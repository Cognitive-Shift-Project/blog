# Example Blog Posts

These MDX files are **reference samples** kept outside the published site. They are not picked up by Astro's content collection loader (which globs `src/content/blog/**/*.{md,mdx}`) and are therefore never rendered or included in the build output.

## Purpose

| What they show | Details |
|---|---|
| **Frontmatter shape** | Each file's frontmatter matches the Zod schema defined in `src/content.config.ts` — use them as a template when writing new posts. |
| **MDX usage** | They demonstrate standard Markdown as well as MDX features such as importing and rendering JSX components inline. |
| **Custom UI components** | Several files import components from `src/components/ui/` (e.g. `Badge`, `Callout`, `Steps`, `Tabs`). Import paths are left as-is so they remain accurate relative to the live source tree. |

## Resurrecting a sample as a live post

1. Copy or move the file back to `src/content/blog/` — keep the `YYYY-MM-DD-` filename prefix.
2. Remove the `<!-- Reference example … -->` comment at the top of the file.
3. Verify that any component imports resolve correctly from the new location.
4. Run `pnpm check` to catch TypeScript / Astro type errors.
5. Run `pnpm build` to confirm the post builds without errors.

## Contributing new posts

See [CONTRIBUTING.md](../../CONTRIBUTING.md) (available after phase 3) for the full authoring guide, including frontmatter requirements, image conventions, and the review process.
