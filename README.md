# UniTrade

UniTrade is a campus marketplace for Chulalongkorn University students and staff to list, discover, and hand over second-hand items on campus. The project is built as a Software Engineering course project.

The app does not process payments, provide shipping, or include in-app chat. Buyers and sellers arrange an in-person handover at a campus pickup location.

## Website

Live Demo: [เว้นไว้รอข้อมูล]

## Features

- Browse products and filter by keyword, category, price, condition, status, and pickup location
- Create, edit, and manage product listings, including product images
- Register and sign in with a Chulalongkorn email address
- Save products to a wishlist
- Submit product reports and provide administration tools for moderation
- Use a mock-data mode to explore the frontend without connecting to Supabase

## Technology

- Next.js 15 App Router and React
- JavaScript (ES modules)
- Supabase Postgres and Storage
- JWT-based API authentication

## Requirements

- Node.js 22 or later
- npm
- A Supabase project for live API development; Supabase is optional for the frontend mock mode

## Run locally

1. Install dependencies:

   ```sh
   npm install
   ```

2. Create a local environment file:

   Windows PowerShell:

   ```powershell
   Copy-Item .env.example .env.local
   ```

   macOS/Linux:

   ```sh
   cp .env.example .env.local
   ```

3. Choose a run mode:

   **Frontend demo with mock data:** set `NEXT_PUBLIC_USE_MOCK_API=true` in `.env.local`. No Supabase credentials are needed for this mode.

   **Live API and database:** configure these server-side values in `.env.local`:

   | Variable | Purpose |
   | --- | --- |
   | `SUPABASE_URL` | URL of your Supabase project |
   | `SUPABASE_SERVICE_ROLE_KEY` | Server-only Supabase secret/service-role key |
   | `JWT_SECRET` | Secret used to sign API authentication tokens |
   | `NEXT_PUBLIC_USE_MOCK_API` | Set to `false` or leave blank to use the live API |

   Generate a JWT secret, for example, with `openssl rand -base64 48`. Use your own Supabase project and ensure its schema and Storage bucket are configured before using the live API.

4. Start the development server:

   ```sh
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Create a production build |
| `npm start` | Run the production build |
| `npm test` | Run the Node.js unit tests |
| `npm run test:api` | Run the Bruno API collection |

The API tests require a running local server and a test database. They may create test records; use a dedicated test Supabase project and clean up test data after running them. Do not run API tests against a production or shared database.

## API

API route handlers are under [`app/api/v1/`](app/api/v1/). The API covers authentication and profiles, faculties, product listings, categories, pickup locations, wishlists, reports, and administration. Route handlers and request/response behavior in the source are the implementation reference.

## Repository layout

```text
app/                 Web pages and API route handlers
components/          Shared interface components
lib/                 Server-side helpers and shared constants
lib/client/          Browser-side API, session, and mock-data helpers
supabase/            Database migrations and seed data
test/                Unit tests
bruno/               Bruno API test collection
docs/                Project specifications and supporting documents
```

## Security

- Never commit `.env.local` or share Supabase secret/service-role keys.
- Keep `SUPABASE_SERVICE_ROLE_KEY` and `JWT_SECRET` server-side; do not prefix them with `NEXT_PUBLIC_`.
- Use a dedicated test database for API tests.

## Project documents

- [System requirements (SRS)](docs/SRS-UNITRADE-v2.2.md)
- [System context diagram](docs/CONTEXT-DIAGRAM.md)