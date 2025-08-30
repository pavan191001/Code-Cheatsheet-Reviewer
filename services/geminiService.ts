
// Client-side: call server-side Netlify function which holds the API key
type Provider = 'auto' | 'gemini' | 'openai';

const callGemini = async (prompt: string, provider: Provider = 'auto', model?: string): Promise<string> => {
  try {
    const res = await fetch('/.netlify/functions/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, provider, model }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Server function error: ${res.status} ${text}`);
    }
    const data = await res.json();
    return data.text;
  } catch (error) {
    console.error('Error calling server function:', error);
    if (error instanceof Error) throw error;
    throw new Error('Unknown error calling server function');
  }
};

export const reviewCode = async (code: string, language: string): Promise<string> => {
  const prompt = `
    Act as an expert senior software engineer and a meticulous code reviewer.
    Provide a thorough and constructive code review for the following ${language} code.

    Your review should cover the following aspects:
    1.  **Potential Bugs & Errors:** Identify any potential bugs, logic errors, or unhandled edge cases.
    2.  **Best Practices & Readability:** Suggest improvements for code clarity, maintainability, and adherence to ${language} conventions and idioms.
    3.  **Performance:** Point out any potential performance bottlenecks and suggest concrete optimizations.
    4.  **Security:** Highlight any potential security vulnerabilities (e.g., injection flaws, improper error handling).
    5.  **Code Structure & Design:** Comment on the overall architecture and suggest improvements if applicable.

    Structure your feedback clearly using Markdown. Use headings for each section.
    Provide specific code examples for your suggestions using Markdown code blocks with the correct language identifier.
    Be polite, constructive, and educational in your tone.

    Here is the code to review:
    \`\`\`${language.toLowerCase()}
    ${code}
    \`\`\`
  `;
  return callGemini(prompt);
};

export const reviewCheatsheet = async (content: string): Promise<string> => {
  const prompt = `
    Act as an expert technical writer and editor. Your task is to review the provided cheatsheet content.
    Your primary focus is on the natural language prose.

    **IMPORTANT RULES:**
    1.  **Review ONLY the natural language text.**
    2.  **DO NOT review or suggest changes for anything inside code blocks (e.g., \`\`\` ... \`\`\`) or inline code (\`...\`).**
    3.  **DO NOT review or suggest changes for any tags, metadata, or special formatting markers (e.g., #tags, frontmatter).**

    For each issue you find in the natural language (grammar, spelling, clarity, conciseness, or technical inaccuracy), you MUST provide your feedback in the following strict format:

    Mistake/suggestion: [Provide a clear and concise description of the issue and your suggestion for improvement.]
    Previous content: [Quote the exact original text that has the issue.]
    Updated content: [Provide the corrected version of the text.]

    Separate each distinct piece of feedback with a '---' divider. Do not use any other formatting. Do not add headings, introductions, or summaries. Go straight to the feedback.

    Here is the cheatsheet content to review:
    ---
    ${content}
    ---
  `;
  return callGemini(prompt);
};
