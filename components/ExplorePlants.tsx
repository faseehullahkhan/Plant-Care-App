import React, { useState, useEffect } from 'react';
import { ExplorePlant } from '../types';
import { getPopularPlants, searchPlants } from '../services/geminiService';
import { LoaderIcon, SunIcon, ThermometerIcon, WaterDropIcon, SearchIcon, LeafIcon, XIcon } from './Icons';
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

const ExplorePlantCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-slate-700 animate-pulse">
    <div className="h-48 bg-gray-300 dark:bg-slate-700" />
    <div className="p-5">
      <div className="h-6 w-3/4 bg-gray-300 dark:bg-slate-700 rounded mb-3" />
      <div className="h-4 w-full bg-gray-300 dark:bg-slate-700 rounded" />
      <div className="h-4 w-5/6 bg-gray-300 dark:bg-slate-700 rounded mt-2" />
    </div>
    <div className="p-5 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700 space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-slate-700 flex-shrink-0 mt-0.5" />
          <div className="w-full space-y-1.5">
            <div className="h-3 w-1/4 bg-gray-300 dark:bg-slate-700 rounded" />
            <div className="h-3 w-1/2 bg-gray-300 dark:bg-slate-700 rounded" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const useDebounce = (value: string, delay: number): string => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};


export const ExplorePlants: React.FC = () => {
  const [popularPlants, setPopularPlants] = useState<ExplorePlant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlant, setSelectedPlant] = useState<ExplorePlant | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ExplorePlant[] | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

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

  useEffect(() => {
    const handleSearch = async () => {
      if (!debouncedSearchTerm.trim()) {
        setSearchResults(null);
        setError(null);
        return;
      }

      setIsSearching(true);
      setError(null);
      try {
        const results = await searchPlants(debouncedSearchTerm.trim());
        setSearchResults(results);
      } catch (err) {
        setError('An error occurred during the search. Please try again.');
        setSearchResults(null);
      } finally {
        setIsSearching(false);
      }
    };

    handleSearch();
  }, [debouncedSearchTerm]);


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
         <div className="animate-fade-in">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
              Searching for "{searchTerm}"...
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <ExplorePlantCardSkeleton key={i} />)}
            </div>
        </div>
      );
    }
    
    const displayedPlants = searchResults !== null ? searchResults : popularPlants;
    const isShowingSearchResults = searchResults !== null;

    if (isShowingSearchResults && displayedPlants.length === 0) {
        return (
          <div className="text-center py-10 px-6 animate-fade-in">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">No Results for "{searchTerm}"</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
              We couldn't find any plants matching your search. Try a different name or check for typos.
            </p>
             <button
              onClick={() => setSearchTerm('')}
              className="mt-6 inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              Clear Search & View Popular Plants
            </button>
          </div>
        );
    }

    // Default view & Search Results
    return (
       <div className="animate-fade-in">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            {isShowingSearchResults ? 'Search Results' : 'Popular Plants'}
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

      <div className="mb-8 max-w-lg mx-auto">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search for any plant in the world..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-slate-600 rounded-lg leading-5 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm shadow-sm transition-colors"
          />
          {searchTerm && !isSearching && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              aria-label="Clear search"
            >
              <XIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
            </button>
          )}
          {isSearching && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <LoaderIcon className="w-5 h-5 text-gray-400 animate-spin" />
            </div>
          )}
        </div>
      </div>

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
