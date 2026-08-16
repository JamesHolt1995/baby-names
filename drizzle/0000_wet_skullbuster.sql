CREATE TABLE "names" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"gender" text NOT NULL,
	"usages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"meaning" text,
	"meaning_url" text,
	"source" text DEFAULT 'api' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "names_name_gender_unique" UNIQUE("name","gender")
);
--> statement-breakpoint
CREATE TABLE "swipes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name_id" integer NOT NULL,
	"action" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "swipes_user_name_unique" UNIQUE("user_id","name_id")
);
--> statement-breakpoint
ALTER TABLE "swipes" ADD CONSTRAINT "swipes_name_id_names_id_fk" FOREIGN KEY ("name_id") REFERENCES "public"."names"("id") ON DELETE cascade ON UPDATE no action;