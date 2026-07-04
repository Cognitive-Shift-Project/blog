# Cognitive Shift Project

A collective exploration of post-LLM AI — cognitive architectures, world models, and autonomous
agents. The central thesis: future AI systems will move beyond autoregressive token prediction toward
richer architectures capable of reasoning, planning, persistent memory, and environment modeling.
This site publishes essays, research notes, and project updates from that exploration.

## Site

URL: TBD — hosted on Astro v6 on Cloudflare Workers, MDX-driven blog.

## Stack

- **Astro v6** with `@astrojs/cloudflare` adapter (hybrid SSR / static)
- **Cloudflare Workers** — zero cold-start edge deployment
- **MDX** — blog as an Astro content collection via `@astrojs/mdx`
- **TailwindCSS v4** — custom `.prose` utility, palette tokens
- **`cf-workers-og`** — dynamic OG image generation (satori + resvg, no Puppeteer)
- **Biome** + **Prettier** — formatting and linting

## Local development

| Command | Action |
| :--- | :--- |
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start dev server at `localhost:4322` |
| `pnpm build` | Build to `./dist/` |
| `pnpm preview` | Preview build locally |
| `pnpm check` | Biome + Prettier + `astro check` |
| `pnpm typecheck` | TypeScript + `astro check` |
| `pnpm preflight` | Typecheck + build in one pass |
| `pnpm skills:content -- validate` | Validate imported skills CMS objects and assets |
| `pnpm skills:content -- rebuild` | Validate skills content and regenerate stale PDF cover previews |
| `pnpm deploy:worker` | Build and deploy via Wrangler |

Copy `wrangler.example.jsonc` → `wrangler.jsonc` and run `pnpm typegen` before first use.

## Editorial CMS

The site includes a Sveltia CMS admin at `/admin/`. It edits blog posts directly in
`src/content/blog/*.mdx` and the imported Skills library in `src/content/skills/**` using the same Astro
content collections that power the public site.

Local CMS workflow:

1. Run the Astro dev server with `pnpm dev`.
2. Open `http://localhost:4322/admin/index.html` in Chrome, Edge, Brave, or another Chromium browser.
3. Click “Work with Local Repository” and select this repository root.
4. Edit content, preview the site, then commit and push changes with Git.

Production CMS workflow:

1. Deploy a Sveltia CMS Authenticator for GitHub OAuth.
2. Set `base_url` in `public/admin/config.yml` to that authenticator URL.
3. Editors sign in with GitHub and create commits against `Cognitive-Shift-Project/blog`.

Draft posts stay hidden from listings, tags, search, RSS, and generated post routes. Draft skills articles
stay hidden from `/skills/`, global search, and generated skill routes.

## Skills Library

Repo B (`cog-ai-intheshell/cognitive-shift`) is imported as the `/skills/` section. The editable source of
truth is CMS-managed:

- `src/content/skills/articles/<slug>/index.mdx` — article metadata and optional Markdown body
- `src/content/skills/categories/*.json` — skills categories
- `src/content/skills/manifest.mdx` — manifesto page
- `src/content/skills/settings.json` — library page copy and labels

Large resource files stay in `public/skills-content/articles/<slug>/` so Astro serves them directly. The
runtime loader in `src/lib/skills.ts` normalizes CMS entries into Repo B-compatible objects with
`contentPath`, `coverPath`, and `coverPreviewPath`.

## Contributing

See CONTRIBUTING.md for the post-authoring workflow and the `pnpm new:post` scaffolder.

## Acknowledgements

Built on the [AstroFlareOG](https://github.com/firxworx) starter by Kevin Firko of Bitcurve Systems,
using [`cf-workers-og`](https://github.com/jillesme/cf-workers-og) by Jilles Soeters.
MIT-licensed where derived.

## License

MIT (see LICENSE if present, else inherit from the AstroFlareOG starter).
