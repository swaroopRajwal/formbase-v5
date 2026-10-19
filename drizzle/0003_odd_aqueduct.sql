CREATE TABLE "submission" (
	"id" text PRIMARY KEY NOT NULL,
	"form_id" text NOT NULL,
	"answers" jsonb NOT NULL,
	"snapshot" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "submission" ADD CONSTRAINT "submission_form_id_form_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."form"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "submission_formId_idx" ON "submission" USING btree ("form_id");