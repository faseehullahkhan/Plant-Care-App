import React from 'react';
import { ExplorePlant } from '../types';
import { LeafIcon, XIcon, SunIcon, WaterDropIcon, ThermometerIcon } from './Icons';

interface ExplorePlantDetailModalProps {
  plant: ExplorePlant;
  onClose: () => void;
}

export const ExplorePlantDetailModal: React.FC<ExplorePlantDetailModalProps> = ({ plant, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-lg transform transition-all animate-fade-in-up"
        onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
      >
        <div className="flex justify-between items-center p-4 sm:p-5 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <LeafIcon className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold capitalize text-gray-800 dark:text-gray-100">{plant.name}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-4 sm:p-6">
          <p className="text-gray-600 dark:text-gray-400 mb-6">{plant.description}</p>
          
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Care Guide</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
              <SunIcon className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-gray-800 dark:text-yellow-200">Sunlight</h4>
                <p className="text-gray-600 dark:text-gray-300">{plant.sunlight}</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-cyan-50 dark:bg-cyan-900/30 rounded-lg">
              <WaterDropIcon className="w-6 h-6 text-cyan-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-gray-800 dark:text-cyan-200">Watering</h4>
                <p className="text-gray-600 dark:text-gray-300">{plant.watering}</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <ThermometerIcon className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-gray-800 dark:text-blue-200">Temperature</h4>
                <p className="text-gray-600 dark:text-gray-300">{plant.temperature}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 sm:px-6 py-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};