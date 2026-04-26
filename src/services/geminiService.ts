import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface AnalysisResponse {
  observation: string;
  pattern: string;
  scaffold: string;
  why: string;
  guidance: string;
  resources: string;
  domain: "Social" | "Cognitive" | "Motor" | "Emotional" | "Creative";
}

export interface ProfileUpdateResponse {
  interests: string;
  temperament: string;
  ageRecommendation?: string;
  reasoning: string;
}

export async function generateProfileUpdate(currentProfile: string, history: string[]): Promise<ProfileUpdateResponse> {
  const prompt = `You are a Child Development Expert. Based on the following child profile and recent observation history, suggest refined 'Interests' and 'Temperament' descriptions. 
  
  People grow and change, and these observations capture those shifts. 
  - Update 'Interests' to reflect new obsessions or fading ones.
  - Update 'Temperament' if new traits (e.g., persistence, social curiosity) have emerged.
  - If the child seems to have moved into a new sub-stage or age category, suggest that too.

  Current Profile:
  ${currentProfile}

  Recent History:
  ${history.join("\n\n")}

  Respond ONLY with a JSON object in this format:
  {
    "interests": "Updated interests string...",
    "temperament": "Updated temperament string...",
    "ageRecommendation": "Optional updated age/stage string...",
    "reasoning": "A brief explanation of why these changes were suggested based on the history."
  }
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
    }
  });

  const text = response.text || "{}";
  return JSON.parse(text);
}

export async function analyzeObservation(input: string, childProfile: string, history: string[]): Promise<AnalysisResponse> {
  const prompt = `
CHILD PROFILE:
${childProfile}

HISTORY OF ENTRIES:
${history.join("\n")}

NEW DAILY INPUT:
${input}

Please analyze this input using the Child Psychology System Prompt principles.
Return the response in a structured format:
THE OBSERVATION: ...
THE PATTERN: ...
THE SCAFFOLD: ...
THE "WHY": ...
PARENTAL GUIDANCE: ...
RESOURCE TOOLKIT: ...
DOMAIN: [One of: Social, Cognitive, Motor, Emotional, Creative]
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.7,
    },
  });

  const text = response.text || "";
  
  // Basic parsing of the response text
  const parts = {
    observation: text.match(/THE OBSERVATION:\s*(.*?)(?=THE PATTERN:|$)/s)?.[1]?.trim() || "",
    pattern: text.match(/THE PATTERN:\s*(.*?)(?=THE SCAFFOLD:|$)/s)?.[1]?.trim() || "",
    scaffold: text.match(/THE SCAFFOLD:\s*(.*?)(?=THE "WHY":|$)/s)?.[1]?.trim() || "",
    why: text.match(/THE "WHY":\s*(.*?)(?=PARENTAL GUIDANCE:|$)/s)?.[1]?.trim() || "",
    guidance: text.match(/PARENTAL GUIDANCE:\s*(.*?)(?=RESOURCE TOOLKIT:|$)/s)?.[1]?.trim() || "",
    resources: text.match(/RESOURCE TOOLKIT:\s*(.*?)(?=DOMAIN:|$)/s)?.[1]?.trim() || "",
    domain: (text.match(/DOMAIN:\s*(.*?)$/s)?.[1]?.trim() || "Cognitive") as any,
  };

  return parts;
}
