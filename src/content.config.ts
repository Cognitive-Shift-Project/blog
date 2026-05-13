import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

import { invariant } from '@/lib/ensure'

const DATE_PREFIX_REGEX = /^\d{4}-\d{2}-\d{2}[-_.]?/
const zSlug = z.string().slugify()

/**
 * Blog collection of markdown files.
 *
 * Each content file can be optionally prefixed with an ISO date (e.g. `2026-01-01-example-post.mdx`)
 * to help sort them on the filesystem and in your editor.
 *
 * The date prefix in filenames will be stripped from the generated `id` / slug via
 * the custom `generateId()` function.
 *
 * Only the `publishedAt` date within the frontmatter is considered by display logic and components.
 */
const blogCollection = defineCollection({
	loader: glob({
		base: './src/content/blog',
		pattern: '**/*.{md,mdx}',
		generateId: (options) => {
			const filePath = options.entry

			const result = zSlug.parse(filePath.replace(DATE_PREFIX_REGEX, '').replace(/\.(md|mdx)$/, ''))
			invariant(result.trim().length > 0, () => `Invalid slug generated from file path: ${filePath}`)

			return result
		},
	}),
	schema: () =>
		z.object({
			title: z.string(),
			description: z.string().optional(),
			publishedAt: z.coerce.date(),
			updatedAt: z.coerce.date().optional(),
			draft: z.boolean().default(false),
		}),
})

export const collections = {
	blog: blogCollection,
}
