import { GoogleGenAI, Type } from "@google/genai";
import { Flashcard, MCQ, ConceptMapData, ChatMessage, EssayOutline, LessonPlan, StudyPlan } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Centralized API error handler for consistent logging and user-friendly messages.
const handleApiError = (error: unknown, context: string): Promise<never> => {
    console.error(`Error during '${context}':`, error);
    let message = `An unknown error occurred during ${context}.`;
    if (error instanceof Error) {
        // In a production app, you could parse specific Gemini API error types here.
        message = `API Error during ${context}: ${error.message}`;
    }
    return Promise.reject(new Error(message));
};

const generateWithSchema = async <T,>(model: string, prompt: string, schema: any, context: string): Promise<T> => {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    const jsonText = response.text.trim();
    // Add an inner try-catch for JSON parsing, as it's a separate failure point.
    try {
        return JSON.parse(jsonText) as T;
    } catch (parseError) {
        console.error(`JSON parsing error during '${context}':`, parseError);
        console.error("Received malformed text from API:", jsonText);
        return Promise.reject(new Error(`The API returned an invalid format for ${context}. Please try again.`));
    }
  } catch (error) {
    return handleApiError(error, context);
  }
};

export const fetchTopicInfo = async (model: string, topic: string, language: string): Promise<string> => {
    const prompt = `Generate a comprehensive set of study notes about the following topic: "${topic}". The notes should be well-structured, informative, and suitable for someone studying this topic. Cover key definitions, main concepts, and important examples. Please provide the response in ${language}.`;
    try {
        const response = await ai.models.generateContent({ model, contents: prompt });
        return response.text;
    } catch (error) {
        return handleApiError(error, 'fetching topic info');
    }
};

export const generateSummary = async (model: string, text: string, language: string): Promise<string> => {
  const prompt = `Summarize the following text in a concise and informative way, in ${language}:\n\n---\n${text}\n---`;
  try {
    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text;
  } catch (error) {
    return handleApiError(error, 'summary generation');
  }
};

export const generateFlashcards = async (model: string, text: string, language: string): Promise<Flashcard[]> => {
  const prompt = `Based on the following text, generate a list of 10 question and answer flashcards. The questions should cover key concepts, definitions, and important facts from the text. The answers should be concise and directly derivable from the text. Please provide the response in ${language}.\n\n---\n${text}\n---`;
  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        question: { type: Type.STRING },
        answer: { type: Type.STRING },
      },
      required: ["question", "answer"],
    },
  };
  const result = await generateWithSchema<{ flashcards: Flashcard[] }>(model, prompt, schema, 'flashcard generation');
  return Array.isArray(result) ? result : (result?.flashcards || []);
};

export const generateMCQs = async (model: string, text: string, language: string, difficulty: 'Easy' | 'Medium' | 'Hard'): Promise<MCQ[]> => {
  const difficultyInstruction = {
    Easy: 'The questions should be straightforward, testing basic recall of definitions and key facts presented in the text.',
    Medium: 'The questions should require comprehension and application of the main concepts, potentially asking to interpret information.',
    Hard: 'The questions should be challenging, requiring analysis, synthesis, or evaluation of the information. They may involve subtle distinctions, multi-step reasoning, or application to new scenarios.'
  };

  const prompt = `Based on the following text, generate a list of 5 multiple-choice questions (MCQs) of ${difficulty} difficulty. ${difficultyInstruction[difficulty]} Each question should have 4 options, with one clear correct answer. For each question, also provide a brief explanation for why the correct answer is correct. This explanation will be shown to the student after they answer. Please provide the response in ${language}.\n\n---\n${text}\n---`;
  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        question: { type: Type.STRING },
        options: { type: Type.ARRAY, items: { type: Type.STRING } },
        correctAnswer: { type: Type.STRING },
        explanation: { 
            type: Type.STRING,
            description: "A brief explanation of why the correct answer is correct, to be shown to the user after they answer."
        },
      },
      required: ["question", "options", "correctAnswer", "explanation"],
    },
  };
  const result = await generateWithSchema<{ mcqs: MCQ[] }>(model, prompt, schema, 'MCQ generation');
  return Array.isArray(result) ? result : (result?.mcqs || []);
};

export const performSemanticSearch = async (model: string, text: string, query: string, topK: number): Promise<string[]> => {
  const prompt = `From the provided text, extract the top ${topK} most relevant snippets related to the following query: "${query}". The snippets should be direct quotes from the text.

--- TEXT ---
${text}
--- QUERY ---
${query}
`;
  const schema = {
    type: Type.OBJECT,
    properties: {
        snippets: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        }
    },
    required: ['snippets']
  };
  const result = await generateWithSchema<{ snippets: string[] }>(model, prompt, schema, 'semantic search');
  return result?.snippets || [];
};

