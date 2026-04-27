# Pokemon Math Catcher

A web-based Pokemon catching game where a 7-year-old answers math, English,
or Chinese questions to catch and train Gen 1 Pokemon. Designed as a
learning-while-playing tool for one specific kid (the dad's son), with a
Professor Oak admin dashboard for the dad to curate questions and manage
profiles.

```
┌─────────────────────────────────────────────┐
│  /login        ←──→  /admin/login           │
│     │                     │                 │
│     ▼                     ▼                 │
│  /pokedex            /admin (dashboard)     │
│     │                     │                 │
│     ├── /encounter/[id]   ├── Users         │
│     ├── /training/[id]    ├── Subjects      │
│     └── /stats            ├── Ad-hoc Qs     │
│                           └── Export        │
└─────────────────────────────────────────────┘
```

## Stack

- **Frontend / API**: Next.js 16 (App Router) + React 19 + TypeScript +
  Tailwind v4. Single deploy on Vercel.
- **Database**: Postgres (Neon free tier). Drizzle ORM.
- **Auth**: HMAC-signed session cookies (kid PIN, admin password — both
  bcrypt-hashed server-side).
- **Sprites**: PokeAPI public CDN (no hosting needed).
- **Audio**: Pre-rendered chiptune-style WAVs in `app/public/audio/`.

## Local development

```bash
cd app
cp .env.example .env.local
# Fill in DATABASE_URL (Neon) and SESSION_SECRET (32-byte hex)
npm install
npm run db:push   # create tables in your Neon project
npm run dev       # http://localhost:3000
```

`SESSION_SECRET` generator:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Deploying to Vercel

1. Sign in at vercel.com (free tier is enough).
2. **Add New → Project**, import this GitHub repo.
3. **Root Directory**: `app` (the Next.js app lives one folder deep).
4. **Environment Variables**:
   - `DATABASE_URL` — your Neon connection string.
   - `SESSION_SECRET` — fresh 32-byte hex (do **not** reuse the local
     dev secret).
5. Click **Deploy**.
6. After ~1–2 minutes you'll get a `*.vercel.app` URL.

### iPad / mobile access

The app is mobile-responsive. On iPad: open the URL in Safari → Share →
"Add to Home Screen". The kid can then launch it like an app icon.

## Question banks

Question banks live under `app/data/questions/age-<N>/<subject>/tier-<T>.json`.

Currently seeded:
- `age-7/math/` — 4 tiers, ~600 hand-curated arithmetic + multiplication
  + fractions + place-value questions
- `age-7/english/` — 4 tiers, letters → CVC → spelling → harder grammar
- `age-7/chinese/` — 4 tiers, basic chars → greetings → family/objects → sentences
- `age-7/ad-hoc/` — empty stubs (admin populates via Professor Oak UI)
- `age-12/*/*` — empty stubs for when the kid grows out of age-7 banks

Regenerate / re-seed:

```bash
cd app
node scripts/generate-pokemon-data.mjs   # 151 Gen 1 Pokemon + tiers + evolution data
node scripts/generate-questions.mjs       # math banks
node scripts/generate-english-chinese.mjs # english + chinese banks
```

## Professor Oak admin

Visit `/admin/login`. First time, you'll be asked to set an admin password
(8+ chars). After that, the four tabs are:

- **Users** — list all kids on this server, edit their age (which bank
  they get), reset their progress.
- **Subjects** — edit which Pokemon ranges map to which subject. Default:
  Math `[1, 50]` / English `[51, 100]` / Chinese `[101, 151]`. Save edits
  to the cloud (admin only) or export as JSON.
- **Ad-hoc questions** — author per-(age, tier) custom questions in the
  form. Use the Subjects tab to map a Pokemon range to subject `ad-hoc`
  and those questions become the pool for that range.
- **Export** — download cloud config + ad-hoc banks as JSON for the
  audit trail.

## Repository layout

```
.
├── README.md                    (this file)
├── Pokemon Plan.md              original product brief
├── Game Spec.md                 v1 product spec
├── Clarifications-*.md          design Q&A logs
├── app/                         the Next.js application
│   ├── data/                    bundled JSON (Pokemon, questions, subjects)
│   ├── drizzle/                 Drizzle migration files
│   ├── public/audio/            chiptune .wav files
│   ├── scripts/                 content generators (Pokemon + question banks + audio)
│   └── src/
│       ├── app/                 routes (UI + API)
│       ├── components/          shared UI (QuestionModal)
│       └── lib/                 storage / auth / db / questions / subjects / audio
└── ...
```

## Build / typecheck

```bash
cd app
npx tsc --noEmit                 # typecheck
npm run build                    # full Next.js production build
```
