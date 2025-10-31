import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Plant, AiCareTip, AiHealthReport, GrowthEntry } from './types';
import { getPlantCareInfo, getAiHealthCheck } from './services/geminiService';
import { PlantCard } from './components/PlantCard';
import { AddPlantModal } from './components/AddPlantModal';
import { AIHealthCheckModal } from './components/AIHealthCheckModal';
import { PlantDetailModal } from './components/PlantDetailModal';
import { Header } from './components/Header';
import { PlusIcon, SortIcon, LeafIcon } from './components/Icons';
import { ExplorePlants } from './components/ExplorePlants';
import { useAuth } from './contexts/AuthContext';
import { AuthPage } from './components/auth/AuthPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { playClick, playDelete, playSuccess } from './utils/soundManager';

type Page = 'dashboard' | 'explore' | 'settings';
type SortOrder = 'default' | 'watering';

// Helper function to convert File to base64 and get its mime type for the API
const fileToBase64 = (file: File): Promise<{data: string, mimeType: string}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64String = result.split(',')[1];
      resolve({ data: base64String, mimeType: file.type });
    };
    reader.onerror = error => reject(error);
  });
};

// Helper function to convert File to a base64 data URL for display
const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const calculateDaysUntilWatering = (plant: Plant): number => {
    const lastWateredDate = new Date(plant.lastWatered);
    const nextWatering = new Date(lastWateredDate);
    nextWatering.setDate(lastWateredDate.getDate() + plant.wateringFrequency);

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date
    
    // Create a normalized nextWatering date for diff calculation without affecting the time for display
    const nextWateringForDiff = new Date(nextWatering);
    nextWateringForDiff.setHours(0, 0, 0, 0);

    const diffTime = nextWateringForDiff.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};


