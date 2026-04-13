# Echo Finance — Copilot Instructions

## Stack
- Next.js 16 App Router, TypeScript strict
- Tailwind CSS + Shadcn UI (never plain CSS)
- Clerk for auth (useAuth, auth() from @clerk/nextjs)
- Supabase for database (never Prisma)
- Inngest for background jobs (id: 'echo-finance')
- Vercel AI SDK for all AI calls (ai package)
- AI Models: Anthropic (claude-sonnet-4-6, claude-haiku-4-5), OpenAI (gpt-4o-mini), Replicate
- Framer Motion for animations
- React Hook Form + Zod for forms
- Zustand for global state (stores/)
- Sonner for toast notifications

## Code Style
- Always use TypeScript, never JavaScript
- No `any` types — always type properly
- Use `async/await`, never `.then()`
- Named exports for components, default for pages
- Always handle loading + error states
- Use `cn()` utility for conditional classNames

## File Conventions
- Components: PascalCase (UploadZone.tsx)
- Hooks: camelCase with use prefix (useUserStore.ts)
- Utils: camelCase (formatCredits.ts)
- API routes: always in app/api/*/route.ts
- Page sections: sections/<feature>/<feature>.page.tsx
- Stores: stores/<name>.ts (Zustand)
- Types: types/<name>.ts
- Always add 'use client' when using hooks/browser APIs

## Styling Rules
- Dark theme only — bg-zinc-950, bg-zinc-900, bg-zinc-800
- Accent color: violet-500 / violet-600
- Secondary accent: cyan-500
- Text: white, zinc-400 for muted
- Borders: zinc-800
- Never use hardcoded colors — always Tailwind classes
- Glassmorphism: backdrop-blur-md bg-white/5 border border-white/10
- Gradient buttons: bg-gradient-to-r from-violet-600 to-cyan-600

## Auth Pattern
- Server components: import { auth } from '@clerk/nextjs/server'
- Client components: import { useAuth } from '@clerk/nextjs'
- API routes: always check auth first, return 401 if not authenticated

## Database Pattern
- Always use supabase from '@/lib/supabase'
- Always filter by user_id for security
- Always handle errors from Supabase
- Use .single() when expecting one row
- Use upsert for update-or-insert

## Component Pattern
- Always use Shadcn as base
- Extend with Tailwind, never override with CSS
- Use Framer Motion for all animations
- Skeleton loading states for all async content
- Toast notifications via Sonner (not Shadcn toast)
- Use cn() from @/utils/cn for class merging

## API Routes Pattern
- Always validate auth first with auth() from @clerk/nextjs/server
- Always validate input with Zod
- Always return proper HTTP status codes
- Always catch errors and return 500
- Always filter by user_id for row-level security

## Inngest Pattern
- Always use step.run() for each logical unit
- Always update job progress in each step
- Always handle errors gracefully
- Event names: dot-separated (story.generate)
- Client id: 'echo-finance'

## AI Pattern
- Import models from @/lib/ai (story, fast, openaiVoice)
- Use generateObject() with Zod schemas for structured output
- Use generateText() for freeform generation
- Define prompts in lib/prompts.ts