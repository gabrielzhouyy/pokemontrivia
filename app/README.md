# Pokemon Trivia App

Pokemon-themed trivia game for Singapore primary school students. Players catch and train Pokemon by answering math and Singapore trivia questions. Difficulty is set per user (`priLevel` 1–4). Built with Next.js App Router + Neon PostgreSQL.

---

## Tech Stack

| | |
|---|---|
| **Framework** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Database** | Neon serverless PostgreSQL via Drizzle ORM |
| **Auth** | HMAC-signed session cookie (bcryptjs for PIN/password hashing) |
| **Deploy** | Vercel, Singapore region (`sin1`) |

---

## npm Scripts

```bash
npm run dev          # Next.js dev server
npm run build        # Production build
npm run lint         # ESLint
npm run db:push      # Push schema changes to Neon (no migration file)
npm run db:generate  # Generate Drizzle migration files
npm run db:migrate   # Run pending migrations
npm run db:studio    # Drizzle Studio GUI
```

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `SESSION_SECRET` | HMAC key for session cookie signing |

---

## Pages (UI Routes)

| Route | File | Description |
|---|---|---|
| `/` | `src/app/page.tsx` | Landing / entry point |
| `/login` | `src/app/login/page.tsx` | Player login + register (username + PIN) |
| `/starter` | `src/app/starter/page.tsx` | Pick starter Pokemon on first login |
| `/pokedex` | `src/app/pokedex/page.tsx` | Player's caught Pokemon grid |
| `/encounter/[id]` | `src/app/encounter/[id]/page.tsx` | Answer a question to catch Pokemon `id` |
| `/training/[id]` | `src/app/training/[id]/page.tsx` | Train owned Pokemon `id`; levels up + evolves |
| `/stats` | `src/app/stats/page.tsx` | Player answer stats dashboard |
| `/admin` | `src/app/admin/page.tsx` | Professor Oak dashboard (Users + Questions tabs) |
| `/admin/login` | `src/app/admin/login/page.tsx` | Admin password entry |

---

## API Routes

### Auth

| Method | Path | File | Description |
|---|---|---|---|
| POST | `/api/auth/register` | `src/app/api/auth/register/route.ts` | Create player (username, PIN, priLevel) |
| POST | `/api/auth/login` | `src/app/api/auth/login/route.ts` | Player login → set session cookie |
| POST | `/api/auth/logout` | `src/app/api/auth/logout/route.ts` | Clear session cookie |
| GET | `/api/auth/me` | `src/app/api/auth/me/route.ts` | Return current session user |
| POST | `/api/auth/admin-login` | `src/app/api/auth/admin-login/route.ts` | Admin login / first-time enrollment |

### Player

| Method | Path | File | Description |
|---|---|---|---|
| GET/PUT | `/api/profile` | `src/app/api/profile/route.ts` | Fetch / save full player profile |
| GET | `/api/config/bank` | `src/app/api/config/bank/route.ts` | Return questions for user's `priLevel` from DB |

### Admin

| Method | Path | File | Description |
|---|---|---|---|
| GET | `/api/admin/users` | `src/app/api/admin/users/route.ts` | List all players |
| GET/PUT | `/api/admin/users/[id]` | `src/app/api/admin/users/[id]/route.ts` | View / edit player |
| PUT | `/api/admin/users/[id]/bank` | `src/app/api/admin/users/[id]/bank/route.ts` | Set player's `priLevel` (1–4) |
| POST | `/api/admin/users/[id]/reset` | `src/app/api/admin/users/[id]/reset/route.ts` | Reset player profile |
| GET/POST | `/api/admin/questions` | `src/app/api/admin/questions/route.ts` | List questions (filterable) / create question |
| PUT/DELETE | `/api/admin/questions/[id]` | `src/app/api/admin/questions/[id]/route.ts` | Edit / delete a question |

---

## Libs (`src/lib/`)

| File | Owns / Exports |
|---|---|
| `auth.ts` | `requireSession()`, `requireAdmin()` (server-only, throw `{status:401}`); session cookie sign/verify; PIN hashing |
| `admin.ts` | Client-only: `isAdminAuthenticated()`, `endAdminSession()`, `resetAdmin()` |
| `db/client.ts` | `getDb()` — Drizzle client singleton; `schema` re-export |
| `db/schema.ts` | All Drizzle table definitions (see DB Schema section) |
| `pokemon.ts` | `getPokemon(id)` → `Pokemon` type (`id, name, tier, evolves_to, evolve_level, evolution_only, sprite, sprite_pixel`) |
| `questions.ts` | `pickQuestion(subject\|null, tier, history)`, `recordAnswer()`, `syncBankFromCloud()`, `bankIsEmpty()`, `QuestionHistory` type |
| `subjects.ts` | `subjectFor(pokemonId)` — parity routing (odd→math, even→singapore_trivia); `getSubjects()` from `data/subjects.json` |
| `profile-types.ts` | `Profile`, `OwnedPokemon` (`{level, evolved}`) types; `newProfile()` |
| `storage.ts` | Client-only: `login()`, `register()`, `logout()`, `loadCurrentProfile()`, `saveProfile()` — thin wrappers over fetch |
| `audio.ts` | `playCorrect()`, `playWrong()`, `playClick()`, `playEvolve()` via Web Audio API |

