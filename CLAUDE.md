# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build (Turbopack)
npm start        # Start production server
npm run lint     # Run ESLint
```

No test runner is configured yet.

## Architecture

Next.js 15.5 app using the **App Router** (not Pages Router). All routes live under `app/` as `page.js` files with co-located `*.module.css` for scoped styles. `app/layout.js` is the root layout and the place to add global providers, fonts, and metadata.

**Import alias:** `@/*` resolves to the project root, so use `@/app/...` or `@/components/...` etc. instead of relative paths.

**Rendering model:** Components are Server Components by default. Add `"use client"` only at the component boundary that needs browser APIs or React hooks.

**Styling conventions:** `globals.css` holds CSS custom properties (`--background`, `--foreground`) with dark mode via `prefers-color-scheme`. Component styles go in CSS Modules (`.module.css`).

**API routes:** Place under `app/api/<route>/route.js` following Next.js App Router conventions.
