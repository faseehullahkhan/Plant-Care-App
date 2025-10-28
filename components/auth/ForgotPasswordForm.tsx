import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LoaderIcon } from '../Icons';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { checkPasswordStrength, PasswordStrength } from '../../utils/passwordStrength';

interface ForgotPasswordFormProps {
  onSwitchToLogin: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSwitchToLogin }) => {
  const [step, setStep] = useState(1); // 1: email, 2: new password, 3: success
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({ score: 0, label: 'Too short', color: ''});
  const { findUserByEmail, resetPassword } = useAuth();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Simulate network delay and check
    setTimeout(() => {
        const user = findUserByEmail(email);
        if (user) {
            setStep(2);
        } else {
            setError('No account found with this email address.');
        }
        setLoading(false);
    }, 500);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
        setError("Password must be at least 8 characters long.");
        return;
    }
    if (newPassword !== confirmPassword) {
        setError("Passwords do not match.");
        return;
    }

    setLoading(true);
    try {
        await resetPassword(email, newPassword);
        setStep(3);
    } catch (err: any) {
        console.error("Reset Password Error:", err);
        setError(err.message || 'An unexpected error occurred.');
    } finally {
        setLoading(false);
    }
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setNewPassword(password);
    setPasswordStrength(checkPasswordStrength(password));
  };
  
  const renderStepOne = () => (
    <>
      <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-1">Reset Your Password</h2>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-6">Enter your email to find your account.</p>
      <form onSubmit={handleEmailSubmit} className="space-y-4">
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
            autoFocus
          />
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 dark:disabled:bg-green-800"
        >
          {loading ? <LoaderIcon className="w-5 h-5 animate-spin" /> : 'Find Account'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Remember your password?{' '}
        <button onClick={onSwitchToLogin} className="font-medium text-green-600 hover:underline">
          Log in
        </button>
      </p>
    </>
  );

  const renderStepTwo = () => (
    <>
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-1">Create a New Password</h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">Enter a new password for {email}.</p>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
                <label htmlFor="new-password"className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    New Password
                </label>
                <input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={handleNewPasswordChange}
                    className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                />
                <PasswordStrengthMeter {...passwordStrength} />
            </div>
            <div>
                <label htmlFor="confirm-password"className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirm New Password
                </label>
                <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                {loading ? <LoaderIcon className="w-5 h-5 animate-spin" /> : 'Reset Password'}
            </button>
        </form>
    </>
  );

  const renderStepThree = () => (
    <div className="text-center">
        <h2 className="text-2xl font-bold text-center text-green-700 dark:text-green-300 mb-4">Password Reset!</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Your password has been successfully updated.</p>
        <button onClick={onSwitchToLogin} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
            &larr; Back to Log in
        </button>
    </div>
  );
  
  const renderContent = () => {
    switch(step) {
        case 2:
            return renderStepTwo();
        case 3:
            return renderStepThree();
        case 1:
        default:
            return renderStepOne();
    }
  }

  return (
    <div className="animate-fade-in-up">
        {renderContent()}
    </div>
  );
};