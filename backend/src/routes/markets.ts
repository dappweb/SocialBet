import { Hono } from 'hono';
import type { Env } from '../index';

export const marketsRoutes = new Hono<{ Bindings: Env }>();

// GET /api/markets - List all markets
marketsRoutes.get('/', async (c) => {
    const { category, limit = '50', offset = '0', sort = 'created_at' } = c.req.query();

    let query = `
    SELECT 
      m.*,
      u.id as creator_id,
      u.name as creator_name,
      u.handle as creator_handle,
      u.avatar as creator_avatar,
      u.is_verified as creator_verified
    FROM markets m
    JOIN users u ON m.creator_id = u.id
  `;

    const params: string[] = [];

    if (category && category !== 'All') {
        query += ' WHERE m.category = ?';
        params.push(category);
    }

    const validSorts = ['created_at', 'pool_size', 'volume', 'likes_count', 'end_date'];
    const sortColumn = validSorts.includes(sort) ? sort : 'created_at';
    query += ` ORDER BY m.${sortColumn} DESC`;

    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const { results } = await c.env.DB.prepare(query).bind(...params).all();

    const markets = (results || []).map((m: any) => ({
        id: m.id,
        creator: {
            id: m.creator_id,
            name: m.creator_name,
            handle: m.creator_handle,
            avatar: m.creator_avatar,
            isVerified: m.creator_verified === 1,
        },
        question: m.question,
        category: m.category,
        endDate: m.end_date,
        poolSize: m.pool_size,
        volume: m.volume,
        likes: m.likes_count,
        comments: m.comments_count,
        image: m.image,
        isHot: m.is_hot === 1,
        isAiGenerated: m.is_ai_generated === 1,
        isPremium: m.is_premium === 1,
        outcomeStats: {
            yesPercent: m.yes_percent,
            noPercent: m.no_percent,
            yesPrice: m.yes_price,
            noPrice: m.no_price,
        },
    }));

    return c.json(markets);
});

// GET /api/markets/:id - Get single market
marketsRoutes.get('/:id', async (c) => {
    const id = c.req.param('id');

    const market = await c.env.DB.prepare(`
    SELECT 
      m.*,
      u.id as creator_id,
      u.name as creator_name,
      u.handle as creator_handle,
      u.avatar as creator_avatar,
      u.is_verified as creator_verified
    FROM markets m
    JOIN users u ON m.creator_id = u.id
    WHERE m.id = ?
  `).bind(id).first();

    if (!market) {
        return c.json({ error: 'Market not found' }, 404);
    }

    const m: any = market;
    return c.json({
        id: m.id,
        creator: {
            id: m.creator_id,
            name: m.creator_name,
            handle: m.creator_handle,
            avatar: m.creator_avatar,
            isVerified: m.creator_verified === 1,
        },
        question: m.question,
        category: m.category,
        endDate: m.end_date,
        poolSize: m.pool_size,
        volume: m.volume,
        likes: m.likes_count,
        comments: m.comments_count,
        image: m.image,
        isHot: m.is_hot === 1,
        isAiGenerated: m.is_ai_generated === 1,
        isPremium: m.is_premium === 1,
        outcomeStats: {
            yesPercent: m.yes_percent,
            noPercent: m.no_percent,
            yesPrice: m.yes_price,
            noPrice: m.no_price,
        },
    });
});

// POST /api/markets - Create new market
marketsRoutes.post('/', async (c) => {
    const body = await c.req.json();
    const { question, category, endDate, image, creatorId = 'me' } = body;

    if (!question || !category || !endDate) {
        return c.json({ error: 'Missing required fields: question, category, endDate' }, 400);
    }

    // Check and deduct Soul balance (10 SOUL required)
    const SOUL_REQUIRED = 10;
    const user = await c.env.DB.prepare('SELECT sos_token_balance FROM users WHERE id = ?').bind(creatorId).first();
    
    if (!user) {
        return c.json({ error: 'User not found' }, 404);
    }

    const userBalance: any = user;
    if (userBalance.sos_token_balance < SOUL_REQUIRED) {
        return c.json({ 
            error: `Insufficient Soul balance. ${SOUL_REQUIRED} SOUL required to create a market.`,
            required: SOUL_REQUIRED,
            current: userBalance.sos_token_balance
        }, 400);
    }

    // Deduct Soul tokens
    await c.env.DB.prepare(`
        UPDATE users 
        SET sos_token_balance = sos_token_balance - ?
        WHERE id = ?
    `).bind(SOUL_REQUIRED, creatorId).run();

    const id = crypto.randomUUID();

    await c.env.DB.prepare(`
    INSERT INTO markets (id, creator_id, question, category, end_date, image)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(id, creatorId, question, category, endDate, image || null).run();

    // Fetch the created market
    const market = await c.env.DB.prepare(`
    SELECT 
      m.*,
      u.id as creator_id,
      u.name as creator_name,
      u.handle as creator_handle,
      u.avatar as creator_avatar,
      u.is_verified as creator_verified
    FROM markets m
    JOIN users u ON m.creator_id = u.id
    WHERE m.id = ?
  `).bind(id).first();

    const m: any = market;
    return c.json({
        id: m.id,
        creator: {
            id: m.creator_id,
            name: m.creator_name,
            handle: m.creator_handle,
            avatar: m.creator_avatar,
            isVerified: m.creator_verified === 1,
        },
        question: m.question,
        category: m.category,
        endDate: m.end_date,
        poolSize: m.pool_size,
        volume: m.volume,
        likes: m.likes_count,
        comments: m.comments_count,
        image: m.image,
        isHot: m.is_hot === 1,
        outcomeStats: {
            yesPercent: m.yes_percent,
            noPercent: m.no_percent,
            yesPrice: m.yes_price,
            noPrice: m.no_price,
        },
    }, 201);
});

// DELETE /api/markets/:id - Delete market
marketsRoutes.delete('/:id', async (c) => {
    const id = c.req.param('id');

    const result = await c.env.DB.prepare('DELETE FROM markets WHERE id = ?').bind(id).run();

    if (result.meta.changes === 0) {
        return c.json({ error: 'Market not found' }, 404);
    }

    return c.json({ success: true });
});
