# Quick start — 7 steps

1. Download and extract `structural-blueprint-portfolio.zip`.
2. Open a terminal in the extracted directory and run `npm install`.
3. Create a Neon PostgreSQL database through Vercel Marketplace and a **public** Vercel Blob store.
4. Copy `.env.example` to `.env.local`, then add your real `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` and `SESSION_SECRET` (see README for hash/secret commands).
5. Initialize Neon: `export DATABASE_URL='YOUR_NEON_URL' && npm run db:init`.
6. Run `npm run dev` and visit `http://localhost:3000/admin` to log in, fill in your real identity and publish your projects.
7. Push to GitHub and import on Vercel; set the same environment variables in Vercel and deploy.

Important: The site isn't deployed or connected to your account yet. It is complete source code to configure and deploy. The demo project descriptions are deliberately labeled as illustrative, not real commissions.
