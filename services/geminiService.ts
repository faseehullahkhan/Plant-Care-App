import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { Plant, ExplorePlant, AiCareTip, AiHealthReport } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const plantCareSchema = {
  type: Type.OBJECT,
  properties: {
    wateringFrequency: {
      type: Type.NUMBER,
      description: 'The ideal watering frequency in number of days. For example, 7 for once a week.'
    },
    sunlight: {
      type: Type.STRING,
      description: 'A concise description of the ideal sunlight. For example, "Bright, indirect light".'
    },
    temperature: {
      type: Type.STRING,
      description: 'The ideal temperature range. For example, "18-29°C".'
    },
  },
  required: ['wateringFrequency', 'sunlight', 'temperature']
};

const popularPlantsSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: "The common name of the plant." },
            description: { type: Type.STRING, description: "A brief, engaging one-sentence description of the plant." },
            sunlight: { type: Type.STRING, description: "A concise description of ideal sunlight conditions." },
            watering: { type: Type.STRING, description: "A concise description of ideal watering frequency." },
            temperature: { type: Type.STRING, description: "The ideal temperature range, e.g., '18-26°C'." },
        },
        required: ['name', 'description', 'sunlight', 'watering', 'temperature']
    }
};

const explorePlantInfoSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "The common name of the plant, formatted to match the user's query if possible." },
        description: { type: Type.STRING, description: "A brief, engaging description of the plant (1-2 sentences)." },
        sunlight: { type: Type.STRING, description: "A concise description of ideal sunlight conditions." },
        watering: { type: Type.STRING, description: "A concise description of ideal watering frequency." },
        temperature: { type: Type.STRING, description: "The ideal temperature range, e.g., '18-26°C'." },
    },
    required: ['name', 'description', 'sunlight', 'watering', 'temperature']
};

const aiCareTipSchema = {
    type: Type.OBJECT,
    properties: {
        tips: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'A list of 2-3 detailed, actionable care tips for the plant. Each tip should be a short, complete sentence.'
        }
    },
    required: ['tips']
};

const aiCareTipWithImageSchema = {
    type: Type.OBJECT,
    properties: {
        isMatch: {
            type: Type.BOOLEAN,
            description: "True if the uploaded image is a match for the plant, false otherwise."
        },
        mismatchMessage: {
            type: Type.STRING,
            description: "The exact message to show if the image is not a match. Only present if isMatch is false. For example: 'This photo doesn't seem to be a [Plant Name]. Please upload a picture of the correct plant to get an accurate care tip.'"
        },
        tips: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'A list of 2-3 detailed, actionable care tips based on the image. Each tip should be a short, complete sentence. Only present if isMatch is true.'
        }
    },
    required: ['isMatch']
};

const aiHealthCheckSchema = {
  type: Type.OBJECT,
  properties: {
    isMatch: {
      type: Type.BOOLEAN,
      description: "True if the uploaded image is a match for the plant, false otherwise."
    },
    mismatchMessage: {
      type: Type.STRING,
      description: "The exact message to show if the image is not a match. Only present if isMatch is false. For example: 'This photo doesn't seem to be a [Plant Name]. Please upload a picture of the correct plant for an accurate health check.'"
    },
    healthScore: {
      type: Type.NUMBER,
      description: 'A score from 1 to 100 representing the plant\'s overall health. Only present if isMatch is true.'
    },
    overallAssessment: {
      type: Type.STRING,
      description: 'A brief, one-sentence summary of the plant\'s condition. Only present if isMatch is true.'
    },
    positiveSigns: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'A list of positive observations. Only present if isMatch is true. If none, return an empty array.'
    },
    potentialIssues: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          issue: { type: Type.STRING, description: 'The name of the observed issue. e.g., "Yellowing Leaves", "Brown Spots", "Wilting".' },
          possibleCause: { type: Type.STRING, description: 'The likely cause of the issue. e.g., "Overwatering or nutrient deficiency", "Fungal infection or sun scorch".' }
        },
        required: ['issue', 'possibleCause']
      },
      description: 'A list of potential problems observed. Only present if isMatch is true. If the plant is perfectly healthy, return an empty array.'
    },
    recommendations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'A list of actionable recommendations. Only present if isMatch is true.'
    }
  },
  required: ['isMatch']
};


export const getPlantCareInfo = async (plantName: string): Promise<Omit<Plant, 'id' | 'name' | 'lastWatered' | 'imageUrl'>> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `For a plant named '${plantName}', provide its care information.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: plantCareSchema,
      }
    });

    const jsonText = response.text.trim();
    const careInfo = JSON.parse(jsonText);
    
    // Basic validation
    if (typeof careInfo.wateringFrequency !== 'number' || typeof careInfo.sunlight !== 'string' || typeof careInfo.temperature !== 'string') {
        throw new Error("Invalid data format received from API");
    }

    return careInfo;
  } catch (error) {
    console.error("Error fetching plant care info from Gemini API:", error);
    throw new Error(`Failed to retrieve care information for ${plantName}.`);
  }
};

export const getAiCareTip = async (plant: Plant, imageData?: {data: string; mimeType: string;}): Promise<AiCareTip> => {
    if (imageData) {
        // Multimodal request with image analysis
        const imagePart = {
            inlineData: {
                mimeType: imageData.mimeType,
                data: imageData.data,
            },
        };
        const textPart = {
            text: `Analyze the provided image and determine if it is a photo of a '${plant.name}'. Your response must be a JSON object.
