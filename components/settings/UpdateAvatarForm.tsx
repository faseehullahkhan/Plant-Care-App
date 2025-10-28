import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LoaderIcon, CameraIcon, TrashIcon } from '../Icons';

// Helper to convert file to base64
const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const UpdateAvatarForm: React.FC = () => {
    const { currentUser, updateAvatar } = useAuth();
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setPreviewUrl(currentUser?.avatarUrl || null);
    }, [currentUser?.avatarUrl]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Basic validation
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError('Image must be smaller than 5MB.');
                return;
            }
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                setError('Please select a JPG, PNG, or WEBP image.');
                return;
            }
            
            setError('');
            setSuccess('');
            setImageFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };

    const handleSave = async () => {
        if (!imageFile) {
            setError("Please select an image first.");
            return;
        }
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const dataUrl = await fileToDataUrl(imageFile);
            await updateAvatar(dataUrl);
            setSuccess('Avatar updated!');
            setImageFile(null); // Clear the file state after saving
        } catch (err: any) {
            setError(err.message || 'Failed to update avatar.');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async () => {
        if (!currentUser?.avatarUrl) return;
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await updateAvatar(null);
            setSuccess('Avatar removed!');
            setImageFile(null);
            setPreviewUrl(null);
        } catch (err: any) {
            setError(err.message || 'Failed to remove avatar.');
        } finally {
            setLoading(false);
        }
    };
    
    if (!currentUser) return null;
    
    const userInitial = currentUser.name.charAt(0).toUpperCase();

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 flex flex-col items-center">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Profile Picture</h3>
            
            <div className="relative group w-32 h-32 mb-4">
                 <div className="w-32 h-32 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-5xl font-bold text-green-600 dark:text-green-300 overflow-hidden">
                    {previewUrl ? (
                        <img src={previewUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : (
                        <span>{userInitial}</span>
                    )}
                </div>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Change profile picture"
                >
                    <CameraIcon className="w-8 h-8" />
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>

            <div className="flex items-center gap-2">
                {imageFile && (
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400 flex items-center"
                    >
                        {loading ? <LoaderIcon className="w-5 h-5 animate-spin mr-2"/> : null}
                        Save
                    </button>
                )}
                {currentUser.avatarUrl && !imageFile && (
                    <button
                        onClick={handleRemove}
                        disabled={loading}
                        className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400 flex items-center"
                    >
                         {loading && !imageFile ? <LoaderIcon className="w-5 h-5 animate-spin mr-2"/> : <TrashIcon className="w-4 h-4 mr-1"/>}
                         Remove
                    </button>
                )}
            </div>
            
            <div className="text-sm mt-3 h-5 text-center">
                {error && <p className="text-red-500">{error}</p>}
                {success && <p className="text-green-600">{success}</p>}
            </div>
        </div>
    );
};