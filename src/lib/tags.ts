import type { BlogPost } from '@/lib/blog'
import { getBlogPostHref, getPublishedBlogPosts } from '@/lib/blog'
import {
	type NormalizedSkillArticle,
	type SkillArticle,
	getPublishedSkillArticles,
	getSkillArticleHref,
	normalizeSkillArticle,
} from '@/lib/skills'

export type UnifiedTagCount = {
	tag: string
	count: number
	blogCount: number
	skillsCount: number
}

export type TaggedBlogResult = {
	source: 'blog'
	post: BlogPost
	href: string
}

export type TaggedSkillResult = {
	source: 'skills'
	article: SkillArticle
	item: NormalizedSkillArticle
	href: string
}

export type TaggedContent = {
	posts: TaggedBlogResult[]
	skills: TaggedSkillResult[]
}

export function getUnifiedTagHref(tag: string): string {
	return `/tags/${encodeURIComponent(tag)}/`
}

export function getSkillTags(article: SkillArticle): string[] {
	return [...new Set([article.data.category, ...article.data.keywords].filter(Boolean))]
}

export async function getUnifiedTagCounts(): Promise<UnifiedTagCount[]> {
	const [posts, skillArticles] = await Promise.all([getPublishedBlogPosts(), getPublishedSkillArticles()])
	const counts = new Map<string, { blogCount: number; skillsCount: number }>()

	for (const post of posts) {
		for (const tag of post.data.tags) {
			const current = counts.get(tag) ?? { blogCount: 0, skillsCount: 0 }
			current.blogCount += 1
			counts.set(tag, current)
		}
	}

	for (const article of skillArticles) {
		for (const tag of getSkillTags(article)) {
			const current = counts.get(tag) ?? { blogCount: 0, skillsCount: 0 }
			current.skillsCount += 1
			counts.set(tag, current)
		}
	}

	return [...counts.entries()]
		.map(([tag, value]) => ({
			tag,
			blogCount: value.blogCount,
			skillsCount: value.skillsCount,
			count: value.blogCount + value.skillsCount,
		}))
		.sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
}

export async function getTaggedContent(tag: string): Promise<TaggedContent> {
	const [posts, skillArticles] = await Promise.all([getPublishedBlogPosts(), getPublishedSkillArticles()])

	return {
		posts: posts
			.filter((post) => post.data.tags.includes(tag))
			.map((post) => ({
				source: 'blog',
				post,
				href: getBlogPostHref(post),
			})),
		skills: skillArticles
			.filter((article) => getSkillTags(article).includes(tag))
			.map((article) => ({
				source: 'skills',
				article,
				item: normalizeSkillArticle(article),
				href: getSkillArticleHref(article),
			})),
	}
}
