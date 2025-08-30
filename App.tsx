import React, { useState, useCallback } from 'react';
import { reviewCode, reviewCheatsheet } from './services/geminiService';
import CodeInput from './components/CodeInput';
import LanguageSelector from './components/LanguageSelector';
import FeedbackDisplay from './components/FeedbackDisplay';
import Loader from './components/Loader';
import Header from './components/Header';
import { SUPPORTED_LANGUAGES } from './constants';
import { CopyIcon, CheckIcon } from './components/Icons';

type ReviewMode = 'code' | 'cheatsheet';

const App: React.FC = () => {
  const [code, setCode] = useState<string>('');
  const [language, setLanguage] = useState<string>(SUPPORTED_LANGUAGES[0].value);
  const [feedback, setFeedback] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [reviewMode, setReviewMode] = useState<ReviewMode>('code');
  const [isFeedbackCopied, setIsFeedbackCopied] = useState(false);

  const handleReview = useCallback(async () => {
    const content = code.trim();
    if (!content) {
      setError(reviewMode === 'code' ? 'Please enter some code to review.' : 'Please enter some content to review.');
      return;
    }
    setIsLoading(true);
    setError('');
    setFeedback('');
    try {
      const result = reviewMode === 'code'
        ? await reviewCode(content, language)
        : await reviewCheatsheet(content);
      setFeedback(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [code, language, reviewMode]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          setCode(text);
          setError('');
        } else {
          setError('Failed to read file content.');
        }
      };
      reader.onerror = () => {
        setError('Error reading file.');
      };
      reader.readAsText(file);
    }
  };

  const handleCopyFeedback = () => {
    if (!feedback) return;
    navigator.clipboard.writeText(feedback);
    setIsFeedbackCopied(true);
    setTimeout(() => setIsFeedbackCopied(false), 2000);
  };


  const isCodeReview = reviewMode === 'code';
  const activeTabClass = 'border-brand-blue text-white';
  const inactiveTabClass = 'border-transparent text-gray-400 hover:text-white hover:border-gray-500';

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="mb-6 flex justify-center space-x-4 sm:space-x-8 border-b border-gray-700">
          <button
            onClick={() => setReviewMode('code')}
            className={`py-3 px-4 text-sm sm:text-base font-medium border-b-2 transition-colors duration-200 ${isCodeReview ? activeTabClass : inactiveTabClass}`}
            aria-pressed={isCodeReview}
          >
            Code Review
          </button>
          <button
            onClick={() => setReviewMode('cheatsheet')}
            className={`py-3 px-4 text-sm sm:text-base font-medium border-b-2 transition-colors duration-200 ${!isCodeReview ? activeTabClass : inactiveTabClass}`}
            aria-pressed={!isCodeReview}
          >
            Cheatsheet Review
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="bg-gray-800 rounded-xl shadow-2xl p-6 flex flex-col space-y-6 h-full">
            <h2 className="text-2xl font-semibold text-white">
              {isCodeReview ? 'Submit Your Code' : 'Submit Your Cheatsheet'}
            </h2>
            
            {isCodeReview ? (
              <LanguageSelector
                language={language}
                onLanguageChange={setLanguage}
                label={'Language'}
              />
            ) : (
              <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-400">Upload a file or paste content</p>
                  <label htmlFor="file-upload" className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white text-sm font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out">
                      Upload File
                  </label>
                  <input id="file-upload" type="file" className="hidden" accept=".txt,.md" onChange={handleFileChange} />
              </div>
            )}
            
            <CodeInput
              code={code}
              onCodeChange={setCode}
              placeholder={isCodeReview ? `Paste your ${language} code here...` : `Paste your cheatsheet content here or upload a file...`}
            />
            <button
              onClick={handleReview}
              disabled={isLoading || !code.trim()}
              className="w-full flex justify-center items-center bg-brand-blue hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader />
                  <span className="ml-2">Analyzing...</span>
                </>
              ) : (
                isCodeReview ? '✨ Review Code' : '📝 Review Cheatsheet'
              )}
            </button>
          </div>

          {/* Output Panel */}
          <div className="bg-gray-800 rounded-xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-white">Review Feedback</h2>
              {feedback && !isLoading && (
                 <button
                    onClick={handleCopyFeedback}
                    className="flex items-center space-x-1 text-gray-400 hover:text-white transition"
                    aria-label="Copy feedback"
                 >
                    {isFeedbackCopied ? <CheckIcon /> : <CopyIcon />}
                    <span className="text-sm font-sans">{isFeedbackCopied ? 'Copied!' : 'Copy'}</span>
                 </button>
              )}
            </div>
            <div className="h-[calc(100vh-300px)] overflow-y-auto pr-2">
              {isLoading && !feedback && (
                 <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Loader size="large" />
                    <p className="mt-4 text-lg">Gemini is thinking...</p>
                    <p className="mt-2 text-sm">This may take a moment.</p>
                 </div>
              )}
              {error && <p className="text-red-500 bg-red-900/20 p-4 rounded-lg">{error}</p>}
              {feedback && <FeedbackDisplay feedback={feedback} />}
              {!isLoading && !error && !feedback && (
                <div className="flex items-center justify-center h-full text-center text-gray-500">
                  <p>Your review feedback will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;