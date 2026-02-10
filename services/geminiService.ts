
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AnalysisResult } from "../types";

const API_KEY = process.env.API_KEY || "";

export class GeminiService {
  private static ai = new GoogleGenAI({ apiKey: API_KEY });

  static async analyzeReviews(rawText: string): Promise<AnalysisResult> {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Analyze the following e-commerce customer reviews and extract structured data. 
      Important: Group similar keywords. Identify specific product features or services.
      
      Reviews Data:
      ${rawText}
      `,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reviews: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  date: { type: Type.STRING, description: "ISO 8601 date" },
                  rating: { type: Type.NUMBER, description: "0-5 scale" },
                  sentiment: { type: Type.STRING, enum: ["positive", "neutral", "negative"] },
                  text: { type: Type.STRING },
                  score: { type: Type.NUMBER, description: "0 to 1 sentiment score" }
                },
                required: ["id", "date", "rating", "sentiment", "text", "score"]
              }
            },
            positiveKeywords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  value: { type: Type.NUMBER }
                },
                required: ["text", "value"]
              }
            },
            negativeKeywords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  value: { type: Type.NUMBER }
                },
                required: ["text", "value"]
              }
            },
            summary: { type: Type.STRING },
            actionableImprovements: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Must be exactly 3 specific, actionable points."
            },
            trendAnalysis: { type: Type.STRING },
            mostLiked: { type: Type.ARRAY, items: { type: Type.STRING } },
            mostDisliked: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["reviews", "positiveKeywords", "negativeKeywords", "summary", "actionableImprovements", "trendAnalysis", "mostLiked", "mostDisliked"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}") as AnalysisResult;
    // Post-process to ensure keyword types
    result.positiveKeywords = result.positiveKeywords.map(k => ({ ...k, type: 'positive' }));
    result.negativeKeywords = result.negativeKeywords.map(k => ({ ...k, type: 'negative' }));
    return result;
  }

  static async *chatStream(message: string, context: AnalysisResult) {
    const chat = this.ai.chats.create({
      model: "gemini-3-pro-preview",
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        systemInstruction: `You are an expert E-commerce Data Analyst. You have analyzed customer reviews for a store. 
        Context of current analysis:
        Summary: ${context.summary}
        Actionable Items: ${context.actionableImprovements.join(", ")}
        Most Liked: ${context.mostLiked.join(", ")}
        Most Disliked: ${context.mostDisliked.join(", ")}
        
        Answer user questions based on this data. Be professional and data-driven.`
      }
    });

    const responseStream = await chat.sendMessageStream({ message });
    for await (const chunk of responseStream) {
      yield (chunk as GenerateContentResponse).text;
    }
  }
}
