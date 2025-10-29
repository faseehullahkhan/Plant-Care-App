export interface GrowthEntry {
  id: string;
  date: string; // ISO date string
  height: number; // in cm
  notes?: string;
}

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
  growthHistory?: GrowthEntry[];
}

export interface ExplorePlant {
  name: string;
  description: string;
  sunlight: string;
  watering: string;
  temperature: string;
  imageUrl: string;
}

export interface AiCareTip {
  isMatch: boolean;
  mismatchMessage?: string;
  tips?: string[];
}

export interface BoundingBox {
  x1: number; // top-left x (normalized 0-1)
  y1: number; // top-left y (normalized 0-1)
  x2: number; // bottom-right x (normalized 0-1)
  y2: number; // bottom-right y (normalized 0-1)
}

export interface AiHealthReport {
  isMatch: boolean;
  mismatchMessage?: string;
  healthScore?: number; // A score from 1-100
  overallAssessment?: string; // e.g., 'Healthy', 'Showing signs of stress'
  positiveSigns?: string[]; // e.g., ["Vibrant green leaves", "New growth is visible"]
  potentialIssues?: {
    issue: string; // e.g., "Yellowing Leaves"
    possibleCause: string; // e.g., "Overwatering or nutrient deficiency"
    boundingBox?: BoundingBox;
  }[];
  recommendations?: string[]; // Actionable recommendations
}


export interface User {
  name: string;
  email: string;
  avatarUrl?: string;
}