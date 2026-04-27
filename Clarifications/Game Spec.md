# Pokemon Math Catcher — Game Spec

A web-based Pokemon catching game where a 7-year-old answers math questions to catch and train Gen 1 Pokemon. Designed for learning while playing, with spaced repetition and pokemon-driven difficulty.

---

## 1. Player & Profile

- **Audience:** One 7-year-old (designer's child) — single-player.
- **Login:** Username + 4-digit PIN.
- **Profile data tracked:**
  - Pokedex caught/seen status (per Pokemon)
  - Each owned Pokemon's level (5–100), XP, evolution stage
  - Question history (correct/incorrect, per math skill, per question id) — for spaced repetition
  - Stats: total questions answered, accuracy %, current streak, longest streak

## 2. Storage

- **Phase 1:** Browser `localStorage` only. Single device.
- **Phase 2 (later):** Optional small backend (SQLite + REST) to sync across devices. Designed so the data shape works for both.

## 3. Pokemon Scope

- **Gen 1 only (151 Pokemon).**
- Sprites pulled from **PokeAPI** official-art URLs — no hosting needed.
- Pokemon-evolvable species exist initially as **base form only**; evolutions unlock through training.

## 4. Difficulty Tiers (Pokemon-driven)

| Tier | Pokemon examples | Math content |
|------|------------------|--------------|
| **1 — Easy** | Caterpie, Pidgey, Rattata, Weedle | Addition/subtraction within 10 |
| **2 — Medium** | Mid Pokemon (e.g. Pikachu, Growlithe, Eevee) | Within 20, skip counting (2s/5s/10s) |
| **3 — Hard** | Stage-2 evolutions (Charizard, Blastoise, Venusaur) | Within 100, 2×/5×/10× multiplication |
| **4 — Very Hard** | Legendaries (Mewtwo, Articuno, Zapdos, Moltres, Mew) | Mixed: harder multiplication, place value, simple fractions |

A `pokemon-tiers.json` config maps each Pokedex # → tier.

## 5. Question Bank

- **Source:** LLM-pre-generated batches, stored as JSON.
- **Admin upload:** Designer edits a config file directly to add/replace questions. No admin UI needed yet.
- **Question shape:**
  ```json
  {
    "id": "add-w10-001",
    "tier": 1,
    "skill": "addition_within_10",
    "format": "multiple_choice" | "number_pad",
    "prompt": "3 + 4 = ?",
    "answer": "7",
    "choices": ["5", "6", "7", "8"]
  }
  ```
- **Format mix:** Multiple choice for easy/visual questions; number pad for arithmetic where typing reinforces the answer.
- **Spaced repetition:** Missed questions are tagged and re-surfaced for that player after a delay (e.g. next 1, 3, 7 encounters). New questions drawn from tier pool when no review-due ones exist.

## 6. Core Loop

### Starting state
- New player picks a starter: **Bulbasaur, Charmander, or Squirtle** at **Level 5**.
- Pokedex shows all 151 slots, locked Pokemon shown as silhouettes.

### Encounter (tapping a Pokemon in the Pokedex)
**If not yet caught:**
- Cinematic: "A wild Pidgey appeared!" → sprite bounces in → question modal.
- **3 attempts** = 3 Pokeball throws.
  - **Correct → caught.** Pokemon enters at Level 5. Catch jingle plays (Game Boy Yellow style chiptune).
  - **Wrong → "It broke free!"** soft buzz, retry with new question.
  - **3 wrong → "It got away!"** Pokemon stays uncaught; can retry anytime.

**If already caught (training mode):**
- Framing: "Training Pidgey!" — sprite shown with current level.
- Each correct answer = **+1 level** + happy ding.
- Wrong answers = soft buzz, no level loss, try again.
- Player can stop training anytime.

### Evolution
- Each species has a fixed **evolution level** matching the canonical Pokemon games (e.g. Charmander → Charmeleon at L16, Charmeleon → Charizard at L36).
- On hitting that level: evolution animation, sprite swap, "Pidgey evolved into Pidgeotto!" celebration.
- **Level cap: 100.**

## 7. Completion / Goals

- **Pokedex completion:** Catch all 151.
- **Evolution completion:** Evolve every evolvable species at least once.
- **Stats screen:** total questions, accuracy %, current/longest streak, time played.
- Badges/medals shown for milestones (10 caught, 50 caught, first evolution, full Pokedex, etc.).

## 8. Visual & Audio Feel

- **Visual:** Modern, clean, kid-friendly — bright colors, rounded shapes, big tap targets. Duolingo-ish energy.
- **Audio:**
  - Successful catch → Game Boy Yellow-style chiptune jingle
  - Correct answer → short "ding"
  - Wrong answer → soft, non-punitive buzz
  - Background music optional/togglable
- **No ads, no microtransaction feel, no scary imagery.**
- **No time pressure in v1.** Add later, scaled by rarity (legendaries get a timer, Caterpie does not).

## 9. Screens

1. **Login** — username + PIN keypad
2. **Home / Pokedex grid** — 151 slots, caught vs silhouette, % completion banner
3. **Encounter** — cinematic intro → question modal → result animation
4. **Training** — caught Pokemon, level bar, question modal, evolution animation when triggered
5. **Stats / Trophies** — completion %, accuracy, streak, badges
6. **Settings** — sound on/off, logout

## 10. Tech Stack (proposed)

- **Frontend:** Next.js (React) + TypeScript + Tailwind CSS
- **State/data:** localStorage via a small data layer that can swap to a backend later
- **Sprites:** PokeAPI URLs (`https://raw.githubusercontent.com/PokeAPI/sprites/...`)
- **Audio:** small chiptune `.mp3`/`.ogg` files in `/public/audio`
- **Question generation (offline):** simple Node script calling Claude API to pre-generate JSON banks per tier/skill — committed to repo
- **Hosting (later):** Vercel free tier

## 11. Repo Layout (proposed)

```
/app                  # Next.js pages
  /login
  /pokedex
  /encounter/[id]
  /training/[id]
  /stats
/components           # UI: PokemonCard, QuestionModal, EvolutionAnimation, ...
/lib
  /storage.ts         # localStorage adapter (swappable for backend)
  /spaced-repetition.ts
  /pokemon.ts         # tier mapping, evolution rules
  /questions.ts       # bank loader + selection logic
/data
  /pokemon-tiers.json
  /evolutions.json
  /questions/
    tier-1.json
    tier-2.json
    tier-3.json
    tier-4.json
/public
  /audio              # catch jingle, ding, buzz, bg music
/scripts
  generate-questions.ts   # admin-run LLM batch generator
```

## 12. Admin Workflow

To add new questions:
1. Edit `/data/questions/tier-N.json` directly, **or**
2. Run `node scripts/generate-questions.ts --tier 2 --skill skip_counting --count 50` to generate via LLM
3. Commit & redeploy

To rebalance which Pokemon is which tier:
- Edit `/data/pokemon-tiers.json`

## 13. Open Items / Deferred to Later

- Time pressure (per-rarity timers)
- Multi-profile support (siblings)
- Backend sync across devices
- Sound effects sourcing (chiptune jingles)
- Trainer avatar / customization
- Trading or battles between Pokemon (NOT in scope for v1)
- Gen 2+ Pokemon

## 14. Build Order (suggested)

1. **Skeleton:** Next.js app, login screen, Pokedex grid with locked silhouettes
2. **Starter pick + localStorage** save/load
3. **Question modal** + multiple-choice + number-pad components
4. **Encounter flow** (catch with 3 attempts) for one Pokemon end-to-end
5. **Tier mapping** + question bank loading + spaced repetition
6. **Training flow + evolution animations**
7. **Stats/trophies screen**
8. **Audio polish** (chiptune jingle, ding, buzz)
9. **Question generation script + initial banks**
10. **Playtest with the 7yo, iterate**

---

*Spec built from Clarifications-1, Clarifications-2, Clarification-3, Clarification-4.*
