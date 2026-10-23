import postgres from 'postgres';

async function testConnection() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.log('NOTICE: Neither DIRECT_URL nor DATABASE_URL is set in environment.');
    console.log('Skipping remote database connection test.');
    return;
  }

  console.log('Connecting to Supabase PostgreSQL via connection string...');
  
  const sql = postgres(connectionString, {
    ssl: 'require',
    connect_timeout: 10,
  });

  try {
    const result = await sql`SELECT current_database(), current_user, version();`;
    console.log('Successfully connected to Supabase PostgreSQL!');
    console.log('Result:', result[0]);
  } catch (err) {
    console.error('Connection error:', err);
  } finally {
    await sql.end();
  }
}

testConnection();
