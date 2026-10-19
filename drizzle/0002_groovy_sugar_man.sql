ALTER TABLE "form" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "form" ALTER COLUMN "status" SET DEFAULT 'unpublished'::text;--> statement-breakpoint
DROP TYPE "public"."form_status";--> statement-breakpoint
CREATE TYPE "public"."form_status" AS ENUM('unpublished', 'published');--> statement-breakpoint
ALTER TABLE "form" ALTER COLUMN "status" SET DEFAULT 'unpublished'::"public"."form_status";--> statement-breakpoint
ALTER TABLE "form" ALTER COLUMN "status" SET DATA TYPE "public"."form_status" USING "status"::"public"."form_status";