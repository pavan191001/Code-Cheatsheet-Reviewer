
import React from 'react';
import { SUPPORTED_LANGUAGES } from '../constants';

interface LanguageSelectorProps {
  language: string;
  onLanguageChange: (language: string) => void;
  label: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ language, onLanguageChange, label }) => {
  return (
    <div>
      <label htmlFor="language" className="block text-sm font-medium text-gray-400 mb-2">
        {label}
      </label>
      <select
        id="language"
        value={language}
        onChange={(e) => onLanguageChange(e.target.value)}
        className="w-full bg-gray-700 text-white p-3 rounded-lg border-2 border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.value} value={lang.value}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
