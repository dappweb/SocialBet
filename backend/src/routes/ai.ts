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
- Proactively suggest creating prediction markets when users discuss interesting topics
- When users ask about trends, events, or "what if" scenarios, suggest generating a prediction market
- Keep responses concise, friendly, and informative
- Use emojis sparingly and appropriately

If a user discusses something that could be a good prediction market (trends, events, outcomes, etc.), suggest: "Would you like me to generate a prediction market for this? Just click 'Generate Prediction' or ask me to create one!"

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

// POST /api/ai/generate-prediction - AI generates a new prediction market
aiRoutes.post('/generate-prediction', async (c) => {
    try {
        const { topic, context, category } = await c.req.json();

        const ai = c.env.AI;
        if (!ai) {
            return c.json({ error: 'AI service not available' }, 503);
        }

        // Enhanced system prompt for prediction generation
        const systemPrompt = `You are an expert prediction market creator for SoulCast. Your role is to generate high-quality, engaging prediction market questions based on trending topics, news, or user requests.

Guidelines:
- Create clear, binary YES/NO questions
- Questions should be specific and measurable
- End dates should be realistic (typically 1-30 days)
- Categories: Crypto, Sports, Pop Culture, Politics, Tech
- Make questions interesting and bettable
- Consider current events and trends

Output format (JSON):
{
  "question": "Clear, specific YES/NO question",
  "category": "One of: Crypto, Sports, Pop Culture, Politics, Tech",
  "description": "Brief explanation of why this prediction is relevant",
  "endDate": "ISO date string (1-30 days from now)",
  "reasoning": "Why this prediction is interesting/valuable",
  "confidence": "AI confidence level (0-100%)"
}`;

        const userPrompt = topic 
            ? `Generate a prediction market question about: ${topic}${context ? `\n\nContext: ${context}` : ''}${category ? `\n\nCategory: ${category}` : ''}`
            : `Generate an interesting prediction market question based on current trends.${category ? `\n\nCategory: ${category}` : ''}`;

        const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            max_tokens: 1500,
            temperature: 0.8, // Higher creativity for generation
        });

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

        // Try to parse JSON from response
        let predictionData;
        try {
            // Extract JSON from markdown code blocks if present
            const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                             responseText.match(/```\s*([\s\S]*?)\s*```/);
            const jsonText = jsonMatch ? jsonMatch[1] : responseText;
            predictionData = JSON.parse(jsonText);
        } catch {
            // If JSON parsing fails, create structured data from text
            const lines = responseText.split('\n').filter(l => l.trim());
            predictionData = {
                question: lines.find(l => l.toLowerCase().includes('question') || l.includes('?')) || 
                         lines[0] || 'Will this prediction come true?',
                category: category || 'Crypto',
                description: responseText.substring(0, 200),
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default 7 days
                reasoning: responseText,
                confidence: 75,
            };
        }

        // Validate and normalize the prediction data
        const validCategories = ['Crypto', 'Sports', 'Pop Culture', 'Politics', 'Tech'];
        const prediction = {
            question: predictionData.question || 'Will this prediction come true?',
            category: validCategories.includes(predictionData.category) 
                ? predictionData.category 
                : (category || 'Crypto'),
            description: predictionData.description || predictionData.reasoning || '',
            endDate: predictionData.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            reasoning: predictionData.reasoning || predictionData.description || '',
            confidence: Math.min(100, Math.max(0, predictionData.confidence || 75)),
            isAiGenerated: true,
        };

        return c.json({
            prediction,
            rawResponse: responseText,
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error('AI prediction generation error:', error);
        return c.json({ 
            error: error.message || 'Failed to generate prediction',
            message: 'AI prediction generation failed. Please try again.',
        }, 500);
    }
});

