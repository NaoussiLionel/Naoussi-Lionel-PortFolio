import { existsSync } from 'node:fs';
import { neon } from '@neondatabase/serverless';

// Make `npm run db:init` work with the same .env.local the app uses.
function loadLocalEnv() {
  if (process.env.DATABASE_URL) return;
  for (const file of ['.env.local', '.env']) {
    if (!existsSync(file)) continue;
    try {
      process.loadEnvFile?.(file);
    } catch {
      // Older Node versions or malformed files: fall through to the clear error below.
    }
    if (process.env.DATABASE_URL) return;
  }
}

loadLocalEnv();

const databaseUrl = process.argv[2] || process.env.DATABASE_URL;

if (!databaseUrl || databaseUrl.includes('USER:PASSWORD')) {
  console.error(`
DATABASE_URL is not configured.

How to fix it:
  1. Create a Neon Postgres database (Vercel -> Storage -> Neon, or neon.tech).
  2. Copy the connection string into .env.local:
       DATABASE_URL=postgresql://user:password@host/neondb?sslmode=require
  3. Run this script again:
       npm run db:init

Or pass the connection string directly:
  npm run db:init -- "postgresql://user:password@host/neondb?sslmode=require"
`);
  process.exit(1);
}

const sql = neon(databaseUrl);

await sql`CREATE TABLE IF NOT EXISTS entries (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),kind text NOT NULL,
 slug text NOT NULL UNIQUE,title text NOT NULL,subtitle text NOT NULL DEFAULT '',
 description text NOT NULL DEFAULT '',cover text NOT NULL DEFAULT '',gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
 tags jsonb NOT NULL DEFAULT '[]'::jsonb,metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
 featured boolean NOT NULL DEFAULT false,published boolean NOT NULL DEFAULT false,
 sort_order integer NOT NULL DEFAULT 0,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now()
)`;

await sql`CREATE INDEX IF NOT EXISTS idx_entries_kind_published ON entries(kind,published,sort_order)`;
await sql`CREATE TABLE IF NOT EXISTS site_settings (key text PRIMARY KEY,value jsonb NOT NULL)`;
await sql`CREATE TABLE IF NOT EXISTS messages (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),name text NOT NULL,email text NOT NULL,
 subject text NOT NULL,message text NOT NULL,is_read boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now()
)`;

// Upgrade databases created before the unread-message feature.
await sql`ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_read boolean NOT NULL DEFAULT false`;

console.log('Database tables ready. Public portfolio starts empty until you create content in /admin.');
