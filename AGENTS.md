# AGENTS.md — UniTrade backend

Instructions for an AI coding agent working in this repo. Read the whole file before writing code.
It is self-contained: the API contracts for your tasks are in sections 7 and 8, so you do not need the spec PDF.

Last updated: 24 Oct 2026 by the Backend Lead (@wz).

---

## 1. Project

UniTrade is a campus marketplace for Chulalongkorn University students and staff (course project, team "VISIT CMU").
Users sign up with a Chula email, post second-hand items, and meet on campus to hand them over.
There is no payment, no shipping, and no in-app chat.

| | |
|---|---|
| Stack | Next.js 15 App Router (JavaScript, ESM) · route handlers under `app/api/v1` · Supabase (Postgres + Storage) |
| Runtime | Node.js **22+** (required by `@supabase/supabase-js`) |
| Hosting | Vercel (frontend and API in this same project) |
| Auth | Our own HS256 JWT, 24 h, no refresh token. **Not** Supabase Auth. |
| DB access | Server only, via `service_role`, which **bypasses all row-level security**. Every permission check happens in our route code. |

## 2. Team and who decides

| Handle | Role | Owns |
|---|---|---|
| @wz | Backend Lead | Architecture, `lib/`, auth, migrations, PR review. **Ask @wz before changing anything in section 4.3.** |
| @SArunPoB | Backend Dev | TASK-09, TASK-12 |
| @yat | Frontend Lead | Layout, home page (consumes TASK-09) |
| @warixm | Frontend Dev | Listing form (consumes TASK-12) |
| @Aud | QA | Test cases (uses the Bruno collection) |

Your human is usually @SArunPoB. If you are not sure who you are working for or which task to do, ask before writing code.
If something here is ambiguous, stop and tell your human to ask @wz. Do not invent response fields, error codes or columns.

## 3. Current state

| Task | Status |
|---|---|
| TASK-04 Database + Supabase setup | Done. Migrations 0001–0004 are applied to the shared Supabase project. |
| TASK-05 API spec | Done (v2.2). Sections 6–8 below are the parts you need. |
| TASK-06 Auth API | Done and tested: register, login, `GET/PATCH /auth/me`, `/faculties`, `requireAuth`, `optionalAuth`. |
| **TASK-09** Product read API | **@SArunPoB, to do.** Section 7. Start here. |
| **TASK-12** Product create/edit/delete + image upload | **@SArunPoB, to do.** Section 8. Start after TASK-09, or in parallel. |

## 4. Rules

### 4.1 Setup and commands

```bash
npm install
cp .env.example .env.local   # human pastes SUPABASE_SERVICE_ROLE_KEY; generate JWT_SECRET with: openssl rand -base64 48
npm test                     # unit tests, must stay green (17 at handover)
npm run dev                  # http://localhost:3000/api/v1
npm run test:api             # Bruno collection against the running dev server (13/13 at handover)
npm run build                # must pass before every PR
```

### 4.2 Hard rules

1. **Never commit, print or log secrets.** `.env.local` is gitignored; keep it that way. Never echo the key into the terminal or into files.
2. **Never push to `main`.** Branch per task (`task-09-product-read`, `task-12-product-crud`), open a PR, @wz reviews and merges.
3. **Every route handler is wrapped** in `requireAuth`, `optionalAuth` or `route`. Because `db()` bypasses all permissions, an unwrapped handler is a data leak.
4. **Never `select('*')` from `users`**, and never embed `users(*)`. List columns explicitly. Public product responses must never contain the seller's `email`, `phone_number`, `line_id` or `password_hash` (SRS FR-06).
5. **Never create a Supabase client in browser code**, and never name a Supabase variable `NEXT_PUBLIC_*`.
6. **Schema changes go in a new migration file** (`supabase/migrations/0005_<name>.sql`), never through the dashboard and never by editing 0001–0004. Tell your human to get @wz's OK; @wz runs it.
7. **The Supabase project is shared with the whole team.** Only create and delete your own test data. Clean up after test runs (section 9.3).
8. **Do not return Supabase error messages to clients.** `throw error` and let `route()` turn it into a logged 500.

### 4.3 Do not change without @wz

