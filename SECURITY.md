# Security Policy

## Supported Versions

Currently, the ScholarSync AI project is in active development. All security patches and fixes are applied to the `main` branch. 

| Version | Supported          |
| ------- | ------------------ |
| 0.0.1   | :white_check_mark: |

## Environment Variables Strategy

To keep the application secure, we strictly categorize our environment variables:

### Public Variables (Safe to expose)
Variables prefixed with `PUBLIC_` are safely bundled into the client-side JavaScript by Vite/Astro.
- `PUBLIC_SUPABASE_URL`: The URL of your Supabase project.
- `PUBLIC_SUPABASE_ANON_KEY`: The anonymous, public-facing key for Supabase. This key is safe to expose because all data access is controlled by **Row Level Security (RLS)** in the database.

### Private Variables (Strictly Secret)
Variables WITHOUT the `PUBLIC_` prefix must **never** be exposed to the client.
- `OPENROUTER_API_KEY`: Used strictly on the server-side (`src/pages/api/*`) for connecting to LLMs. If this key is leaked, it could result in financial billing abuse.

**Important Note:** The `.env` and `.env.production` files are strictly ignored by `.gitignore`. Do not commit actual secrets to the repository. Use `.env.example` as a template.

## API Route Protection

All API routes (`/api/chat`, `/api/ai-search`, `/api/match`) are protected through multiple layers:
1. **Authentication Check**: The `/api/chat` and `/api/ai-search` routes require a valid Supabase JWT `Authorization` header. Unauthenticated requests are rejected with a `401 Unauthorized`.
2. **Rate Limiting**: An in-memory rate limiter prevents abuse (e.g., maximum 10 requests per minute per IP for chat).
3. **Payload Validation**: Incoming requests are validated to ensure required JSON structures are met.

## Deployment on Netlify
When deploying to Netlify, ensure that you add the environment variables via the **Netlify Dashboard -> Site Settings -> Environment Variables**. Do not upload your local `.env` file to Netlify.

## Reporting a Vulnerability

If you discover a security vulnerability within ScholarSync AI, please send an e-mail to the project maintainers rather than creating a public issue. We will review the vulnerability and provide a timeline for a patch.
