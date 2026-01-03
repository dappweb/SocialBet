import { GoogleGenAI } from "@google/genai";
import { ChatMessage, ChatResponse, AIPredictionResponse, MarketAnalysis, AIPrediction } from './api';

// Initialize Gemini Client
// @ts-ignore
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

// System prompt for SoulCast AI assistant
const SYSTEM_PROMPT = `You are a helpful AI assistant for SoulCast, a KOL Intent Prediction Market platform. Your role is to:
- Help users understand prediction markets, odds, and betting mechanics
- Provide insights about KOL (Key Opinion Leader) behavior trends
- Explain market dynamics and probability calculations
- Assist with AI avatar creation concepts
- Answer questions about trending topics and market opportunities
- Proactively suggest creating prediction markets when users discuss interesting topics
- When users ask about trends, events, or "what if" scenarios, suggest generating a prediction market
- Keep responses concise, friendly, and informative
- Use emojis sparingly and appropriately

If a user discusses something that could be a good prediction market (trends, events, outcomes, etc.), suggest: "Would you like me to generate a prediction market for this? Just click 'Generate Prediction' or ask me to create one!"

Always be helpful and accurate. If you don't know something, admit it rather than guessing.`;

export const geminiService = {
  async chat(messages: ChatMessage[]): Promise<ChatResponse> {
    if (!genAI) {
      throw new Error('Gemini API key not configured');
    }

    try {
      // Convert messages to Gemini format
      // Note: This SDK might handle history differently, but for simplicity we'll use a single turn or simple history if supported
      // The new SDK structure often uses models.generateContent with a history array if using chat session
      
      // We will use a simple generateContent approach with history embedded for now, 
      // or start a chat session if we were maintaining state here. 
      // Since this is a stateless API call wrapper, we'll reconstruct context.
      
      const history = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content || msg.text || '' }]
      }));

      // Add system prompt as the first user message or system instruction if supported
      // Gemini 1.5 Pro supports system instructions, but Flash might not. 
      // Safe bet: Prepend system prompt to the first message or as a separate system part if using beta.
      
      const model = 'gemini-2.0-flash'; // Using a fast, capable model

      const response = await genAI.models.generateContent({
        model: model,
        config: {
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }]
          }
        },
        contents: history
      });

      const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response.";

      return {
        message: text,
        model: `Google ${model} (Fallback)`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Gemini Chat Error:', error);
      throw error;
    }
  },

  async generatePrediction(data: { topic?: string; context?: string; category?: string }): Promise<AIPredictionResponse> {
    if (!genAI) {
      throw new Error('Gemini API key not configured');
    }

    const { topic, context, category } = data;
    
    // Fallback topic if undefined/empty
    const searchTopic = topic && topic.trim() ? topic : 'Current trending events';

    const prompt = `You are an expert prediction market creator for SoulCast. Your role is to generate high-quality, engaging prediction market questions based on trending topics, news, or user requests.

Guidelines:
- Create clear, binary YES/NO questions
- Questions should be specific and measurable
- End dates should be realistic (typically 1-30 days)
- Categories: Crypto, Sports, Pop Culture, Politics, Tech
- Make questions interesting and bettable
- Consider current events and trends

Generate a JSON object with the following structure:
{
  "question": "Clear, specific YES/NO question",
  "category": "One of: Crypto, Sports, Pop Culture, Politics, Tech",
  "description": "Brief explanation of why this prediction is relevant",
  "endDate": "ISO date string (1-30 days from now)",
  "reasoning": "Why this prediction is interesting/valuable",
  "confidence": number (0-100)
}

Input Topic: ${searchTopic}
${context ? `Context: ${context}` : ''}
${category ? `Category: ${category}` : ''}

Output ONLY valid JSON.`;

    try {
      // Using gemini-1.5-flash as it is generally available and stable
      const modelName = 'gemini-1.5-flash';
      const response = await genAI.models.generateContent({
        model: modelName,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('No response from Gemini');

      // Cleanup JSON string - sometimes models wrap in markdown despite MimeType
      const jsonString = text.replace(/```json\n?|\n?```/g, '').trim();
      const predictionData = JSON.parse(jsonString);

      const prediction: AIPrediction = {
        question: predictionData.question,
        category: predictionData.category,
        description: predictionData.description,
        endDate: predictionData.endDate,
        reasoning: predictionData.reasoning,
        confidence: predictionData.confidence,
        isAiGenerated: true
      };

      return {
        prediction,
        rawResponse: text,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Gemini Generate Prediction Error:', error);
      // Fallback: If JSON parsing failed, try to construct a partial response or rethrow
      if (error instanceof SyntaxError) {
          console.error('Failed to parse Gemini response as JSON');
      }
      throw error;
    }
  },

  async analyzeMarket(data: { marketId?: string; question: string; category?: string; currentOdds?: { yesPercent: number; noPercent: number } }): Promise<MarketAnalysis> {
    if (!genAI) {
      throw new Error('Gemini API key not configured');
    }

    const prompt = `Analyze this prediction market question for a user who is considering betting: "${data.question}". 
    Category: ${data.category || 'General'}. 
    Current Stats: YES is ${data.currentOdds?.yesPercent || 50}%, NO is ${data.currentOdds?.noPercent || 50}%.
    Provide a concise 2-sentence risk assessment and probability insight.`;

    try {
      const response = await genAI.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });

      const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "Analysis unavailable.";

      return {
        analysis: text,
        marketId: data.marketId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Gemini Analyze Market Error:', error);
      throw error;
    }
  }
};
