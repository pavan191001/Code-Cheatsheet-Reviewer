import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'https://esm.sh/react-syntax-highlighter@15.5.0';
import { vscDarkPlus } from 'https://esm.sh/react-syntax-highlighter@15.5.0/dist/esm/styles/prism';
import { CopyIcon, CheckIcon } from './Icons';

interface CodeBlockProps {
  language: string;
  value: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="my-4 rounded-lg bg-[#1e1e1e] overflow-hidden not-prose">
            <div className="flex justify-between items-center px-4 py-2 bg-gray-700/50">
                <span className="text-gray-400 text-sm font-sans uppercase">{language}</span>
                <button
                    onClick={handleCopy}
                    className="flex items-center space-x-1 text-gray-400 hover:text-white transition"
                    aria-label="Copy code"
                >
                    {copied ? <CheckIcon /> : <CopyIcon />}
                    <span className="text-sm font-sans">{copied ? 'Copied!' : 'Copy'}</span>
                </button>
            </div>
            <SyntaxHighlighter
                language={language}
                style={vscDarkPlus}
                customStyle={{ margin: 0, borderRadius: '0 0 0.5rem 0.5rem' }}
                codeTagProps={{ style: { fontFamily: 'inherit' } }}
            >
                {value}
            </SyntaxHighlighter>
        </div>
    );
};

export default CodeBlock;