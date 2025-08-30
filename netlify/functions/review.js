// Netlify Function: server-side proxy for Gemini API
// Reads GEMINI_API_KEY from environment variables (set in Netlify site settings)

export async function handler(event) {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

  const body = event.body ? JSON.parse(event.body) : {};
  const prompt = body.prompt;
  const provider = body.provider || 'auto'; // 'gemini' | 'openai' | 'auto'
  const model = body.model; // optional model override
  // Optional client-provided key (not recommended): if provided and server keys missing, function may use it.
  const clientKey = body.clientKey || null;

    if (!prompt) {
      return { statusCode: 400, body: 'Missing prompt' };
    }

  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || null;
  const openaiKey = process.env.OPENAI_API_KEY || process.env.GPT_API_KEY || null;

    // provider selection
    const useGemini = provider === 'gemini' || (provider === 'auto' && !!geminiKey);
    const useOpenAI = provider === 'openai' || (provider === 'auto' && !geminiKey && !!openaiKey);

    if (useGemini) {
      const effectiveKey = geminiKey || clientKey;
      if (!effectiveKey) {
        return { statusCode: 500, body: JSON.stringify({ error: 'GEMINI_API_KEY not configured' }) };
      }
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: effectiveKey });
      const response = await ai.models.generateContent({
        model: model || 'gemini-2.5-flash',
        contents: prompt,
      });
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'gemini', text: response.text }),
      };
    }

    if (useOpenAI) {
      const effectiveKey = openaiKey || clientKey;
      if (!effectiveKey) {
        return { statusCode: 500, body: JSON.stringify({ error: 'OPENAI_API_KEY not configured' }) };
      }

      // Call OpenAI Chat Completions (v1) - simple implementation
      const openaiModel = model || 'gpt-4o-mini';
      const payload = {
        model: openaiModel,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1000,
      };

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
      Authorization: `Bearer ${effectiveKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        return { statusCode: res.status, body: JSON.stringify({ error: txt }) };
      }
      const data = await res.json();
      const text = (data.choices && data.choices[0] && (data.choices[0].message?.content || data.choices[0].text)) || '';
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'openai', text }),
      };
    }

    return { statusCode: 400, body: JSON.stringify({ error: 'No provider key configured or invalid provider' }) };
  } catch (err) {
    console.error('Function error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err instanceof Error ? err.message : String(err) }) };
  }
}
