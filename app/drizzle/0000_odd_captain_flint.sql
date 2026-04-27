CREATE TABLE "admin_questions" (
	"age" integer NOT NULL,
	"subject" text NOT NULL,
	"tier" integer NOT NULL,
	"questions" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_questions_age_subject_tier_pk" PRIMARY KEY("age","subject","tier")
);
--> statement-breakpoint
CREATE TABLE "admin_subjects" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"config" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "caught" (
	"user_id" integer NOT NULL,
	"species_id" integer NOT NULL,
	"ts" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "caught_user_id_species_id_pk" PRIMARY KEY("user_id","species_id")
);
--> statement-breakpoint
CREATE TABLE "evolved" (
	"user_id" integer NOT NULL,
	"species_id" integer NOT NULL,
	"ts" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "evolved_user_id_species_id_pk" PRIMARY KEY("user_id","species_id")
);
--> statement-breakpoint
CREATE TABLE "pokemon_owned" (
	"user_id" integer NOT NULL,
	"species_id" integer NOT NULL,
	"level" integer NOT NULL,
	"evolved" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pokemon_owned_user_id_species_id_pk" PRIMARY KEY("user_id","species_id")
);
--> statement-breakpoint
CREATE TABLE "question_history" (
	"user_id" integer NOT NULL,
	"question_id" text NOT NULL,
	"correct" boolean NOT NULL,
	"review_counter" integer DEFAULT 0 NOT NULL,
	"ts" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "question_history_user_id_question_id_pk" PRIMARY KEY("user_id","question_id")
);
--> statement-breakpoint
CREATE TABLE "user_stats" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"total_answered" integer DEFAULT 0 NOT NULL,
	"correct" integer DEFAULT 0 NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"longest_streak" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"pin_hash" text NOT NULL,
	"role" text DEFAULT 'player' NOT NULL,
	"age" integer DEFAULT 7 NOT NULL,
	"starter_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "caught" ADD CONSTRAINT "caught_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evolved" ADD CONSTRAINT "evolved_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pokemon_owned" ADD CONSTRAINT "pokemon_owned_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_history" ADD CONSTRAINT "question_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_stats" ADD CONSTRAINT "user_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;