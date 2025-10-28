import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LoaderIcon } from '../Icons';

interface ForgotEmailFormProps {
  onSwitchToLogin: () => void;
}

export const ForgotEmailForm: React.FC<ForgotEmailFormProps> = ({ onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [foundEmail, setFoundEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { findEmailByName } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setFoundEmail('');
    setLoading(true);

    // Simulate checking for user
    setTimeout(() => {
        const email = findEmailByName(name);
        if (email) {
            setFoundEmail(email);
            setMessage('We found an account with this name:');
        } else {
            setMessage('No account was found with that name.');
        }
        setLoading(false);
    }, 1000);
  };

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-1">Find Your Email</h2>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-6">Enter your full name to recover your email address.</p>
      
      {message ? (
          <div className="text-center">
              <p className="text-gray-800 dark:text-gray-200 mb-2">{message}</p>
              {foundEmail && (
                  <p className="font-bold text-lg text-green-600 bg-green-50 dark:bg-green-900/50 py-2 px-4 rounded-md inline-block">{foundEmail}</p>
              )}
              <button onClick={onSwitchToLogin} className="mt-4 block w-full font-medium text-green-600 hover:underline">
                &larr; Back to Log in
              </button>
          </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
            <label htmlFor="find-by-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name
            </label>
            <input
                id="find-by-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
                placeholder="e.g., Jane Doe"
            />
            </div>
            
            <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 dark:disabled:bg-green-800"
            >
            {loading ? <LoaderIcon className="w-5 h-5 animate-spin" /> : 'Find Email'}
            </button>
        </form>
      )}

      {!message && (
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Know your email?{' '}
            <button onClick={onSwitchToLogin} className="font-medium text-green-600 hover:underline">
            Log in
            </button>
        </p>
      )}
    </div>
  );
};