`lib/auth.js`, `lib/http.js`, `lib/supabase.js`, `lib/validation.js`, `lib/users.js`, migrations 0001–0004, Bruno requests 01–13, and the response shape of any existing endpoint.
You **may** add exports to `lib/constants.js` and create new `lib/` files (for example `lib/products.js`).

### 4.4 Code style

- ESM. Inside `lib/`, use relative imports with the `.js` extension (`./http.js`) so `node --test` can load them. In `app/`, use `@/lib/<file>.js`.
- User-facing `message` strings are **Thai**. Code comments are short and in Thai, matching the existing files; English is fine where Thai would be awkward.
- Throw `ApiError` for expected failures. Never build an error `Response` by hand.
- Small pure helpers (parsing, validation, mapping) go in `lib/` and get unit tests in `test/`.

## 5. Codebase map

```
app/api/v1/auth/{register,login,me}/route.js   TASK-06, done
app/api/v1/faculties/route.js                  TASK-06, done
lib/http.js        ok(body, status) · noContent() · ApiError(status, code, message, field?) · route(handler) · readJson(request)
lib/auth.js        requireAuth(handler) · optionalAuth(handler) · signToken(user) · TOKEN_TTL_SECONDS
lib/supabase.js    db() → Supabase client (service_role) · PRODUCT_IMAGES_BUCKET = 'product-images'
lib/constants.js   FACULTIES · PICKUP_LOCATIONS · PRODUCT_STATUSES · ACTIVE_STATUSES
lib/validation.js  user rules (TASK-06)
lib/users.js       PROFILE_COLUMNS · getUserRow · getProfile
supabase/          migrations 0001–0004 + seed.sql (already applied; for reference)
test/              node:test unit tests
bruno/             API collection; environments/local.bru sets baseUrl
```

### 5.1 How a route looks

```js
// app/api/v1/products/[id]/status/route.js
import { ApiError, ok, readJson } from '@/lib/http.js';
import { requireAuth } from '@/lib/auth.js';
import { db } from '@/lib/supabase.js';

export const PATCH = requireAuth(async (request, { params, user }) => {
  const { id } = await params;            // Next.js 15: params is a Promise
  const body = await readJson(request);   // non-JSON body → 400 INVALID_PAYLOAD automatically
  // user = { user_id, role } from the token
  ...
  throw new ApiError(403, 'NOT_OWNER', 'คุณไม่ใช่เจ้าของประกาศนี้');
});
```

- `requireAuth`: no token → 401 `UNAUTHORIZED`, expired → 401 `TOKEN_EXPIRED`. Handler gets `user`.
- `optionalAuth`: no token or bad token → `user = null`. Use it on public GET routes.
- `route()` (wrapped by both): converts `ApiError` to JSON, Postgres `23514` to 422 `VALIDATION_ERROR`, anything else to a logged 500 `INTERNAL_ERROR`.

## 6. Shared API conventions

**Success, list:**
```json
{ "data": [ ... ], "pagination": { "page": 1, "per_page": 20, "total": 137, "total_pages": 7 } }
```
**Success, single item:** the object itself, not wrapped.
**Error:** `{ "error": { "code": "NOT_OWNER", "message": "…", "field": "optional" } }`
**Money:** JSON number (`250.00`), never a string. Wrap with `Number()` when mapping. **Time:** ISO 8601 UTC, as Postgres returns it.

### 6.1 Error codes you will use

| code | status | when |
|---|---|---|
| `INVALID_PAYLOAD` | 400 | Body is not JSON / not multipart when it must be |
| `UNAUTHORIZED` / `TOKEN_EXPIRED` | 401 | Handled by `requireAuth` |
| `NOT_OWNER` | 403 | Logged in, but not the listing's seller |
| `PRODUCT_NOT_FOUND` | 404 | Write routes only (`PATCH`/`DELETE /products/:id`): no product with that id, **or the id is not a valid UUID**. `GET /products/:id` does **not** use it — it answers `200` + `{ "data": [] }` |
| `FILE_TOO_LARGE` | 413 | One image > 2 MB, or all images together > 4 MB |
| `VALIDATION_ERROR` | 422 | Any field or query param fails a rule without a more specific code. Always set `field`. |
| `NO_IMAGE` | 422 | POST with zero images |
| `TOO_MANY_IMAGES` | 422 | More than 5 images |
| `UNSUPPORTED_FILE_TYPE` | 422 | File is not really a JPEG or PNG (check the bytes, section 8.1) |
| `INVALID_PICKUP_LOCATION` | 422 | Not exactly one of `PICKUP_LOCATIONS` |
| `INVALID_STATUS` | 422 | Status body is not `available` / `reserved` / `sold` |
| `INTERNAL_ERROR` | 500 | Produced by `route()`; never throw it yourself |

