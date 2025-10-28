import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Plant, AiCareTip } from './types';
import { getPlantCareInfo, getAiCareTip } from './services/geminiService';
import { PlantCard } from './components/PlantCard';
import { AddPlantModal } from './components/AddPlantModal';
import { AICareTipModal } from './components/AICareTipModal';
import { Header } from './components/Header';
import { PlusIcon, SortIcon, LeafIcon } from './components/Icons';
import { ExplorePlants } from './components/ExplorePlants';
import { useAuth } from './contexts/AuthContext';
import { AuthPage } from './components/auth/AuthPage';
import { SettingsPage } from './components/settings/SettingsPage';

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
  const [isAiTipModalOpen, setAiTipModalOpen] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [aiTip, setAiTip] = useState<AiCareTip | null>(null);
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

  const handleGetAiTip = useCallback(async (plant: Plant, imageFile: File | null = null) => {
    setSelectedPlant(plant);
    setAiTipModalOpen(true);
    setIsLoading(true);
    setError(null);
    setAiTip(null);
    try {
      let imageData: {data: string, mimeType: string} | undefined = undefined;
      if (imageFile) {
        imageData = await fileToBase64(imageFile);
      }
      const tipData = await getAiCareTip(plant, imageData);
      setAiTip(tipData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get AI care tip. Please try again.';
      setError(errorMessage);
      console.error(err);
      setAiTip(null);
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
      
      // Get a personalized tip based on the uploaded photo
      handleGetAiTip(newPlant, imageFile);
    } catch (err) {
      setError('Failed to add plant. Could not get care info. Please try again.');
      console.error(err);
    } finally {
      // The AI Tip modal has its own loading indicator, so we can turn this one off.
      setIsLoading(false);
    }
  }, [handleGetAiTip]);

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
  }, []);

  const handleUpdatePlantNotes = useCallback((plantId: string, notes: string) => {
    setPlants(prevPlants =>
      prevPlants.map(p => (p.id === plantId ? { ...p, notes } : p))
    );
  }, []);


  const handleDeletePlant = useCallback((plantId: string) => {
    setPlants(prevPlants => prevPlants.filter(p => p.id !== plantId));
  }, []);

  const closeAiTipModal = () => {
    setAiTipModalOpen(false);
    setSelectedPlant(null);
    setAiTip(null);
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
              onGetAiTip={handleGetAiTip}
              onDelete={handleDeletePlant}
              onUpdateNotes={handleUpdatePlantNotes}
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

      {isAiTipModalOpen && selectedPlant && (
        <AICareTipModal
          plantName={selectedPlant.name}
          tipData={aiTip}
          isLoading={isLoading}
          onClose={closeAiTipModal}
          error={error}
        />
      )}
    </div>
  );
};

export default App;