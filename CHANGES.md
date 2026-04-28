# Pokemon Trivia — Change Log

A record of all customisations made to the original codebase, and the reasoning behind each decision.

---

## Deployment

### Hosting: Vercel + Neon DB
**What:** Deployed the Next.js app to Vercel (free tier). Created a Neon serverless PostgreSQL database to store players, questions, banks, and progress.

**Why:** The app requires a persistent cloud database to sync player progress across devices. Neon's free tier is sufficient and integrates well with Vercel's Singapore (`sin1`) region. Setup takes ~10 minutes total.

**How to re-deploy:** Push to `main` on GitHub — Vercel auto-deploys. To re-seed the database: `cd app && node scripts/seed-banks.mjs`.

---

## Question System Redesign

### Replaced Singapore Pri 1–6 curriculum with 4 grade tiers
**What:** Removed the original Singapore MOE Primary 1–6 question structure and replaced it with 4 grade-based categories:
- **preK–K** — foundational concepts
- **1st–3rd Grade** — elementary
- **4th–5th Grade** — intermediate
- **Adult** — advanced / financial / statistical

**Why:** The app is being used outside Singapore's school curriculum context. The audience spans from young children to adults, so a grade-based system is more universally understood.

**Files:** `app/data/questions/new-curriculum/`, `app/scripts/seed-banks.mjs`

### Replaced English + Chinese subjects with Math + Singapore Trivia
**What:** Removed the English and Chinese subject categories. Replaced with two subjects:
- **Math** — curriculum-aligned arithmetic, geometry, algebra
- **Singapore** — Singapore geography, history, culture, and current affairs

**Why:** The trivia game is Singapore-themed and the two most relevant knowledge domains for this audience are math skills and local knowledge.

**Subject routing:** Odd Pokémon IDs → Math, Even Pokémon IDs → Singapore. This creates natural alternation as kids encounter different Pokémon.

**Files:** `app/data/subjects.json`, `app/src/lib/subjects.ts` (added `parity` field to `Subject` type and updated `subjectFor()`)

### Removed old question JSON files
**What:** Deleted `app/data/questions/age-7/` and `app/data/questions/age-12/` directories entirely.

**Why:** These contained the original Singapore MOE bundled questions which are no longer used. Keeping them would cause the seed script to re-create the old Pri 1–6 banks on every run.

### Simplified seed script
**What:** Stripped `seed-banks.mjs` down to only seed the 4 new curriculum banks. Removed the Pri 1–6 bank creation logic, the `classifyPri()` function, and the old question upsert loop.

**Why:** Keeping dead code in the seed script caused confusion — every re-run recreated 6 unused banks and printed misleading output.

---

## Admin (Professor Oak) Changes

### Removed 8-character password minimum
**What:** Removed the minimum password length constraint from three places: the client-side `admin.ts` helper, the login page form validation, and the server-side API route.

**Why:** The constraint was unnecessarily restrictive for a private family/classroom deployment. The admin can now choose any password length.

**Files:** `app/src/lib/admin.ts`, `app/src/app/admin/login/page.tsx`, `app/src/app/api/auth/admin-login/route.ts`

### Removed Pri 1–6 dropdown from Users tab
**What:** Removed the "Pri" level dropdown (1–6) from each player card in the admin Users tab. Also removed the description text referencing Singapore Primary levels.

**Why:** The Pri level concept is tied to the old Singapore curriculum and is no longer meaningful. Bank assignment (the dropdown next to it) is the correct mechanism for controlling which question pool a player sees.

**Files:** `app/src/app/admin/tabs/UsersTab.tsx`

### Updated subject lists in admin tabs
**What:** Updated the hardcoded subject arrays in `BanksTab.tsx` and `SubjectsTab.tsx` from `["math", "english", "chinese", "general"]` to `["math", "singapore_trivia"]`.

**Why:** These lists drove the filter dropdowns in the admin UI. They were still referencing the old subjects after the question system was redesigned, causing singapore_trivia questions to be invisible in the admin interface.

**Files:** `app/src/app/admin/tabs/BanksTab.tsx`, `app/src/app/admin/tabs/SubjectsTab.tsx`

### Removed "general" subject
**What:** Removed `general` from subjects.json, SubjectsTab, and BanksTab.

**Why:** No questions were ever seeded for the `general` subject. Keeping it in the UI was misleading.

---

## Player-Facing UI Changes

### Title
**What:** Changed the app title from "Pokemon Math Catcher" to "Pokemon Trivia: Catch **THREE** Pokemon and win a sticker!" (with "THREE" in red).

**Why:** The app is no longer math-only — it covers trivia. The new title sets a clear goal (catch 3) and provides an incentive (sticker), which is motivating for young children.

**File:** `app/src/app/login/page.tsx`

### Difficulty selector replaces Primary level
**What:** Replaced the "Primary level" dropdown (Pri 1–6) on the login screen with a "Difficulty" dropdown showing four human-readable options:
- Easy (PreK – K)
- Medium (Grade 1–3)
- Hard (Grade 4–5)
- Very Hard (Adult)

**Why:** "Pri 1–6" is meaningless outside Singapore schools. "Difficulty" with descriptive labels is immediately understood by any player or parent.

**File:** `app/src/app/login/page.tsx`

### Removed disclaimer text
**What:** Removed two footer notes:
- "Your progress is saved on this device." (login page)
- "This is a local admin. Password is stored in your browser only." (admin login page)

**Why:** Progress is now stored in the cloud (Neon DB), so the first note was factually wrong. The second was unnecessary clutter for a private deployment.

**Files:** `app/src/app/login/page.tsx`, `app/src/app/admin/login/page.tsx`

### Top-right controls: icons → words
**What:** Replaced icon/emoji buttons in the Pokédex header with plain text:
- 🏆 → "Stats"
- 🔊/🔇 → "Sound On" / "Sound Off"
- ⎋ → "Logout"

**Why:** Icons are ambiguous for young readers. Words are immediately clear.

**File:** `app/src/app/pokedex/page.tsx`

### Added "Level up Pokemon by clicking on them"
**What:** Added a hint line below the stats bar on the Pokédex page.

**Why:** New players don't intuitively know that tapping a caught Pokémon starts training. The hint removes that friction.

**File:** `app/src/app/pokedex/page.tsx`

---

## Gameplay Changes

### Random level multiplier (event mode)
**What:** Each correct answer during training now grants 3–9 levels randomly instead of exactly 1. The float label shows the actual gain (e.g. "+7 Levels!").

**Why:** Young children have short attention spans. Rapid level-ups and quick evolution make the game feel rewarding in a short session (e.g. a classroom event or prize stall).

**How to disable after the event:** In `app/src/app/training/[id]/page.tsx`, change:
```ts
const LEVEL_GAIN_MIN = 1;
const LEVEL_GAIN_MAX = 1;
```
No other changes needed.

**File:** `app/src/app/training/[id]/page.tsx`

---

## Utility Scripts Added

| Script | Purpose |
|--------|---------|
| `app/scripts/seed-banks.mjs` | Wipes and re-seeds the 4 curriculum banks from JSON files |
| `app/scripts/wipe-banks.mjs` | Clears all banks and bank_questions from Neon (run before seed) |
| `app/scripts/clear-subjects-override.mjs` | Clears any stale admin subjects override from the DB |