export const generateAnswer = async (model: string, context: string, question: string, language: string): Promise<string> => {
  const prompt = `Using ONLY the provided context below, answer the user's question in ${language}. If the answer is not found in the context, say "The answer is not available in the provided text." in ${language}.\n\n--- CONTEXT ---\n${context}\n\n--- QUESTION ---\n${question}`;
  try {
    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text;
  } catch (error) {
    return handleApiError(error, 'answer generation');
  }
};

const conceptMapSchema = {
    type: Type.OBJECT,
    properties: {
      nodes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, group: { type: Type.INTEGER } }, required: ["id", "group"] } },
      links: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { source: { type: Type.STRING }, target: { type: Type.STRING }, value: { type: Type.INTEGER } }, required: ["source", "target", "value"] } },
    },
    required: ["nodes", "links"],
};

export const generateConceptMapData = async (model: string, text: string, language: string): Promise<ConceptMapData> => {
  const prompt = `Analyze the following text and generate a concept map. Identify the main concepts as nodes and the relationships between them as links. Provide the output as a JSON object with 'nodes' and 'links' arrays. Each node should have an 'id' (the concept name) and a 'group' (a number for coloring). Each link should have a 'source' id, a 'target' id, and a 'value' representing the strength of the relationship (from 1 to 10). Please provide the concept names (node ids) in ${language}.\n\n---\n${text}\n---`;
  const result = await generateWithSchema<ConceptMapData>(model, prompt, conceptMapSchema, 'concept map generation');
  return result || { nodes: [], links: [] };
};

export const generateConceptMapForTopic = async (model: string, topic: string, language: string): Promise<ConceptMapData> => {
    const prompt = `Generate a concept map for the topic: "${topic}". Identify the main concepts as nodes and the relationships between them as links. Provide the output as a JSON object with 'nodes' and 'links' arrays. Each node should have an 'id' (the concept name) and a 'group' (a number for coloring). Each link should have a 'source' id, a 'target' id, and a 'value' representing the strength of the relationship (from 1 to 10). Please provide the concept names (node ids) in ${language}.`;
    const result = await generateWithSchema<ConceptMapData>(model, prompt, conceptMapSchema, `concept map generation for topic "${topic}"`);
    return result || { nodes: [], links: [] };
};

export const generatePersonalizedStudyGuide = async (model: string, text: string, incorrectMCQs: MCQ[], language: string): Promise<string> => {
    const incorrectQuestionsText = incorrectMCQs.map(mcq => `- Question: "${mcq.question}" (Correct Answer: "${mcq.correctAnswer}")`).join('\n');
    const prompt = `A student is studying the following text and has incorrectly answered some multiple-choice questions. Based on the text and their specific mistakes, generate a personalized study guide to help them understand the concepts they are struggling with. The guide should be concise, targeted, and easy to understand. Please provide the response in ${language}.\n\n--- ORIGINAL TEXT ---\n${text}\n---\n\n--- INCORRECTLY ANSWERED QUESTIONS ---\n${incorrectQuestionsText}\n---\n\nYour task is to:\n1. Identify the core concepts the student is misunderstanding based on their errors.\n2. Extract the most relevant information from the original text that explains these concepts.\n3. Present this information as a clear, focused study guide. Start with a brief overview of the weak areas and then provide explanations.`;
    try {
      const response = await ai.models.generateContent({ model, contents: prompt });
      return response.text;
    } catch (error) {
      return handleApiError(error, 'personalized study guide generation');
    }
};

export const extractTextFromFile = async (model: string, fileData: string, mimeType: string): Promise<string> => {
  const prompt = "Extract all text content from the provided file. The output should be formatted as plain text, preserving paragraphs and structure where possible.";
  try {
    const response = await ai.models.generateContent({ model, contents: { parts: [{ text: prompt }, { inlineData: { data: fileData, mimeType: mimeType } }] } });
    return response.text;
  } catch (error) {
    return handleApiError(error, 'file text extraction');
  }
};

export const transcribeAudio = async (model: string, fileData: string, mimeType: string): Promise<string> => {
  const prompt = "Transcribe the audio from the provided file accurately. The output should be the spoken text only.";
  try {
    const response = await ai.models.generateContent({ model, contents: { parts: [{ text: prompt }, { inlineData: { data: fileData, mimeType: mimeType } }] } });
    return response.text;
  } catch (error) {
    return handleApiError(error, 'audio transcription');
  }
};

