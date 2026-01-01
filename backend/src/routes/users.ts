import { Hono } from 'hono';
import type { Env } from '../index';

export const usersRoutes = new Hono<{ Bindings: Env }>();

// GET /api/users - List users (leaderboard)
usersRoutes.get('/', async (c) => {
    const { limit = '20', sort = 'sos_token_balance' } = c.req.query();

    const validSorts = ['sos_token_balance', 'created_at', 'name'];
    const sortColumn = validSorts.includes(sort) ? sort : 'sos_token_balance';

    const { results } = await c.env.DB.prepare(`
    SELECT * FROM users ORDER BY ${sortColumn} DESC LIMIT ?
  `).bind(limit).all();

    const users = (results || []).map((u: any) => ({
        id: u.id,
        name: u.name,
        handle: u.handle,
        avatar: u.avatar,
        isVerified: u.is_verified === 1,
        sosTokenBalance: u.sos_token_balance,
        isCreator: u.is_creator === 1,
    }));

    return c.json(users);
});

// GET /api/users/:id - Get user profile
usersRoutes.get('/:id', async (c) => {
    const id = c.req.param('id');

    const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();

    if (!user) {
        return c.json({ error: 'User not found' }, 404);
    }

    const u: any = user;
    return c.json({
        id: u.id,
        name: u.name,
        handle: u.handle,
        avatar: u.avatar,
        isVerified: u.is_verified === 1,
        walletAddressEth: u.wallet_address_eth,
        walletAddressSol: u.wallet_address_sol,
        walletAddressBsc: u.wallet_address_bsc,
        primaryChain: u.primary_chain,
        sosTokenBalance: u.sos_token_balance,
        isCreator: u.is_creator === 1,
    });
});

// GET /api/users/:id/stats - Get user statistics
usersRoutes.get('/:id/stats', async (c) => {
    const id = c.req.param('id');

    const user = await c.env.DB.prepare('SELECT id FROM users WHERE id = ?').bind(id).first();
    if (!user) {
        return c.json({ error: 'User not found' }, 404);
    }

    const marketsCreated = await c.env.DB.prepare(
        'SELECT COUNT(*) as count FROM markets WHERE creator_id = ?'
    ).bind(id).first() as { count: number };

    const betsPlaced = await c.env.DB.prepare(
        'SELECT COUNT(*) as count FROM bets WHERE user_id = ?'
    ).bind(id).first() as { count: number };

    const totalVolume = await c.env.DB.prepare(
        'SELECT COALESCE(SUM(amount), 0) as total FROM bets WHERE user_id = ?'
    ).bind(id).first() as { total: number };

    const wins = await c.env.DB.prepare(
        "SELECT COUNT(*) as count FROM bets WHERE user_id = ? AND status = 'won'"
    ).bind(id).first() as { count: number };

    const likesReceived = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM likes l
    JOIN markets m ON l.market_id = m.id
    WHERE m.creator_id = ?
  `).bind(id).first() as { count: number };

    return c.json({
        marketsCreated: marketsCreated?.count || 0,
        betsPlaced: betsPlaced?.count || 0,
        totalVolume: totalVolume?.total || 0,
        wins: wins?.count || 0,
        likesReceived: likesReceived?.count || 0,
        winRate: betsPlaced?.count > 0 ? ((wins?.count || 0) / betsPlaced.count * 100).toFixed(1) : '0.0',
    });
});

// PUT /api/users/:id - Update user profile
usersRoutes.put('/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();

    const existing = await c.env.DB.prepare('SELECT id FROM users WHERE id = ?').bind(id).first();
    if (!existing) {
        return c.json({ error: 'User not found' }, 404);
    }

    const { name, handle, avatar, walletAddressEth, walletAddressSol, walletAddressBsc, primaryChain } = body;

    const updates: string[] = [];
    const params: (string | number | null)[] = [];

    if (name !== undefined) { updates.push('name = ?'); params.push(name); }
    if (handle !== undefined) { updates.push('handle = ?'); params.push(handle); }
    if (avatar !== undefined) { updates.push('avatar = ?'); params.push(avatar); }
    if (walletAddressEth !== undefined) { updates.push('wallet_address_eth = ?'); params.push(walletAddressEth); }
    if (walletAddressSol !== undefined) { updates.push('wallet_address_sol = ?'); params.push(walletAddressSol); }
    if (walletAddressBsc !== undefined) { updates.push('wallet_address_bsc = ?'); params.push(walletAddressBsc); }
    if (primaryChain !== undefined) { updates.push('primary_chain = ?'); params.push(primaryChain); }

    if (updates.length > 0) {
        params.push(id);
        await c.env.DB.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run();
    }

    return c.json({ success: true });
});
