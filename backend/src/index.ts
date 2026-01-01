import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { marketsRoutes } from './routes/markets';
import { usersRoutes } from './routes/users';
import { betsRoutes } from './routes/bets';
import { socialRoutes } from './routes/social';
import { aiRoutes } from './routes/ai';
import { operationsRoutes } from './routes/operations';

export interface Env {
    DB: D1Database;
    AI: any; // Cloudflare AI binding
}

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use('*', cors({
    origin: [
        'http://localhost:3000', 
        'http://localhost:5173', 
        'https://socialbet.pages.dev',
        'https://51218b34.socialbet.pages.dev',
        'https://*.socialbet.pages.dev'
    ],
    credentials: true,
}));

// Health check
app.get('/api/health', (c) => {
    return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount routes
app.route('/api/markets', marketsRoutes);
app.route('/api/users', usersRoutes);
app.route('/api/bets', betsRoutes);
app.route('/api/social', socialRoutes);
app.route('/api/ai', aiRoutes);
app.route('/api/operations', operationsRoutes);

// 404 handler
app.notFound((c) => {
    return c.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
    console.error('Error:', err);
    return c.json({ error: err.message }, 500);
});

export default app;
