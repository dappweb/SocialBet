import { Hono } from 'hono';

export interface Env {
    DB: D1Database;
    AI: any; // Cloudflare AI binding
}

export const aiRoutes = new Hono<{ Bindings: Env }>();

// POST /api/ai/chat - Chat with AI assistant
aiRoutes.post('/chat', async (c) => {
    try {
        const { messages, userId } = await c.req.json();

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return c.json({ error: 'Messages array is required' }, 400);
        }

        // Get the last user message
        const lastMessage = messages[messages.length - 1];
        if (!lastMessage.content || lastMessage.role !== 'user') {
            return c.json({ error: 'Last message must be from user' }, 400);
        }

        // Build conversation history for context
        const conversationHistory = messages
            .slice(-10) // Keep last 10 messages for context
            .map((msg: any) => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content || msg.text || '',
            }));

        // System prompt for SoulCast AI assistant
        const systemPrompt = `You are a helpful AI assistant for SoulCast, a KOL Intent Prediction Market platform. Your role is to:
- Help users understand prediction markets, odds, and betting mechanics
- Provide insights about KOL (Key Opinion Leader) behavior trends
- Explain market dynamics and probability calculations
- Assist with AI avatar creation concepts
- Answer questions about trending topics and market opportunities
- Keep responses concise, friendly, and informative
- Use emojis sparingly and appropriately

Always be helpful and accurate. If you don't know something, admit it rather than guessing.`;

        // Prepare messages for Cloudflare AI
        const aiMessages = [
            { role: 'system', content: systemPrompt },
            ...conversationHistory,
        ];

        // Call Cloudflare AI Workers
        const ai = c.env.AI;
        
        if (!ai) {
            // Fallback if AI binding is not available
            return c.json({
                error: 'AI service not available',
                message: 'AI assistant is currently unavailable. Please try again later.',
            }, 503);
        }

        // Use Cloudflare AI's chat completion
        const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
            messages: aiMessages,
            max_tokens: 1000,
            temperature: 0.7,
        });

        // Extract response text
        let responseText = '';
        if (response.response) {
            responseText = response.response;
        } else if (typeof response === 'string') {
            responseText = response;
        } else if (response.text) {
            responseText = response.text;
        } else {
            responseText = JSON.stringify(response);
        }

        return c.json({
            message: responseText,
            model: 'llama-3.1-8b-instruct',
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error('AI chat error:', error);
        return c.json({
            error: 'AI service error',
            message: error.message || 'Failed to get AI response',
        }, 500);
    }
});

// POST /api/ai/analyze-market - Analyze a prediction market
aiRoutes.post('/analyze-market', async (c) => {
    try {
        const { marketId, question, category, currentOdds } = await c.req.json();

        if (!question) {
            return c.json({ error: 'Market question is required' }, 400);
        }

        const ai = c.env.AI;
        if (!ai) {
            return c.json({ error: 'AI service not available' }, 503);
        }

        const analysisPrompt = `Analyze this prediction market and provide insights:

Market Question: ${question}
Category: ${category || 'General'}
Current YES Odds: ${currentOdds?.yesPercent || 'N/A'}%
Current NO Odds: ${currentOdds?.noPercent || 'N/A'}%

Provide:
1. Brief market analysis
2. Key factors to consider
3. Risk assessment
4. Recommendation (YES/NO) with confidence level (0-100%)

Keep the response concise and actionable.`;

        const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
            messages: [
                { role: 'system', content: 'You are a prediction market analyst. Provide clear, data-driven insights.' },
                { role: 'user', content: analysisPrompt },
            ],
            max_tokens: 800,
            temperature: 0.6,
        });

        let analysisText = '';
        if (response.response) {
            analysisText = response.response;
        } else if (typeof response === 'string') {
            analysisText = response;
        } else {
            analysisText = JSON.stringify(response);
        }

        return c.json({
            analysis: analysisText,
            marketId,
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error('Market analysis error:', error);
        return c.json({ error: error.message || 'Analysis failed' }, 500);
    }
});

// GET /api/ai/models - List available AI models
aiRoutes.get('/models', async (c) => {
    return c.json({
        models: [
            {
                id: '@cf/meta/llama-3.1-8b-instruct',
                name: 'Llama 3.1 8B Instruct',
                description: 'Fast, efficient model for chat and general tasks',
            },
            {
                id: '@cf/meta/llama-3.1-70b-instruct',
                name: 'Llama 3.1 70B Instruct',
                description: 'More powerful model for complex reasoning',
            },
            {
                id: '@cf/mistral/mistral-7b-instruct-v0.2',
                name: 'Mistral 7B Instruct',
                description: 'Alternative high-quality instruction model',
            },
        ],
    });
});

