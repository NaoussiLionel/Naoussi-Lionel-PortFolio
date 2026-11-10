# STRUCTURAL / BLUEPRINT — Engineering Portfolio & Admin CMS

An editable structural-engineering portfolio with dark CAD/blueprint visual design, cyan linework, amber engineering annotations, optional Ink Free typography, public project case studies, secure admin dashboard, PostgreSQL and Vercel Blob uploads.

## Features

- Public: homepage, responsive project grid, individual project case studies, technical specs, image/PDF gallery, expertise, skills, experience, education, certifications, CV link and contact form.
- Admin at `/admin`: secure sign-in; create/update/delete projects, skills, services, experience, education and certifications; draft/publish status; sorting and metadata; upload images and PDFs; edit every website text, colors, section visibility and contact details; read and delete enquiries.
- Backend: Neon PostgreSQL via Vercel Marketplace, server-side authenticated APIs, HttpOnly signed session cookie, bcrypt password hash, Vercel Blob direct-to-storage upload.
- **Important:** Public pages show explicitly marked illustration/demo entries if DATABASE_URL is not configured; once connected, entries are read from the database (initially empty). Content saved in admin is real, not local-only.

## 1. Install

Use Node 22+.

```bash
npm install
cp .env.example .env.local
```

## 2. Vercel / Neon database

1. Create a Vercel project and connect a **Neon PostgreSQL** database in Vercel Storage / Marketplace.
2. Copy its `DATABASE_URL` environment variable to `.env.local` for local development (or use `vercel env pull`).
3. Initialize tables with the same URL (bash/macOS):

```bash
export DATABASE_URL='postgresql://...'
npm run db:init
```

The database has `entries`, `site_settings`, and `messages` tables. All admin-controlled content uses these tables. Run initialization **once** per database.

## 3. Configure admin credentials

Generate a robust unique password (at least 12 characters) and hash it:

```bash
npm run auth:hash -- "your-unique-very-long-password"
```

Copy the hash to `ADMIN_PASSWORD_HASH` in `.env.local`. Add `ADMIN_EMAIL` (your login email). Create `SESSION_SECRET` with `openssl rand -base64 48`; put it in `.env.local`. **Never commit the `.env.local` file.** Admin login uses email + password; nothing is hardcoded.

## 3.1 Fixing “Admin credentials are not configured” on Vercel

If `/admin` shows a 503 error with **Admin authentication is not configured**, the production deployment is missing one or more server-side environment variables.

In **Vercel → Project → Settings → Environment Variables**, add these three variables for the **Production** environment:

- `ADMIN_EMAIL` — the email you will use to sign in.
- `ADMIN_PASSWORD_HASH` — the bcrypt hash generated locally with `npm run auth:hash -- "your-password"`.
- `SESSION_SECRET` — a random secret of at least 32 characters; for example `openssl rand -base64 48`.

Then **redeploy the latest commit**. Do not put the plain admin password in GitHub, `.env.example`, source code, or client-side code.

The login endpoint now reports exactly which variable is missing, so a 503 can be diagnosed without exposing credentials.

## 4. Vercel Blob for images and PDFs

1. Create a **public** Vercel Blob store and link it to this project.
2. Set `BLOB_READ_WRITE_TOKEN` in project env and local `.env.local`.
3. The admin media uploader stores images and PDF documents to Blob via a protected token endpoint, with a 25MB size limit.
4. This store is **public**. Do not upload confidential client plans/calculations. Use a separate private Blob store and authenticated delivery flow for confidential media.

## 5. Start local

```bash
npm run dev
```

Open `http://localhost:3000` (public portfolio), `http://localhost:3000/admin` (login/dashboard). Log in, edit settings first, add projects, choose Published and Save. Once published, the public website reads this content immediately.

## 6. Deploy

- Push the project to GitHub and import in Vercel.
- In the Vercel project **Environment Variables**, set `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, `SESSION_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `NEXT_PUBLIC_SITE_URL`.
- Initialize the database from your machine against the same Neon instance.
- Deploy. Change your name, contact info, pictures and sample text in `/admin`.
- For production, add rate limiting at your edge/WAF for `/api/auth/login` and `/api/contact`, optionally MFA/SSO for admin and anti-spam protection. Session cookie is HttpOnly, SameSite Strict and secure in production.

## Typography / Ink Free

CSS specifies `'Ink Free', 'Caveat', cursive` for handwritten annotations. **Ink Free is proprietary and is not bundled.** If you have appropriate rights to embed it, provide licensed webfont files separately and add an `@font-face` declaration to `app/globals.css`. Otherwise, Caveat (loaded from Google Fonts) provides the same handwritten design intent without redistributing a restricted font.

## Notes and boundaries

- Website identity text, colors, section visibility, projects, media URLs, metadata and content can all be edited through admin. Brand-new layout components or logic changes still require developer changes.
- Uploads use a *public* Blob store. Published project PDFs/images are accessible to anyone who has their URL.
- `NEXT_PUBLIC_SITE_URL` is reserved for future canonical/social metadata support.
- Site settings have default placeholder content until edited. Do not claim demo projects are real professional commissions.
- For a high-traffic public site, add IP rate limiting, captcha and operational monitoring before wide launch.
- The contact form stores messages in Neon; it does not automatically email you. Read enquiries in the admin Messages tab.

## Project structure

- `app/page.tsx` public home
- `app/projects/[slug]/page.tsx` project case studies
- `app/admin/page.tsx` admin console
- `components/AdminDashboard.tsx` editable CMS interface
- `app/api/admin` secured CRUD/media/settings/messages
- `app/api/auth` secure admin authentication
- `app/api/contact` public contact form
- `lib/db.ts` Neon queries
- `lib/defaults.ts` placeholder content and website defaults
- `scripts/init-db.mjs` initial SQL tables

Built for structural engineering, not a generic business card.