export const getTutorResponse = async (model: string, context: string, history: ChatMessage[], question: string, language: string): Promise<string> => {
  const systemInstruction = `You are an AI Tutor named 'Synapse'. Your primary goal is to help the user understand a topic by guiding them with the Socratic method, not by giving direct answers. Use the provided context material to stay on topic. The conversation history is provided for context. When the user asks a question, respond with a thoughtful, probing question that encourages them to think critically and find the answer themselves. If the user is stuck, you can provide small hints. Keep your responses concise and conversational. Please respond in ${language}.\n\n--- CONTEXT MATERIAL ---\n${context}\n---`;
  const contents = [ ...history.map(msg => ({ role: msg.role, parts: [{ text: msg.content }] })), { role: 'user', parts: [{ text: question }] } ];
  try {
    // @ts-ignore
    const response = await ai.models.generateContent({ model, contents, config: { systemInstruction } });
    return response.text;
  } catch (error) {
    return handleApiError(error, 'AI Tutor response generation');
  }
};

const essayOutlineSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: 'A compelling title for the essay.' },
        introduction: { type: Type.STRING, description: 'A paragraph introducing the topic and the main thesis.' },
        body: { type: Type.ARRAY, description: 'The main body paragraphs of the essay.', items: { type: Type.OBJECT, properties: { heading: { type: Type.STRING, description: 'The main topic or argument of this paragraph.' }, points: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Bullet points or key ideas to be discussed in this paragraph, supported by evidence from the context.' } }, required: ['heading', 'points'] } },
        conclusion: { type: Type.STRING, description: 'A paragraph summarizing the main points and restating the thesis.' },
    },
    required: ['title', 'introduction', 'body', 'conclusion'],
};

export const generateEssayOutline = async (model: string, context: string, topic: string, language: string): Promise<EssayOutline> => {
    const prompt = `Based on the provided context material, generate a structured essay outline for the following topic/thesis: "${topic}". The outline should include a title, an introduction, several body sections with headings and bullet points, and a conclusion. The points in the body should be derived from the context. Please generate the outline in ${language}.\n\n--- CONTEXT MATERIAL ---\n${context}\n---`;
    return generateWithSchema<EssayOutline>(model, prompt, essayOutlineSchema, 'essay outline generation');
};

export const generateEssayArguments = async (model: string, context: string, topic: string, language: string): Promise<string> => {
    const prompt = `Based on the provided context material, play the role of a "devil's advocate" for the following essay topic/thesis: "${topic}". Generate a list of potential counter-arguments, weaknesses in the likely arguments, or alternative perspectives that the author should consider addressing to make their essay more robust. Present this as a bulleted list. Respond in ${language}.\n\n--- CONTEXT MATERIAL ---\n${context}\n---`;
    try {
        const response = await ai.models.generateContent({ model, contents: prompt });
        return response.text;
    } catch (error) {
        return handleApiError(error, 'essay argument generation');
    }
};

const lessonPlanSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "Title of the lesson plan." },
        objective: { type: Type.STRING, description: "The primary learning objective for the students." },
        duration: { type: Type.STRING, description: "Estimated duration of the lesson, e.g., '50 minutes'." },
        materials: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of materials needed." },
        activities: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, duration: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["name", "duration", "description"] } },
        assessment: { type: Type.STRING, description: "How student understanding will be assessed." }
    },
    required: ["title", "objective", "duration", "materials", "activities", "assessment"]
};

export const generateLessonPlan = async (model: string, context: string, topic: string, language: string): Promise<LessonPlan> => {
    const prompt = `Based on the provided text, create a detailed 50-minute lesson plan for the topic: "${topic}". The lesson plan should be structured for a classroom setting and include a clear objective, materials, a sequence of activities (like a warm-up, main activity, and wrap-up), and an assessment method. Respond in ${language}.\n\n--- CONTEXT ---\n${context}\n---`;
    return generateWithSchema<LessonPlan>(model, prompt, lessonPlanSchema, 'lesson plan generation');
};

const studyPlanSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        durationDays: { type: Type.INTEGER },
        schedule: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { day: { type: Type.INTEGER }, topic: { type: Type.STRING }, tasks: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["day", "topic", "tasks"] } }
    },
    required: ["title", "durationDays", "schedule"]
};

export const generateStudyPlan = async (model: string, context: string, days: number, language: string): Promise<StudyPlan> => {
    const prompt = `Analyze the provided study material and create a personalized, day-by-day study plan to cover all the content within ${days} days. The plan should break down the material into manageable topics and tasks for each day. The goal is to prepare for an exam on this content. Respond in ${language}.\n\n--- STUDY MATERIAL ---\n${context}\n---`;
    return generateWithSchema<StudyPlan>(model, prompt, studyPlanSchema, 'study plan generation');
};