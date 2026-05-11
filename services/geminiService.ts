
import { GoogleGenAI } from "@google/genai";
import { BUILDINGS, EVENTS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function askCampusAssistant(prompt: string) {
  const systemInstruction = `
    You are the CUTM (Centurion University) Campus Assistant for the Vizianagaram campus.
    
    Current Campus Data:
    Buildings: ${BUILDINGS.map(b => `${b.name} (${b.description})`).join(', ')}
    
    Specific Layout Information for Hostel Cluster (South-West of main campus):
    - Head from Block C past the Solar Plant (~1km).
    - The Boys Hostel is the main residential hub.
    - To the NORTH of the hostel is the Boys Mess.
    - To the WEST of the hostel is the Skill Campus.
    - Further SOUTH/WEST of the Skill Campus is the Sports Ground.
    
    Upcoming Events: ${EVENTS.map(e => `${e.title} at ${BUILDINGS.find(b => b.id === e.locationId)?.name}`).join(', ')}
    
    Rules:
    1. Be friendly, professional, and proud of CUTM.
    2. If asked about the hostel cluster layout, describe the relative positions: Mess is north, Skill Campus is west, and Sports Ground is south of Skill Campus.
    3. Suggest visiting the Skyline Rooftop (Block B) for views or the Sports Ground for exercise.
    4. Keep answers concise.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "I'm sorry, I couldn't process that. How else can I help you today?";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The assistant is currently taking a coffee break. Please try again in a moment!";
  }
}
