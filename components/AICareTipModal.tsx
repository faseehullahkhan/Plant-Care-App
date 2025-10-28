import React from 'react';
import { SparklesIcon, XIcon, LoaderIcon, WarningIcon } from './Icons';
import { AiCareTip } from '../types';

interface AICareTipModalProps {
  plantName: string;
  tipData: AiCareTip | null;
  isLoading: boolean;
  onClose: () => void;
  error: string | null;
}

export const AICareTipModal: React.FC<AICareTipModalProps> = ({ plantName, tipData, isLoading, onClose, error }) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
          <LoaderIcon className="w-8 h-8 animate-spin text-purple-600"/>
          <span>Analyzing your plant...</span>
        </div>
      );
    }
    
    if (error) {
        return <p className="text-lg text-red-500 text-center leading-relaxed">{error}</p>;
    }
    
    if (tipData) {
      if (tipData.isMatch === false) {
        return (
            <div className="text-center w-full space-y-3">
                <WarningIcon className="w-12 h-12 text-yellow-500 mx-auto" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Image Mismatch</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{tipData.mismatchMessage}</p>
            </div>
        );
      }

      if (tipData.isMatch === true && tipData.tips && tipData.tips.length > 0) {
        return (
          <div className="text-left w-full space-y-6">
              <ul className="space-y-3">
                  {tipData.tips.map((tipPoint, index) => (
                  <li key={index} className="flex items-start gap-3">
                      <SparklesIcon className="w-5 h-5 text-purple-500 flex-shrink-0 mt-1" />
                      <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{tipPoint}</span>
                  </li>
                  ))}
              </ul>
          </div>
        );
      }
    }
    
    return <p className="text-gray-500 dark:text-gray-400">Could not retrieve care tips.</p>;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-md transform transition-all animate-fade-in-up">
        <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <SparklesIcon className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold capitalize text-gray-800 dark:text-gray-100">AI Guide for {plantName}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 min-h-[150px] flex items-center justify-center">
          {renderContent()}
        </div>
        <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};
