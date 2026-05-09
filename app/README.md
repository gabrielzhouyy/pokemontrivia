# Poké-Go Singapore

Pokémon-themed trivia game for Singapore events and schools. Players catch and train Gen 1 Pokémon by answering math and Singapore trivia questions. Features a **Quick Start** mode for instant demo play and a per-player difficulty selector. Built with Next.js App Router + Neon PostgreSQL.

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
npm run db:seed      # Upsert JSON curriculum questions → Neon DB
npm run db:export    # Export Neon DB questions → JSON curriculum files
```

> **Workflow for editing questions**: If admin has edited questions in the DB and you're about to push code, run `db:export` first to snapshot DB → JSON. Then redeploy. Run `db:seed` if the DB was wiped (e.g. fresh Neon project).

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
| `/login` | `src/app/login/page.tsx` | Quick Start (Ash + Pikachu) as primary CTA; named login as secondary |
| `/starter` | `src/app/starter/page.tsx` | Pick starter Pokémon on first named login |
| `/pokedex` | `src/app/pokedex/page.tsx` | Player's caught Pokémon grid; difficulty dropdown in header |
| `/encounter/[id]` | `src/app/encounter/[id]/page.tsx` | Answer a question to catch Pokémon `id` |
| `/training/[id]` | `src/app/training/[id]/page.tsx` | Train owned Pokémon `id`; levels up + evolves |
| `/stats` | `src/app/stats/page.tsx` | Player answer stats dashboard |
| `/admin` | `src/app/admin/page.tsx` | Professor Oak dashboard (Users + Questions tabs) |
| `/admin/login` | `src/app/admin/login/page.tsx` | Admin password entry |

---

## API Routes

### Auth

| Method | Path | File | Description |
|---|---|---|---|
| POST | `/api/auth/login` | `src/app/api/auth/login/route.ts` | Player login / auto-register → set session cookie |
| POST | `/api/auth/quickstart` | `src/app/api/auth/quickstart/route.ts` | Reset + session "ash" user with Pikachu; always fresh state |
| POST | `/api/auth/logout` | `src/app/api/auth/logout/route.ts` | Clear session cookie |
| GET | `/api/auth/me` | `src/app/api/auth/me/route.ts` | Return current session user |
| POST | `/api/auth/admin-login` | `src/app/api/auth/admin-login/route.ts` | Admin login / first-time enrollment |

### Player

| Method | Path | File | Description |
|---|---|---|---|
| GET/PUT | `/api/profile` | `src/app/api/profile/route.ts` | Fetch / save full player profile |
| PATCH | `/api/profile/difficulty` | `src/app/api/profile/difficulty/route.ts` | Update `priLevel` + `bankId` without touching game state |
| GET | `/api/config/bank` | `src/app/api/config/bank/route.ts` | Return questions + `subjectFilter` for user's `priLevel` |

### Admin

| Method | Path | File | Description |
|---|---|---|---|
| GET | `/api/admin/users` | `src/app/api/admin/users/route.ts` | List all players |
| DELETE | `/api/admin/users/[id]` | `src/app/api/admin/users/[id]/route.ts` | Delete player |
| PUT | `/api/admin/users/[id]/bank` | `src/app/api/admin/users/[id]/bank/route.ts` | Set player `priLevel` and/or `subjectFilter` |
| POST | `/api/admin/users/[id]/reset` | `src/app/api/admin/users/[id]/reset/route.ts` | Reset player profile |
| GET/POST | `/api/admin/questions` | `src/app/api/admin/questions/route.ts` | List / create questions |
| PUT/DELETE | `/api/admin/questions/[id]` | `src/app/api/admin/questions/[id]/route.ts` | Edit / delete a question |

---

## Libs (`src/lib/`)

| File | Owns / Exports |
|---|---|
| `auth.ts` | `requireSession()`, `requireAdmin()` (server-only, throw `{status:401}`); session cookie sign/verify |
| `admin.ts` | Client-only: `isAdminAuthenticated()`, `endAdminSession()`, `resetAdmin()` |
| `db/client.ts` | `getDb()` — Drizzle client singleton; `schema` re-export |
| `db/schema.ts` | All Drizzle table definitions (see DB Schema section) |
| `pokemon.ts` | `getPokemon(id)` → `Pokemon` type; `STARTERS = [1, 4, 7]` |
| `questions.ts` | `pickQuestion()`, `recordAnswer()`, `syncBankFromCloud()`, `bankIsEmpty()`, `getSubjectFilter()` |
| `subjects.ts` | `subjectFor(pokemonId)` — parity routing (odd→math, even→singapore_trivia) |
| `profile-types.ts` | `Profile`, `OwnedPokemon` types; `newProfile()` |
| `storage.ts` | Client-only: `loginOrRegister()`, `quickStart()`, `logout()`, `loadCurrentProfile()`, `saveProfile()` |
| `audio.ts` | `playCorrect()`, `playWrong()`, `playClick()`, `playEvolve()`, `playMaxLevel()` (Web Audio API jingle at level 60) |

---

## Components (`src/components/`)

| File | Props | Description |
|---|---|---|
| `QuestionModal.tsx` | `question, onAnswer, imageUrl?, imageName?, levelUpText?, subtitle?, onExit?, exitLabel?` | Full-screen modal for answering questions. Supports `multiple_choice`, `number_pad`, `text_pad` formats. |

---

## Admin UI (`src/app/admin/tabs/`)

| File | Description |
|---|---|
| `UsersTab.tsx` | Table of all players; inline difficulty dropdown; subject filter; Reset / Delete buttons |
| `QuestionsTab.tsx` | Filter by difficulty + subject; inline add/edit/delete |

---

## DB Schema (`src/lib/db/schema.ts`)

| Table | Key Columns |
|---|---|
| `users` | `id, username, pinHash, role, priLevel (1–4), subjectFilter, starterId, bankId, createdAt` |
| `questions` | `id, subject, priLevel, tier, prompt, answer, format, choices (json), explanation` |
| `banks` | `id, name` |
| `bank_questions` | `bankId, questionId` |
| `pokemon_owned` | `userId, speciesId, level, evolved` |
| `caught` | `userId, speciesId` |
| `evolved` | `userId, speciesId` |
| `question_history` | `userId, questionId, correct, reviewCounter, ts` |
| `user_stats` | `userId, totalAnswered, correct, currentStreak, longestStreak` |

---

## Data Files (`data/`)

| Path | Content |
|---|---|
| `pokemon.json` | All Pokémon: `id, name, tier, evolves_to, evolve_level, evolution_only, sprite, sprite_pixel` |
| `subjects.json` | Subject definitions + parity routing |
| `questions/curriculum/prek-k/` | priLevel 1 questions (math + singapore_trivia) |
| `questions/curriculum/grade-1-3/` | priLevel 2 questions |
| `questions/curriculum/grade-4-5/` | priLevel 3 questions |
| `questions/curriculum/adult/` | priLevel 4 questions |

---

## Scripts (`scripts/`)

| File | npm script | Purpose |
|---|---|---|
| `seed-questions.mjs` | `npm run db:seed` | Upsert all JSON curriculum questions into Neon |
| `export-questions.mjs` | `npm run db:export` | Export all questions from Neon back to JSON |
| `generate-audio.mjs` | `node scripts/generate-audio.mjs` | Regenerate chiptune WAV files in `public/audio/` |

---

## Key Systems

### Quick Start
`POST /api/auth/quickstart` upserts a reserved `"ash"` user, wipes all game state, seeds Pikachu (species 25, L5), and sets a session. Every Quick Start click resets to this clean state — ideal for showcase/demo flows. The `quickStart()` helper in `storage.ts` calls this endpoint then loads the fresh profile.

### Auth
HMAC-signed session cookie keyed by `SESSION_SECRET`. `requireSession()` and `requireAdmin()` in `src/lib/auth.ts` are server-only guards. Client admin helpers live in `src/lib/admin.ts`.

### priLevel / Difficulty
`priLevel` is the single difficulty axis: **1**=preK–K, **2**=Grade 1–3, **3**=Grade 4–5, **4**=Adult. Stored on `users.priLevel`. Players can change it at any time via the Pokédex header dropdown — `PATCH /api/profile/difficulty` updates `priLevel` + `bankId`, then `syncBankFromCloud()` refreshes the question cache.

### Subject Filter
`subjectFilter` on `users` controls which subject a player sees during training: `null` = random (both), `'math'` = math only, `'singapore_trivia'` = trivia only. Set by Professor Oak per player.

### Question Bank
`/api/config/bank` queries questions filtered by `users.priLevel`. Cached in `localStorage` at `pmc:bank:active` via `syncBankFromCloud()`, called on every `loadCurrentProfile()`.

### Levels & Evolution
`LEVEL_GAIN_MIN=3 / LEVEL_GAIN_MAX=9` per correct answer. Evolution triggers when `level >= evolve_level`. Evolution animation: Phase 1 (0–0.5s) old sprite flashes, Phase 2 (0.5s–1.92s) evolved sprite bounces in at `w-[29rem]`. When a Pokémon first reaches level 60, a chiptune "Gotta Catch 'Em All" jingle plays via `playMaxLevel()` and a celebratory overlay appears for 4 seconds.

### Question Modal UX
`QuestionModal` is used by both encounter and training pages. The back button and backdrop tap always call `onExit` — players are never stuck.
