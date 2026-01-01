import { describe, it, expect } from 'vitest';
import app from './index';

describe('Backend API', () => {
    it('GET /api/health should return 200 and status ok', async () => {
        const res = await app.request('/api/health');
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).toEqual(expect.objectContaining({
            status: 'ok',
            timestamp: expect.any(String)
        }));
    });

    it('GET /api/unknown should return 404', async () => {
        const res = await app.request('/api/unknown');
        expect(res.status).toBe(404);
        const body = await res.json();
        expect(body).toEqual({ error: 'Not found' });
    });
});
