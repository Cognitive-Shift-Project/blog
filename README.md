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
| `pnpm deploy:worker` | Build and deploy via Wrangler |

Copy `wrangler.example.jsonc` → `wrangler.jsonc` and run `pnpm typegen` before first use.

## Contributing

See CONTRIBUTING.md for the post-authoring workflow and the `pnpm new:post` scaffolder.

## Acknowledgements

Built on the [AstroFlareOG](https://github.com/firxworx) starter by Kevin Firko of Bitcurve Systems,
using [`cf-workers-og`](https://github.com/jillesme/cf-workers-og) by Jilles Soeters.
MIT-licensed where derived.

## License

MIT (see LICENSE if present, else inherit from the AstroFlareOG starter).