## 7. TASK-09 — Product read API

Four public endpoints, all wrapped in `optionalAuth` (or `route` where `user` is not needed).

### 7.1 Shared mapping (put in `lib/products.js`)

**Public seller name.** Public responses show the first name plus the first letter of the surname: `"กันตภณ ชัยรุ่งปัญญา"` → `"กันตภณ ช."`.
If the surname starts with a Thai leading vowel (`เ แ โ ใ ไ`), keep the vowel and the next character: `"สมชาย เจริญ"` → `"สมชาย เจ."`.
A single-word name is returned as is. Unit-test this.

**`is_free`** = `price === 0`. It is computed, not stored.

**`primary_image_url`** = the `image_url` of the product's image with `is_primary = true`, or `null`.

**Product card** (used by `GET /products`):
```json
{
  "product_id": "uuid",
  "title": "CALCULUS I (2110101) + ชีทสรุปครบเทอม",
  "price": 250.00,
  "is_free": false,
  "item_condition": "like_new",
  "status": "available",
  "pickup_location": "ศาลาพระเกี้ยว",
  "primary_image_url": "https://…/product-images/<product_id>/<image_id>.jpg",
  "category": { "category_id": "uuid", "name": "Textbooks" },
  "seller": { "user_id": "uuid", "full_name": "กันตภณ ช.", "faculty": "คณะวิศวกรรมศาสตร์" },
  "is_wishlisted": false,
  "created_at": "2026-09-08T09:12:00+00:00"
}
```

**Product detail** (used by `GET /products/:id`, and returned by `POST` and `PATCH /products/:id` in TASK-12):
```json
{
  "product_id": "uuid",
  "title": "…",
  "description": "… or null",
  "price": 250.00,
  "is_free": false,
  "item_condition": "like_new",
  "status": "available",
  "pickup_location": "ศาลาพระเกี้ยว",
  "images": [
    { "image_id": "uuid", "image_url": "https://…", "is_primary": true },
    { "image_id": "uuid", "image_url": "https://…", "is_primary": false }
  ],
  "category": { "category_id": "uuid", "name": "Textbooks" },
  "seller": {
    "user_id": "uuid",
    "full_name": "กันตภณ ช.",
    "faculty": "คณะวิศวกรรมศาสตร์",
    "created_at": "…",
    "active_listings": 4
  },
  "is_wishlisted": false,
  "is_owner": false,
  "created_at": "…"
}
```
- `images`: the primary image first. There is no position column, so the order of the rest is not guaranteed. That is a known limit; do not add a column.
- `seller.active_listings` = the seller's products with `status` in `ACTIVE_STATUSES` (`available`, `reserved`). This must match `stats.active_listings` in `/auth/me`.
- `is_wishlisted`: `false` when `user` is null, otherwise check `wishlists`.
- `is_owner`: `user?.user_id === seller_id`.

A select that works (verified 24 Oct):
```js
const PRODUCT_SELECT =
  'product_id, seller_id, title, description, price, item_condition, status, pickup_location, created_at,' +
  ' category:categories(category_id, name),' +
  ' seller:users(user_id, full_name, faculty, created_at),' +
  ' images:product_images(image_id, image_url, is_primary)';
```
Strip `seller_id`, `description` and the image list when mapping to a card.

### 7.2 `GET /api/v1/categories`

Public. Returns the 6 seeded categories, ordered by `category_id` ascending (that is the seed order).
`product_count` = the number of products in that category with `status = 'available'`.

```json
{ "data": [ { "category_id": "00000000-0000-4000-8000-000000000001", "name": "Textbooks", "description": "หนังสือเรียน ชีทสรุป และเอกสารประกอบการเรียน", "product_count": 128 } ] }
```
Category UUIDs are fixed (`00000000-0000-4000-8000-00000000000{1..6}`). The frontend relies on that.

### 7.3 `GET /api/v1/pickup-locations`

