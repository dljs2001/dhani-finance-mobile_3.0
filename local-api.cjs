// local-api.cjs — Local dev server that mimics Netlify Functions
// Runs on port 3001 and handles /api/* routes
// Used only during local development (npm run dev)

const http = require('http');
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || process.env.PG_CONNECTION_STRING;
const sslOption = process.env.DISABLE_DB_SSL === 'true' ? false : { rejectUnauthorized: false };

const pool = new Pool({
    connectionString,
    ssl: sslOption,
});

const server = http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const url = req.url;

    // --- ROUTE: GET Users ---
    if (req.method === 'GET' && (req.url === '/api/get-online-users' || req.url === '/.netlify/functions/get-online-users')) {
        console.log('GET /api/get-online-users - Fetching from Neon...');
        try {
            const client = await pool.connect();
            try {
                const result = await client.query('SELECT * FROM online_app ORDER BY created_at DESC');
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*' // Add CORS for local KOS Hub dev too
                });
                res.end(JSON.stringify(result.rows));
            } finally {
                client.release();
            }
        } catch (err) {
            console.error('Neon DB Error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
        }
        return;
    }

    // --- ROUTE: Create User (Existing) ---
    if (req.method === 'POST' && (url === '/api/create-online-user' || url === '/.netlify/functions/create-online-user')) {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const data = JSON.parse(body || '{}');
                const { user_id, password, account_name, bank_name, bank_amount, withdraw_account_number, available_balance, withdrawal_fee } = data;

                if (!user_id || !password || !account_name) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: 'user_id, password, and account_name are required.' }));
                    return;
                }

                const client = await pool.connect();
                try {
                                        const result = await client.query(
                                                `INSERT INTO online_app 
                            (user_id, password, account_name, bank_name, bank_amount, withdraw_account_number, available_balance, withdrawal_fee)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                         ON CONFLICT (user_id) DO UPDATE SET
                             password = EXCLUDED.password,
                             account_name = EXCLUDED.account_name,
                             bank_name = EXCLUDED.bank_name,
                             bank_amount = EXCLUDED.bank_amount,
                             withdraw_account_number = EXCLUDED.withdraw_account_number,
                             available_balance = EXCLUDED.available_balance,
                             withdrawal_fee = EXCLUDED.withdrawal_fee
                         RETURNING *`,
                                                [user_id, password, account_name, bank_name || '', bank_amount || 0, withdraw_account_number || '', available_balance || 0, withdrawal_fee || 0]
                                        );
                    console.log('✅ Saved to Neon online_app:', result.rows[0]);
                    res.writeHead(200);
                    res.end(JSON.stringify({ success: true, data: result.rows[0] }));
                } finally {
                    client.release();
                }
            } catch (err) {
                console.error('❌ Neon DB error:', err.message);
                res.writeHead(500);
                res.end(JSON.stringify({ error: err.message }));
            }
        });
        return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(3001, () => {
    console.log('🚀 Local API server running at http://localhost:3001');
    console.log('   Handles: POST /api/create-online-user');
});