const App: React.FC = () => {
  const { currentUser } = useAuth();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isHealthCheckModalOpen, setHealthCheckModalOpen] = useState(false);
  const [healthCheckImageUrl, setHealthCheckImageUrl] = useState<string | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [detailedPlant, setDetailedPlant] = useState<Plant | null>(null);
  const [healthReport, setHealthReport] = useState<AiHealthReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sortOrder, setSortOrder] = useState<SortOrder>('default');

  useEffect(() => {
    // Load plants from local storage on user change
    if (currentUser) {
      try {
        const storedPlants = localStorage.getItem(`plants_${currentUser.email}`);
        if (storedPlants) {
          setPlants(JSON.parse(storedPlants));
        } else {
          setPlants([]);
        }
      } catch (e) {
        console.error("Failed to load plants from local storage", e);
        setPlants([]);
      }
    } else {
      // Clear plants when user logs out
      setPlants([]);
    }
  }, [currentUser]);

  useEffect(() => {
    // Save plants to local storage whenever they change, if user is logged in
    if (currentUser) {
      try {
        localStorage.setItem(`plants_${currentUser.email}`, JSON.stringify(plants));
      } catch (e) {
        console.error("Failed to save plants to local storage", e);
      }
    }
  }, [plants, currentUser]);
  
  const handleHealthCheck = useCallback(async (plant: Plant, imageFile: File) => {
    setSelectedPlant(plant);
    setHealthReport(null);
    setError(null);
    
    // Convert to data URL for preview and open modal immediately
    const imageUrl = await fileToDataUrl(imageFile);
    setHealthCheckImageUrl(imageUrl);
    setHealthCheckModalOpen(true);
    setIsLoading(true);
    
    try {
      const imageData = await fileToBase64(imageFile);
      const reportData = await getAiHealthCheck(plant, imageData);
      setHealthReport(reportData);
    } catch (err) {
       const errorMessage = err instanceof Error ? err.message : 'Failed to get AI Health Check. Please try again.';
      setError(errorMessage);
      console.error(err);
      setHealthReport(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAddPlant = useCallback(async (plantName: string, imageFile: File, lastWateredDate: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch care info and convert uploaded image to data URL in parallel
      const [careInfo, imageDataUrl] = await Promise.all([
        getPlantCareInfo(plantName),
        fileToDataUrl(imageFile),
      ]);

      const newPlant: Plant = {
        id: crypto.randomUUID(),
        name: plantName,
        ...careInfo,
        lastWatered: new Date(lastWateredDate).toISOString(),
        imageUrl: imageDataUrl, // Use the user-uploaded image
        wateringHistory: [new Date(lastWateredDate).toISOString()],
        notes: '',
      };
      
      setPlants(prevPlants => [...prevPlants, newPlant]);
      setAddModalOpen(false);
      playSuccess();
      
    } catch (err) {
      setError('Failed to add plant. Could not get care info. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleWaterPlant = useCallback((plantId: string) => {
    setPlants(prevPlants =>
      prevPlants.map(p => {
        if (p.id === plantId) {
          const newWateredDate = new Date().toISOString();
          // Prepend the new date to the history. Create history from lastWatered if it doesn't exist.
          const newHistory = [newWateredDate, ...(p.wateringHistory || [p.lastWatered])];
          // Limit history to the last 10 entries for performance and UI cleanliness
          if (newHistory.length > 10) {
            newHistory.splice(10);
          }
          return {
            ...p,
            lastWatered: newWateredDate,
            wateringHistory: newHistory,
          };
        }
        return p;
      })
    );
    playClick();
  }, []);

  const handleUpdatePlantNotes = useCallback((plantId: string, notes: string) => {
    setPlants(prevPlants =>
      prevPlants.map(p => (p.id === plantId ? { ...p, notes } : p))
    );
  }, []);
  
  const handleUpdatePlantNickname = useCallback((plantId: string, nickname: string) => {
    const trimmedNickname = nickname.trim();
    setPlants(prevPlants =>
        prevPlants.map(p => (p.id === plantId ? { ...p, nickname: trimmedNickname || undefined } : p))
    );
    // Also update the detailed plant if it's the one being edited
    setDetailedPlant(prev => prev && prev.id === plantId ? {...prev, nickname: trimmedNickname || undefined} : prev);
    playClick();
  }, []);


  const handleDeletePlant = useCallback((plantId: string) => {
    setPlants(prevPlants => prevPlants.filter(p => p.id !== plantId));
    playDelete();
  }, []);

  const handleAddGrowthEntry = useCallback((plantId: string, entry: Omit<GrowthEntry, 'id'>) => {
    const newEntry: GrowthEntry = {
      id: crypto.randomUUID(),
      ...entry,
    };
    setPlants(prevPlants => 
      prevPlants.map(p => {
        if (p.id === plantId) {
          const updatedHistory = [...(p.growthHistory || []), newEntry];
          updatedHistory.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          return {...p, growthHistory: updatedHistory };
        }
        return p;
      })
    );
     // Also update the detailed plant if it's the one being edited
    setDetailedPlant(prev => {
        if (prev && prev.id === plantId) {
            const updatedHistory = [...(prev.growthHistory || []), newEntry];
            updatedHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            return { ...prev, growthHistory: updatedHistory };
        }
        return prev;
    });
    playClick();
  }, []);

  const closeHealthCheckModal = () => {
    setHealthCheckModalOpen(false);
    setSelectedPlant(null);
    setHealthReport(null);
    setError(null);
    setHealthCheckImageUrl(null);
  };

  const sortedPlants = useMemo(() => {
    if (sortOrder === 'watering') {
      return [...plants].sort((a, b) => {
        return calculateDaysUntilWatering(a) - calculateDaysUntilWatering(b);
      });
    }
    return plants; // Default order is the order of addition
  }, [plants, sortOrder]);


  const renderDashboard = () => {
    if (plants.length === 0) {
      return (
        <div className="text-center py-20 px-6 animate-fade-in-up">
          <div className="inline-block p-6 bg-green-100 dark:bg-green-900/50 rounded-full mb-6">
            <LeafIcon className="w-16 h-16 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">Welcome to Your Virtual Garden, {currentUser?.name.split(' ')[0]}!</h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">Let's add your first plant to get started and watch your digital oasis grow.</p>
          <button
            onClick={() => setAddModalOpen(true)}
            className="mt-8 inline-flex items-center gap-3 px-8 py-4 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 transform hover:scale-105"
          >
            <PlusIcon className="w-6 h-6" />
            Add Your First Plant
          </button>
        </div>
      );
    }

    return (
      <div className="animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">My Plants ({plants.length})</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortOrder(prev => (prev === 'default' ? 'watering' : 'default'))}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-semibold rounded-lg shadow-sm border border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300"
            >
              <SortIcon className="w-5 h-5" />
              <span>{sortOrder === 'default' ? 'Sort by Next Watering' : 'Reset Sort'}</span>
            </button>
             <button
                onClick={() => setAddModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 transform hover:scale-105"
            >
                <PlusIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Add Plant</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger-in">
          {sortedPlants.map(plant => (
            <PlantCard
              key={plant.id}
              plant={plant}
              onWater={handleWaterPlant}
              onHealthCheck={handleHealthCheck}
              onDelete={handleDeletePlant}
              onUpdateNotes={handleUpdatePlantNotes}
              onViewDetails={() => setDetailedPlant(plant)}
            />
          ))}
        </div>
      </div>
    );
  }
  
  const renderPage = () => {
    switch(currentPage) {
        case 'dashboard':
            return renderDashboard();
        case 'explore':
            return <ExplorePlants />;
        case 'settings':
            return <SettingsPage />;
        default:
            return renderDashboard();
    }
  }

  if (!currentUser) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen">
      <Header
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />
      
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {renderPage()}
      </main>

      {isAddModalOpen && (
        <AddPlantModal
          onClose={() => setAddModalOpen(false)}
          onAddPlant={handleAddPlant}
          isLoading={isLoading}
          error={error}
        />
      )}
      
      {isHealthCheckModalOpen && selectedPlant && (
        <AIHealthCheckModal
          plant={selectedPlant}
          reportData={healthReport}
          isLoading={isLoading}
          onClose={closeHealthCheckModal}
          error={error}
          onUpdateNotes={handleUpdatePlantNotes}
          imagePreviewUrl={healthCheckImageUrl}
        />
      )}

      {detailedPlant && (
        <PlantDetailModal
          plant={detailedPlant}
          onClose={() => setDetailedPlant(null)}
          onAddGrowthEntry={handleAddGrowthEntry}
          onUpdateNickname={handleUpdatePlantNickname}
        />
      )}

    </div>
  );
};

export default App;