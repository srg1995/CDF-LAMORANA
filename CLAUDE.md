# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun install       # Install dependencies
bun dev           # Dev server at localhost:4321
bun build         # Type-check + build to ./dist/
bun preview       # Preview production build
bun astro check   # TypeScript/Astro type checking only
```

No test suite is configured.

## Architecture

**CDF-LAMORAÑA** is a fishing club (Sociedad Deportiva de Pesca) website built with Astro 5 + React 19 + Tailwind CSS v4, using Bun as package manager. Backend is PocketBase.

### Key conventions

- **Path alias**: `@/` maps to `src/` (configured in `tsconfig.json`)
- **Styling**: Tailwind CSS v4 via `@tailwindcss/vite` plugin (no `tailwind.config` file — configured inline)
- **React islands**: React components use `client:load` directive in Astro pages. Interactive UI lives in `.tsx` files; static layout in `.astro` files
- **No TypeScript `any`**: Strict types required in all `.ts`/`.tsx` files

### Two distinct areas

1. **Public site** (`src/pages/`, `src/layouts/Layout.astro`): Static club website (index, clasificaciones, eventos, pescadores, servicios, contacto, sobre-nosotros, cookies, privacidad). Uses `Layout.astro` with dark `slate-50` background and `Footer.astro`

2. **Admin area** (`src/pages/admin/`): Protected by client-side `sessionStorage` auth (credentials from `PUBLIC_ADMIN_USER` / `PUBLIC_ADMIN_PASSWORD` env vars). Pages: `login.astro`, `index.astro`, `jornadas.astro`. Admin pages have `noindex, nofollow` meta and a dark `slate-900` theme — they do **not** use `Layout.astro`

### PocketBase integration

`src/lib/pocketbase.ts` exports a singleton PocketBase client reading `PUBLIC_POCKETBASE_URL`. 

**Backend:** PocketBase está desplegado en Railway usando el repositorio [srg1995/pocketbase-railway](https://github.com/srg1995/pocketbase-railway).

**Configuración:**
- Production: URL del Railway (ej. `https://your-app.railway.app`)
- Development: Puede usar la instancia Railway o ejecutar PocketBase localmente en `http://127.0.0.1:8090`

### Collections used

- `pescadores`: fields `nombre`, `apellido1`, `apellido2`, `dni`, `num_federativa`, `num_licencia`, `anio_nacimiento`

### Environment variables

| Variable | Purpose |
|---|---|
| `PUBLIC_POCKETBASE_URL` | PocketBase server URL |
| `PUBLIC_ADMIN_USER` | Admin login username |
| `PUBLIC_ADMIN_PASSWORD` | Admin login password |

Create a `.env` file at the root with these variables for local development.
