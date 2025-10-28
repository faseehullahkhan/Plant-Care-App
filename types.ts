export interface Plant {
  id: string;
  name: string;
  wateringFrequency: number; // in days
  sunlight: string; // e.g., 'Bright, indirect light'
  temperature: string; // e.g., '18-29°C'
  lastWatered: string; // ISO date string
  imageUrl: string;
  wateringHistory: string[]; // Array of ISO date strings
  notes?: string; // User-specific notes
}

export interface ExplorePlant {
  name: string;
  description: string;
  sunlight: string;
  watering: string;
  temperature: string;
}

export interface AiCareTip {
  isMatch: boolean;
  mismatchMessage?: string;
  tips?: string[];
}