// GET /api/ai/current-events - Get 5 current events for market creation
aiRoutes.get('/current-events', async (c) => {
    try {
        const ai = c.env.AI;
        if (!ai) {
            return c.json({ error: 'AI service not available' }, 503);
        }

        const systemPrompt = `You are a news and trend analyst. Generate exactly 5 current, relevant events that would make good prediction markets. Focus on:
- Recent news (last 24-48 hours)
- Trending topics in crypto, sports, tech, politics, pop culture
- Events with clear YES/NO outcomes
- Topics that are bettable and interesting

For each event, provide:
- title: Short, catchy title (max 50 chars)
- description: Brief description (1-2 sentences)
- category: One of: Crypto, Sports, Pop Culture, Politics, Tech
- suggestedQuestion: A clear YES/NO prediction market question
- relevance: Why this is relevant now (1 sentence)

Output as JSON array with exactly 5 events.`;

        const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: 'Generate 5 current events that would make good prediction markets. Focus on recent news and trending topics.' },
            ],
            max_tokens: 2000,
            temperature: 0.8,
        });

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

        // Try to parse JSON from response
        let events;
        try {
            // Extract JSON from markdown code blocks if present
            const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                             responseText.match(/```\s*([\s\S]*?)\s*```/);
            const jsonText = jsonMatch ? jsonMatch[1] : responseText;
            events = JSON.parse(jsonText);
        } catch {
            // If JSON parsing fails, create mock events as fallback
            events = [
                {
                    title: 'Bitcoin ETF Approval',
                    description: 'SEC decision on Bitcoin ETF applications expected this week',
                    category: 'Crypto',
                    suggestedQuestion: 'Will Bitcoin ETF be approved by SEC this week?',
                    relevance: 'Major regulatory decision affecting crypto markets',
                },
                {
                    title: 'AI Model Release',
                    description: 'Major tech company announces new AI model launch',
                    category: 'Tech',
                    suggestedQuestion: 'Will the new AI model achieve AGI benchmarks?',
                    relevance: 'Breakthrough in AI technology',
                },
                {
                    title: 'Sports Championship',
                    description: 'Upcoming championship game with close odds',
                    category: 'Sports',
                    suggestedQuestion: 'Will the underdog team win the championship?',
                    relevance: 'High-stakes sports event',
                },
                {
                    title: 'Political Election',
                    description: 'Upcoming election with polling data showing close race',
                    category: 'Politics',
                    suggestedQuestion: 'Will the incumbent win re-election?',
                    relevance: 'Important political event',
                },
                {
                    title: 'Celebrity Announcement',
                    description: 'Major celebrity expected to make significant announcement',
                    category: 'Pop Culture',
                    suggestedQuestion: 'Will the celebrity announce a major project?',
                    relevance: 'Trending in entertainment news',
                },
            ];
        }

        // Ensure we have exactly 5 events
        if (!Array.isArray(events) || events.length < 5) {
            // Use fallback events if AI didn't return enough
            events = events.slice(0, 5);
        } else {
            events = events.slice(0, 5);
        }

        // Validate and normalize events
        const validCategories = ['Crypto', 'Sports', 'Pop Culture', 'Politics', 'Tech'];
        const normalizedEvents = events.map((event: any) => ({
            title: event.title || 'Current Event',
            description: event.description || '',
            category: validCategories.includes(event.category) ? event.category : 'Crypto',
            suggestedQuestion: event.suggestedQuestion || event.title,
            relevance: event.relevance || '',
        }));

        return c.json({
            events: normalizedEvents,
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error('Current events error:', error);
        // Return fallback events on error
        return c.json({
            events: [
                {
                    title: 'Bitcoin Price Movement',
                    description: 'Bitcoin approaching key resistance level',
                    category: 'Crypto',
                    suggestedQuestion: 'Will Bitcoin break $100k this month?',
                    relevance: 'Major price movement expected',
                },
                {
                    title: 'Tech Product Launch',
                    description: 'Major tech company product announcement',
                    category: 'Tech',
                    suggestedQuestion: 'Will the new product exceed sales expectations?',
                    relevance: 'Product launch event',
                },
                {
                    title: 'Sports Playoff',
                    description: 'Championship playoff game',
                    category: 'Sports',
                    suggestedQuestion: 'Will the home team win?',
                    relevance: 'Playoff game',
                },
                {
                    title: 'Political Poll',
                    description: 'Election polling data release',
                    category: 'Politics',
                    suggestedQuestion: 'Will the leading candidate maintain lead?',
                    relevance: 'Election polling',
                },
                {
                    title: 'Entertainment News',
                    description: 'Major entertainment industry announcement',
                    category: 'Pop Culture',
                    suggestedQuestion: 'Will the announcement be positive?',
                    relevance: 'Entertainment trend',
                },
            ],
            timestamp: new Date().toISOString(),
        });
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

