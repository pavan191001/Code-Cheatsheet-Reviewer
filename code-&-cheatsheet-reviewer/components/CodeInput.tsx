
import React from 'react';

interface CodeInputProps {
  code: string;
  onCodeChange: (code: string) => void;
  placeholder: string;
}

const CodeInput: React.FC<CodeInputProps> = ({ code, onCodeChange, placeholder }) => {
  return (
    <div className="flex-grow flex flex-col">
      <label htmlFor="codeInput" className="sr-only">Code Input</label>
      <textarea
        id="codeInput"
        value={code}
        onChange={(e) => onCodeChange(e.target.value)}
        placeholder={placeholder}
        className="w-full flex-grow bg-gray-900 text-gray-300 p-4 rounded-lg border-2 border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent font-mono text-sm resize-none transition"
        spellCheck="false"
      />
    </div>
  );
};

export default CodeInput;
