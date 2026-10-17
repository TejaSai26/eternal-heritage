# Eternal Heritage — Release 1

A source-first, accessibility-aware heritage discovery platform. See [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) for the problem statement, architecture, recommendation logic, evaluation plan and professor-demo flow. Release 1 includes a responsive React frontend, a Node/Express API, Supabase Auth + PostgreSQL profile storage, an explainable rule-based recommender, a curated source-linked content seed, and an installable PWA build.

## What is in Release 1

- Email/password account registration and sign-in through Supabase Auth.
- Profile stored in PostgreSQL: name, broad age band, state/UT, selected interests, language preference, and optional recent heritage site.
- Row Level Security (RLS) on private profile and visit-history tables.
- Recommendation ranking that explains matches using interests, state and recent/visited sites.
- Source links on story cards; the API only returns published stories marked `verified`.
- Ability to mark a site as visited, update a profile, sign out, and request account deletion.
- Mobile-responsive layout, keyboard-visible focus states, reduced-motion support, semantic content, alternative text, and PWA configuration.
- No recommendation pop-ups or RAG in this release. Those are planned as later enhancements.

## Project structure

```text
eternal-heritage-release1/
├── client/                 # React + Vite + PWA
│   ├── public/             # Icons and web assets
│   └── src/                # UI, fallback preview catalogue, Supabase client
├── server/                 # Express REST API + recommendation ranking
└── supabase/
    └── schema.sql          # Tables, row-level policies, signup trigger, seed content
```

## Requirements

- Node.js 20.19+ or 22.12+ (Node 24 is fine).
- npm. On Windows PowerShell, use `npm.cmd` if `npm` is blocked by PowerShell's script policy.
- A Supabase project for real account registration and persistent profile storage.

## Setup — do these in order

### 1. Open the project root

Extract the project so that `client`, `server`, and `supabase` sit together in one folder. In VS Code, open that folder (the one containing this `README.md`), not only the `client` folder.

### 2. Create the Supabase project

1. Create a new project in the Supabase dashboard for **Eternal Heritage**. Do not reuse a different practice project's database.
2. Open **Project Settings → API Keys**. Copy the **Project URL** and the **publishable key** (`sb_publishable_...`). The older anon/public key can also work if that is what your dashboard offers.
3. In **SQL Editor**, create a new query, paste the complete contents of `supabase/schema.sql`, and click **Run**.
4. Confirm the query finishes successfully. It creates the heritage catalogue, stories, profile and visit tables; row-level security policies; the profile-on-signup trigger; the account-deletion function; and starter records.
5. In **Authentication → Providers → Email**, keep email confirmation enabled for normal use. For local testing, if confirmation is enabled, sign-up may show a message telling you to confirm your email before signing in. Use a real email inbox. If you temporarily disable confirmation for a classroom demo, re-enable it before a public deployment.

### 3. Configure the frontend

1. In the `client` folder, copy `.env.example` to a new file named `.env.local`.
2. Fill in your own values:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
VITE_API_URL=
```

Leave `VITE_API_URL` blank for local development. Vite will proxy `/api` requests to the local Express server.

### 4. Configure the backend

1. In the `server` folder, copy `.env.example` to a file named `.env`.
2. Fill in the **same project URL and publishable key**:

```dotenv
PORT=4000
NODE_ENV=development
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
CLIENT_ORIGIN=http://localhost:5173
```

Do **not** use a Supabase secret key or `service_role` key in the frontend or these starter settings. The API verifies the user's access token and issues database requests using that user's JWT; PostgreSQL RLS protects each user's private rows.

### 5. Start the API

Open a VS Code terminal at the project root, then run:

```powershell
cd server
npm.cmd install
npm.cmd run dev
```

Keep this terminal running. The API should print that it is listening on port 4000. In a browser, `http://localhost:4000/api/health` should return JSON with `"ok": true` and `"configured": true` after environment setup.

### 6. Start the website

Open a **second** VS Code terminal at the project root and run:

```powershell
cd client
npm.cmd install
npm.cmd run dev
```

Open the local URL Vite prints, usually `http://localhost:5173`.

The page can be previewed before connecting Supabase, but sign-up and database saving are deliberately disabled until the connection is configured. This prevents the UI from pretending a profile was saved when it was not.

## How to test personalisation

1. Create an account and choose interests, state, language and (optionally) a recent site.
2. For a cooking interest plus a Tirumala recent visit, the Laddu story should rank prominently. It links to TTD's published details about large-scale ingredients and does **not** present those quantities as an exact home recipe.
3. For Telangana plus Tirumala, the Yadagirigutta story should be a regional discovery. The content explicitly states the two temples have different traditions; it does not say they are identical.
4. For anime/visual-storytelling interest, a Konark sculpture story uses character design and visual motifs as an analogy for looking closely at historical art. It clearly distinguishes this analogy from any historical connection to anime.
5. Mark a destination as visited. The visit is stored against the signed-in account and helps re-rank later recommendations.
6. Edit the profile. The updated record and recommendations should refresh from the API.

