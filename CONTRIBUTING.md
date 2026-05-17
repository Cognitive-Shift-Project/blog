# Contributing to the Cognitive Shift Project

Cognitive Shift is a collective blog exploring post-LLM AI: cognitive architectures, world models,
and autonomous agents. Contributions are welcome — the primary way to contribute is writing or
improving posts. The workflow is designed to be low-friction: fork, write, and open a pull request.

---

## Prerequisites

- **Node.js >= 24.14** and **pnpm 11** installed
- A clone of the repository
- All dependencies installed via `pnpm install`

```bash
git clone https://github.com/Cognitive-Shift-Project/blog.git
cd cognitive-shift-project
pnpm install
```

---

## Running locally

```bash
pnpm dev
```

Starts the dev server at **http://localhost:4322**. The blog listing is at
**http://localhost:4322/blog/**. Changes to MDX files reload automatically.

---

## Writing a post

### The fast way — `pnpm new:post`

The repo ships an interactive scaffolding script. Run:

```bash
pnpm new:post
```

The script walks through five prompts in order:

| Prompt | Default | Behaviour |
|--------|---------|-----------|
| **Title** | — | Required. Used to generate the filename slug. |
| **Description** | _(empty)_ | Optional subtitle shown in the blog listing. Press Enter to skip. |
| **publishedAt** | Today's local date (YYYY-MM-DD) | Press Enter to accept. Must match YYYY-MM-DD if you override. |
| **Draft? (y/N)** | `N` | Drafts are excluded from the blog listing — useful for work-in-progress posts. |
| **Template** | `basic` | Choose `basic` or `showcase`. See descriptions below. |

**Templates:**

- **`basic`** — minimal frontmatter + one `##` heading. Good starting point for most posts.
- **`showcase`** — pre-imports `Callout`, `LinkCard`, `Steps`, and `Divider`; includes usage
  examples inline. Good for component-heavy reference posts.

After the prompts, the script:

- Generates `src/content/blog/YYYY-MM-DD-<slug>.mdx`
- Refuses to overwrite if a file at that path already exists
- Attempts to open the new file in VS Code automatically (requires `code` on `PATH`)

---

### The manual way

Create `src/content/blog/YYYY-MM-DD-your-slug.mdx` with this frontmatter, which must match the
Zod schema defined in `src/content.config.ts`:

```mdx
---
title: Your Post Title
description: Optional short description shown in the blog listing.
publishedAt: 2026-05-17
# updatedAt: 2026-05-20   # optional: last significant edit date
# draft: true             # optional: exclude from blog listing
---

## First section heading

Body content starts here.
```

A few conventions to follow:

- The `YYYY-MM-DD-` filename prefix is for filesystem sorting only — it is stripped from the
  URL slug at build time.
- Leave `draft: true` in the frontmatter while the post is in progress. Remove it when ready.
- The layout renders `title` as the page `<h1>`. Start the body with `##` headings — never
  write a duplicate `# h1` in the post body.

---

## Available MDX components

All components live in `src/components/ui/` and must be imported per-file. There is no
global auto-import.

| Component | Import path | Use for |
|-----------|-------------|---------|
| `Callout` | `@/components/ui/Callout.astro` | Info / tip / warning / danger callout blocks. Props: `type` (`note`\|`tip`\|`warning`\|`danger`), `title?` |
| `Divider` | `@/components/ui/Divider.astro` | Horizontal visual separator between major sections |
| `Figure` | `@/components/ui/Figure.astro` | Images with optional captions. Props: `src`, `alt`, `caption?` |
| `LinkCard` | `@/components/ui/LinkCard.astro` | Styled card linking to an internal or external URL. Props: `href`, `title`, `description?`, `domain?` |
| `ProsCons` | `@/components/ui/ProsCons.astro` | Side-by-side pros and cons lists. Props: `pros: string[]`, `cons: string[]` |
| `Quote` | `@/components/ui/Quote.astro` | Pull quote with optional attribution. Props: `author?`, `title?` |
| `Steps` | `@/components/ui/Steps.astro` | Numbered step-by-step guide — wraps an ordered list |
| `Tabs` + `TabItem` | `@/components/ui/Tabs.astro`, `@/components/ui/TabItem.astro` | Tabbed content or code panels. `Tabs` takes a `tabs: string[]` prop |
| `YouTube` | `@/components/ui/YouTube.astro` | Responsive YouTube embed. Props: `id` (video ID), `start?` (seconds) |

**`Callout` usage example:**

```mdx
import Callout from '@/components/ui/Callout.astro'

<Callout type="tip" title="Quick shortcut">
  Run `pnpm new:post` to scaffold a new post rather than creating the file by hand.
</Callout>
```

The four `type` values map to distinct icon + colour combinations:
`note` (blue), `tip` (green), `warning` (amber), `danger` (red).

**`Steps` usage example:**

```mdx
import Steps from '@/components/ui/Steps.astro'

<Steps>
1. Fork the repository on GitHub.
2. Create a branch: `git checkout -b feat/my-post`.
3. Write your post in `src/content/blog/`.
4. Open a pull request against `main`.
</Steps>
```

`Steps` renders an ordered list with custom styling. Write plain Markdown `1. 2. 3.` inside it.

---

## Reference examples

`docs/examples/blog/` contains the original placeholder posts from the starter theme.
**These files are not built by the site** — each file has a comment at the top explaining this.
They are useful for seeing real-world MDX patterns: frontmatter fields, component imports,
prose structure, and code blocks. Browse them before writing your first post.

---

## Before opening a pull request

Run the following checks — all three must pass before requesting review:

```bash
# Lint and format check (Biome + Prettier)
pnpm check

# Auto-fix any fixable issues, then recheck
pnpm check:fix

# TypeScript and Astro type checking
pnpm typecheck

# Production build — must complete with zero errors
pnpm build

# Shortcut: runs typecheck then build in one command
pnpm preflight
```

Failing builds block merge. Run `pnpm preflight` as a final sanity check before pushing.

---

## Commit style

[Conventional Commits](https://www.conventionalcommits.org/) format is suggested (not enforced
by CI):

```
feat(blog): add post on world models
fix(blog): correct broken link in cognitive-architectures-overview
docs: update contributing guide
chore: update dependencies
```

The scope `blog` covers new or updated posts. Use `docs` for non-post documentation changes
and `chore` for maintenance tasks.

---

## Deployment

Only maintainers deploy. The command is:

```bash
pnpm deploy:worker
```

This runs `pnpm build` and then `wrangler deploy` to Cloudflare Workers. Contributors do not
need Cloudflare credentials or `wrangler` configuration — ignore this step entirely.

---

## Questions & feedback

Open a [GitHub Issue](https://github.com/Cognitive-Shift-Project/blog/issues) or start
a [Discussion](https://github.com/Cognitive-Shift-Project/blog/discussions) on the repo.
