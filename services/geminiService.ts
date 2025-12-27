import { GoogleGenAI, Type } from "@google/genai";
import { Category } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const categorizeTask = async (taskDescription: string): Promise<Category> => {
  try {
    const modelId = "gemini-3-flash-preview"; 
    
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Kategorisiere diese Aufgabe in genau eine Kategorie: Fokus, Kreativ, Körper, Mental, Freizeit.
      
      Regeln:
      - Fokus: Arbeit, Studium, Konzentration, Orga.
      - Kreativ: Malen, Design, Schreiben, Kunst, Erschaffen.
      - Körper: Sport, Bewegung, Gesundheit, Ernährung.
      - Mental: Therapie, Meditation, Journaling, Self-care, Nachdenken.
      - Freizeit: Gaming, Freunde treffen, Spaß, Entspannung.
      
      Aufgabe: "${taskDescription}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              enum: ["Fokus", "Kreativ", "Körper", "Mental", "Freizeit"]
            }
          }
        }
      }
    });

    const json = JSON.parse(response.text || "{}");
    
    // Map response string to Enum
    switch (json.category) {
      case "Fokus": return Category.FOCUS;
      case "Kreativ": return Category.CREATIVE;
      case "Körper": return Category.BODY;
      case "Mental": return Category.MENTAL;
      case "Freizeit": return Category.LEISURE;
      default: return Category.UNASSIGNED;
    }
  } catch (error) {
    console.error("AI Categorization failed", error);
    return Category.UNASSIGNED;
  }
};