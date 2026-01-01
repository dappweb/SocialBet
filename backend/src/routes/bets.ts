import { Hono } from 'hono';
import type { Env } from '../index';

export const betsRoutes = new Hono<{ Bindings: Env }>();

// POST /api/bets - Place a bet
betsRoutes.post('/', async (c) => {
    const body = await c.req.json();
    const { marketId, userId = 'me', betType, amount, priceAtBet, blockchain } = body;

    if (!marketId || !betType || !amount || !priceAtBet) {
        return c.json({ error: 'Missing required fields: marketId, betType, amount, priceAtBet' }, 400);
    }

    if (!['YES', 'NO'].includes(betType)) {
        return c.json({ error: 'betType must be YES or NO' }, 400);
    }

    const market = await c.env.DB.prepare('SELECT id FROM markets WHERE id = ?').bind(marketId).first();
    if (!market) {
        return c.json({ error: 'Market not found' }, 404);
    }

    const id = crypto.randomUUID();

    await c.env.DB.prepare(`
    INSERT INTO bets (id, market_id, user_id, bet_type, amount, price_at_bet, blockchain)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(id, marketId, userId, betType, amount, priceAtBet, blockchain || null).run();

    // Update market volume
    await c.env.DB.prepare('UPDATE markets SET volume = volume + ? WHERE id = ?').bind(amount, marketId).run();

    return c.json({
        id,
        marketId,
        userId,
        betType,
        amount,
        priceAtBet,
        blockchain,
        status: 'pending',
    }, 201);
});

// GET /api/bets/user/:userId - Get user's bets
betsRoutes.get('/user/:userId', async (c) => {
    const userId = c.req.param('userId');
    const { status, limit = '50', offset = '0' } = c.req.query();

    let query = `
    SELECT 
      b.*,
      m.question as market_question,
      m.category as market_category,
      m.end_date as market_end_date
    FROM bets b
    JOIN markets m ON b.market_id = m.id
    WHERE b.user_id = ?
  `;

    const params: string[] = [userId];

    if (status) {
        query += ' AND b.status = ?';
        params.push(status);
    }

    query += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const { results } = await c.env.DB.prepare(query).bind(...params).all();

    const bets = (results || []).map((b: any) => ({
        id: b.id,
        marketId: b.market_id,
        marketQuestion: b.market_question,
        marketCategory: b.market_category,
        marketEndDate: b.market_end_date,
        betType: b.bet_type,
        amount: b.amount,
        priceAtBet: b.price_at_bet,
        blockchain: b.blockchain,
        status: b.status,
        createdAt: b.created_at,
    }));

    return c.json(bets);
});

// GET /api/bets/market/:marketId - Get bets for a market
betsRoutes.get('/market/:marketId', async (c) => {
    const marketId = c.req.param('marketId');
    const { limit = '50', offset = '0' } = c.req.query();

    const { results } = await c.env.DB.prepare(`
    SELECT 
      b.*,
      u.name as user_name,
      u.handle as user_handle,
      u.avatar as user_avatar
    FROM bets b
    JOIN users u ON b.user_id = u.id
    WHERE b.market_id = ?
    ORDER BY b.created_at DESC
    LIMIT ? OFFSET ?
  `).bind(marketId, limit, offset).all();

    const bets = (results || []).map((b: any) => ({
        id: b.id,
        marketId: b.market_id,
        user: {
            id: b.user_id,
            name: b.user_name,
            handle: b.user_handle,
            avatar: b.user_avatar,
        },
        betType: b.bet_type,
        amount: b.amount,
        priceAtBet: b.price_at_bet,
        status: b.status,
        createdAt: b.created_at,
    }));

    return c.json(bets);
});

// GET /api/bets/:id - Get single bet
betsRoutes.get('/:id', async (c) => {
    const id = c.req.param('id');

    const bet = await c.env.DB.prepare(`
    SELECT 
      b.*,
      m.question as market_question,
      m.category as market_category
    FROM bets b
    JOIN markets m ON b.market_id = m.id
    WHERE b.id = ?
  `).bind(id).first();

    if (!bet) {
        return c.json({ error: 'Bet not found' }, 404);
    }

    const b: any = bet;
    return c.json({
        id: b.id,
        marketId: b.market_id,
        marketQuestion: b.market_question,
        marketCategory: b.market_category,
        userId: b.user_id,
        betType: b.bet_type,
        amount: b.amount,
        priceAtBet: b.price_at_bet,
        blockchain: b.blockchain,
        status: b.status,
        createdAt: b.created_at,
    });
});
