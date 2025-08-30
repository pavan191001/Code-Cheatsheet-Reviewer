import React, { useState, useEffect } from 'react';

type Provider = 'auto' | 'gemini' | 'openai';

const STORAGE_KEY = 'codeReviewer.keys';

const ApiKeyInput: React.FC = () => {
  const [provider, setProvider] = useState<Provider>('auto');
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.provider) setProvider(parsed.provider);
        if (parsed.apiKey) setApiKey(parsed.apiKey);
      }
    } catch (e) {}
  }, []);

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ provider, apiKey }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const clear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setApiKey('');
    setProvider('auto');
    setSaved(false);
  };

  return (
    <div className="flex items-center space-x-2">
      <select value={provider} onChange={(e) => setProvider(e.target.value as Provider)} className="bg-gray-700 text-white px-2 py-1 rounded">
        <option value="auto">Auto</option>
        <option value="gemini">Gemini</option>
        <option value="openai">OpenAI</option>
      </select>
      <input
        type="password"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="Enter API key (optional)"
        className="bg-gray-700 text-white px-3 py-1 rounded w-64"
        aria-label="API key"
      />
      <button onClick={save} className="bg-brand-blue hover:bg-blue-600 text-white px-3 py-1 rounded">Save</button>
      <button onClick={clear} className="bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded">Clear</button>
      {saved && <span className="text-sm text-green-400">Saved</span>}
    </div>
  );
};

export default ApiKeyInput;
