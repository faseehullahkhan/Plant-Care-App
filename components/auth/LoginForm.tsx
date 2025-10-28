import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LoaderIcon } from '../Icons';

interface LoginFormProps {
  onSwitchToSignUp: () => void;
  onForgotPassword: () => void;
  onForgotEmail: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignUp, onForgotPassword, onForgotEmail }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      // Success state is handled by the parent App component which will re-render
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-1">Welcome Back!</h2>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-6">Sign in to manage your garden.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            required
          />
        </div>
        <div>
          <div className="flex justify-between items-center">
            <label htmlFor="password"className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
             <button type="button" onClick={onForgotPassword} className="text-sm text-green-600 hover:underline">
              Forgot?
            </button>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            required
          />
        </div>
        
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 dark:disabled:bg-green-800"
        >
          {loading ? <LoaderIcon className="w-5 h-5 animate-spin" /> : 'Log In'}
        </button>
        <div className="text-sm text-center">
          <button type="button" onClick={onForgotEmail} className="font-medium text-green-600 hover:underline">
            Forgot your email?
          </button>
        </div>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Don't have an account?{' '}
        <button onClick={onSwitchToSignUp} className="font-medium text-green-600 hover:underline">
          Sign up
        </button>
      </p>
    </div>
  );
};