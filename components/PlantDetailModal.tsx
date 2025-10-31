import React, { useState, useMemo } from 'react';
import { Plant, GrowthEntry } from '../types';
import { LeafIcon, XIcon, RulerIcon, ChartBarIcon, PlusIcon, CalendarIcon, TrendingUpIcon, PencilIcon } from './Icons';
import { WateringChart } from './WateringChart';
import { GrowthChart } from './GrowthChart';

interface PlantDetailModalProps {
  plant: Plant;
  onClose: () => void;
  onAddGrowthEntry: (plantId: string, entry: Omit<GrowthEntry, 'id'>) => void;
  onUpdateNickname: (plantId: string, nickname: string) => void;
}

export const PlantDetailModal: React.FC<PlantDetailModalProps> = ({ plant, onClose, onAddGrowthEntry, onUpdateNickname }) => {
    const [height, setHeight] = useState('');
    const [notes, setNotes] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isEditingNickname, setIsEditingNickname] = useState(false);
    const [currentNickname, setCurrentNickname] = useState(plant.nickname || '');

    const sortedGrowthHistory = useMemo(() => 
        [...(plant.growthHistory || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        [plant.growthHistory]
    );

    const currentHeight = sortedGrowthHistory[0]?.height;
    
    const { daysUntilWatering, wateringStatusText, wateringStatusColor } = useMemo(() => {
        const lastWateredDate = new Date(plant.lastWatered);
        const nextWatering = new Date(lastWateredDate);
        nextWatering.setDate(lastWateredDate.getDate() + plant.wateringFrequency);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextWateringForDiff = new Date(nextWatering);
        nextWateringForDiff.setHours(0, 0, 0, 0);
        const diffTime = nextWateringForDiff.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const isOverdue = diffDays < 0;
        let statusText = `In ${diffDays} days`;
        if (isOverdue) statusText = `Overdue by ${Math.abs(diffDays)} days`;
        if (diffDays === 0) statusText = 'Today';
        if (diffDays === 1) statusText = `In 1 day`;
        
        let statusColor = 'text-green-600 dark:text-green-400';
        if (diffDays <= 0) statusColor = 'text-red-600 dark:text-red-400';
        else if (diffDays <= 2) statusColor = 'text-yellow-600 dark:text-yellow-400';

        return { daysUntilWatering: diffDays, wateringStatusText: statusText, wateringStatusColor: statusColor };
    }, [plant.lastWatered, plant.wateringFrequency]);


    const handleAddGrowthSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const heightValue = parseFloat(height);
        if (!heightValue || heightValue <= 0) return;

        onAddGrowthEntry(plant.id, {
            date,
            height: heightValue,
            notes
        });

        // Reset form
        setHeight('');
        setNotes('');
        setDate(new Date().toISOString().split('T')[0]);
    };

    const handleSaveNickname = () => {
        onUpdateNickname(plant.id, currentNickname.trim());
        setIsEditingNickname(false);
    };

    const handleCancelNickname = () => {
        setCurrentNickname(plant.nickname || '');
        setIsEditingNickname(false);
    };


  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-gray-50 dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl transform transition-all animate-fade-in-up flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 sm:p-5 border-b border-gray-200 dark:border-slate-800 flex-shrink-0 bg-white dark:bg-slate-800 rounded-t-xl">
          <div className="flex-grow min-w-0">
            {isEditingNickname ? (
                <div className="flex items-center gap-2 animate-fade-in">
                    <input
                        type="text"
                        value={currentNickname}
                        onChange={(e) => setCurrentNickname(e.target.value)}
                        className="text-xl font-semibold bg-gray-100 dark:bg-slate-700 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 w-full min-w-0"
                        placeholder="Enter a nickname..."
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveNickname()}
                    />
                    <button onClick={handleSaveNickname} className="px-4 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold flex-shrink-0">Save</button>
                    <button onClick={handleCancelNickname} className="px-4 py-1.5 text-sm bg-gray-200 dark:bg-slate-600 rounded-md hover:bg-gray-300 dark:hover:bg-slate-500 font-semibold flex-shrink-0">Cancel</button>
                </div>
            ) : (
                <div className="flex items-center gap-3">
                    <LeafIcon className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <div className="min-w-0">
                        <h2 className="text-xl font-semibold capitalize text-gray-800 dark:text-gray-100 flex items-center gap-2 truncate">
                            <span className="truncate">{plant.nickname || plant.name}</span>
                            <button onClick={() => setIsEditingNickname(true)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 flex-shrink-0" aria-label="Edit nickname">
                                <PencilIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            </button>
                        </h2>
                        {plant.nickname && <p className="text-sm text-gray-500 dark:text-gray-400 -mt-1 capitalize truncate">{plant.name}</p>}
                    </div>
                </div>
            )}
            </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 ml-4 flex-shrink-0">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-4 sm:p-6 overflow-y-auto">
             {/* Main Dashboard Grid */}
            <main className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                
                {/* --- LEFT COLUMN --- */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Header with Photo and Key Stats */}
                    <section className="flex flex-col sm:flex-row gap-6 items-start">
                        <img src={plant.imageUrl} alt={plant.name} className="w-full sm:w-40 h-40 rounded-lg object-cover shadow-lg border-4 border-white dark:border-slate-700"/>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 flex-grow w-full">
                            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 flex items-center gap-4">
                                <div className={`p-3 rounded-full ${wateringStatusColor.replace('text', 'bg').replace('-600', '-100').replace('-400', '-900/50')}`}>
                                <CalendarIcon className={`w-6 h-6 ${wateringStatusColor}`} />
                                </div>
                                <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Next Watering</p>
                                <h3 className={`text-2xl font-bold ${wateringStatusColor}`}>{wateringStatusText}</h3>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 flex items-center gap-4">
                                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50">
                                <TrendingUpIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Current Height</p>
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{currentHeight ? `${currentHeight} cm` : 'N/A'}</h3>
                                </div>
                            </div>
                        </div>
                    </section>
                    
                    {/* Timeline Column */}
                    <aside>
                        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 h-full">
                            <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Growth Timeline</h3>
                            </div>
                            <div className="p-6">
                                {sortedGrowthHistory.length > 0 ? (
                                    <ol className="relative border-l-2 border-gray-200 dark:border-slate-700">                  
                                        {sortedGrowthHistory.map(entry => (
                                        <li key={entry.id} className="mb-8 ml-6">            
                                                <span className="absolute flex items-center justify-center w-6 h-6 bg-green-100 dark:bg-green-900/50 rounded-full -left-[13px] ring-4 ring-white dark:ring-slate-800">
                                                    <RulerIcon className="w-3 h-3 text-green-600 dark:text-green-400"/>
                                                </span>
                                                <h4 className="flex items-center mb-1 font-semibold text-gray-900 dark:text-white">{entry.height} cm</h4>
                                                <time className="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">{new Date(entry.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                                                {entry.notes && <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{entry.notes}"</p>}
                                            </li>
                                        ))}
                                    </ol>
                                ) : (
                                    <div className="text-center py-8 px-4">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                            No growth entries yet. Add your first measurement to start the timeline!
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
                
                {/* --- RIGHT COLUMN --- */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Growth Card */}
                    <section className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                           <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-3"><RulerIcon className="w-5 h-5"/> Growth Chart & Log</h3>
                        </div>
                        <div className="p-4">
                            <GrowthChart history={plant.growthHistory || []} />
                        </div>
                         <form onSubmit={handleAddGrowthSubmit} className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-b-lg space-y-3">
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                               <div>
                                    <label htmlFor="growth-height" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Height (cm)</label>
                                    <input type="number" id="growth-height" value={height} onChange={e => setHeight(e.target.value)} required min="0" step="0.1" className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md focus:ring-green-500 focus:border-green-500 text-sm" placeholder="e.g., 25.5"/>
                                </div>
                                <div>
                                    <label htmlFor="growth-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                                    <input type="date" id="growth-date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md focus:ring-green-500 focus:border-green-500 text-sm" />
                                </div>
                           </div>
                            <div>
                                <label htmlFor="growth-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes (optional)</label>
                                <textarea id="growth-notes" value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="e.g., New leaf unfurled!" className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-md focus:ring-green-500 focus:border-green-500 text-sm"></textarea>
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2 font-semibold"><PlusIcon className="w-5 h-5"/> Save Entry</button>
                            </div>
                        </form>
                    </section>
                    {/* Watering Card */}
                    <section className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-3"><ChartBarIcon className="w-5 h-5"/> Watering Pattern</h3>
                        </div>
                         {plant.wateringHistory && plant.wateringHistory.length > 1 ? (
                            <div className="p-4">
                               <WateringChart history={plant.wateringHistory} idealFrequency={plant.wateringFrequency} />
                            </div>
                        ) : (
                            <div className="text-center py-8 px-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                    Water your plant again to see a pattern chart here.
                                </p>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
      </div>
    </div>
  );
};