Public. `{ "data": PICKUP_LOCATIONS }`. Use the constant, never a second copy.

### 7.4 `GET /api/v1/products`

Public, `optionalAuth`. Query parameters:

| param | rule | invalid → |
|---|---|---|
| `page` | integer ≥ 1, default 1 | 422 `VALIDATION_ERROR` field `page` |
| `per_page` | integer ≥ 1, default 20; values above 50 become 50 | 422 if not a positive integer |
| `keyword` | trimmed; ignored if empty; ≤ 100 chars; case-insensitive substring match on `title` **or** `description` (works for Thai) | 422 if too long |
| `category_id` | one or more UUIDs, comma-separated → `in` filter | 422 if any value is not a UUID |
| `min_price`, `max_price` | numbers ≥ 0; `min ≤ max` | 422 |
| `free_only` | `true` / `1` → `price = 0` | — |
| `status` | `available` (default) · `reserved` · `sold` · `all` (no filter) | 422 field `status` |
| `pickup_location` | must be in `PICKUP_LOCATIONS` (exact match) | 422 `INVALID_PICKUP_LOCATION` |
| `item_condition` | `new` · `like_new` · `good` · `fair` | 422 |
| `sort` | `date_desc` (default) · `date_asc` · `price_asc` · `price_desc`; always add `product_id` as a tie-breaker so pages are stable | 422 |

Response: `{ data: [card…], pagination }`. `total_pages = ceil(total / per_page)` (0 when total is 0).

**No results is not an error:** return `200` with `data: []`, the pagination, and
`"message": "ไม่พบสินค้าที่ตรงกับเงื่อนไข ลองปรับตัวกรองหรือคำค้นหา"`. Never 404 for a list.

`is_wishlisted` for a logged-in user: one extra query, `wishlists` where `user_id = user.user_id` and `product_id in (ids on this page)`.

Build the filters in one function (`applyProductFilters(query, filters)`) so the page query and the count query in 10.1 share them.

### 7.5 `GET /api/v1/products/:id`

Public, `optionalAuth`. Returns the detail object for any status (sold items stay viewable).
An invalid UUID or unknown id → `200` with the body `{ "data": [] }`. **Never 404** (decided by wz in the TASK-09 review). The FE tells "found" from "not found" by checking that the body has a `product_id` (found) or an empty `data` array (not found).
**No seller contact information in this response.** The contact endpoint is a separate, out-of-scope endpoint.

### 7.6 Done when

- [ ] 4 routes: `app/api/v1/categories/route.js`, `pickup-locations/route.js`, `products/route.js` (GET), `products/[id]/route.js` (GET)
- [ ] `lib/products.js` with the select, the card/detail mappers, short-name and query parsing; unit tests for short-name and query parsing (bad page, bad UUID, min > max, unknown sort)
- [ ] Bruno requests: categories, pickup-locations, list default, list with filters, list empty result (200 + `[]`), keyword containing `,()%"`, detail, detail with a random UUID (200 + `{ data: [] }`), detail with `not-a-uuid` (200 + `{ data: [] }`). Also assert that the detail response has no `phone_number`, `line_id` or `email` anywhere in `seller`.
- [ ] `npm test`, `npm run build`, `npm run test:api` all pass; PR opened against `main`

## 8. TASK-12 — Create, edit, delete products and upload images

All endpoints use `requireAuth`. For every `:id` route, check in this order:
**invalid UUID or not found → 404 `PRODUCT_NOT_FOUND`**, then **`seller_id !== user.user_id` → 403 `NOT_OWNER`**, then validate the body (422).

### 8.1 `POST /api/v1/products` — create a listing (multipart)

Request: `multipart/form-data`. Parse with `await request.formData()`; if that throws → 400 `INVALID_PAYLOAD`.

| field | rule | invalid → |
|---|---|---|
| `title` | trimmed, 3–255 chars, required | 422 `VALIDATION_ERROR` |
| `description` | optional; empty → `null`; ≤ 2000 chars | 422 |
| `category_id` | required UUID of an existing category | 422 field `category_id` (also map Postgres `23503` to this) |
| `item_condition` | `new` · `like_new` · `good` · `fair` | 422 |
| `price` | required; `Number(value)`, finite, `0 ≤ price ≤ 999999.99`, at most 2 decimals; `0` means free | 422 field `price` |
| `pickup_location` | exactly one of `PICKUP_LOCATIONS` | 422 `INVALID_PICKUP_LOCATION` |
| `images` | file field, sent once per file. Accept both `images` and `images[]` names. Ignore entries with size 0. | see below |

