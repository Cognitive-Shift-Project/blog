import { type CollectionEntry, getCollection, getEntry } from 'astro:content'
import folderManifestData from '@/data/skills-folder-manifest.json'

export type SkillArticle = CollectionEntry<'skills_articles'>
export type SkillCategory = CollectionEntry<'skills_categories'>
export type SkillManifesto = CollectionEntry<'skills_manifesto'>
export type SkillSettings = CollectionEntry<'skills_settings'>['data']

export type SkillContentKind = 'pdf' | 'md' | 'folder' | 'file' | 'other'

export type NormalizedSkillArticle = {
	slug: string
	type: SkillContentKind
	category: string
	name: string
	shortDescription: string
	description: string
	keywords: string[]
	contentPath: string
	coverPath: string
	coverPreviewPath: string
	href: string
	source: 'skills'
}

export type SkillFolderEntry = {
	name: string
	path: string
	href: string
	sizeBytes: number
	extension: string
}

export type SkillCategoryGroup = {
	category: SkillCategory
	articles: SkillArticle[]
}

export async function getPublishedSkillArticles(): Promise<SkillArticle[]> {
	const articles = await getCollection('skills_articles', (article) => !article.data.draft)

	return articles.sort((a, b) => a.data.name.localeCompare(b.data.name) || a.id.localeCompare(b.id))
}

export async function getSkillCategories(): Promise<SkillCategory[]> {
	const categories = await getCollection('skills_categories')

	return categories.sort((a, b) => a.data.name.localeCompare(b.data.name) || a.id.localeCompare(b.id))
}

export async function getSkillSettings(): Promise<SkillSettings> {
	const settings = await getEntry('skills_settings', 'settings')
	if (!settings) {
		throw new Error('Missing skills settings entry.')
	}

	return settings.data
}

export async function getSkillManifesto(): Promise<SkillManifesto> {
	const manifesto = await getEntry('skills_manifesto', 'manifest')
	if (!manifesto) {
		throw new Error('Missing skills manifesto entry.')
	}

	return manifesto
}

export async function getSkillCategoryGroups(): Promise<SkillCategoryGroup[]> {
	const [categories, articles] = await Promise.all([getSkillCategories(), getPublishedSkillArticles()])

	return categories
		.map((category) => ({
			category,
			articles: articles.filter((article) => article.data.category === category.id),
		}))
		.filter((group) => group.articles.length > 0)
}

export function getSkillArticleHref(article: SkillArticle): string {
	return `/skills/${getSkillArticleSlug(article)}/`
}

export function getSkillArticleSlug(article: SkillArticle): string {
	return article.data.slug || article.id
}

export function getSkillManifestoHref(): string {
	return '/skills/manifest/'
}

export function getSkillContentKind(article: Pick<SkillArticle, 'data'>): SkillContentKind {
	const resourcePath = article.data.resourcePath.split(/[?#]/)[0]?.replace(/\/+$/, '').toLowerCase() ?? ''

	if (resourcePath.endsWith('.pdf')) return 'pdf'
	if (resourcePath.endsWith('.md') || resourcePath.endsWith('.mdx')) return 'md'
	if (resourcePath.endsWith('/content') || article.data.type === 'folder') return 'folder'

	return article.data.type
}

export function normalizeSkillArticle(article: SkillArticle): NormalizedSkillArticle {
	const kind = getSkillContentKind(article)

	return {
		slug: getSkillArticleSlug(article),
		type: kind,
		category: article.data.category,
		name: article.data.name,
		shortDescription: article.data.shortDescription,
		description: article.data.description,
		keywords: article.data.keywords,
		contentPath: article.data.resourcePath,
		coverPath: article.data.cover,
		coverPreviewPath: article.data.coverPreview ?? article.data.cover,
		href: getSkillArticleHref(article),
		source: 'skills',
	}
}

export function getSkillFolderEntries(article: NormalizedSkillArticle): SkillFolderEntry[] {
	if (article.type !== 'folder') return []

	const folderManifest = folderManifestData as Record<string, SkillFolderEntry[]>
	return folderManifest[article.slug] ?? []
}

export function getRelatedSkillArticles(article: SkillArticle, articles: SkillArticle[], limit = 3): SkillArticle[] {
	return articles
		.filter((candidate) => candidate.id !== article.id)
		.map((candidate) => ({
			article: candidate,
			score:
				(candidate.data.category === article.data.category ? 2 : 0) +
				candidate.data.keywords.filter((keyword) => article.data.keywords.includes(keyword)).length,
		}))
		.filter((candidate) => candidate.score > 0)
		.sort((a, b) => b.score - a.score || a.article.data.name.localeCompare(b.article.data.name))
		.slice(0, limit)
		.map((candidate) => candidate.article)
}
