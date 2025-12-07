import { GoogleGenAI, Type, Schema } from "@google/genai";
import { StudyTopic, Resource, Flashcard, QuizQuestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Schemas ---

const syllabusSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      description: { type: Type.STRING },
    },
    required: ["title", "description"],
  },
};

const studyContentSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    flashcards: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          answer: { type: Type.STRING },
          ease: { type: Type.NUMBER, description: "Initial ease factor between 1.5 and 3.0" },
        },
        required: ["question", "answer", "ease"],
      },
    },
    quiz: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctAnswerIndex: { type: Type.INTEGER },
          explanation: { type: Type.STRING },
        },
        required: ["question", "options", "correctAnswerIndex", "explanation"],
      },
    },
    prerequisites: { type: Type.STRING },
    keyConcepts: { type: Type.STRING },
    practiceIdeas: { type: Type.STRING },
  },
  required: ["flashcards", "quiz", "prerequisites", "keyConcepts", "practiceIdeas"],
};

// --- Service Methods ---

export const generateSyllabus = async (topic: string): Promise<{ title: string; description: string }[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Create a comprehensive 5-part study syllabus for the topic: "${topic}". Each part should represent a logical progression (e.g., Day 1, Day 2, etc.).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: syllabusSchema,
        systemInstruction: "You are an expert curriculum designer. Break down complex topics into 5 digestible modules.",
      },
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No response text generated");
  } catch (error) {
    console.error("Error generating syllabus:", error);
    return [];
  }
};

export const generateTopicContent = async (
  topicTitle: string,
  context: string
): Promise<Partial<StudyTopic>> => {
  // Parallel execution: Search for Resources AND Generate Study Materials
  
  // 1. Generate Study Materials (Flashcards, Quiz, Concepts)
  const materialPromise = ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Generate study materials for the module: "${topicTitle}". The overall course topic is "${context}".
    Create 4 spaced-repetition flashcards.
    Create 3 multiple-choice quiz questions.
    Provide a brief text on prerequisites, key concepts, and practice ideas.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: studyContentSchema,
    },
  });

  // 2. Find Resources using Search Grounding
  const searchPromise = ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Find 3 high-quality, free online resources (videos, articles, documentation) to learn about: "${topicTitle}" in the context of "${context}".`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  try {
    const [materialRes, searchRes] = await Promise.all([materialPromise, searchPromise]);

    // Parse Materials
    const materials = JSON.parse(materialRes.text || "{}");
    
    // Parse Search Results
    const resources: Resource[] = [];
    const chunks = searchRes.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // Extract logical resources from grounding chunks
    // Note: Since raw chunks can be messy, we synthesize them if direct web objects aren't clear,
    // but typically we look for the 'web' property in chunks.
    
    chunks.forEach((chunk: any) => {
        if (chunk.web) {
            resources.push({
                title: chunk.web.title || "External Resource",
                url: chunk.web.uri,
                summary: "Source from Google Search",
                relevance: 0.9
            });
        }
    });

    // Deduplicate resources by URL
    const uniqueResources = Array.from(new Map(resources.map(item => [item.url, item])).values()).slice(0, 4);

    return {
      resources: uniqueResources,
      flashcards: materials.flashcards?.map((f: any, i: number) => ({ ...f, id: `fc-${i}-${Date.now()}` })) || [],
      quiz: materials.quiz?.map((q: any, i: number) => ({ ...q, id: `qz-${i}-${Date.now()}` })) || [],
      prerequisites: materials.prerequisites || "None",
      keyConcepts: materials.keyConcepts || "Covered in resources.",
      practiceIdeas: materials.practiceIdeas || "Review the materials.",
      isLoaded: true,
    };

  } catch (error) {
    console.error("Error generating topic content:", error);
    return {
      isLoaded: false
    };
  }
};