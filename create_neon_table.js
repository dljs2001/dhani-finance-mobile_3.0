import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_VjQUeDagK0O9@ep-steep-fire-ae637xly-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
    ssl: { rejectUnauthorized: false },
});

async function run() {
    const client = await pool.connect();
    try {
        console.log('Connected to Neon DB ✅');

        await client.query(`
      CREATE TABLE IF NOT EXISTS online_app (
        id                      SERIAL PRIMARY KEY,
        user_id                 TEXT UNIQUE NOT NULL,
        password                TEXT NOT NULL,
        account_name            TEXT NOT NULL,
        bank_amount             NUMERIC(15, 2) DEFAULT 0,
        withdraw_account_number TEXT,
        available_balance       NUMERIC(15, 2) DEFAULT 0,
        withdrawal_fee          NUMERIC(15, 2) DEFAULT 0,
        created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
        console.log('Table online_app created (or already exists) ✅');

        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_online_app_user_id ON online_app (user_id);
    `);
        console.log('Index created ✅');

        const res = await client.query(`
      SELECT column_name, data_type FROM information_schema.columns
      WHERE table_name = 'online_app'
      ORDER BY ordinal_position;
    `);
        console.log('\nonline_app table columns:');
        res.rows.forEach(row => console.log(`  - ${row.column_name}: ${row.data_type}`));

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

run();
