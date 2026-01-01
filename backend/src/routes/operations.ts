import { Hono } from 'hono';
import type { Env } from '../index';

export const operationsRoutes = new Hono<{ Bindings: Env }>();

// Middleware to check admin permissions
const checkAdmin = async (c: any, userId?: string) => {
    if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const user = await c.env.DB.prepare('SELECT is_admin FROM users WHERE id = ?').bind(userId).first();
    
    if (!user || (user as any).is_admin !== 1) {
        return c.json({ error: 'Admin access required' }, 403);
    }

    return null; // User is admin
};

// GET /api/operations/treasury - Get treasury overview
operationsRoutes.get('/treasury', async (c) => {
    try {
        // Get current month's date
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        
        // Get latest metrics
        const metrics = await c.env.DB.prepare(`
            SELECT * FROM operations_metrics 
            ORDER BY metric_date DESC 
            LIMIT 1
        `).first();

        // If no metrics exist, create default
        let treasuryData: any;
        if (!metrics) {
            // Initialize with default values
            const defaultMetrics = {
                id: crypto.randomUUID(),
                metric_date: currentMonth,
                total_revenue: 0,
                monthly_revenue: 0,
                operational_fund: 0,
                total_trades: 0,
                monthly_trades: 0,
                platform_fee_percent: 2.5,
            };
            
            await c.env.DB.prepare(`
                INSERT INTO operations_metrics 
                (id, metric_date, total_revenue, monthly_revenue, operational_fund, total_trades, monthly_trades, platform_fee_percent)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
                defaultMetrics.id,
                defaultMetrics.metric_date,
                defaultMetrics.total_revenue,
                defaultMetrics.monthly_revenue,
                defaultMetrics.operational_fund,
                defaultMetrics.total_trades,
                defaultMetrics.monthly_trades,
                defaultMetrics.platform_fee_percent
            ).run();
            
            treasuryData = defaultMetrics;
        } else {
            treasuryData = metrics;
        }

        // Get fund allocations
        const allocations = await c.env.DB.prepare(`
            SELECT * FROM fund_allocations
        `).all();

        let allocationData: any = {};
        if (!allocations.results || allocations.results.length === 0) {
            // Initialize default allocations
            const defaultAllocations = [
                { category: 'development', percentage: 40 },
                { category: 'operations', percentage: 30 },
                { category: 'marketing', percentage: 15 },
                { category: 'reserves', percentage: 10 },
                { category: 'partnerships', percentage: 5 },
            ];

            for (const alloc of defaultAllocations) {
                const id = crypto.randomUUID();
                const amount = (treasuryData.operational_fund || 0) * (alloc.percentage / 100);
                await c.env.DB.prepare(`
                    INSERT INTO fund_allocations (id, category, allocated_amount, used_amount, percentage)
                    VALUES (?, ?, ?, 0, ?)
                `).bind(id, alloc.category, amount, alloc.percentage).run();
                
                allocationData[alloc.category] = {
                    allocated: amount,
                    used: 0,
                    percentage: alloc.percentage,
                };
            }
        } else {
            (allocations.results || []).forEach((alloc: any) => {
                allocationData[alloc.category] = {
                    allocated: alloc.allocated_amount,
                    used: alloc.used_amount,
                    percentage: alloc.percentage,
                };
            });
        }

        // Calculate trends (mock for now, would calculate from historical data)
        const totalRevenue = treasuryData.total_revenue || 0;
        const monthlyRevenue = treasuryData.monthly_revenue || 0;
        const operationalFund = treasuryData.operational_fund || 0;
        const totalTrades = treasuryData.total_trades || 0;
        const monthlyTrades = treasuryData.monthly_trades || 0;

        return c.json({
            totalRevenue,
            monthlyRevenue,
            operationalFund,
            totalTrades,
            monthlyTrades,
            platformFeePercent: treasuryData.platform_fee_percent || 2.5,
            allocations: allocationData,
            trends: {
                revenueChange: '+12.5%',
                monthlyRevenueChange: '+8.2%',
                fundChange: '+5.1%',
                tradesChange: '+15.3%',
            },
        });
    } catch (error: any) {
        console.error('Error fetching treasury data:', error);
        return c.json({ error: error.message || 'Failed to fetch treasury data' }, 500);
    }
});

// GET /api/operations/transactions - Get treasury transactions
operationsRoutes.get('/transactions', async (c) => {
    const { limit = '50', offset = '0', type, category } = c.req.query();

    let query = 'SELECT * FROM treasury_transactions WHERE 1=1';
    const params: string[] = [];

    if (type) {
        query += ' AND transaction_type = ?';
        params.push(type);
    }

    if (category) {
        query += ' AND category = ?';
        params.push(category);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const { results } = await c.env.DB.prepare(query).bind(...params).all();

    return c.json({
        transactions: results || [],
        total: results?.length || 0,
    });
});

// POST /api/operations/transactions - Record a treasury transaction
operationsRoutes.post('/transactions', async (c) => {
    try {
        const body = await c.req.json();
        const { transactionType, amount, currency = 'USD', description, category, status = 'completed', userId } = body;

        // For trade_fee, allow automatic recording without admin check
        // For other types, require admin
        if (transactionType !== 'trade_fee') {
            const adminCheck = await checkAdmin(c, userId);
            if (adminCheck) return adminCheck;
        }

        if (!transactionType || !amount) {
            return c.json({ error: 'Missing required fields: transactionType, amount' }, 400);
        }

        const id = crypto.randomUUID();
        await c.env.DB.prepare(`
            INSERT INTO treasury_transactions 
            (id, transaction_type, amount, currency, description, category, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(id, transactionType, amount, currency, description || null, category || null, status).run();

        // Update operations metrics if it's a trade fee
        if (transactionType === 'trade_fee' && status === 'completed') {
            const now = new Date();
            const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            
            // Get or create current month's metrics
            let metrics = await c.env.DB.prepare(`
                SELECT * FROM operations_metrics 
                WHERE metric_date = ?
            `).bind(currentMonth).first();

            if (!metrics) {
                // Get previous month's data
                const prevMetrics = await c.env.DB.prepare(`
                    SELECT * FROM operations_metrics 
                    ORDER BY metric_date DESC 
                    LIMIT 1
                `).first();

                const prev: any = prevMetrics || {};
                const newId = crypto.randomUUID();
                await c.env.DB.prepare(`
                    INSERT INTO operations_metrics 
                    (id, metric_date, total_revenue, monthly_revenue, operational_fund, total_trades, monthly_trades, platform_fee_percent)
                    VALUES (?, ?, ?, 0, ?, 0, 0, ?)
                `).bind(
                    newId,
                    currentMonth,
                    prev.total_revenue || 0,
                    prev.operational_fund || 0,
                    prev.platform_fee_percent || 2.5
                ).run();
            }

            // Update metrics
            await c.env.DB.prepare(`
                UPDATE operations_metrics 
                SET 
                    total_revenue = total_revenue + ?,
                    monthly_revenue = monthly_revenue + ?,
                    operational_fund = operational_fund + ?,
                    total_trades = total_trades + 1,
                    monthly_trades = monthly_trades + 1,
                    updated_at = datetime('now')
                WHERE metric_date = ?
            `).bind(amount, amount, amount, currentMonth).run();

            // Update fund allocations
            if (category) {
                await c.env.DB.prepare(`
                    UPDATE fund_allocations 
                    SET allocated_amount = allocated_amount + ?,
                        updated_at = datetime('now')
                    WHERE category = ?
                `).bind(amount, category).run();
            }
        }

        return c.json({ success: true, id }, 201);
    } catch (error: any) {
        console.error('Error creating transaction:', error);
        return c.json({ error: error.message || 'Failed to create transaction' }, 500);
    }
});

// GET /api/operations/stats - Get operations statistics
operationsRoutes.get('/stats', async (c) => {
    try {
        // Get current metrics
        const metrics = await c.env.DB.prepare(`
            SELECT * FROM operations_metrics 
            ORDER BY metric_date DESC 
            LIMIT 1
        `).first();

        // Get transaction counts by type
        const transactionStats = await c.env.DB.prepare(`
            SELECT 
                transaction_type,
                COUNT(*) as count,
                SUM(amount) as total_amount
            FROM treasury_transactions
            WHERE status = 'completed'
            GROUP BY transaction_type
        `).all();

        // Get allocation breakdown
        const allocations = await c.env.DB.prepare(`
            SELECT * FROM fund_allocations
        `).all();

        const m: any = metrics || {};
        return c.json({
            metrics: {
                totalRevenue: m.total_revenue || 0,
                monthlyRevenue: m.monthly_revenue || 0,
                operationalFund: m.operational_fund || 0,
                totalTrades: m.total_trades || 0,
                monthlyTrades: m.monthly_trades || 0,
            },
            transactionStats: (transactionStats.results || []).map((t: any) => ({
                type: t.transaction_type,
                count: t.count,
                totalAmount: t.total_amount,
            })),
            allocations: (allocations.results || []).map((a: any) => ({
                category: a.category,
                allocated: a.allocated_amount,
                used: a.used_amount,
                percentage: a.percentage,
            })),
        });
    } catch (error: any) {
        console.error('Error fetching stats:', error);
        return c.json({ error: error.message || 'Failed to fetch stats' }, 500);
    }
});

// PUT /api/operations/allocations - Update fund allocations
operationsRoutes.put('/allocations', async (c) => {
    try {
        const body = await c.req.json();
        const { allocations, userId } = body;

        // Require admin for allocation updates
        const adminCheck = await checkAdmin(c, userId);
        if (adminCheck) return adminCheck;

        if (!allocations || !Array.isArray(allocations)) {
            return c.json({ error: 'Invalid allocations data' }, 400);
        }

        // Get current operational fund
        const metrics = await c.env.DB.prepare(`
            SELECT operational_fund FROM operations_metrics 
            ORDER BY metric_date DESC 
            LIMIT 1
        `).first();

        const m: any = metrics || {};
        const totalFund = m.operational_fund || 0;

        // Update allocations
        for (const alloc of allocations) {
            const { category, percentage } = alloc;
            const allocatedAmount = totalFund * (percentage / 100);

            await c.env.DB.prepare(`
                UPDATE fund_allocations 
                SET 
                    allocated_amount = ?,
                    percentage = ?,
                    updated_at = datetime('now')
                WHERE category = ?
            `).bind(allocatedAmount, percentage, category).run();
        }

        return c.json({ success: true });
    } catch (error: any) {
        console.error('Error updating allocations:', error);
        return c.json({ error: error.message || 'Failed to update allocations' }, 500);
    }
});

