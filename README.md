# Pokemon Trivia

A web-based Pokemon catching game where players answer Math and Singapore Trivia
questions to catch and train Gen 1 Pokemon. Designed as a learning-while-playing
tool for events, with a Professor Oak admin dashboard to manage players and banks.

```
┌─────────────────────────────────────────────┐
│  /login        ←──→  /admin/login           │
│     │                     │                 │
│     ▼                     ▼                 │
│  /pokedex            /admin (dashboard)     │
│     │                     │                 │
│     ├── /encounter/[id]   ├── Users         │
│     ├── /training/[id]    ├── Subjects      │
│     └── /stats            └── Banks         │
└─────────────────────────────────────────────┘
```

## Stack

- **Frontend / API**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4. Single deploy on Vercel.
- **Database**: Postgres (Neon free tier). Drizzle ORM.
- **Auth**: HMAC-signed session cookies (player PIN, admin password — both bcrypt-hashed server-side).
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
   - `SESSION_SECRET` — fresh 32-byte hex (do **not** reuse the local dev secret).
5. Click **Deploy**.
6. After ~1–2 minutes you'll get a `*.vercel.app` URL.

### First-time setup after deploy

```bash
cd app
npm run db:push                  # push schema to Neon
node scripts/seed-banks.mjs      # create the 4 grade banks in DB
```

### iPad / mobile access

The app is mobile-responsive. On iPad: open the URL in Safari → Share →
"Add to Home Screen". Players can then launch it like an app icon.

## Question banks

Questions live under `app/data/questions/curriculum/` as static JSON files
bundled with the app. No DB seeding needed for questions — edit the JSON and redeploy.

```
data/questions/curriculum/
├── prek-k/
│   ├── math.json
│   └── singapore_trivia.json
├── grade-1-3/
│   ├── math.json
│   └── singapore_trivia.json
├── grade-4-5/
│   ├── math.json
│   └── singapore_trivia.json
└── adult/
    ├── math.json
    └── singapore_trivia.json
```

Each file is a JSON array of questions:

```json
[
  {
    "id": "unique-id",
    "prompt": "Question text",
    "answer": "Correct answer",
    "choices": ["A", "B", "C", "D"]
  }
]
```

### Subject routing

Pokemon are assigned subjects by ID parity:
- **Odd** Pokemon ID → Math
- **Even** Pokemon ID → Singapore Trivia

## Grade banks

There are 4 grade banks. Assign players in the Professor Oak admin:

| Bank | Difficulty |
|------|-----------|
| preK–K | Easy |
| 1st–3rd Grade | Medium |
| 4th–5th Grade | Hard |
| Adult | Very Hard |

## Professor Oak admin

Visit `/admin/login`. First time, set an admin password. After that, the tabs are:

- **Users** — list all players, assign their grade bank, reset progress.
- **Subjects** — configure which Pokemon ID ranges map to which subject.
- **Banks** — view the 4 grade banks and their question counts.

## Repository layout

```
.
├── README.md                    (this file)
├── app/                         the Next.js application
│   ├── data/
│   │   ├── questions/curriculum/  bundled question JSON files
│   │   ├── pokemon.json           Gen 1 Pokemon data
│   │   └── subjects.json          subject routing config
│   ├── drizzle/                 Drizzle migration files
│   ├── public/audio/            chiptune .wav files
│   ├── scripts/                 utility scripts (seed-banks, wipe-banks)
│   └── src/
│       ├── app/                 routes (UI + API)
│       ├── components/          shared UI (QuestionModal)
│       └── lib/                 auth / db / curriculum / subjects / audio
```

## Build / typecheck

```bash
cd app
npx tsc --noEmit                 # typecheck
npm run build                    # full Next.js production build
```
