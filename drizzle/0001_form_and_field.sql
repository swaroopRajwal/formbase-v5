CREATE TYPE "public"."field_type" AS ENUM('short', 'paragraph', 'number', 'url', 'email', 'radio', 'checkbox', 'switch', 'select', 'multi_select', 'date', 'datetime', 'date_range');--> statement-breakpoint
CREATE TYPE "public"."form_status" AS ENUM('draft', 'published', 'closed');--> statement-breakpoint
CREATE TABLE "field" (
	"id" text PRIMARY KEY NOT NULL,
	"form_id" text NOT NULL,
	"type" "field_type" NOT NULL,
	"label" text NOT NULL,
	"helper_text" text DEFAULT '' NOT NULL,
	"required" boolean DEFAULT false NOT NULL,
	"placeholder" text,
	"options" jsonb,
	"allow_other" boolean DEFAULT false NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"status" "form_status" DEFAULT 'draft' NOT NULL,
	"public_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "form_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
ALTER TABLE "field" ADD CONSTRAINT "field_form_id_form_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."form"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form" ADD CONSTRAINT "form_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "field_formId_position_idx" ON "field" USING btree ("form_id","position");--> statement-breakpoint
CREATE INDEX "form_userId_idx" ON "form" USING btree ("user_id");