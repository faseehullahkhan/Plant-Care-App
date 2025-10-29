import React, { useState, useEffect } from 'react';
import { ExplorePlant } from '../types';
import { getPopularPlants, searchPlantByName } from '../services/geminiService';
import { LoaderIcon, SunIcon, ThermometerIcon, WaterDropIcon, SearchIcon, LeafIcon } from './Icons';
import { ExplorePlantDetailModal } from './ExplorePlantDetailModal';

interface ExplorePlantCardProps {
  plant: ExplorePlant;
  onClick: () => void;
}

const ExplorePlantCard: React.FC<ExplorePlantCardProps> = ({ plant, onClick }) => (
  <button 
    onClick={onClick}
    className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden flex flex-col text-left w-full transition-all transform duration-300 hover:-translate-y-2 hover:shadow-2xl dark:shadow-black/20 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 border border-gray-200 dark:border-slate-700"
  >
    <div className="relative h-48 bg-gray-100 dark:bg-slate-700">
      {plant.imageUrl ? (
        <img src={plant.imageUrl} alt={plant.name} className="w-full h-full object-cover" />
      ) : (
        <div className="flex items-center justify-center w-full h-full">
            <LeafIcon className="w-12 h-12 text-gray-300 dark:text-slate-500" />
        </div>
      )}
    </div>
    <div className="p-5">
      <h3 className="text-xl font-bold capitalize truncate text-gray-900 dark:text-white">{plant.name}</h3>
      <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm h-10">{plant.description}</p>
    </div>
    <div className="p-5 flex flex-col flex-grow space-y-3 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700">
      <div className="flex items-start gap-3">
        <SunIcon className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Sunlight</h4>
          <span>{plant.sunlight}</span>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <WaterDropIcon className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Watering</h4>
          <span>{plant.watering}</span>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <ThermometerIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Temperature</h4>
          <span>{plant.temperature}</span>
        </div>
      </div>
    </div>
  </button>
);

export const ExplorePlants: React.FC = () => {
  const [popularPlants, setPopularPlants] = useState<ExplorePlant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlant, setSelectedPlant] = useState<ExplorePlant | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ExplorePlant[] | null>(null);

  useEffect(() => {
    const fetchPopularPlants = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const plants = await getPopularPlants();
        setPopularPlants(plants);
      } catch (err) {
        setError('Could not fetch plant ideas. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPopularPlants();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value === '') {
        setSearchResults(null);
        setError(null);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    setError(null);
    setSearchResults([]); // Clear previous results to signify a search is in progress
    
    try {
      const result = await searchPlantByName(searchTerm.trim());
      setSearchResults(result ? [result] : []);
    } catch (err) {
      setError('An error occurred during the search. Please try again.');
      console.error(err);
      setSearchResults(null); // On error, revert to showing popular plants list
    } finally {
      setIsSearching(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-20">
          <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
            <LoaderIcon className="w-10 h-10 animate-spin text-green-600"/>
            <span className="text-lg">Fetching plant inspiration...</span>
          </div>
        </div>
      );
    }

    if (error) {
       return (
        <div className="text-center py-20 px-6 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <h3 className="text-xl font-semibold text-red-700 dark:text-red-300">Oops! Something went wrong.</h3>
            <p className="text-red-600 dark:text-red-400 mt-2">{error}</p>
        </div>
      );
    }

    if (isSearching) {
      return (
         <div className="flex justify-center items-center py-20">
          <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
            <LoaderIcon className="w-10 h-10 animate-spin text-green-600"/>
            <span className="text-lg">Searching for "{searchTerm}"...</span>
          </div>
        </div>
      );
    }
    
    const displayedPlants = searchResults !== null ? searchResults : popularPlants;

    if (searchResults !== null && searchResults.length === 0) {
        return (
          <div className="text-center py-10 px-6">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">No Results for "{searchTerm}"</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
              Please check the spelling or try another name. In the meantime, why not explore one of these popular plants?
            </p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-in">
              {popularPlants.map((plant) => (
                <ExplorePlantCard 
                  key={plant.name} 
                  plant={plant} 
                  onClick={() => setSelectedPlant(plant)}
                />
              ))}
            </div>
          </div>
        );
    }

    // Default view & Search Results
    return (
       <div className="animate-fade-in">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            {searchResults !== null ? 'Search Result' : 'Popular Plants'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-in">
          {displayedPlants.map((plant) => (
            <ExplorePlantCard 
              key={plant.name} 
              plant={plant} 
              onClick={() => setSelectedPlant(plant)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in-up">
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">Discover New Plants</h2>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Looking for a new leafy friend? Search for any plant below, or browse our popular picks.
        </p>
      </div>

      <form onSubmit={handleSearchSubmit} className="mb-8 max-w-lg mx-auto flex gap-2">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search for any plant in the world..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-slate-600 rounded-lg leading-5 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm shadow-sm"
          />
        </div>
        <button
          type="submit"
          disabled={isSearching || !searchTerm.trim()}
          className="px-4 sm:px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 disabled:bg-green-400 dark:disabled:bg-green-800 flex items-center justify-center"
        >
          {isSearching ? (
            <LoaderIcon className="w-5 h-5 animate-spin" />
          ) : (
             <>
                <SearchIcon className="w-5 h-5 sm:hidden" />
                <span className="hidden sm:inline">Search</span>
            </>
          )}
        </button>
      </form>

      {renderContent()}

      {selectedPlant && (
        <ExplorePlantDetailModal
          plant={selectedPlant}
          onClose={() => setSelectedPlant(null)}
        />
      )}
    </div>
  );
};