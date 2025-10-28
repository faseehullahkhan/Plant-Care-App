import React from 'react';
import { UpdateProfileForm } from './UpdateProfileForm';
import { ChangePasswordForm } from './ChangePasswordForm';
import { UpdateAvatarForm } from './UpdateAvatarForm';

export const SettingsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up space-y-12">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Profile & Settings</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your account details, avatar, and password.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1">
          <UpdateAvatarForm />
        </div>
        <div className="lg:col-span-2 space-y-12">
          <UpdateProfileForm />
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
};