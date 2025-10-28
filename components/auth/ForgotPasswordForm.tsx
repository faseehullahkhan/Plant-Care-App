import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LoaderIcon } from '../Icons';

interface ForgotPasswordFormProps {
  onSwitchToLogin: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { findUserByEmail } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    // Simulate checking for user and sending email
    setTimeout(() => {
        findUserByEmail(email); // We don't reveal if the user exists for security
        setMessage('If an account exists for this email, a password reset link has been sent.');
        setLoading(false);
    }, 1000);
  };

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-1">Reset Your Password</h2>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-6">Enter your email and we'll send you a link to get back into your account.</p>
      
      {message ? (
          <div className="text-center">
              <p className="text-green-700 dark:text-green-300 mb-4">{message}</p>
              <button onClick={onSwitchToLogin} className="font-medium text-green-600 hover:underline">
                &larr; Back to Log in
              </button>
          </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
            <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address
            </label>
            <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
            />
            </div>
            
            <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 dark:disabled:bg-green-800"
            >
            {loading ? <LoaderIcon className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
            </button>
        </form>
      )}

      {!message && (
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Remember your password?{' '}
            <button onClick={onSwitchToLogin} className="font-medium text-green-600 hover:underline">
            Log in
            </button>
        </p>
      )}
    </div>
  );
};