The first catalogue is intentionally small. `heritage_stories.review_status` defaults to `needs_review`, and unverified stories are not returned by the recommendation API. Before making the project public, expand the editorial process and verify every claim and URL against authoritative sources.

## Test the phone layout

For a responsive preview, connect your phone and computer to the same Wi-Fi network.

1. Run the frontend using `npm.cmd run dev` (the Vite config listens on `0.0.0.0`).
2. On your computer, run `ipconfig` and find the IPv4 address of the active Wi-Fi adapter.
3. On your phone, open Chrome and navigate to `http://YOUR_COMPUTER_IPV4:5173` (replace the example with your actual address). Keep both development servers running. If Windows Firewall asks, allow the app on a private network.

For home-screen installation, deploy the site over HTTPS first. Vite's PWA plugin emits the web manifest and service worker during a production build:

```powershell
cd client
npm.cmd run build
npm.cmd run preview
```

A local HTTP preview is useful for checking the build. Installability on other devices should be tested from the deployed HTTPS URL. External heritage photographs and Google Fonts currently need an internet connection; this is not a complete offline content experience yet.

## Recommendation-rule tests

The API recommendation-ranking tests can be run from the `server` folder after dependencies are installed:

```powershell
npm.cmd test
```

The starter test suite checks the cooking + Tirumala case, the Telangana regional-discovery case, and the anime/visual-storytelling case.

## API routes

| Method | Route | Access | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | API and environment status |
| GET | `/api/sites` | Public | Published heritage catalogue |
| GET | `/api/me` | Signed in | Read the signed-in user's profile and visited site IDs |
| PUT | `/api/me` | Signed in | Validate and update their own profile |
| GET | `/api/recommendations` | Signed in | Source-linked stories ranked for the profile |
| POST | `/api/visits` | Signed in | Mark a published heritage site as visited |
| DELETE | `/api/me` | Signed in | Delete the caller's Supabase auth user via a restricted database function; related profile and visit rows cascade |

## Data design and safety notes

- The app deliberately asks for an **age band**, not a full birth date. Before serving minors publicly, add and review an age-appropriate guardian-consent flow where required; the bundled consent checkbox is a prototype acknowledgment, not a substitute for legal compliance.
- State and interest fields come from controlled lists; the backend validates values again.
- Profile and visit tables use RLS tied to `auth.uid()`. Public visitors can only read published heritage content.
- Signup metadata is copied into the profile table by a database trigger, including when email confirmation is enabled.
- Recommendations are rule-based and explainable in this release. No RAG, external AI calls, background tracking or recommendation pop-ups are included.
- The prototype has no admin editing screen. To publish new stories, add records in a controlled editorial workflow, verify the source and facts, set `review_status = 'verified'`, provide `reviewed_at`, and only then set `is_published = true`.
- The provided profile-deletion route is destructive. It asks for confirmation in the frontend and only calls the database function as the authenticated user. Test in a disposable account first.
- Before deployment, configure Supabase Auth redirect URLs for your deployed domain, set `CLIENT_ORIGIN` to the exact frontend origin(s), use HTTPS, and test signup/login/password recovery and account deletion end-to-end.

## Initial editorial sources

- Tirumala Tirupati Devasthanams, temple history: https://www.tirumala.org/TTDTempleHistory.aspx
- TTD, Srivari Laddu production and materials update (3 June 2026): https://news.tirumala.org/sacred-laddu-sales-hits-all-time-high-in-may-_-%E0%B0%AE%E0%B1%87-%E0%B0%A8%E0%B1%86%E0%B0%B2%E0%B0%B2%E0%B1%8B-%E0%B0%B0%E0%B0%BF%E0%B0%95%E0%B0%BE%E0%B0%B0%E0%B1%8D%E0%B0%A1%E0%B1%81/
- Yadadri Bhuvanagiri District, Yadagirigutta: https://yadadri.telangana.gov.in/tourist-place/yadagirigutta/
- Incredible India, Lepakshi Temple: https://www.incredibleindia.gov.in/en/andhra-pradesh/anantapur/lepakshi-temple
- UNESCO, Great Living Chola Temples: https://whc.unesco.org/en/list/250/
- UNESCO, Group of Monuments at Hampi: https://whc.unesco.org/en/list/241/
- UNESCO, Sun Temple, Konârak: https://whc.unesco.org/en/list/246/
- UNESCO, Khajuraho Group of Monuments: https://whc.unesco.org/en/list/240/
- UNESCO, Sun Temple, Modhera and its adjoining monuments (Tentative List): https://whc.unesco.org/en/tentativelists/6627

Starter images are remote Unsplash photographs for the prototype. Check each photograph's current licensing/attribution information and replace or formally credit images as part of the project's final content review.