1. **CRITICAL FIRST STEP:** Compare the plant in the image to the name '${plant.name}'.
2. **If it is NOT a match:** Respond with 'isMatch' set to 'false' and a 'mismatchMessage' string. The message should be exactly: "This photo doesn't seem to be a ${plant.name}. Please upload a picture of the correct plant to get an accurate care tip."
3. **If it IS a match:** Respond with 'isMatch' set to 'true'. Then, carefully analyze the plant's appearance in the photo for signs of its current health (e.g., leaf color, wilting, spots, soil moisture). Considering it was last watered on ${new Date(plant.lastWatered).toLocaleDateString()}, provide a 'tips' array containing 2-3 actionable, personalized care tips based on your visual analysis.`
        };

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [imagePart, textPart] },
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: aiCareTipWithImageSchema,
                }
            });
            const result = JSON.parse(response.text.trim());

            // The result from the API should directly map to our AiCareTip type.
            // The component layer will handle the logic based on the response.
            return result as AiCareTip;

        } catch (error) {
            console.error("Error fetching AI care tip from Gemini API with image:", error);
             if (error instanceof Error) {
                 throw error;
            }
            throw new Error(`Failed to retrieve AI care tip for ${plant.name}.`);
        }

    } else {
        // Text-only request
        const nextWateringDate = new Date(plant.lastWatered);
        nextWateringDate.setDate(nextWateringDate.getDate() + plant.wateringFrequency);

        const prompt = `Provide a personalized care guide for a '${plant.name}'. The plant was last watered on ${new Date(plant.lastWatered).toLocaleDateString()} and its next watering is scheduled for ${nextWateringDate.toLocaleDateString()}. Based on this, provide a 'tips' array with a list of 2-3 actionable tips in point form.`;

      try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: aiCareTipSchema,
            }
        });

        const jsonText = response.text.trim();
        const careTip: { tips: string[] } = JSON.parse(jsonText);
        
        if (!Array.isArray(careTip.tips)) {
            throw new Error("Invalid data format received from API");
        }
        
        return { isMatch: true, tips: careTip.tips };
      } catch (error) {
        console.error("Error fetching AI care tip from Gemini API:", error);
        throw new Error(`Failed to retrieve AI care tip for ${plant.name}.`);
      }
    }
};

export const getAiHealthCheck = async (plant: Plant, imageData: {data: string; mimeType: string;}): Promise<AiHealthReport> => {
  const imagePart = {
    inlineData: {
      mimeType: imageData.mimeType,
      data: imageData.data,
    },
  };
  const textPart = {
    text: `Act as a plant health expert. Your response must be a JSON object.
    1. **CRITICAL FIRST STEP:** Analyze the provided image and determine if it is a photo of a '${plant.name}'.
    2. **If it is NOT a match:** Respond with 'isMatch' set to 'false' and a 'mismatchMessage' string. The message should be exactly: "This photo doesn't seem to be a ${plant.name}. Please upload a picture of the correct plant for an accurate health check."
    3. **If it IS a match:** Respond with 'isMatch' set to 'true'. Then, provide a detailed health assessment based *only* on the visual information in the photo, filling out the healthScore, overallAssessment, positiveSigns, potentialIssues, and recommendations fields.`
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: aiHealthCheckSchema,
      }
    });
    
    const result = JSON.parse(response.text.trim());
    return result as AiHealthReport;

  } catch (error) {
    console.error("Error fetching AI Health Check from Gemini API:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to retrieve AI Health Check for ${plant.name}.`);
  }
};



export const getPopularPlants = async (): Promise<ExplorePlant[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "List 8 popular and diverse indoor plants. For each plant, provide its name, a short one-sentence description, and basic care info (sunlight, watering, temperature).",
      config: {
        responseMimeType: 'application/json',
        responseSchema: popularPlantsSchema,
      }
    });

    const jsonText = response.text.trim();
    const popularPlants = JSON.parse(jsonText);
    return popularPlants;
  } catch (error) {
    console.error("Error fetching popular plants from Gemini API:", error);
    throw new Error('Failed to retrieve popular plants.');
  }
};

export const searchPlantByName = async (plantName: string): Promise<ExplorePlant | null> => {
    const prompt = `Find information for a plant named "${plantName}".
- First, verify if this is a real, known plant.
- If it is a real plant, provide its name, a short description, and care details (sunlight, watering, temperature).
- If it is not a real plant or cannot be found, you must indicate it by setting 'plantFound' to false.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        plantFound: {
                            type: Type.BOOLEAN,
                            description: "True if the plant was found, false otherwise."
                        },
                        plantData: {
                            ...explorePlantInfoSchema,
                            description: "The plant's data. Only present if plantFound is true."
                        }
                    },
                    required: ['plantFound']
                }
            }
        });

        const result = JSON.parse(response.text.trim());
        if (result.plantFound && result.plantData) {
            return result.plantData;
        }
        return null;
    } catch (error) {
        console.error(`Error searching for plant "${plantName}" from Gemini API:`, error);
        throw new Error(`Failed to search for plant: ${plantName}.`);
    }
};