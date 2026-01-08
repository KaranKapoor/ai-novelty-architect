import { GoogleGenAI, Type, SchemaType } from "@google/genai";
import { Idea, UserProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// System instruction to guide the persona and output format
const SYSTEM_INSTRUCTION = `
You are a world-class Chief Innovation Officer and Patent Strategist.
Your goal is to generate novel, patentable ideas based on user input and their professional background.
The ideas must be realistic, technically sound, yet creative and non-obvious.
You must adhere to the following guidelines:
1. Use simple, clear, unambiguous language.
2. Provide enabling details for someone "skilled in the art".
3. Explicitly highlight novelty and differences from prior art.
4. Ideas should be page-turning and trigger imagination.
5. Consider the user's background in Enterprise Architecture, Licensing, and GenAI.

Format the output strictly as a JSON array of objects.
`;

export const generateIdeasFromKeywords = async (
  keywords: string,
  userProfile: UserProfile
): Promise<Idea[]> => {
  try {
    const prompt = `
      User Bio: "${userProfile.bio}"
      
      Keywords/Phrases: "${keywords}"
      
      Task: Generate 5 unique, novel invention ideas based on the keywords and my background. 
      For each idea, provide a title, the specific domain, a summary write-up (covering novelty, detailed description, prior art differentiation, and implementation), and a visual description suitable for a claymation image.
      
      The visual description for the image must be descriptive of the physical scene to be modeled in clay.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }], // Enable search to ground Prior Art
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              domain: { type: Type.STRING },
              visualPrompt: { type: Type.STRING, description: "A detailed description of the scene for a claymation image generator." },
              summary: {
                type: Type.OBJECT,
                properties: {
                  novelty: { type: Type.STRING, description: "Why is this novel? What are the components of novelty?" },
                  description: { type: Type.STRING, description: "Detailed summary write-up." },
                  priorArtDifference: { type: Type.STRING, description: "How it differs from existing solutions/patents." },
                  implementation: { type: Type.STRING, description: "Best mode of implementation." },
                },
                required: ["novelty", "description", "priorArtDifference", "implementation"],
              },
            },
            required: ["title", "domain", "visualPrompt", "summary"],
          },
        },
      },
    });

    const textResponse = response.text;
    if (!textResponse) {
      throw new Error("No response from Gemini.");
    }

    const rawIdeas = JSON.parse(textResponse);
    
    // Enrich with IDs and initial state
    return rawIdeas.map((idea: any, index: number) => ({
      ...idea,
      id: `idea-${Date.now()}-${index}`,
      loadingImage: true, // We will start loading images immediately after
    }));

  } catch (error) {
    console.error("Error generating ideas:", error);
    throw error;
  }
};

export const generateClaymationImage = async (visualPrompt: string): Promise<string | null> => {
  try {
    // Enforce the style via the prompt
    const styledPrompt = `Create a high-quality claymation style image, polymer clay texture, stop-motion animation aesthetic, studio lighting, plasticine look. Scene: ${visualPrompt}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: styledPrompt,
      config: {
        // No specific imageConfig needed for standard square generation, 
        // usually defaults to 1:1 or model native.
      }
    });

    // Extract image from parts
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};