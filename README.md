# UniTrade

UniTrade is a campus marketplace for Chulalongkorn University students and staff to list, discover, and hand over second-hand items on campus. The project is built as a Software Engineering course project.

The app does not process payments, provide shipping, or include in-app chat. Buyers and sellers arrange an in-person handover at a campus pickup location.

## Website

Live Demo: **[`https://unitrade-rouge.vercel.app`](https://unitrade-rouge.vercel.app)** — deploy บน Vercel 16 พ.ย. 2569 (ผลตรวจหลัง deploy: [`docs/TASK-23-DEPLOY.md`](docs/TASK-23-DEPLOY.md#7-ผล-deploy-จริง-16-พฤศจิกายน-2569))

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

   Generate a JWT secret, for example, with `openssl rand -base64 48`. Team members use the team's shared Supabase project: ask the Backend Lead for a server key by direct message, never in a group chat or in git. Anyone else can use their own Supabase project after applying the migrations in [`supabase/migrations/`](supabase/migrations/).

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

The API tests need `npm run dev` running. The team runs them against its shared Supabase project: each run registers `bruno.*` test users and creates test listings, and the collection deletes its own listings through the API at the end. After a run, delete the test users with the SQL in the "ลบข้อมูลทดสอบ" section of [`docs/TEAM-GUIDE.md`](docs/TEAM-GUIDE.md).

The 13 admin requests (67–79) need `bruno/.env` with `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Copy [`bruno/.env.example`](bruno/.env.example) and ask the Backend Lead for the test admin account by direct message. Without that file, those 13 requests are skipped and the other 82 still run. `bruno/.env` is ignored by git; never commit it.

## API

API route handlers are under [`app/api/v1/`](app/api/v1/). The API covers authentication and profiles, faculties, product listings, categories, pickup locations, wishlists, reports, and administration.

The API contract is [API Specification v2.2](docs/API-SPEC-UNITRADE-v2.2.md). All 22 endpoints in the spec are built, including seller contact (`GET /products/:id/contact`) and My Listings (`GET /me/products`). Rate limiting (spec §1.6) is not built. The spec's "สถานะการพัฒนาเทียบกับ spec" section lists where the code differs from the spec.

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
- The Supabase project is shared by the team. Only create and delete your own test data, and clean up after test runs.

## Project documents

- [Project report](docs/REPORT-SE-UNITRADE.md)
- [System requirements (SRS)](docs/SRS-UNITRADE-v2.2.md)
- [API Specification v2.2](docs/API-SPEC-UNITRADE-v2.2.md)
- [System context diagram](docs/CONTEXT-DIAGRAM.md)
- [Project Kanban](docs/PROJECT-KANBAN.md)
- [Test report](docs/TEST_REPORT.md) and [test cases (TASK-11)](docs/UniTrade_TASK-11_Test_Cases.xlsx)
- [User acceptance testing (UAT)](docs/UAT-UNITRADE.md)
- [Team guide](docs/TEAM-GUIDE.md)
- [Deploy guide (TASK-23)](docs/TASK-23-DEPLOY.md)
- Change notes: [TASK-07/10/16/18 (frontend)](docs/TASK-07-10-16-18-CHANGELOG.md), [TASK-09](docs/TASK-09-CHANGELOG.md), [TASK-12](docs/TASK-12-CHANGELOG.md), [TASK-15](docs/TASK-15-CHANGELOG.md), [TASK-19](docs/TASK-19-CHANGELOG.md), [contact and My Listings API](docs/CONTACT-MY-PRODUCTS-CHANGELOG.md)
- [Frontend design notes](docs/REPORT-FRONTEND.md)
- [Postman collection for reports and admin](docs/postman/)
