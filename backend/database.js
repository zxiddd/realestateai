/**
 * DATABASE CONNECTION
 * PostgreSQL connection pool
 * Supports both local development and Supabase production
 */

import pg from 'pg';
const { Pool } = pg;

// For production, we need to handle SSL properly
let connectionConfig;

if (process.env.DATABASE_URL) {
  // Production - Supabase
  let dbUrl = process.env.DATABASE_URL;

  // Add sslmode if not present
  if (!dbUrl.includes('sslmode')) {
    dbUrl += dbUrl.includes('?') ? '&sslmode=no-verify' : '?sslmode=no-verify';
  }

  connectionConfig = {
    connectionString: dbUrl,
    ssl: {
      rejectUnauthorized: false
    }
  };

  console.log('📦 Using DATABASE_URL for connection');
} else {
  // Local development
  connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'bhoomiai',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD ? String(process.env.DB_PASSWORD) : '1',
  };
  console.log('🏠 Using local database config');
}

const pool = new Pool({
  ...connectionConfig,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Test connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Database connected successfully at:', res.rows[0].now);
  }
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected pool error:', err.message);
});

export default pool;
