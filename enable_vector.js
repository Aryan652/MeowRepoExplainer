import postgres from 'postgres';
const sql = postgres('postgresql://postgres.cydxivstmpdxunhtzzfc:CcHPow5n7xxlYyXj@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres');
sql`CREATE EXTENSION IF NOT EXISTS vector;`.then(() => {
  console.log('Vector extension enabled');
  process.exit(0);
}).catch(console.error);
