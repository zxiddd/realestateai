/**
 * CHECK DATABASE TABLES
 * Verify that all required tables exist
 */

import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'bhoomiai',
  user: 'postgres',
  password: '1'
});

const requiredTables = [
  'users',
  'user_profiles',
  'email_verification_tokens',
  'refresh_tokens',
  'password_reset_tokens',
  'user_sessions',
  'audit_logs'
];

async function checkDatabase() {
  console.log('🔍 Checking BhoomiAI Database...\n');

  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful\n');

    // Check for each table
    console.log('📋 Checking tables:\n');

    let allTablesExist = true;

    for (const tableName of requiredTables) {
      const result = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = $1
        );
      `, [tableName]);

      const exists = result.rows[0].exists;

      if (exists) {
        // Count rows in table
        const countResult = await pool.query(`SELECT COUNT(*) FROM ${tableName}`);
        const count = countResult.rows[0].count;
        console.log(`   ✅ ${tableName.padEnd(30)} (${count} rows)`);
      } else {
        console.log(`   ❌ ${tableName.padEnd(30)} (MISSING)`);
        allTablesExist = false;
      }
    }

    console.log('');

    if (allTablesExist) {
      console.log('🎉 All database tables exist!');
      console.log('You can now test registration and login.\n');
      console.log('Next steps:');
      console.log('1. Start backend: npm run backend');
      console.log('2. Start frontend: npm run dev');
      console.log('3. Or test with: node test-registration.js');
    } else {
      console.log('⚠️  Some tables are missing!');
      console.log('\nYou need to run the schema.sql file:');
      console.log('1. Open pgAdmin');
      console.log('2. Right-click on "bhoomiai" database');
      console.log('3. Select "Query Tool"');
      console.log('4. Open backend/schema.sql');
      console.log('5. Click Execute (F5)');
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.log('\n🔍 Troubleshooting:');
    console.log('1. Make sure PostgreSQL is running');
    console.log('2. Make sure database "bhoomiai" exists');
    console.log('3. Make sure password is correct in .env file');
    await pool.end();
    process.exit(1);
  }
}

checkDatabase();
