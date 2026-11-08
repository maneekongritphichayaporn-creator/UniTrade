# Software Requirements Specification (SRS)

## UniTrade — Campus Marketplace Platform

| Document control | Value |
|---|---|
| Document version | 2.2 |
| Status | Expanded baseline for team review; historical tasks 01–05 confirmed complete by the project owner |
| Date | 8 November 2026 |
| Product | UniTrade |
| Project team | VISIT CMU |
| Requirements basis | Source SRS v2.0; API Specification v2.2; team confirmation for TASK-01–05; repository implementation reviewed on 8 November 2026 |

> This revision keeps the product intent of the supplied SRS, aligns requirements with the current API and repository, and distinguishes requirements from implementation status. TASK-01–05 are recorded as complete based on the project owner’s confirmation; their source artifacts are not present in this repository. This document is organized in the style of IEEE 830 / ISO/IEC/IEEE 29148 SRS documents; it is not a claim of formal certification against either standard. The supplied file is named “SRS Document v1.0” but its contents identify it as version 2.0. This document resolves that version ambiguity by using version 2.2.

## Revision history

| Version | Date | Change |
|---|---|---|
| 2.0 | 27 September 2026 | Source SRS supplied by the project team. |
| 2.1 | 8 November 2026 | Consolidated requirements, clarified interfaces and constraints, aligned runtime and API requirements, and added traceability to current delivery status. |
| 2.2 | 8 November 2026 | Expanded report-aligned SRS sections, added stakeholder/priority/acceptance and data dictionary material, recorded TASK-01–05 as complete based on team confirmation, mapped US-01–US-06 to requirements and current evidence, linked the original schedule to the Kanban/task tracker, and updated the Sprint 4 window to include the 17 November presentation. |

## Contents

