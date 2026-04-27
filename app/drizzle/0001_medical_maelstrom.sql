CREATE TABLE "bank_questions" (
	"bank_id" integer NOT NULL,
	"question_id" text NOT NULL,
	CONSTRAINT "bank_questions_bank_id_question_id_pk" PRIMARY KEY("bank_id","question_id")
);
--> statement-breakpoint
CREATE TABLE "banks" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "banks_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" text PRIMARY KEY NOT NULL,
	"subject" text NOT NULL,
	"tier" integer NOT NULL,
	"age_suggestion" integer DEFAULT 7 NOT NULL,
	"prompt" text NOT NULL,
	"answer" text NOT NULL,
	"format" text NOT NULL,
	"choices" jsonb,
	"skill" text DEFAULT 'custom' NOT NULL,
	"source" text DEFAULT 'bundled' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "bank_id" integer;--> statement-breakpoint
ALTER TABLE "bank_questions" ADD CONSTRAINT "bank_questions_bank_id_banks_id_fk" FOREIGN KEY ("bank_id") REFERENCES "public"."banks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_questions" ADD CONSTRAINT "bank_questions_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;