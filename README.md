# Pokemon Trivia

A web-based Pokemon catching game where players answer Math and Singapore Trivia
questions to catch and train Gen 1 Pokemon. Designed as a learning-while-playing
tool for events, with a Professor Oak admin dashboard to manage players and question banks.

```
┌─────────────────────────────────────────────┐
│  /login        ←──→  /admin/login           │
│     │                     │                 │
│     ▼                     ▼                 │
│  /pokedex            /admin (dashboard)     │
│     │                     │                 │
│     ├── /encounter/[id]   ├── Users         │
│     ├── /training/[id]    └── Questions     │
│     └── /stats                              │
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
npm run db:push      # create tables in your Neon project
npm run db:seed      # seed questions from JSON files → DB
npm run dev          # http://localhost:3000
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
npm run db:push      # push schema to Neon
npm run db:seed      # populate questions from curriculum JSON files
```

### iPad / mobile access

The app is mobile-responsive. On iPad: open the URL in Safari → Share →
"Add to Home Screen". Players can then launch it like an app icon.

## Question banks

Questions are stored in NeonDB (master source of truth) and can be managed via the
Professor Oak admin panel. The bundled JSON files under `app/data/questions/curriculum/`
are the seed source.

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

### Keeping JSON and DB in sync

If you or admin edit questions in the DB and then redeploy code, running `db:seed`
would overwrite those changes. To prevent this, export the DB back to JSON first:

```bash
cd app
npm run db:export    # pull current DB state → JSON files
git diff data/       # review what changed
# commit if needed, then redeploy
npm run db:seed      # re-seed DB from JSON if schema was wiped
```

### Subject routing

By default, training draws randomly from both subjects. Admin can pin individual
players to one subject in the Users tab (see Professor Oak admin below).

## Grade levels

There are 4 difficulty levels. Assign players in the Professor Oak admin:

| Level | Difficulty |
|-------|-----------|
| preK–K | Easy |
| 1st–3rd Grade | Medium |
| 4th–5th Grade | Hard |
| Adult | Very Hard |

## Professor Oak admin

Visit `/admin/login`. First time, set an admin password. After that, the tabs are:

- **Users** — list all players, assign their grade level, pin subject filter (All / Math / Singapore), reset or delete progress.
- **Questions** — view, create, edit, and delete questions across all difficulty levels.

## Repository layout

```
.
├── README.md                    (this file)
├── app/                         the Next.js application
│   ├── data/
│   │   ├── questions/curriculum/  bundled question JSON files (seed source)
│   │   ├── pokemon.json           Gen 1 Pokemon data
│   │   └── subjects.json          subject routing config
│   ├── drizzle/                 Drizzle migration files
│   ├── public/audio/            chiptune .wav files
│   ├── scripts/                 utility scripts (seed, export)
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
