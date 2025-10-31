import React, { useState, useEffect, useRef } from 'react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(objectUrl);

    // Cleanup the object URL
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (plantName.trim() && imageFile && lastWateredDate) {
      onAddPlant(plantName.trim(), imageFile, lastWateredDate);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
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
          <div className="p-4 sm:p-6 space-y-4">
            <div>
              <label htmlFor="plant-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Plant Name
              </label>
              <input
                id="plant-name"
                type="text"
                value={plantName}
                onChange={(e) => setPlantName(e.target.value)}
                placeholder="e.g., Fiddle Leaf Fig"
                className="w-full mt-1 px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Plant Photo
              </label>
              <div className="mt-1">
                {previewUrl ? (
                  <div className="relative group">
                    <img src={previewUrl} alt="Plant preview" className="w-full h-48 object-cover rounded-lg" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="text-white text-sm bg-black/50 px-3 py-1 rounded-md"
                      >
                        Change Photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-slate-600 border-dashed rounded-md cursor-pointer hover:border-green-500 dark:hover:border-green-600 transition-colors"
                  >
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <p className="pl-1">Click to upload a photo</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG up to 5MB</p>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/png, image/jpeg"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="last-watered-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                When did you last water it?
              </label>
              <input
                id="last-watered-date"
                type="date"
                value={lastWateredDate}
                onChange={(e) => setLastWateredDate(e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                disabled={isLoading}
                required
              />
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
