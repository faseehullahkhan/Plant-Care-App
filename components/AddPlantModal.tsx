

import React, { useState, useEffect } from 'react';
import { LeafIcon, XIcon, LoaderIcon } from './Icons';

interface AddPlantModalProps {
  onClose: () => void;
  onAddPlant: (plantName: string, imageFile: File, lastWatered: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const AddPlantModal: React.FC<AddPlantModalProps> = ({ onClose, onAddPlant, isLoading, error }) => {
  const [plantName, setPlantName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [lastWateredDate, setLastWateredDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    } else {
      setImageFile(null);
    }
  };

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(objectUrl);
    
    // Cleanup the object URL on component unmount or when the file changes
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (plantName.trim() && imageFile && lastWateredDate) {
      onAddPlant(plantName.trim(), imageFile, lastWateredDate);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-md transform transition-all animate-fade-in-up">
        <div className="flex justify-between items-center p-4 sm:p-5 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <LeafIcon className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Add a New Plant</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-4 sm:p-6">
            <div className="mb-4">
                <label htmlFor="plant-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Plant Name
                </label>
                <p className="text-gray-500 dark:text-gray-400 text-xs mb-2">
                    e.g., "Monstera Deliciosa". AI will find its care needs.
                </p>
                <input
                    id="plant-name"
                    type="text"
                    value={plantName}
                    onChange={(e) => setPlantName(e.target.value)}
                    placeholder="e.g., Fiddle Leaf Fig"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    disabled={isLoading}
                    autoFocus
                    required
                />
            </div>
            
            <div className="mb-4">
                 <label htmlFor="last-watered-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    When did you last water it?
                </label>
                <input
                    id="last-watered-date"
                    type="date"
                    value={lastWateredDate}
                    onChange={(e) => setLastWateredDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 mt-1"
                    disabled={isLoading}
                    required
                />
            </div>


            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Upload a Photo
              </label>
              <p className="text-gray-500 dark:text-gray-400 text-xs mb-2">
                A photo is required to get a personalized AI tip on your plant's current health.
              </p>
              <div className="mt-1 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-slate-600 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Plant preview" className="mx-auto h-24 w-auto rounded-md" />
                  ) : (
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  )}
                  <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-slate-800 rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500">
                      <span>{imageFile ? 'Change photo' : 'Upload a file'}</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} disabled={isLoading} required />
                    </label>
                  </div>
                   <p className="text-xs text-gray-500 dark:text-gray-500">{imageFile ? imageFile.name : 'PNG, JPG up to 10MB'}</p>
                </div>
              </div>
            </div>
            
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
          <div className="px-4 sm:px-6 py-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 dark:disabled:bg-green-800 flex items-center justify-center min-w-[100px]"
              disabled={!plantName.trim() || !imageFile || !lastWateredDate || isLoading}
            >
              {isLoading ? <LoaderIcon className="w-5 h-5 animate-spin" /> : 'Add Plant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};