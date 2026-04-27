-- Drop 6: rename age-related columns to pri_level (Singapore Primary 1-6).
-- Existing data: users.age (7-15) → pri_level (1-6) via clamp(age - 6, 1, 6).
-- questions.age_suggestion was 7 by default; reset to 1 here, the seed
-- script (scripts/seed-banks.mjs) classifies skill -> pri_level after.

ALTER TABLE "users" RENAME COLUMN "age" TO "pri_level";
UPDATE "users" SET "pri_level" = GREATEST(1, LEAST(6, "pri_level" - 6));
ALTER TABLE "users" ALTER COLUMN "pri_level" SET DEFAULT 1;

ALTER TABLE "questions" RENAME COLUMN "age_suggestion" TO "pri_level";
UPDATE "questions" SET "pri_level" = 1 WHERE "pri_level" > 6 OR "pri_level" < 1;
ALTER TABLE "questions" ALTER COLUMN "pri_level" SET DEFAULT 1;
