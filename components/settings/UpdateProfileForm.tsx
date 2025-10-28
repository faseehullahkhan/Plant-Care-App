import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LoaderIcon } from '../Icons';

export const UpdateProfileForm: React.FC = () => {
    const { currentUser, updateUser } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (currentUser) {
            setName(currentUser.name);
            setEmail(currentUser.email);
        }
    }, [currentUser]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        if (name === currentUser?.name && email === currentUser?.email) {
            setError("No changes were made.");
            return;
        }

        setLoading(true);
        try {
            await updateUser(name, email);
            setSuccess('Profile updated successfully!');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    if (!currentUser) return null;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Personal Information</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Update your name and email address.</p>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Full Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            required
                        />
                    </div>
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
                </div>
                <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800/50 flex justify-between items-center">
                    <div className="text-sm">
                        {error && <p className="text-red-500">{error}</p>}
                        {success && <p className="text-green-600">{success}</p>}
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex justify-center py-2 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 dark:disabled:bg-green-800"
                    >
                        {loading ? <LoaderIcon className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};
