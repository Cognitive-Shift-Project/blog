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
			thumbnail: z.string().optional(),
			thumbnailAlt: z.string().optional(),
			publishedAt: z.coerce.date(),
			updatedAt: z.coerce.date().optional(),
			tags: z.array(z.string()).default([]),
			draft: z.boolean().default(false),
		}),
})

const skillsArticleCollection = defineCollection({
	loader: glob({
		base: './src/content/skills/articles',
		pattern: '**/index.{md,mdx}',
		generateId: (options) => {
			const result = zSlug.parse(options.entry.replace(/\/index\.(md|mdx)$/, ''))
			invariant(result.trim().length > 0, () => `Invalid skill article slug generated from file path: ${options.entry}`)

			return result
		},
	}),
	schema: () =>
		z.object({
			name: z.string(),
			slug: z.string().optional(),
			type: z.enum(['pdf', 'md', 'folder', 'file', 'other']),
			category: z.string(),
			shortDescription: z.string(),
			description: z.string(),
			keywords: z.array(z.string()).default([]),
			cover: z.string(),
			coverPreview: z.string().optional(),
			resourcePath: z.string(),
			draft: z.boolean().default(false),
		}),
})

const skillsCategoryCollection = defineCollection({
	loader: glob({
		base: './src/content/skills/categories',
		pattern: '**/*.json',
		generateId: (options) => zSlug.parse(options.entry.replace(/\.json$/, '')),
	}),
	schema: () =>
		z.object({
			slug: z.string(),
			name: z.string(),
			description: z.string().default(''),
		}),
})

const skillsManifestoCollection = defineCollection({
	loader: glob({
		base: './src/content/skills',
		pattern: 'manifest.mdx',
		generateId: () => 'manifest',
	}),
	schema: () =>
		z.object({
			title: z.string(),
			description: z.string(),
		}),
})

const skillsSettingsCollection = defineCollection({
	loader: glob({
		base: './src/content/skills',
		pattern: 'settings.json',
		generateId: () => 'settings',
	}),
	schema: () =>
		z.object({
			heroTitle: z.array(z.string()).min(1),
			heroDescription: z.string(),
			searchLabel: z.string(),
			emptyState: z.string(),
			manifestoTitle: z.string(),
			manifestoDescription: z.string(),
			manifestoLinkLabel: z.string(),
		}),
})

export const collections = {
	blog: blogCollection,
	skills_articles: skillsArticleCollection,
	skills_categories: skillsCategoryCollection,
	skills_manifesto: skillsManifestoCollection,
	skills_settings: skillsSettingsCollection,
}
