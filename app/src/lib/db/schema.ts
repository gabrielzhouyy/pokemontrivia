import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  primaryKey,
  jsonb,
} from "drizzle-orm/pg-core";

// Users — both player profiles and the admin (Professor Oak) live here,
// distinguished by the `role` column.
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  // bcrypt hash of the plaintext PIN (player) or password (admin).
  pinHash: text("pin_hash").notNull(),
  role: text("role").notNull().default("player"), // 'player' | 'admin'
  age: integer("age").notNull().default(7),
  starterId: integer("starter_id"),
  // Drop 5b: which bank of questions this user draws from. Null = unassigned
  // (player UI falls back to the legacy bundled-JSON picker until 5c flips
  // the runtime to use banks).
  bankId: integer("bank_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// One row per Pokemon a user owns, keyed by (user, species).
// Mirrors `Profile.owned: Record<speciesId, { level, evolved }>`.
export const pokemonOwned = pgTable(
  "pokemon_owned",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    speciesId: integer("species_id").notNull(),
    level: integer("level").notNull(),
    evolved: boolean("evolved").notNull().default(false),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.speciesId] })],
);

// Caught species (set semantics). Mirrors `Profile.caught: number[]`.
export const caught = pgTable(
  "caught",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    speciesId: integer("species_id").notNull(),
    ts: timestamp("ts").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.speciesId] })],
);

// Evolved-from species (set semantics). Mirrors `Profile.evolved: number[]`.
export const evolved = pgTable(
  "evolved",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    speciesId: integer("species_id").notNull(),
    ts: timestamp("ts").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.speciesId] })],
);

// One row per (user, question) tracking the spaced-repetition state.
export const questionHistory = pgTable(
  "question_history",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    questionId: text("question_id").notNull(),
    correct: boolean("correct").notNull(),
    reviewCounter: integer("review_counter").notNull().default(0),
    ts: timestamp("ts").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.questionId] })],
);

// Per-user game stats (single row per user).
export const userStats = pgTable("user_stats", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  totalAnswered: integer("total_answered").notNull().default(0),
  correct: integer("correct").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
});

// Admin overrides — singletons (one row per kind).
// adminSubjects holds the active subjects.json override.
// adminQuestions holds ad-hoc questions per (age, subject, tier).
export const adminSubjects = pgTable("admin_subjects", {
  id: integer("id").primaryKey().default(1), // singleton row id=1
  config: jsonb("config").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const adminQuestions = pgTable(
  "admin_questions",
  {
    age: integer("age").notNull(),
    subject: text("subject").notNull(),
    tier: integer("tier").notNull(),
    questions: jsonb("questions").notNull().$type<unknown[]>(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.age, t.subject, t.tier] })],
);

// ---------------- Drop 5b: master question pool + banks ----------------

// Single source of truth for every question — bundled (seeded from JSON)
// and admin-authored alike. Drop 5c's runtime picker reads from here via
// bank_questions instead of from the JSON files at module load.
export const questions = pgTable("questions", {
  id: text("id").primaryKey(),
  subject: text("subject").notNull(), // 'math' | 'english' | 'chinese' | 'general'
  tier: integer("tier").notNull(),
  // Which age bucket the question was originally authored for (7 or 12).
  // Used as a soft suggestion when admin curates a bank, not a hard filter.
  ageSuggestion: integer("age_suggestion").notNull().default(7),
  prompt: text("prompt").notNull(),
  answer: text("answer").notNull(),
  format: text("format").notNull(), // 'multiple_choice' | 'number_pad' | 'text_pad'
  choices: jsonb("choices").$type<string[] | null>(),
  skill: text("skill").notNull().default("custom"),
  source: text("source").notNull().default("bundled"), // 'bundled' | 'custom'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// A named, reusable collection of questions. Many users can share one bank.
export const banks = pgTable("banks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Many-to-many: which questions are inside a bank.
export const bankQuestions = pgTable(
  "bank_questions",
  {
    bankId: integer("bank_id")
      .notNull()
      .references(() => banks.id, { onDelete: "cascade" }),
    questionId: text("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.bankId, t.questionId] })],
);

export type DbUser = typeof users.$inferSelect;
export type DbPokemonOwned = typeof pokemonOwned.$inferSelect;
export type DbCaught = typeof caught.$inferSelect;
export type DbEvolved = typeof evolved.$inferSelect;
export type DbQuestionHistory = typeof questionHistory.$inferSelect;
export type DbUserStats = typeof userStats.$inferSelect;
export type DbQuestion = typeof questions.$inferSelect;
export type DbBank = typeof banks.$inferSelect;
export type DbBankQuestion = typeof bankQuestions.$inferSelect;
