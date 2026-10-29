# Formbase

An online platform where Creators build Forms and share them publicly so Respondents can fill them in.

## Tech stack

- Tanstack start - React + Server functions
- Typescript
- Tailwind CSS + shadcn
- PostgreSQL + drizzle ORM
- Zod for validations
- React hook forms for forms management
- Betterauth for authentication - Google + Email password

## To run the project locally

1. Copy `.env.example` to `.env`
2. Fill out the environment variables
3. Install dependencies - `pnpm i`
4. Apply migrations to the DB - `pnpm db:migrate`
5. Ensure everything's alright - `pnpm build`
6. Run the dev server - `pnpm dev`