Image rules (check all of them **before** touching the database):
1. 0 files → 422 `NO_IMAGE` · more than 5 → 422 `TOO_MANY_IMAGES`
2. Any file > 2 MB (2 × 1024 × 1024 bytes) → 413 `FILE_TOO_LARGE` (`"ไฟล์รูปต้องมีขนาดไม่เกิน 2MB ต่อรูป"`)
3. All files together > 4 MB → 413 `FILE_TOO_LARGE` (`"รูปทั้งหมดรวมกันต้องไม่เกิน 4MB"`). Vercel rejects request bodies over 4.5 MB on every plan, and the frontend is responsible for resizing images.
4. **Detect the type from the first bytes, not from the name or `file.type`:** JPEG starts `FF D8 FF`, PNG starts `89 50 4E 47 0D 0A 1A 0A`. Anything else → 422 `UNSUPPORTED_FILE_TYPE`. Use the detected type for `contentType` and the extension (`jpg` / `png`).
5. **The first image (index 0) is the primary** (`is_primary = true`), per the 29/09 brief. There is no `primary_image_index` field.

Processing order (this follows the team's UC-02 sequence diagram):
1. `INSERT` into `products` with `seller_id = user.user_id` and `status = 'available'`, selecting `product_id`.
2. For each image: `image_id = crypto.randomUUID()`, `path = \`${product_id}/${image_id}.${ext}\``,
   `db().storage.from(PRODUCT_IMAGES_BUCKET).upload(path, Buffer.from(await file.arrayBuffer()), { contentType, upsert: false })`,
   then `image_url = db().storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl`.
3. Insert all `product_images` rows in **one** insert call (`image_id`, `product_id`, `image_url`, `is_primary`).
4. **If anything in steps 2–3 fails:** remove every file already uploaded (`.remove(paths)`, log but ignore errors there), delete the product row (its image rows go with it via cascade), then rethrow. Supabase has no transaction across the database and Storage, so this cleanup is the only thing that prevents orphan files.

Response: **201**, the detail object (section 7.1) plus `"message": "ลงประกาศสำเร็จ"`.

### 8.2 `PATCH /api/v1/products/:id` — edit a listing (JSON)

Owner only. Body is JSON (`readJson`). Editable fields: `title`, `description`, `category_id`, `item_condition`, `price`, `pickup_location`, with the same rules as 8.1.
Ignore any other field, including `status` and `seller_id`. Images cannot be edited; the seller deletes the listing and posts again.
Empty patch → return the current detail unchanged. Response: **200**, the detail object.

### 8.3 `PATCH /api/v1/products/:id/status`

Owner only. Body `{ "status": "reserved" }`. The value must be in `PRODUCT_STATUSES`, otherwise 422 `INVALID_STATUS`
with message `"สถานะต้องเป็น Available, Reserved หรือ Sold เท่านั้น"` and field `status`. Any transition between the three is allowed.

```json
{ "product_id": "uuid", "status": "reserved", "message": "อัปเดตสถานะเป็น Reserved แล้ว" }
```

### 8.4 `DELETE /api/v1/products/:id`

Owner only. Steps:
1. Delete the `products` row. `product_images` and `wishlists` rows go with it via cascade. `reports.product_id` becomes `NULL` and the reports stay (that is intended).
2. **After** the delete succeeds, remove the files: `list(product_id)` in the bucket, then `remove(names.map(n => \`${product_id}/${n}\`))`.
   List the folder rather than reading `product_images`, because those rows are already gone at this point.
3. If removing files fails, `console.error` it and still respond **204**. The database is correct; a leftover file can be cleaned up later.

Response: **204** with no body (`noContent()`).

### 8.5 Done when

- [ ] Routes: `products/route.js` (POST alongside the TASK-09 GET), `products/[id]/route.js` (PATCH and DELETE alongside the GET), `products/[id]/status/route.js` (PATCH)
- [ ] Image checks are a pure function in `lib/` with unit tests (byte sniffing, 2 MB, 4 MB total, 0 files, 6 files)
- [ ] Bruno: create (201) with `bruno/fixtures/` images, `NO_IMAGE`, a fake `.jpg` that is really text (`UNSUPPORTED_FILE_TYPE`), `INVALID_PICKUP_LOCATION`, edit (200), status change (200), `INVALID_STATUS`, a **second user** trying to edit and delete (403 `NOT_OWNER`), delete (204), detail after delete (200 + `{ data: [] }`)
- [ ] After a Bruno run, the bucket has no folder left for the deleted product (check it in the Supabase dashboard, or by listing it with a short script)
- [ ] `npm test`, `npm run build`, `npm run test:api` all pass; PR opened against `main`

## 9. Testing

### 9.1 Unit tests

`node:test` + `node:assert/strict`, files named `test/<area>.test.js`. Test pure functions only. Anything that imports `lib/supabase.js` cannot run under `node --test`, because `server-only` throws outside Next.js.

### 9.2 Bruno

- Continue numbering at `14-…`. Existing request 02 registers a user and saves `{{email}}`; 09 logs in and saves `{{token}}`. Requests that run after 09 can use `auth: bearer` with `{{token}}`.
- For the `NOT_OWNER` cases, register and log in a second user in pre-request or post-response scripts (save it as `token2`), with an email that also starts `bruno.` and ends `@student.chula.ac.th`.
- Save the created product's id with `bru.setVar("product_id", res.getBody().product_id)`.
- Multipart syntax (verified against Bruno's parser):

```
post {
  url: {{baseUrl}}/products
  body: multipartForm
  auth: bearer
}

auth:bearer {
  token: {{token}}
}

body:multipart-form {
  title: CALCULUS I (2110101)
  category_id: 00000000-0000-4000-8000-000000000001
  item_condition: like_new
  price: 250
  pickup_location: ศาลาพระเกี้ยว
  images: @file(fixtures/book.jpg)
  images: @file(fixtures/book2.png)
}
```
- Keep fixtures small (< 200 KB each). Test the 2 MB and 4 MB limits in unit tests, not with large files in git.

### 9.3 Cleanup of the shared database

End the collection with the DELETE request, which also removes the Storage files.
Then the human runs this in the Supabase SQL Editor (also in the README):
```sql
delete from public.users where email like 'bruno.%@student.chula.ac.th';
```
Deleting users cascades to their products, but **not** to Storage files, so always delete products through the API first.

## 10. Verified Supabase behaviour (tested 24 Oct 2026 on this project)

1. **Paging past the end errors.** `.range(from, to)` with `from` beyond the last row returns error `PGRST103` ("Requested range not satisfiable") and `count: null`.
   Catch `PGRST103`, return `data: []`, and get `total` from a second query with `{ count: 'exact', head: true }` and the same filters.
2. **A raw keyword in `.or()` breaks the query.** `title.ilike.%a,b(c)%` fails with `PGRST100`. Quote and escape the value; this version was verified with `a,b(c)`, `x"y`, `50%_off` and Thai text:
   ```js
   // literal % _ \ for ILIKE, then PostgREST double-quote escaping
   function ilikeContains(keyword) {
     const like = keyword.replace(/[\\%_]/g, (c) => '\\' + c);
     return `"%${like.replace(/["\\]/g, (c) => '\\' + c)}%"`;
   }
   query.or(`title.ilike.${ilikeContains(kw)},description.ilike.${ilikeContains(kw)}`);
   ```
   The table was empty when this was tested, so confirm with real data that a search for `50%` matches the text `50%` and does not match everything.
3. **An invalid UUID gives Postgres `22P02`**, which would become a 500. Validate `:id` and `category_id` with a UUID regex first and answer yourself (`GET /products/:id` → 200 + `{ data: [] }`, `category_id` → 422).
4. **The embedded select in 7.1 works** (`categories`, `users` via `seller_id`, `product_images`).
5. **Listing a folder that doesn't exist** in the bucket returns `[]` without an error.
6. `count: 'exact'` together with `.range()` gives the filtered total in one query.

## 11. Out of scope — do not build unless @wz asks

`GET /me/products`, `GET /products/:id/contact`, wishlist endpoints, reports, admin endpoints, rate limiting, any frontend page, and changes to auth.
