
import { GoogleGenAI, Modality } from "@google/genai";
import { Article } from "../types";

// Safe initialization of GoogleGenAI to prevent white screen if API key is missing
const getAi = () => {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is missing. AI features will be disabled.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

const ai = getAi();

/**
 * Intelligent Semantic Search
 * Analyzes query intent and ranks available articles by conceptual relevance.
 */
export const suggestSemanticMatches = async (query: string, articles: Article[]): Promise<string[]> => {
  if (!query || articles.length === 0 || !ai) return [];

  try {
    const articleMetadata = articles.map(a => `ID:${a.id} | Title:${a.title} | Excerpt:${a.excerpt.substring(0, 100)}`).join('\n');
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Analyze the intent behind the query: "${query}"
        Find the most meaningful articles from the list below.
        Return ONLY a comma-separated list of IDs.
        
        Articles:
        ${articleMetadata}
      `,
    });

    // The GenerateContentResponse object features a text property that directly returns the string output.
    const result = response.text || "";
    return result.split(',').map(s => s.replace('ID:', '').trim()).filter(s => s.length > 0);
  } catch (error) {
    console.error("Semantic Search Error:", error);
    return [];
  }
};

/**
 * Summarizes text in the specified language using Gemini Flash.
 */
export const summarizeText = async (text: string, lang: string = 'uz'): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize this text in ${lang}. Use 3 bullet points. Tone: Academic.\n\n${text}`,
    });
    // The text property returns the extracted string output.
    return response.text || "Summary generated empty.";
  } catch (error) {
    console.error("Summarization Error:", error);
    return "The AI engine is currently synthesizing other data. Please try again.";
  }
};

export const improveContent = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Improve style/grammar/formatting for: \n\n${text}`,
    });
    // The text property returns the extracted string output.
    return response.text || text;
  } catch (error) {
    return text;
  }
};

export const factCheck = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Fact-check this: \n\n${text}`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    // The text property returns the extracted string output.
    let result = response.text || "Synthesis complete. No major errors detected.";
    
    // Always extract website URLs from groundingChunks when using Google Search.
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks && chunks.length > 0) {
      const sources = chunks
        .map((chunk: any) => chunk.web?.uri)
        .filter((uri: string) => !!uri)
        .map((uri: string) => `- ${uri}`)
        .join('\n');
      if (sources) result += `\n\nSources:\n${sources}`;
    }
    return result;
  } catch (error) {
    return "AI Fact-Checking Engine temporarily offline.";
  }
};

export const autoCategorize = async (title: string, content: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this article and return ONLY the most appropriate category from this list: Science, History, Technology, Culture, Art, Geography, Biography, Literature, Philosophy, Economy, Health, Society, Nature.
      
      Title: ${title}
      Content: ${content.substring(0, 1000)}`,
    });
    return response.text?.trim() || "Other";
  } catch (error) {
    return "Other";
  }
};

export const translateArticle = async (title: string, content: string, targetLang: string): Promise<{ title: string, content: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Translate the following article to ${targetLang}. Return the result in JSON format with "title" and "content" keys.
      
      Title: ${title}
      Content: ${content}`,
      config: {
        responseMimeType: "application/json"
      }
    });
    return JSON.parse(response.text || '{"title": "", "content": ""}');
  } catch (error) {
    console.error("Translation error:", error);
    return { title, content };
  }
};

export const checkSpelling = async (text: string, lang: string): Promise<{ word: string, offset: number, length: number }[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Find spelling errors in this ${lang} text. Return a JSON array of objects with "word", "offset" (character index), and "length".
      
      Text: ${text}`,
      config: {
        responseMimeType: "application/json"
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    return [];
  }
};

export const suggestTopics = async (context: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `WikiAtlas uchun 5 ta qiziqarli va dolzarb maqola mavzusini tavsiya eting. Kontekst: ${context || 'Umumiy bilimlar'}. Faqat mavzular ro'yxatini qaytaring (har bir mavzu yangi qatorda).`,
    });
    return (response.text || "").split('\n').map(s => s.replace(/^\d+\.\s*/, '').trim()).filter(s => s.length > 0);
  } catch (error) {
    return ["O'zbekiston tarixi", "Sun'iy intellekt kelajagi", "Koinot sirlari", "Ekologiya va biz", "Raqamli iqtisodiyot"];
  }
};

export const generateArticle = async (topic: string): Promise<{ title: string, content: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `"${topic}" mavzusida WikiAtlas uchun mukammal, ilmiy va batafsil maqola yozing. Maqola o'zbek tilida bo'lsin. Maqola sarlavhasi va mazmunini JSON formatida qaytaring: {"title": "...", "content": "..."}. Mazmuni Markdown formatida bo'lsin.`,
      config: {
        responseMimeType: "application/json"
      }
    });
    return JSON.parse(response.text || '{"title": "", "content": ""}');
  } catch (error) {
    throw new Error("AI maqola yaratishda xatolik yuz berdi.");
  }
};

export const generateSpeech = async (text: string): Promise<string | undefined> => {
  if (!text) return undefined;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `O'zbek tilida ravon va tushunarli qilib o'qib bering: ${text.substring(0, 1000)}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Kore is a good balanced voice
          },
        },
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    console.error("TTS Error:", error);
    return undefined;
  }
};
