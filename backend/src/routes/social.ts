import { Hono } from 'hono';
import type { Env } from '../index';

export const socialRoutes = new Hono<{ Bindings: Env }>();

// POST /api/social/markets/:id/like - Like a market
socialRoutes.post('/markets/:id/like', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { userId = 'me' } = body;

    const market = await c.env.DB.prepare('SELECT id FROM markets WHERE id = ?').bind(id).first();
    if (!market) {
        return c.json({ error: 'Market not found' }, 404);
    }

    const existing = await c.env.DB.prepare('SELECT * FROM likes WHERE market_id = ? AND user_id = ?').bind(id, userId).first();
    if (existing) {
        return c.json({ error: 'Already liked' }, 400);
    }

    await c.env.DB.prepare('INSERT INTO likes (market_id, user_id) VALUES (?, ?)').bind(id, userId).run();
    await c.env.DB.prepare('UPDATE markets SET likes_count = likes_count + 1 WHERE id = ?').bind(id).run();

    const updated = await c.env.DB.prepare('SELECT likes_count FROM markets WHERE id = ?').bind(id).first() as { likes_count: number };

    return c.json({ success: true, likes: updated?.likes_count || 0 });
});

// DELETE /api/social/markets/:id/like - Unlike a market
socialRoutes.delete('/markets/:id/like', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { userId = 'me' } = body;

    const result = await c.env.DB.prepare('DELETE FROM likes WHERE market_id = ? AND user_id = ?').bind(id, userId).run();

    if (result.meta.changes === 0) {
        return c.json({ error: 'Like not found' }, 404);
    }

    await c.env.DB.prepare('UPDATE markets SET likes_count = MAX(0, likes_count - 1) WHERE id = ?').bind(id).run();

    const updated = await c.env.DB.prepare('SELECT likes_count FROM markets WHERE id = ?').bind(id).first() as { likes_count: number };

    return c.json({ success: true, likes: updated?.likes_count || 0 });
});

// GET /api/social/markets/:id/likes - Check if user liked
socialRoutes.get('/markets/:id/likes', async (c) => {
    const id = c.req.param('id');
    const userId = c.req.query('userId') || 'me';

    const like = await c.env.DB.prepare('SELECT * FROM likes WHERE market_id = ? AND user_id = ?').bind(id, userId).first();
    const total = await c.env.DB.prepare('SELECT likes_count FROM markets WHERE id = ?').bind(id).first() as { likes_count: number } | null;

    return c.json({
        isLiked: !!like,
        totalLikes: total?.likes_count || 0,
    });
});

// POST /api/social/markets/:id/comments - Add comment
socialRoutes.post('/markets/:id/comments', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { userId = 'me', content } = body;

    if (!content || content.trim() === '') {
        return c.json({ error: 'Comment content is required' }, 400);
    }

    const market = await c.env.DB.prepare('SELECT id FROM markets WHERE id = ?').bind(id).first();
    if (!market) {
        return c.json({ error: 'Market not found' }, 404);
    }

    const commentId = crypto.randomUUID();

    await c.env.DB.prepare(`
    INSERT INTO comments (id, market_id, user_id, content)
    VALUES (?, ?, ?, ?)
  `).bind(commentId, id, userId, content.trim()).run();

    await c.env.DB.prepare('UPDATE markets SET comments_count = comments_count + 1 WHERE id = ?').bind(id).run();

    const comment = await c.env.DB.prepare(`
    SELECT 
      c.*,
      u.name as user_name,
      u.handle as user_handle,
      u.avatar as user_avatar,
      u.is_verified as user_verified
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `).bind(commentId).first();

    const cm: any = comment;
    return c.json({
        id: cm.id,
        marketId: cm.market_id,
        user: {
            id: cm.user_id,
            name: cm.user_name,
            handle: cm.user_handle,
            avatar: cm.user_avatar,
            isVerified: cm.user_verified === 1,
        },
        content: cm.content,
        createdAt: cm.created_at,
    }, 201);
});

// GET /api/social/markets/:id/comments - Get comments
socialRoutes.get('/markets/:id/comments', async (c) => {
    const id = c.req.param('id');
    const { limit = '50', offset = '0' } = c.req.query();

    const { results } = await c.env.DB.prepare(`
    SELECT 
      c.*,
      u.name as user_name,
      u.handle as user_handle,
      u.avatar as user_avatar,
      u.is_verified as user_verified
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.market_id = ?
    ORDER BY c.created_at DESC
    LIMIT ? OFFSET ?
  `).bind(id, limit, offset).all();

    const comments = (results || []).map((cm: any) => ({
        id: cm.id,
        marketId: cm.market_id,
        user: {
            id: cm.user_id,
            name: cm.user_name,
            handle: cm.user_handle,
            avatar: cm.user_avatar,
            isVerified: cm.user_verified === 1,
        },
        content: cm.content,
        createdAt: cm.created_at,
    }));

    return c.json(comments);
});

// DELETE /api/social/comments/:id - Delete comment
socialRoutes.delete('/comments/:id', async (c) => {
    const id = c.req.param('id');

    const comment = await c.env.DB.prepare('SELECT market_id FROM comments WHERE id = ?').bind(id).first() as { market_id: string } | null;

    if (!comment) {
        return c.json({ error: 'Comment not found' }, 404);
    }

    await c.env.DB.prepare('DELETE FROM comments WHERE id = ?').bind(id).run();
    await c.env.DB.prepare('UPDATE markets SET comments_count = MAX(0, comments_count - 1) WHERE id = ?').bind(comment.market_id).run();

    return c.json({ success: true });
});
