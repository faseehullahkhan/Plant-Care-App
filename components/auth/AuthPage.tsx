import React, { useState } from 'react';
import { LeafIcon } from '../Icons';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { ForgotEmailForm } from './ForgotEmailForm';

type AuthView = 'login' | 'signup' | 'forgot-password' | 'forgot-email';

export const AuthPage: React.FC = () => {
  const [view, setView] = useState<AuthView>('login');

  const renderView = () => {
    switch (view) {
      case 'signup':
        return <SignUpForm onSwitchToLogin={() => setView('login')} />;
      case 'forgot-password':
        return <ForgotPasswordForm onSwitchToLogin={() => setView('login')} />;
       case 'forgot-email':
        return <ForgotEmailForm onSwitchToLogin={() => setView('login')} />;
      case 'login':
      default:
        return <LoginForm onSwitchToSignUp={() => setView('signup')} onForgotPassword={() => setView('forgot-password')} onForgotEmail={() => setView('forgot-email')} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 animate-fade-in">
        <div className="mx-auto w-full max-w-md">
            <div className="flex justify-center items-center gap-3 mb-6">
                <LeafIcon className="w-10 h-10 text-green-600" />
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
                    Plant Care
                </h1>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 sm:p-8">
                {renderView()}
            </div>
        </div>
    </div>
  );
};