1. [Introduction](#1-introduction)
2. [Overall description](#2-overall-description)
3. [System features and functional requirements](#3-system-features-and-functional-requirements)
4. [External interface requirements](#4-external-interface-requirements)
5. [Data requirements](#5-data-requirements)
6. [Non-functional requirements](#6-non-functional-requirements)
7. [Business rules and constraints](#7-business-rules-and-constraints)
8. [Verification and acceptance](#8-verification-and-acceptance)
9. [Requirements traceability and delivery status](#9-requirements-traceability-and-delivery-status)
10. [Open decisions](#10-open-decisions)
11. [Appendices](#11-appendices)
12. [Project planning and source artifacts](#12-project-planning-and-source-artifacts)

## 1. Introduction

### 1.1 Purpose

This SRS defines the functional and non-functional requirements for UniTrade, a web-based marketplace for students and personnel of Chulalongkorn University. It is intended for the project team, reviewers, testers, and maintainers as a shared basis for implementation, verification, and change control.

Requirements use the word **shall** for mandatory behavior. A requirement marked **TBD** is unresolved and must be agreed before the related feature is treated as complete. Implementation status is reported separately in Section 9; a requirement remains in scope even when its implementation is pending.

Each requirement is assigned a stable identifier and should be verified by inspection, analysis, demonstration, or test. Identifiers FR-01 through FR-08 preserve the numbering in the original SRS/API discussions (including FR-06 contact, FR-07 Wishlist, and FR-08 report/moderation). FR-09 and FR-10 identify profile and cross-cutting UI requirements made explicit in this consolidated revision. Priorities use MoSCoW: **Must** (required for the agreed product baseline), **Should** (important but may be deferred with approval), and **Could** (desirable). If no priority is stated, it is Must for the stated scope. Acceptance or sign-off is not implied by repository presence.

### 1.2 Product scope

UniTrade enables eligible university users to publish and discover second-hand items or items offered for free, coordinate an on-campus handover using seller-provided contact details, save products of interest, and report inappropriate listings. Administrators review reports and take moderation actions.

The product is a marketplace and coordination tool. UniTrade does not process a purchase, guarantee a transaction, or arrange the physical handover.

### 1.3 Objectives

- Provide an organized catalog that users can search, filter, sort, and browse.
- Restrict account registration to the approved Chulalongkorn email domains.
- Let members create and manage their own product listings.
- Support campus pickup by displaying a configured pickup location and, when authorized, the seller’s contact channels.
- Provide reporting and administrator moderation for inappropriate listings.
- Encourage reuse of goods within the university community.

### 1.4 Scope

**In scope**

- Public product catalog, product details, categories, pickup locations, search and filtering.
- Member registration, login, profile retrieval and profile updates.
- Product creation with images, editing, status changes, and owner-initiated deletion.
- Wishlist management for signed-in members.
- Member reporting and administrator report review, dismissal, and listing removal.
- Seller contact disclosure to an authenticated member through an approved contact flow.
- Web UI and API delivered as one Next.js application.

**Out of scope**

- Online payments, escrow, refunds, and payment-provider integration.
- Shipping, parcel tracking, and delivery logistics.
- In-app live chat or messaging.
- University identity-provider integration or verification beyond the approved email-domain rule, unless separately approved.
- Native mobile applications.
- Guaranteeing the quality, ownership, legality, price, or successful handover of a listed item.

### 1.5 References

1. Supplied source document, *SRS Document v1.0 (UniTrade).docx* (document contents identify version 2.0, dated 27 September 2026).
2. UniTrade API Specification v2.2 (project contract for API behavior).
3. Repository guidance: [`AGENTS.md`](../AGENTS.md).
4. Project overview and delivery notes: [`README.md`](../README.md).
5. Product read requirements and delivery notes: [`TASK-09-CHANGELOG.md`](TASK-09-CHANGELOG.md).
6. Product CRUD requirements and delivery notes: [`TASK-12-CHANGELOG.md`](TASK-12-CHANGELOG.md).
7. Search and filter delivery notes: [`TASK-15-CHANGELOG.md`](TASK-15-CHANGELOG.md).
8. Report and moderation delivery notes: [`TASK-19-CHANGELOG.md`](TASK-19-CHANGELOG.md).
9. Frontend requirements and delivery notes: [`TASK-07-10-16-18-CHANGELOG.md`](TASK-07-10-16-18-CHANGELOG.md).
10. System context: [`CONTEXT-DIAGRAM.md`](CONTEXT-DIAGRAM.md).
11. Project plan, approved Figma screens, original ERD/sequence/data dictionary, and API Specification v2.2: **completed under TASK-01–05 according to project-owner confirmation on 8 November 2026; source files/links were not available in the repository at the time this revision was prepared.**

If this SRS conflicts with API Specification v2.2 for an endpoint, the API specification is the contract until the project owner approves a change.

### 1.6 Definitions and abbreviations

| Term | Definition |
|---|---|
| Admin | A user whose persisted role grants access to moderation functions. |
| Available / Reserved / Sold | Product listing states. |
| CU | Chulalongkorn University. |
| Guest | A person using public browsing without an authenticated account. |
| Member | An authenticated CU student or staff user. A member can act as buyer, seller, or both. |
| Listing / Product | A second-hand or free item and its associated description, category, images, and status. |
| On-campus pickup | Handover arranged by users at a configured location within the university. |
| SRS | Software Requirements Specification. |
| JWT | JSON Web Token used by the application for authenticated API requests. |
| RBAC | Role-based access control. |
| Shall | A mandatory requirement. |
| TBD | A decision or detail requiring confirmation. |

### 1.7 Stakeholders

| Stakeholder | Interest / responsibility |
|---|---|
| Students and university staff | Browse, search, buy/sell or hand over goods, and contact one another. |
| Sellers | Publish accurate listings and maintain contact and listing status. |
| Buyers / guests | Discover products and understand their status and pickup location before contacting a seller. |
| System administrators | Review reports and moderate listings with an auditable record. |
| Project manager / business analyst | Control scope, coordinate the plan, and maintain requirements. |
| System analyst / UI designer | Maintain system analysis, data/process diagrams, and UI design. |
| Backend lead/developers | Maintain API contracts, authorization, database, storage, and server-side behavior. |
| Frontend lead/developers | Implement navigation, screens, client-side API integration, and interaction behavior. |
| QA / technical writer | Define test cases, report verification results, and maintain report quality. |
| University / project course | Intended community and academic context; no external approval is assumed. |

### 1.8 Requirement priority and change control

Requirements are grouped by feature and MUST be implemented only according to the agreed scope and approved API contract. A requirement change that alters an existing endpoint response, database schema, privacy behavior, role permission, or user-visible workflow requires review by the responsible project lead and updates to affected diagrams, tests, and documentation. TASK ownership is summarized in Sections 9 and 12.

### 1.9 Document approval

| Review role | Reviewer | Decision / date |
|---|---|---|
| Project owner / PM | [TBD: name] | [TBD: approve / revise, date] |
| Backend lead | [TBD: name] | [TBD: approve / revise, date] |
| Frontend lead | [TBD: name] | [TBD: approve / revise, date] |
| QA / technical writer | [TBD: name] | [TBD: approve / revise, date] |

## 2. Overall description

### 2.1 Product perspective

UniTrade is a web application built with Next.js 15 App Router. Its frontend and API are part of the same application. Server-side API routes access Supabase PostgreSQL and Supabase Storage; the browser does not connect directly to Supabase.

The system context and external data flows are documented in [`CONTEXT-DIAGRAM.md`](CONTEXT-DIAGRAM.md). The principal external parties are members, administrators, and the Supabase service.

### 2.2 Product functions

At a high level, the product shall provide:

1. Public catalog browsing and product search.
2. Account registration, login, and profile management.
3. Listing creation and owner-controlled listing management.
4. Wishlist and seller-contact features for authenticated members.
5. Product reporting and administrator moderation.
6. Consistent validation, authorization, error responses, and privacy protections.

### 2.3 User classes and characteristics

| User class | Description | Principal permissions |
|---|---|---|
| Guest | Any visitor, not signed in. | Browse categories, pickup locations, product lists, and product details; search and filter. |
| Member | Registered user with an approved CU email address. | Guest permissions plus profile management, listing management for own listings, wishlist, reporting, and authorized seller-contact requests. |
| Seller | A member who has created one or more listings. | Manage only listings owned by that member; provide contact details through the profile. |
| Administrator | A member whose account has the administrator role. | Review reports, dismiss reports, remove listings under moderation rules, and create moderation records. |

Buyer and seller are business roles of the same member account; they are not separate account types.

### 2.4 Operating environment

- **Application:** Next.js 15 App Router, JavaScript ESM.
- **Runtime:** Node.js 22 or later.
- **Database and object storage:** Supabase PostgreSQL and Supabase Storage.
- **Hosting target:** Vercel.
- **Client:** Current supported desktop and mobile web browsers, including Chrome and Safari.
- **Network:** HTTPS connectivity is required for production use.
- **Development and version control:** Node.js, npm, and Git.

### 2.5 User needs and elicitation summary

The source SRS records interviews with 6 students and 4 university staff, and review of existing social-media trading practices. The reported needs include:

- Better organization and search than an unstructured social-media feed.
- More confidence that other users belong to the CU community.
- Clear product status, condition, price, category, and pickup location.
- A way to contact a seller using a channel the seller has provided.
- A way to report inappropriate listings.

This summary reflects the supplied SRS; raw interview records and detailed survey results were not included in the repository reviewed for this revision.

### 2.6 Constraints

- Product handover is arranged directly by users and is limited to on-campus pickup locations offered by the application.
- Public product responses shall not disclose seller email, phone number, LINE ID, or password data.
- Database access uses server-side service credentials that bypass row-level security; API route authorization is therefore mandatory.
- Database schema changes require a new migration and approval by the backend lead.
- User-facing error messages shall be in Thai.
- Image upload is subject to the limits in FR-03 and NFR-18.

### 2.7 Assumptions and dependencies

- Users have a modern browser and an internet connection.
- Members provide accurate profile and contact information.
- Supabase and the hosting platform are available for the application’s operation.
- Administrators are assigned through an approved, server-controlled role process; self-service role elevation is not allowed.
- The project will maintain the authoritative lists of faculties, categories, product conditions, report reasons, statuses, and pickup locations.
- The API Specification v2.2 remains the contract for API endpoints unless formally revised.

### 2.8 Project lifecycle and release scope

The project is organized into sprint-based tasks. Planning, UI/UX, system design, database setup, and API specification (TASK-01–05) are confirmed complete by the project owner. Implementation work is delivered by later tasks and can be complete, partial, or pending independently of the planning deliverables. Deployment preparation is not equivalent to a production release; production URL and release evidence require separate confirmation.

## 3. System features and functional requirements

### 3.1 Account registration

**FR-01 — Register a member**

1. The system shall accept registration only for email addresses ending in `@student.chula.ac.th` or `@chula.ac.th`, using a case-insensitive comparison.
2. The system shall normalize the email address before storing or comparing it.
3. The system shall require a password of at least 8 characters that contains at least one letter and one digit. The password shall not exceed the supported bcrypt input size of 72 UTF-8 bytes.
4. The system shall require a full name of 2–255 characters after trimming and whitespace normalization.
5. The system shall require at least one contact channel: a valid phone number or a valid LINE ID.
6. The system shall require a valid faculty selection, or “Other” with a description of 2–100 characters.
7. The system shall hash passwords using bcrypt and shall never store or return a plaintext password.
8. The system shall reject a duplicate email address and return a stable application error.
9. The system shall return a success response and the created member profile without exposing password data.

### 3.2 Authentication and session

**FR-02 — Sign in and authenticate requests**

1. The system shall authenticate a member using the registered email and password.
2. On successful sign-in, the system shall issue an HS256 JWT with a 24-hour lifetime.
3. The client shall send the token as a bearer token on authenticated API requests.
4. The system shall reject missing, invalid, or expired tokens with the corresponding authentication error.
5. The system shall not issue a refresh token. Signing out shall remove the client-side token.
6. The system shall not return the signing secret or password hash to a client.

### 3.3 Member profile

**FR-09 — Retrieve and update profile**

1. The system shall allow an authenticated member to retrieve their own profile.
2. The system shall allow a member to update full name, phone number, LINE ID, and faculty, subject to registration validation rules.
3. The system shall require at least one contact channel to remain available after a profile update.
4. The system shall not allow a member to change their email address or role through the profile update operation.
5. The system shall return only explicitly approved profile fields and shall never return the password hash.

### 3.4 Public catalog and product details

**FR-05 — Browse categories, pickup locations, and products**

1. The system shall provide public endpoints for categories and pickup locations.
2. The system shall return the six configured categories in seed order and include the count of available products for each category.
3. The system shall provide a public, paginated product list. The default status filter shall be `available`.
4. The product list shall return product cards containing the product identifier, title, numeric price, computed free indicator, condition, status, pickup location, primary image URL, category, public seller name and faculty, wishlist indicator, and creation time.
5. When no products match, the system shall return a successful response with an empty data array and pagination information, not a not-found error.
6. The system shall provide public product details for products in any status, including reserved and sold products.
7. An unknown or malformed product identifier in the public detail request shall return HTTP 200 with `{ "data": [] }`, not disclose whether an inaccessible record exists.
8. Public product list and detail responses shall not contain seller email, phone number, LINE ID, password hash, or other private contact data.
9. The public seller name shall be shortened according to the agreed Thai-name mapping rule. A single-word name shall remain unchanged.

### 3.5 Search, filter, sorting, and pagination

**FR-05 — Find products (continued)**

1. The system shall search the title and description using a case-insensitive substring match.
2. The system shall support one or more category identifiers, a minimum and maximum price, free-only filtering, product status, pickup location, and item condition.
3. The system shall support sorting by creation date ascending or descending and price ascending or descending.
4. The system shall use a stable product-identifier tie-breaker when sorting so that paged results are deterministic.
5. The system shall default to page 1 and 20 items per page; it shall cap page size at 50.
6. The system shall reject malformed page values, non-numeric or negative prices, minimum prices greater than maximum prices, invalid category identifiers, invalid statuses, unsupported sort values, invalid conditions, and unknown pickup locations with a validation response.
7. The system shall treat free-only values `true` and `1` as a request for price zero.
8. The system shall treat an empty trimmed keyword as no keyword filter and reject keywords longer than 100 characters.
9. The system shall preserve literal keyword characters such as commas, parentheses, percent signs, underscores, and quotes when applying search filters.

### 3.6 Listing creation and image upload

**FR-03 — Create a product listing**

1. The system shall require an authenticated member to create a listing.
2. The system shall require a title of 3–255 characters, a valid existing category, a supported item condition, a valid price, and one configured pickup location.
3. The description shall be optional, normalized to null when empty, and limited to 2,000 characters.
4. The price shall be a finite number from 0 through 999,999.99 inclusive, with no more than two decimal places. A price of zero shall represent a free item.
5. The system shall require 1–5 non-empty image files.
6. The system shall verify image content from file bytes and accept JPEG or PNG only; file name and declared MIME type alone shall not determine the accepted type.
7. Each image shall be no larger than 2 MiB, and all images in one listing shall total no more than 4 MiB.
8. The first uploaded image shall be marked primary.
9. The system shall create a new listing with status `available` and associate it with the authenticated member.
10. If an image upload or image-record operation fails, the system shall attempt to remove uploaded files and the newly created listing before returning an error.
11. The system shall return the created product detail and a success message.

### 3.7 Listing management

**FR-04 — Edit, change status, and delete an owned listing**

1. The system shall allow a member to edit only a listing they own.
2. Editable fields shall be title, description, category, item condition, price, and pickup location. Each field shall use the same validation rules as listing creation.
3. An edit request shall ignore non-editable fields such as seller identifier and status. An empty edit request shall leave the listing unchanged.
4. Listing images shall not be editable through the product edit operation.
5. The system shall allow the owner to set the product status to `available`, `reserved`, or `sold`; all transitions among these statuses are allowed.
6. The system shall allow the owner to delete their listing.
7. For owner-only write operations, the system shall validate the product identifier and confirm the product exists before checking ownership and validating the request body.
8. A non-owner shall not be able to edit, change the status of, or delete another member’s listing.
9. On listing deletion, associated image and wishlist records shall be removed according to database relationships, and stored image files shall be removed after the database deletion succeeds.
10. If storage cleanup fails after a successful deletion, the system shall log the failure without falsely reporting that the database deletion failed.

### 3.8 Wishlist

**FR-07 — Save and manage products of interest**

1. The system shall require authentication to add, remove, or view a member’s wishlist.
2. The system shall associate each saved product with the requesting member and shall prevent one member from reading or changing another member’s wishlist.
3. A member shall be able to add a product, remove a product, and retrieve their saved products.
4. Product cards returned to an authenticated member shall indicate whether each product on the current page is in that member’s wishlist.
5. Deleting a product shall remove its wishlist associations.
6. Exact wishlist endpoint paths, request/response schemas, duplicate-action behavior, and whether a member may save their own listing require approval in the API specification before implementation.

### 3.9 Seller contact

**FR-06 — Request seller contact information**

1. Public browsing shall not reveal a seller’s phone number or LINE ID.
2. The system shall require an authenticated member before disclosing seller contact channels.
3. The system shall return only contact channels that the seller has supplied, along with the product’s pickup location and any approved safety notice.
4. The system shall not provide in-app messaging; members contact one another through the returned phone or LINE channel.
5. The contact API path, response schema, seller-self-contact behavior, and product-status eligibility require approval by the backend lead and incorporation into the API specification before this requirement is considered implementation-ready.

### 3.10 Product reports

**FR-08 — Report an inappropriate listing**

1. The system shall require an authenticated member to submit a report.
2. The report shall reference an existing product and one reason from the configured report-reason list.
3. A member shall not be allowed to report their own listing.
4. The system shall prevent duplicate reports by the same member for the same product according to the API contract.
5. The system shall record the report as pending and return a confirmation without exposing internal database errors.
6. The exact reason catalog shall be maintained centrally and match the database/API specification.

### 3.11 Administrator moderation

**FR-08 — Administrator moderation (continued)**

1. The system shall require a valid authenticated administrator role for every admin operation. The role shall be verified server-side and shall not be trusted solely from client input.
2. The system shall allow an administrator to list reports, defaulting to pending reports, and filter by supported report status.
3. The report list shall support pagination with a default of 20 and a maximum of 50 records per page.
4. The system shall return report reason, status, creation time, reporter summary, and related product/seller summary when available, without exposing private contact or credential fields.
5. The system shall allow an administrator to dismiss a report without deleting the product.
6. The system shall allow an administrator to delete a listing under moderation rules. The operation shall preserve report records as specified and shall write a moderation audit record.
7. Moderation actions shall record the acting administrator, action, affected identifiers, and timestamp according to the approved data model.
8. The system shall return an authorization error for a non-admin and a not-found error for an unknown moderation target, without exposing Supabase error details.

### 3.12 Frontend behavior and user feedback

**FR-10 — Provide the web user interface**

1. The user interface shall use Thai for user-facing labels, messages, and validation feedback.
2. The interface shall provide public home/search and product-detail pages, and signed-in flows for authentication, profile, listing management, wishlist, contact, and reporting according to their release status.
3. The interface shall display loading, empty, not-found, and error states where applicable.
4. Form validation feedback shall identify the relevant field when the API provides a field identifier.
5. After an unauthorized response caused by an invalid or expired session, the client shall clear the local session and provide a path to sign in again.
6. UI features shall call the API through the shared client request layer and shall not connect directly to Supabase.

### 3.13 User stories and acceptance-criteria traceability

The stakeholder-provided user stories and their full acceptance criteria are recorded in [REPORT-SE-UNTRADE.md](REPORT-SE-UNTRADE.md), Section 3.2. The table below maps them to this SRS. “Priority” reflects the supplied user-story list; repository status is implementation evidence only, not formal acceptance.

| Story | User goal | Priority | Related SRS requirements | Current evidence / unresolved acceptance |
|---|---|---|---|---|
| US-01 | Register and sign in with a university email | Must Have | FR-01, FR-02, FR-09 | Auth API, password hashing, and JWT are present; frontend registration/profile is incomplete. Acceptance criterion specifies only `@student.chula.ac.th`, while FR-01 and the current API also accept `@chula.ac.th` for staff. Confirm the intended domain policy. |
| US-02 | Create a product listing with details and images | Must Have | FR-03 | Backend validation, image upload, limits, and default status are present; listing form and image preview are not evidenced in the UI. |
| US-03 | Manage own listings and status | Must Have | FR-04, FR-10 | Owner checks, status API, and status badges exist. Edit/delete controls and confirmation modal are not evidenced; product detail currently does not disable contact for Sold listings. |
| US-04 | Search and filter products | Must Have | FR-05, FR-10 | Search/filter and empty state are implemented. The current Thai empty-state message differs from the exact requested acceptance text and should be confirmed. |
| US-05 | Save favorites and contact sellers | Should Have | FR-06, FR-07, FR-10 | Wishlist API/UI is not implemented. Contact UI/mock exists, but the contact API is absent; the complete acceptance flow is not met. |
| US-06 | Report inappropriate listings and moderate as Admin | Should Have | FR-08, FR-10 | Report/moderation API exists; Admin Dashboard UI is not evidenced. Current report API requires authentication; confirm whether unauthenticated guests are intended to report. |

These are stakeholder acceptance targets, not claims that the criteria have passed. Formal verification results and sign-off are deferred to TASK-21. The detailed criteria and repository evidence notes are maintained in the report to avoid duplicating long acceptance text here.

## 4. External interface requirements

### 4.1 User interface

- The application shall provide a shared page layout with navigation, page content, and footer.
- The home page shall provide category navigation, product cards, search/filter controls, sorting, and pagination.
- A product detail page shall show images, title, price/free status, condition, listing status, pickup location, description, and public seller summary.
- Contact information shall be shown only through the authorized contact flow.
- Signed-in users shall have access to profile and listing controls appropriate to their permissions.
- Administrative controls shall be available only to authenticated administrators.
- Interfaces shall adapt to mobile and desktop viewport widths.

### 4.2 API interface

The API base path is `/api/v1`. Existing endpoint contracts are governed by API Specification v2.2.

| Resource | Method and path | Request | Success result | Access |
|---|---|---|---|---|
| Faculties | `GET /faculties` | None | Faculty list and `allow_other` metadata | Public |
| Registration | `POST /auth/register` | JSON registration fields | `201`, created profile and message | Public |
| Login | `POST /auth/login` | JSON email/password | `200`, bearer token and profile | Public |
| Current profile | `GET /auth/me` | Bearer token | Profile and active-listing statistics | Authenticated |
| Update profile | `PATCH /auth/me` | Bearer token; JSON profile fields | Updated profile | Authenticated |
| Categories | `GET /categories` | None | Category list and available-product counts | Public |
| Pickup locations | `GET /pickup-locations` | None | Configured location list | Public |
| Product collection | `GET /products` | Query: `page`, `per_page`, `keyword`, `category_id`, `min_price`, `max_price`, `free_only`, `status`, `pickup_location`, `item_condition`, `sort` | `200`, cards, pagination; empty matches include `data: []` | Public; optional auth for wishlist flags |
| Create product | `POST /products` | Bearer token; multipart product fields and images | `201`, product detail and message | Authenticated |
| Product detail | `GET /products/:id` | Product UUID | Detail object, or `200` with `{ "data": [] }` when missing/invalid | Public; optional auth |
| Edit product | `PATCH /products/:id` | Bearer token; JSON editable fields | `200`, current product detail | Owner |
| Delete own product | `DELETE /products/:id` | Bearer token | `204`, no body | Owner |
| Change product status | `PATCH /products/:id/status` | Bearer token; `{ "status": "available" \| "reserved" \| "sold" }` | `200`, product ID, status and message | Owner |
| Report product | `POST /products/:id/reports` | Bearer token; `{ "reason": <configured reason> }` | `201`, report result | Authenticated member |
| List reports | `GET /admin/reports` | Bearer token; `status`, `page`, `per_page` | `200`, report list and pagination | Admin |
| Dismiss report | `PATCH /admin/reports/:id` | Bearer token; `{ "status": "dismissed" }` | `200`, operation result | Admin |
| Moderation delete | `DELETE /admin/products/:id` | Bearer token | `204`, report actioning/logging and storage cleanup | Admin |

The table summarizes behavior documented in API Specification v2.2 and repository implementation notes; it is not a replacement for the complete approved API specification. The approved specification file itself is not present in the repository. Wishlist and seller-contact endpoint contracts are not present and shall not be inferred from frontend route names.

### 4.2.1 Shared response and error format

Single-resource success responses are returned as an object. List responses use:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 0,
    "total_pages": 0
  }
}
```

Error responses use:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "ข้อความภาษาไทย",
    "field": "field_name"
  }
}
```

The `field` member is optional and appears when the error is associated with a specific input. Exact error codes and statuses are listed in Appendix A.

### 4.3 API data and error conventions

- Successful single-resource responses shall return the resource object; list responses shall return `data` and pagination information where applicable.
- Errors shall use the common error envelope defined by the API specification. User-facing messages shall be in Thai.
- Expected validation or permission failures shall use the specified application error code and HTTP status.
- Unexpected database or storage errors shall be logged server-side and shall not expose Supabase error text to clients.
- Product prices shall be JSON numbers. Timestamps shall be ISO 8601 values as returned by the database.
- Product list responses with no results shall be successful empty-list responses.

### 4.4 Software and communication interfaces

- Browser-to-application requests shall use HTTPS in deployed environments.
- API requests and responses shall use JSON except product creation, which uses multipart form data.
- The application server shall communicate with Supabase using server-side credentials only.
- Product image files shall be stored in Supabase Storage and served using their public image URLs as permitted by the product-image design.
- External contact actions may use phone or LINE links. UniTrade does not control the availability or behavior of those third-party applications.

### 4.5 Role-based interface permissions

| Interface/action | Guest | Member | Owner of listing | Admin |
|---|---:|---:|---:|---:|
| Read public catalog and product detail | Yes | Yes | Yes | Yes |
| Register/sign in | Yes | N/A | N/A | N/A |
| Read/update own profile | No | Yes | Yes | Yes |
| Create a listing | No | Yes | Yes | Yes |
| Edit/change status/delete a listing | No | No, unless owner | Yes | Moderation delete only |
| Submit product report | No | Yes, subject to report rules | Cannot self-report | Yes as member unless otherwise specified |
| Read/write own wishlist | No | Yes, contract pending | Yes, contract pending | Yes, contract pending |
| Request seller contact | No | Yes, contract pending | Self-contact behavior TBD | Yes, contract pending |
| List/dismiss reports | No | No | No | Yes |

## 5. Data requirements

### 5.1 Data entities

| Entity | Required information and rules |
|---|---|
| User | User identifier, normalized CU email, password hash, full name, faculty, optional phone and LINE ID with at least one contact channel, role, and creation time. |
| Category | Identifier, name, optional description; category values are centrally seeded/configured. |
| Product | Product identifier, seller identifier, title, optional description, category, condition, numeric price, status, pickup location, and creation time. |
| Product image | Image identifier, product identifier, image URL, primary-image flag. One image per listing shall be marked primary when images exist. |
| Wishlist entry | Member identifier and product identifier; uniqueness and deletion behavior shall follow the database/API contract. |
| Report | Report identifier, reporter, product reference, reason, status, and creation time. Reports shall remain auditable when a product is removed. |
| Moderation log | Acting administrator, action, affected report/product/seller identifiers as applicable, and action timestamp. |

### 5.2 Data validation and privacy

- UUID-valued identifiers shall be validated before database operations where malformed values could cause database errors.
- User and product inputs shall satisfy the validation rules in Section 3.
- User queries and API response mappings shall select only required fields; wildcard user selects and embedded `users(*)` are prohibited.
- Password hashes and private contact details shall not appear in public product responses or logs.
- Database schema changes shall be delivered as new migration files and reviewed before application.
- Product deletion shall preserve reports and moderation history as specified by the database contract.

### 5.3 Configured values

The following values shall be centrally maintained and consistently applied by the API and user interface:

- Approved email domains.
- Faculties and the “Other” faculty behavior.
- Product categories.
- Product conditions: `new`, `like_new`, `good`, `fair`.
- Product statuses: `available`, `reserved`, `sold`.
- Report reasons and report statuses.
- Pickup locations.

The exact category and pickup-location labels are defined by the project seed data and shared constants rather than duplicated in independent feature code.

Current configured catalog values in the repository are:

| Category ID | Category |
|---|---|
| `00000000-0000-4000-8000-000000000001` | Textbooks |
| `00000000-0000-4000-8000-000000000002` | Study Equipment |
| `00000000-0000-4000-8000-000000000003` | Apparel |
| `00000000-0000-4000-8000-000000000004` | Dorm Essentials |
| `00000000-0000-4000-8000-000000000005` | IT & Gadgets |
| `00000000-0000-4000-8000-000000000006` | Other |

Configured pickup locations are:

1. ศาลาพระเกี้ยว
2. อินทนิน ตึกมหามกุฎ
3. โรงอาหารจุลจักร ชั้น 2 (Smo Cafe)
4. หอสมุดกลาง
5. ใต้ตึกคณะวิศวกรรมศาสตร์
6. ใต้ตึกคณะวิทยาศาสตร์
7. ใต้ตึกคณะนิเทศศาสตร์
8. หอพักนิสิตจุฬาฯ (U-Center)
9. MRT สามย่าน ทางออก 2

Configured report reasons are `scam`, `prohibited_item`, `spam`, `wrong_category`, `offensive_content`, `already_sold`, and `other`. Report statuses are `pending`, `actioned`, and `dismissed`.

### 5.4 Data dictionary

The following dictionary reflects migrations `0001_init.sql` and `0005_moderation_logs.sql`. `PK` means primary key, `FK` foreign key, and `UK` unique key. Nullable behavior and delete actions are noted where defined. Database types are PostgreSQL types.

| Table | Field | Type | Null/default | Key / rule |
|---|---|---|---|---|
| `users` | `user_id` | `uuid` | NOT NULL / `gen_random_uuid()` | PK |
| `users` | `email` | `citext` | NOT NULL | UK; CU email check |
| `users` | `password_hash` | `text` | NOT NULL | Must match bcrypt hash format |
| `users` | `full_name` | `text` | NOT NULL | 2–255 characters |
| `users` | `phone_number` | `text` | NULL | Supported Thai phone format |
| `users` | `line_id` | `text` | NULL | 2–100 allowed characters |
| `users` | `faculty` | `text` | NOT NULL | 2–100 characters |
| `users` | `role` | `user_role` | NOT NULL / `member` | `member` or `admin` |
| `users` | `created_at` | `timestamptz` | NOT NULL / `now()` | — |
| `categories` | `category_id` | `uuid` | NOT NULL / `gen_random_uuid()` | PK; seeded IDs are fixed |
| `categories` | `name` | `text` | NOT NULL | UK |
| `categories` | `description` | `text` | NULL | — |
| `products` | `product_id` | `uuid` | NOT NULL / `gen_random_uuid()` | PK |
| `products` | `seller_id` | `uuid` | NOT NULL | FK → `users.user_id`, ON DELETE CASCADE |
| `products` | `category_id` | `uuid` | NOT NULL | FK → `categories.category_id` |
| `products` | `title` | `text` | NOT NULL | 3–255 characters |
| `products` | `description` | `text` | NULL | Maximum 2,000 characters |
| `products` | `price` | `numeric(10,2)` | NOT NULL / `0` | 0–999,999.99; zero means free |
| `products` | `item_condition` | `product_condition` | NOT NULL | `new`, `like_new`, `good`, `fair` |
| `products` | `status` | `product_status` | NOT NULL / `available` | `available`, `reserved`, `sold` |
| `products` | `pickup_location` | `text` | NOT NULL | API requires an exact configured value |
| `products` | `created_at` | `timestamptz` | NOT NULL / `now()` | — |
| `product_images` | `image_id` | `uuid` | NOT NULL / `gen_random_uuid()` | PK |
| `product_images` | `product_id` | `uuid` | NOT NULL | FK → `products.product_id`, ON DELETE CASCADE |
| `product_images` | `image_url` | `text` | NOT NULL | Public image URL |
| `product_images` | `is_primary` | `boolean` | NOT NULL / `false` | Partial unique index: at most one primary per product |
| `wishlists` | `wishlist_id` | `uuid` | NOT NULL / `gen_random_uuid()` | PK |
| `wishlists` | `user_id` | `uuid` | NOT NULL | FK → `users.user_id`, ON DELETE CASCADE |
| `wishlists` | `product_id` | `uuid` | NOT NULL | FK → `products.product_id`, ON DELETE CASCADE |
| `wishlists` | `created_at` | `timestamptz` | NOT NULL / `now()` | — |
| `wishlists` | `(user_id, product_id)` | — | — | UK; prevents duplicate saved product |
| `reports` | `report_id` | `uuid` | NOT NULL / `gen_random_uuid()` | PK |
| `reports` | `reporter_id` | `uuid` | NOT NULL | FK → `users.user_id`, ON DELETE CASCADE |
| `reports` | `product_id` | `uuid` | NULL after product deletion | FK → `products.product_id`, ON DELETE SET NULL |
| `reports` | `reason` | `report_reason` | NOT NULL | One of seven configured reasons |
| `reports` | `status` | `report_status` | NOT NULL / `pending` | `pending`, `actioned`, `dismissed` |
| `reports` | `created_at` | `timestamptz` | NOT NULL / `now()` | — |
| `reports` | `(product_id, reporter_id)` | — | — | UK; prevents duplicate report |
| `moderation_logs` | `log_id` | `uuid` | NOT NULL / `gen_random_uuid()` | PK |
| `moderation_logs` | `admin_id` | `uuid` | NULL | FK → `users.user_id`, ON DELETE SET NULL |
| `moderation_logs` | `action` | `moderation_action` | NOT NULL | `delete_product` or `dismiss_report` |
| `moderation_logs` | `product_id` | `uuid` | NULL | Snapshot; intentionally no FK |
| `moderation_logs` | `product_title` | `text` | NULL | Snapshot |
| `moderation_logs` | `seller_id` | `uuid` | NULL | Snapshot; intentionally no FK |
| `moderation_logs` | `report_id` | `uuid` | NULL | FK → `reports.report_id`, ON DELETE SET NULL |
| `moderation_logs` | `reports_actioned` | `integer` | NULL | Must be non-negative when present |
| `moderation_logs` | `created_at` | `timestamptz` | NOT NULL / `now()` | — |

### 5.5 Data lifecycle and retention

| Data | Current behavior evidenced in schema | Retention duration / policy |
|---|---|---|
| User | Product and report relationships use cascade for user deletion; moderation admin reference becomes null. | [TBD: account deletion and retention policy] |
| Product | Owner/admin hard delete; images and wishlist rows cascade; reports remain with `product_id = NULL`. | [TBD: archival policy] |
| Image object | API removes files after product deletion; user deletion outside the API may leave storage objects. | [TBD: orphan-object audit/retention] |
| Report | Persists after product delete; reporter deletion cascades reports. | [TBD: legal/audit retention duration] |
| Moderation log | Persists; admin deletion sets `admin_id` null; product metadata is stored as a snapshot. | [TBD: retention duration] |

## 6. Non-functional requirements

### 6.1 Security

**NFR-01.** All protected API routes shall enforce authentication and authorization on the server.  
**NFR-02.** Administrator privileges shall be checked from server-controlled user data for every admin operation.  
**NFR-03.** Passwords shall be stored using bcrypt hashes and never as plaintext.  
**NFR-04.** JWTs shall use HS256, expire after 24 hours, and be signed with a server-only secret.  
**NFR-05.** Production browser/API communication shall use HTTPS. The hosting platform’s supported secure TLS configuration shall be used; a specific TLS minor version is subject to hosting-platform verification.  
**NFR-06.** The Supabase service-role key and JWT secret shall never be exposed to browser code, committed to source control, or included in client responses.  
**NFR-07.** Public endpoints shall not disclose email, phone number, LINE ID, password hashes, or other non-public account data.  
**NFR-08.** Unexpected infrastructure errors shall not be returned verbatim to clients.  
**NFR-09.** User input used in database filters shall be validated and escaped/parameterized using the approved data-access patterns.

### 6.2 Performance and capacity

The supplied source SRS proposes the following targets. They are retained as **provisional acceptance targets** because the original document does not define the hardware, network, cache state, percentile, or measurement method. The team shall confirm those conditions before using them as release gates.

| ID | Provisional target | Measurement conditions requiring agreement |
|---|---|---|
| NFR-10 | Home page load time shall be no more than 3.0 seconds. | Browser, device class, network profile, cache state, and metric (e.g. LCP or full load). |
| NFR-11 | Product list/search API response time shall be no more than 500 ms at 50 concurrent users. | Deployment region, dataset size, request mix, percentile, and load-test duration. |
| NFR-12 | System availability shall be at least 95% during the project test/demo period. | Monitoring source, measurement window, and planned maintenance treatment. |

### 6.3 Usability and accessibility

**NFR-13.** User-facing content, validation messages, and system feedback shall be in Thai.  
**NFR-14.** The interface shall support a minimum viewport width of 375 CSS pixels and desktop viewports of 1024 CSS pixels or wider without loss of core functionality.  
**NFR-15.** Interactive elements shall have discernible labels, keyboard-operable controls, and visible focus states.  
**NFR-16.** Loading, empty, error, and not-found states shall be distinguishable to users.

### 6.4 Reliability and data integrity

**NFR-17.** Database and storage failures shall be reported as failures, not converted into success-shaped responses.  
**NFR-18.** Product creation shall validate all fields and image constraints before creating database records.  
**NFR-19.** If the multi-step product/image operation fails after product creation, cleanup shall be attempted and cleanup failures shall be logged.  
**NFR-20.** Listing pagination and sorting shall be deterministic for a fixed dataset and filter set.

### 6.5 Maintainability and portability

**NFR-21.** The frontend and backend API shall remain deployable from the same Next.js application.  
**NFR-22.** Backend route handlers shall use the shared authentication, response, and validation conventions documented in the repository.  
**NFR-23.** Pure validation and mapping logic shall be testable without a live Supabase connection.  
**NFR-24.** The system shall support Node.js 22 or later in local and deployed environments.

### 6.6 Compatibility

**NFR-25.** The web application shall support current stable versions of Chrome and Safari on desktop and mobile. Other browser versions are not guaranteed unless added to the project’s supported-browser policy.

## 7. Business rules and constraints

1. Only email addresses at `student.chula.ac.th` and `chula.ac.th` may register.
2. An account must retain at least one contact channel: phone or LINE ID.
3. Listings are for campus handover; online payment and shipping are not part of the system.
4. Listing operations are owner-only except for authorized administrator moderation.
5. Product detail remains publicly viewable for any product status; contact data remains private.
6. A product’s first uploaded image is its primary image.
7. Zero price means the product is free; `is_free` is computed from the price.
8. Available and reserved products count as active listings where active-listing statistics are presented.
9. Deleting a listing shall not erase its report or moderation history.
10. No API handler may rely on Supabase row-level security as its sole authorization control because the service-role client bypasses RLS.

## 8. Verification and acceptance

### 8.1 Verification methods

| Method | Use |
|---|---|
| Unit test | Verify pure input validation, mapping, query parsing, image checks, and report rules. |
| API test | Verify HTTP status, response shape, authorization, validation, and error codes using the Bruno collection or an approved equivalent. |
| Integration test | Verify database and Storage interactions in an authorized test environment with test-owned data. |
| UI test | Verify navigation, forms, responsive behavior, loading/error/empty states, and authenticated flows. |
| Inspection | Review code, configuration, migration, and documentation against the requirement. |
| Performance test | Measure NFR-10 to NFR-12 after their measurement conditions are agreed. |

### 8.2 Acceptance criteria

A release candidate is acceptable when:

- Each in-scope mandatory requirement has a passing verification result or an explicitly approved deferral.
- Authentication, owner-only access, admin-only access, and private-contact rules pass positive and negative tests.
- Product creation, image validation/cleanup, search, filters, stable pagination, and empty-list behavior pass API tests.
- Public product responses contain no private contact fields or credentials.
- Thai user-facing success, validation, and failure messages are present for delivered UI flows.
- The unit test suite and production build pass.
- Performance and availability targets are judged only under agreed test conditions.
- Any TBD item affecting an unfinished feature is resolved in the API specification before that feature is accepted.

### 8.3 Feature-level acceptance criteria

| Requirement | Minimum acceptance evidence |
|---|---|
| FR-01 | Valid CU registration succeeds; non-CU email, invalid fields, missing contacts, and duplicate email return the documented errors; response and database do not expose plaintext password. |
| FR-02 | Valid credentials produce a valid 24-hour HS256 token; missing, invalid, and expired tokens are rejected. |
| FR-03 | Valid product with 1–5 real JPEG/PNG images is created with first image primary; field, image type, count, per-file size, and aggregate-size failures return the specified errors; failed upload is cleaned up where possible. |
| FR-04 | Owner can edit/status-change/delete; another member cannot; invalid or missing IDs are handled before body validation; storage cleanup is attempted after successful deletion. |
| FR-05 | Guest can browse categories, locations, product lists, and any-status details; filters produce expected results; invalid queries return documented errors; pagination is stable; no result is HTTP 200 with an empty list; public payload contains no private contact data. |
| FR-06 | Guest cannot retrieve contact channels; authenticated contact response includes only seller-provided channels and approved pickup/safety information after contract approval. |
| FR-07 | Authenticated member can add/remove/read only their own saved products; uniqueness and delete behavior are verified after endpoint contract is approved. |
| FR-08 | Authenticated non-owner can submit one valid report; self-report, invalid reason, missing product, and duplicate report produce documented outcomes; non-admin cannot access moderation routes; admin actions and audit log are atomic. |
| FR-09 | Authenticated user can read/update only allowed profile fields; cannot change email/role; at least one contact channel remains. |
| FR-10 | Delivered UI flows are navigable, responsive, accessible by keyboard at a basic level, and render loading/empty/error/success states in Thai. |

## 9. Requirements traceability and delivery status

Status below reflects the repository’s `main` branch as reviewed on **8 November 2026**. “Complete” describes evidence in the repository, not a claim of production deployment or independent acceptance testing.

| Task | Related requirements | Status | Repository evidence / gap |
|---|---|---|---|
| TASK-01 — Planning, schedule, UI details, SRS v1.0 | Project planning; Sections 1–12 | Complete (team-confirmed) | Source schedule, original UI details, and submitted SRS file are not stored in this repository. |
| TASK-02 — Wireframe and high-fidelity UI | Sections 4.1 and 4.6 | Complete (team-confirmed) | Figma source/prototype link and export are not stored in this repository. |
| TASK-03 — ERD, sequence diagrams, data dictionary | Sections 4.3–4.5 and 5.4 | Complete (team-confirmed) | Original diagrams/data dictionary files are not stored in this repository; this SRS includes a repository-derived data model summary. |
| TASK-04 — Database design and Supabase setup | Sections 4.2, 4.5, 5 | Complete | Migrations and seed are present; shared Supabase setup is reported complete in project guidance. |
| TASK-05 — API Specification and request/response mock | Sections 4.2–4.3 | Complete (team-confirmed) | API Specification v2.2 file/mock artifact is not stored in this repository; this SRS summarizes the known API contract and is not a substitute. |
| TASK-06 — Auth API | FR-01, FR-02, FR-09, NFR-01–NFR-08 | Complete (backend) | Register, login, profile API and JWT/auth helpers are present. |
| TASK-07 — Core layout | FR-10, NFR-13–NFR-16 | Complete | Shared layout, navigation, and theme are present. |
| TASK-08 — Auth UI | FR-01, FR-02, FR-09, FR-10 | Partial | Login route is a placeholder; registration and profile UI are not present. |
| TASK-09 — Product read API | FR-05 | Complete | Public product, category, pickup-location APIs and query handling are present. |
| TASK-10 — Home UI | FR-05, FR-10 | Complete | Home page, product cards, and product grid are present. |
| TASK-11 — QA test cases | Section 8 | Partial / not evidenced as a deliverable | Unit tests and Bruno requests exist; a standalone QA test-case document for login and product display was not found. |
| TASK-12 — Product CRUD API | FR-03, FR-04 | Complete | Create/edit/delete/status APIs and image validation are present. |
| TASK-13 — Listing UI | FR-03, FR-04, FR-10 | Not implemented | Create/edit listing pages were not found. |
| TASK-14 — My listings/status UI | FR-04, FR-10 | Partial | Status API exists; a “my listings” UI was not found. |
| TASK-15 — Search/filter API | FR-05 | Complete | Search and filtering are implemented with Bruno examples. |
| TASK-16 — Search/filter UI | FR-05, FR-10 | Complete | Search and filter controls are present on the home page. |
| TASK-17 — Wishlist | FR-07 | Not implemented | Wishlist UI and API routes were not found. |
| TASK-18 — Product detail/contact | FR-05, FR-06, FR-10 | Partial | Product detail UI and contact button exist; the contact API is absent and awaits ownership/contract approval. |
| TASK-19 — Reports/admin API | FR-08 | Complete (backend) | Report, admin moderation routes, migration, tests, and Bruno examples are present. |
| TASK-20 — Admin UI | FR-08, FR-10 | Not implemented | Admin dashboard UI was not found. |
| TASK-21 — Integration and system testing | Section 8; FR-01–FR-10, NFR-01–NFR-16 | Planned; blocked until TASK-01–20 are complete | Not started; system-wide test plan, execution results, and defect records are pending. |
| TASK-22 — Bug fixing | Findings from TASK-21 | Planned; blocked until TASK-21 testing is complete | Not started; fixes and regression results depend on the integration/system test findings. |
| TASK-23 — Vercel deployment and domain/database connection | NFR-05, NFR-14–NFR-15 | Planned; blocked until TASK-22 is complete | Not deployed; production URL, domain, environment configuration, and deployment evidence are pending. |
| TASK-24 — Complete five-chapter project report | Sections 1–12; verification results | Planned; blocked until TASK-21–23 are complete | Not started; final report must use completed test, bug-fix, and deployment results. |
| TASK-25 — Presentation slides and demo preparation | Sections 8–9; final system and report | Planned; blocked until TASK-21–24 are complete | Not started; slides and presentation test scenarios are pending. |

## 10. Open decisions

The following items require explicit team approval; they shall not be inferred from UI mock behavior or route placeholders:

1. **Wishlist API:** endpoint paths, schemas, duplicate-add behavior, and whether users can save their own products.
2. **Seller contact API:** ownership, exact endpoint path, response schema, seller-self-contact behavior, and whether sold listings still reveal contact information.
3. **Account verification:** whether domain validation alone is sufficient or an email verification flow is required.
4. **Performance targets:** test environment, percentile, measurement tools, and load profile for NFR-10 through NFR-12.
5. **Data lifecycle:** retention/deletion policy for inactive accounts, images, reports, and moderation logs.
6. **Accessibility target:** whether the project will formally target a WCAG conformance level.
7. **Supported browser versions:** define “current stable” relative to a release date or support window.
8. **Operational recovery:** backup frequency, recovery-point objective, recovery-time objective, and incident ownership.
9. **US-01 email-domain policy:** confirm whether registration is restricted to students (`@student.chula.ac.th`) or includes university staff (`@chula.ac.th`) as supported by the current SRS/API.
10. **User-story acceptance details:** confirm the exact empty-state text, guest-reporting policy, and whether contact must be disabled for Sold listings; record acceptance evidence during TASK-21.

## 11. Appendices

### Appendix A — API error behavior

The API shall use the project’s approved error catalog. The following cases are especially relevant to this SRS:

| Case | Expected behavior |
|---|---|
| Invalid JSON or invalid multipart payload | `400 INVALID_PAYLOAD` |
| Missing/invalid/expired authentication | `401` with the applicable authentication code |
| Invalid login credentials | `401 INVALID_CREDENTIALS` |
| Duplicate registered email | `409 EMAIL_TAKEN` |
| Authenticated non-owner write | `403 NOT_OWNER` |
| Non-admin moderation request | `403 ADMIN_REQUIRED` |
| Missing or invalid product for owner write | `404 PRODUCT_NOT_FOUND` |
| Unsupported CU email | `422 NON_CU_EMAIL` |
| Weak or over-limit password | `422 WEAK_PASSWORD` or the specified password validation error |
| Invalid registration/profile/product/query field | `422 VALIDATION_ERROR` with a field where applicable |
| Missing all contact channels | `422 MISSING_CONTACT` |
| Invalid faculty | `422 INVALID_FACULTY` |
| Missing image | `422 NO_IMAGE` |
| Too many images | `422 TOO_MANY_IMAGES` |
| Image size exceeds limit | `413 FILE_TOO_LARGE` |
| Invalid image bytes | `422 UNSUPPORTED_FILE_TYPE` |
| Invalid pickup location | `422 INVALID_PICKUP_LOCATION` |
| Invalid product status | `422 INVALID_STATUS` |
| Invalid report reason | `422 INVALID_REPORT_REASON` |
| Unexpected server/database/storage failure | Generic logged `500 INTERNAL_ERROR`; no raw Supabase error is returned |

### Appendix B — Product constraints

| Field | Constraint |
|---|---|
| Title | Required, trimmed, 3–255 characters. |
| Description | Optional, empty becomes null, maximum 2,000 characters. |
| Category | Required existing category identifier. |
| Item condition | `new`, `like_new`, `good`, or `fair`. |
| Price | Required numeric value, 0–999,999.99, at most two decimal places. |
| Pickup location | Required; must exactly match a configured location. |
| Images | 1–5 JPEG/PNG files, verified by file bytes; at most 2 MiB each and 4 MiB total. |
| Status | `available`, `reserved`, or `sold`; new listings start as `available`. |

### Appendix C — Report and moderation lifecycle

- A new report is `pending`.
- An administrator may dismiss a report without deleting its product; the dismissed action is recorded.
- Deleting a reported product through moderation preserves report records and records the moderation action.
- The canonical list of report reasons and any additional allowed transitions are governed by the database and API specification.

### Appendix D — Account input constraints

| Field | Constraint |
|---|---|
| Email | Trimmed and lowercased; maximum 254 characters; must match a CU student or staff domain. |
| Password | At least 8 characters, containing a letter and a digit; maximum 72 UTF-8 bytes for bcrypt. |
| Full name | Trimmed, internal whitespace normalized, 2–255 characters. |
| Phone | Optional; spaces and hyphens may be removed; normalized value must match the supported `0` or `+66` format with 8–9 subsequent digits. |
| LINE ID | Optional; 2–100 characters from `A-Z`, `a-z`, `0-9`, `.`, `_`, and `-`. |
| Contact requirement | At least one of phone or LINE ID must be present. |
| Faculty | Must match a configured faculty, or use `other` with a 2–100 character description. |

## 12. Project planning and source artifacts

### 12.1 Sprint plan and task completion

The project owner confirms TASK-01–05 are complete. Sprint/task information below reflects the project task sheet and team confirmation, not evidence that the original deliverable files are present in this repository.

| Task | Work package | Sprint | Owner role | Completion |
|---|---|---|---|---|
| TASK-01 | Planning schedule, UI details, and SRS Document v1.0 | Sprint 0 | PM/BA | Complete (confirmed) |
| TASK-02 | Wireframe and high-fidelity UI in Figma | Sprint 0 | SA/UI | Complete (confirmed) |
| TASK-03 | ER Diagram, Sequence Diagram, and Data Dictionary | Sprint 0 | SA/UI | Complete (confirmed) |
| TASK-04 | Database table design and Supabase setup | Sprint 0 | Backend Lead | Complete |
| TASK-05 | API Specification and request/response mock | Sprint 0 | Backend Lead | Complete (confirmed) |
| TASK-06 | Authentication API | Sprint 1 | Backend Lead | Complete |
| TASK-07 | Core frontend layout | Sprint 1 | Frontend Lead | Complete |
| TASK-08 | Authentication UI | Sprint 1 | Frontend Developer | Partial |
| TASK-09 | Product read API | Sprint 1 | Backend Developer | Complete |
| TASK-10 | Home and product-card grid | Sprint 1 | Frontend Lead | Complete |
| TASK-11 | Login/product test cases | Sprint 1 | QA/Documentation | Not evidenced as a standalone deliverable |
| TASK-12 | Product CRUD API and image upload | Sprint 2 | Backend Developer | Complete |
| TASK-13 | Listing create/edit UI | Sprint 2 | Frontend Developer | Not implemented |
| TASK-14 | Product status and my-listings UI | Sprint 2 | Frontend Developer | Partial |
| TASK-15 | Backend search and filter | Sprint 2 | Backend Lead | Complete |
| TASK-16 | Search and filter UI | Sprint 2 | Frontend Lead | Complete |
| TASK-17 | Wishlist frontend/backend | Sprint 2 | Frontend Developer | Not implemented |
| TASK-18 | Product detail and seller contact UI | Sprint 2 | Frontend Lead | Partial; Contact API pending |
| TASK-19 | Reports and admin API | Sprint 3 | Backend Developer | Complete (backend) |
| TASK-20 | Admin dashboard UI | Sprint 3 | Frontend Developer | Not implemented |
| TASK-21 | Integration and system testing for the complete system | Sprint 3 | QA/Documentation | Planned; do not start until TASK-01–20 are complete |
| TASK-22 | Bug fixing across the system | Sprint 3 | All developers | Planned; after TASK-21 testing and findings |
| TASK-23 | Deploy frontend to Vercel and connect domain/database | Sprint 4 | Frontend Lead | Planned; after TASK-22 and regression testing |
| TASK-24 | Compile the complete five-chapter project report | Sprint 4 | QA/Documentation | Planned; after TASK-21–23 are complete and evidence is available |
| TASK-25 | Prepare presentation slides and demo test scenarios | Sprint 4 | PM/BA | Planned; after TASK-21–24 are complete |

**Original planned dates and sprint windows:** available in the provided `VISIT CMU.xlsx` and transcribed into the [Project Kanban & Task Tracker](PROJECT-KANBAN.md). The original task dates and Sprint 4 baseline (1–14 November 2026) are preserved; the Sprint 4 window is adjusted to 1–17 November 2026 so the presentation date in TASK-25 falls within the sprint. Actual completion dates and schedule variance have not been established.

**Execution gate for TASK-21–25:** These tasks are recorded for planning only. Do not begin TASK-21 until all TASK-01–20 are complete. Then proceed in order: integration/system testing (TASK-21), defect fixes and regression testing (TASK-22), deployment (TASK-23), final report (TASK-24), and presentation/demo preparation (TASK-25). Later tasks depend on the evidence and outputs of the preceding tasks.

### 12.2 TASK-01–05 deliverable register

| Task | Expected artifact | State | Repository location / follow-up |
|---|---|---|---|
| TASK-01 | Project plan/schedule; UI detail notes; SRS v1.0 | Completed per owner; not present here | [TBD: add source link or archive location] |
| TASK-02 | Approved wireframes and high-fidelity Figma prototype | Completed per owner; not present here | [TBD: add view-only Figma URL and export, if permitted] |
| TASK-03 | ERD, sequence diagrams, data dictionary | Completed per owner; not present here | [TBD: add approved source files; this document’s schema summary is derived from migrations] |
| TASK-04 | Database schema and Supabase setup | Completed; migration/seed artifacts present | [`../supabase/migrations/`](../supabase/migrations/) and [`../supabase/seed.sql`](../supabase/seed.sql); do not store credentials in the report |
| TASK-05 | API Specification v2.2 and request/response mock | Completed per owner; not present here | [TBD: add approved specification location; do not treat this summary as the canonical API contract] |

### 12.3 Sprint 0 baseline

The approved Sprint 0 baseline consists of project planning, UI/UX design, system/data design, database setup, and API contract definition. These artifacts are prerequisites for implementation and verification. They are marked complete from the owner’s confirmation; the original versions, approvers, and approval dates remain unverified in this repository.

### 12.4 Cross-document traceability

| Planning/design deliverable | Requirements/design sections in this SRS | Implementation/verification evidence |
|---|---|---|
| Project schedule (TASK-01) | Section 12.1 | Sprint labels from task plan; actual dates/variance TBD |
| SRS and UI details (TASK-01) | Sections 1–3, 6–10 | This consolidated SRS; source approval record TBD |
| Figma design (TASK-02) | Section 4.6 | UI implementation notes in [`docs/TASK-07-10-16-18-CHANGELOG.md`](../docs/TASK-07-10-16-18-CHANGELOG.md); original Figma link TBD |
| ERD/Sequence/Data Dictionary (TASK-03) | Sections 4.3–4.5, 5.4 | Current schema in migrations; original approved diagrams TBD |
| Database/Supabase setup (TASK-04) | Sections 2.1, 4.2, 4.5, 5 | [`../supabase/migrations/`](../supabase/migrations/) and seed file |
| API Specification (TASK-05) | Sections 4.2–4.3 and Appendix A | API implementation notes and Bruno collection; approved spec file TBD |
