import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function generateMovieAudition(actingLevel: number, projectTitle?: string, roleName?: string) {
  try {
    const context = projectTitle ? `specifically for the role of "${roleName}" in the movie titled "${projectTitle}".` : "";
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a short movie script snippet for an audition ${context}
      The player's acting level is ${actingLevel} (0-100). 
      Make the scene challenging but appropriate. 
      Include a character description, a short back-and-forth dialogue (3-4 lines), and a 'director's note' on how to play it.
      Format the output as a JSON object with fields: title, genre, character, dialogue, directorsNote.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            genre: { type: Type.STRING },
            character: { type: Type.STRING },
            dialogue: { type: Type.STRING },
            directorsNote: { type: Type.STRING },
          },
          required: ["title", "genre", "character", "dialogue", "directorsNote"],
        },
      },
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
}

export async function generateTabloidHeadlines(playerName: string, fame: number, rivals: string[] = []) {
  try {
    const rivalContext = rivals.length > 0 ? `Mention at least one of these rivals in a scandalous way: ${rivals.join(', ')}.` : "";
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 3 tabloid news headlines for an actor named ${playerName}. 
      Their fame level is ${fame}/100. 
      ${rivalContext}
      Headlines should range from flattering to scandalous.
      Format as a JSON array of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
}
