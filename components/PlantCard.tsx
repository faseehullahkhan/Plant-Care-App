import React, { useMemo, useState, useRef } from 'react';
import { Plant } from '../types';
import { WaterDropIcon, SunIcon, ThermometerIcon, SparklesIcon, TrashIcon, CalendarIcon, WarningIcon, ClockIcon, PencilIcon, DocumentTextIcon, ChartBarIcon, HeartbeatIcon, ChartPieIcon } from './Icons';
import { WateringChart } from './WateringChart';

interface PlantCardProps {
  plant: Plant;
  onWater: (id: string) => void;
  onHealthCheck: (plant: Plant, imageFile: File) => void;
  onDelete: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onViewDetails: () => void;
}

export const PlantCard: React.FC<PlantCardProps> = ({ plant, onWater, onHealthCheck, onDelete, onUpdateNotes, onViewDetails }) => {
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [currentNotes, setCurrentNotes] = useState(plant.notes || '');
  const healthCheckFileInputRef = useRef<HTMLInputElement>(null);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);

  const { nextWateringDate, daysUntilWatering } = useMemo(() => {
    const lastWateredDate = new Date(plant.lastWatered);
    const nextWatering = new Date(lastWateredDate);
    nextWatering.setDate(lastWateredDate.getDate() + plant.wateringFrequency);

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date
    
    // Create a normalized nextWatering date for diff calculation without affecting the time for display
    const nextWateringForDiff = new Date(nextWatering);
    nextWateringForDiff.setHours(0, 0, 0, 0);

    const diffTime = nextWateringForDiff.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      nextWateringDate: nextWatering,
      daysUntilWatering: diffDays,
    };
  }, [plant.lastWatered, plant.wateringFrequency]);
  
  const sortedHistory = useMemo(() => {
    return [...(plant.wateringHistory || [plant.lastWatered])].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [plant.wateringHistory, plant.lastWatered]);

  const handleSaveNotes = () => {
    onUpdateNotes(plant.id, currentNotes);
    setIsEditingNotes(false);
  };

  const handleCancelEdit = () => {
    setCurrentNotes(plant.notes || '');
    setIsEditingNotes(false);
  };

  const handleHealthCheckClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    healthCheckFileInputRef.current?.click();
  };

  const handleFileSelectedForHealthCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onHealthCheck(plant, file);
    }
    // Reset file input value to allow re-selection of the same file
    e.target.value = '';
  };
  
  const handleConfirmDelete = () => {
    onDelete(plant.id);
    setIsDeleteConfirmVisible(false);
  };

  const isOverdue = daysUntilWatering < 0;

  const wateringStatusText = () => {
    if (isOverdue) return `Overdue by ${Math.abs(daysUntilWatering)} day(s)`;
    if (daysUntilWatering === 0) return 'Needs watering today!';
    if (daysUntilWatering === 1) return `Water in 1 day`;
    return `Water in ${daysUntilWatering} days`;
  };

  const wateringStatusColor = () => {
    if (daysUntilWatering <= 0) return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
    if (daysUntilWatering <= 2) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
    return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
  };

  const cardBorderClass = isOverdue ? 'border-2 border-red-500 dark:border-red-600' : 'border border-gray-200 dark:border-slate-700';

  return (
    <>
      <input
        type="file"
        ref={healthCheckFileInputRef}
        onChange={handleFileSelectedForHealthCheck}
        className="hidden"
        accept="image/*"
      />
      
      {isDeleteConfirmVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-sm p-6 text-center animate-fade-in-up">
            <WarningIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Are you sure?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this plant? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setIsDeleteConfirmVisible(false)}
                className="px-6 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-2xl dark:shadow-black/20 overflow-hidden flex flex-col transition-all duration-500 transform hover:-translate-y-2 group ${cardBorderClass}`}>
        <div 
            className="cursor-pointer"
            onClick={onViewDetails}
            aria-label={`View details for ${plant.nickname || plant.name}`}
        >
            <div className="relative">
                <img src={plant.imageUrl} alt={plant.name} className="w-full h-48 object-cover" />
                <div className="absolute top-2 right-2">
                <button 
                    onClick={(e) => { e.stopPropagation(); setIsDeleteConfirmVisible(true); }}
                    className="p-2 bg-white/50 dark:bg-black/50 backdrop-blur-sm rounded-full text-gray-700 dark:text-gray-300 hover:bg-red-500 hover:text-white dark:hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100"
                    aria-label="Delete plant"
                >
                    <TrashIcon className="w-5 h-5"/>
                </button>
                </div>
            </div>
            
            {/* Top Content Area */}
            <div className="p-5">
                <h3 className="text-xl font-bold capitalize truncate text-gray-900 dark:text-white">{plant.nickname || plant.name}</h3>
                {plant.nickname && <p className="text-sm text-gray-500 dark:text-gray-400 capitalize -mt-1">{plant.name}</p>}
                <div className={`mt-2 text-sm font-semibold px-3 py-1 rounded-full text-center flex items-center justify-center gap-2 ${wateringStatusColor()}`}>
                    {isOverdue && <WarningIcon className="w-4 h-4" />}
                    <span>{wateringStatusText()}</span>
                </div>
            </div>
        </div>
        
        {/* Bottom Content Area */}
        <div className="p-5 bg-gray-50 dark:bg-slate-800/50 flex-grow flex flex-col">
            <div className="flex-grow">
                <div className="space-y-3 text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-3">
                    <SunIcon className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                    <span>{plant.sunlight}</span>
                    </div>
                    <div className="flex items-center gap-3">
                    <ThermometerIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span>{plant.temperature}</span>
                    </div>
                    <div className="flex items-center gap-3">
                    <WaterDropIcon className="w-5 h-5 text-cyan-500 flex-shrink-0" />
                    <span>Last: {new Date(plant.lastWatered).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                    <CalendarIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    <span>Next: {nextWateringDate.toLocaleDateString()}</span>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                    <button
                    onClick={(e) => { e.stopPropagation(); setIsHistoryVisible(!isHistoryVisible); }}
                    className="w-full flex items-center justify-between text-left text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white focus:outline-none"
                    aria-expanded={isHistoryVisible}
                    >
                    <div className="flex items-center gap-3">
                        <ClockIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <span>Watering History</span>
                    </div>
                    <svg
                        className={`w-5 h-5 transform transition-transform duration-200 ${isHistoryVisible ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                    </button>
                    
                    {isHistoryVisible && (
                        <div className="mt-2 pl-8 max-h-24 overflow-y-auto pr-2 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                        <ul className="list-disc list-inside text-sm text-gray-500 dark:text-gray-400 space-y-1">
                            {sortedHistory.map((date, index) => (
                            <li key={index}>
                                {new Date(date).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                })}
                            </li>
                            ))}
                        </ul>
                        </div>
                    )}
                </div>

                {/* Notes Section */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <DocumentTextIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">My Notes</span>
                        </div>
                        {!isEditingNotes && (
                            <button 
                                onClick={() => setIsEditingNotes(true)} 
                                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"
                                aria-label="Edit notes"
                            >
                                <PencilIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            </button>
                        )}
                    </div>
                    {isEditingNotes ? (
                        <div className="mt-2 animate-fade-in">
                            <textarea
                                value={currentNotes}
                                onChange={(e) => setCurrentNotes(e.target.value)}
                                className="w-full h-24 p-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="Add observations, tips, or reminders..."
                            />
                            <div className="flex justify-end gap-2 mt-2">
                                <button
                                    onClick={handleCancelEdit}
                                    className="px-3 py-1 text-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-slate-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveNotes}
                                    className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-2 pl-8 pr-2">
                            <p className="text-sm text-gray-500 dark:text-gray-400 italic whitespace-pre-wrap min-h-[20px]">
                                {plant.notes || 'No notes yet. Click the pencil to add one!'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3" onClick={(e) => e.stopPropagation()}>
                <button
                onClick={() => onWater(plant.id)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-green-600 text-green-600 dark:text-green-400 dark:border-green-500 font-semibold rounded-lg hover:bg-green-600 hover:text-white dark:hover:bg-green-500 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300"
                >
                <WaterDropIcon className="w-5 h-5" />
                Watered
                </button>
                <button
                    onClick={handleHealthCheckClick}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
                    title="Upload a new photo for a detailed health analysis"
                    >
                    <HeartbeatIcon className="w-5 h-5" />
                    AI Health Check
                </button>
            </div>
        </div>

      </div>
    </>
  );
};