---

## Components (`src/components/`)

| File | Props | Description |
|---|---|---|
| `QuestionModal.tsx` | `question, onAnswer, imageUrl?, imageName?, levelUpText?, subtitle?, onExit?, exitLabel?` | Full-screen modal for answering questions. Supports multiple_choice, number_pad, text_pad formats. Shows feedback + explanation + level-up text. Calls `onAnswer(correct)` on Continue. |

---

## Admin UI (`src/app/admin/tabs/`)

| File | Description |
|---|---|
| `UsersTab.tsx` | Table of all players; inline difficulty dropdown; Reset / Delete buttons |
| `QuestionsTab.tsx` | Filter by difficulty + subject; inline add/edit form (prompt, answer, choices, explanation); delete |

---

## DB Schema (`src/lib/db/schema.ts`)

| Table | Key Columns |
|---|---|
| `users` | `id, username, pinHash, priLevel (1–4), starterId, createdAt` |
| `sessions` | `id, userId, expiresAt` |
| `admin_config` | `key, value` — stores `admin_password_hash` |
| `questions` | `id, subject, priLevel, tier, prompt, answer, format, choices (json), skill, source, explanation` |
| `owned_pokemon` | `userId, pokemonId, level, evolved` |

---

## Data Files (`data/`)

| Path | Content |
|---|---|
| `pokemon.json` | All Pokemon: `id, name, tier, evolves_to, evolve_level, evolution_only, sprite, sprite_pixel` |
| `subjects.json` | Subject definitions + parity routing (odd→math, even→singapore_trivia) |
| `questions/curriculum/prek-k/math.json` | priLevel 1 math questions |
| `questions/curriculum/prek-k/singapore_trivia.json` | priLevel 1 Singapore trivia |
| `questions/curriculum/grade-1-3/math.json` | priLevel 2 math |
| `questions/curriculum/grade-1-3/singapore_trivia.json` | priLevel 2 Singapore trivia |
| `questions/curriculum/grade-4-5/math.json` | priLevel 3 math |
| `questions/curriculum/grade-4-5/singapore_trivia.json` | priLevel 3 Singapore trivia |
| `questions/curriculum/adult/math.json` | priLevel 4 math |
| `questions/curriculum/adult/singapore_trivia.json` | priLevel 4 Singapore trivia |

---

## Scripts (`scripts/`)

| File | Run with | Purpose |
|---|---|---|
| `seed-questions.mjs` | `node scripts/seed-questions.mjs` | Upsert all JSON curriculum questions into Neon `questions` table |

---

## Key Systems

### Auth
HMAC-signed session cookie keyed by `SESSION_SECRET`. `requireSession()` and `requireAdmin()` in `src/lib/auth.ts` are server-only guards — they throw `{ status: 401 }` which every API route catches and returns as a 401 JSON response. Client admin helpers live in `src/lib/admin.ts`.

### priLevel Tiers
`priLevel` is the single difficulty axis: **1**=preK–K, **2**=Grade 1–3, **3**=Grade 4–5, **4**=Adult. Stored on `users.priLevel`. Controls which questions are served (`/api/config/bank`) and shown in the admin Users tab.

### Question Bank
`/api/config/bank` (`src/app/api/config/bank/route.ts`) queries `questions` where `priLevel = users.priLevel`. The result is cached in `localStorage` at key `pmc:bank:active` via `syncBankFromCloud()` in `src/lib/questions.ts`, called on every `loadCurrentProfile()`. Admin edits to questions propagate on next player page load.

### Question Picking
`pickQuestion(subject | null, tier, history)` in `src/lib/questions.ts`. Priority: (1) due reviews (wrong + reviewCounter=0), (2) fresh (never seen), (3) random from pool. Pass `subject=null` to draw from all subjects — used by training so math and Singapore trivia are mixed. Pass a specific subject for encounter pages.

### Levels & Evolution
`LEVEL_GAIN_MIN=3 / LEVEL_GAIN_MAX=9` in `src/app/training/[id]/page.tsx`. Gain is pre-rolled into `pendingGain` state at question-load time and shown as `Lv.X → Lv.Y` in `QuestionModal` on correct answer. Evolution triggers when `level >= evolve_level && evolves_to !== null`: current slot frozen at `evolve_level` with `evolved:true`, new slot created for evolved form, auto-caught.

### Evolution Animation
Two-phase overlay in `src/app/training/[id]/page.tsx`. Phase 1 (0–1s): current sprite flashes (`animate-evolve`), message "A evolved into B!". Phase 2 (1s–3.2s): evolved sprite at `w-80 h-80` snaps in, message "Meet B!". At 3.2s routes to `/training/${evolvedToId}`.

### Profile Shape
Canonical type in `src/lib/profile-types.ts`. Server is source of truth (Neon DB). Client syncs via `loadCurrentProfile()` / `saveProfile()` in `src/lib/storage.ts` which wrap `GET/PUT /api/profile`. `OwnedPokemon = { level: number; evolved: boolean }`.
