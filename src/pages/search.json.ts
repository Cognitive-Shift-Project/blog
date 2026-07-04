import type { APIRoute } from 'astro'

import { getBlogPostHref, getPublishedBlogPosts, getReadTimeMinutes } from '@/lib/blog'
import { formatDate } from '@/lib/dates'
import { getPublishedSkillArticles, normalizeSkillArticle } from '@/lib/skills'

type SearchResult = {
	source: 'blog' | 'skills'
	type: string
	title: string
	description: string
	tags: string[]
	href: string
	thumbnail?: string | undefined
	thumbnailAlt?: string | undefined
	publishedAt?: string
	readTime?: number
}

export const GET: APIRoute = async () => {
	const [posts, skillArticles] = await Promise.all([getPublishedBlogPosts(), getPublishedSkillArticles()])
	const skills = skillArticles.map(normalizeSkillArticle)
	const results: SearchResult[] = [
		...posts.map((post) => ({
			source: 'blog' as const,
			type: 'post',
			title: post.data.title,
			description: post.data.description ?? '',
			tags: post.data.tags,
			href: getBlogPostHref(post),
			thumbnail: post.data.thumbnail,
			thumbnailAlt: post.data.thumbnailAlt,
			publishedAt: formatDate(post.data.publishedAt),
			readTime: getReadTimeMinutes(post.body),
		})),
		...skills.map((skill) => ({
			source: 'skills' as const,
			type: skill.type,
			title: skill.name,
			description: skill.description || skill.shortDescription,
			tags: skill.keywords,
			href: skill.href,
		})),
	]

	return new Response(
		JSON.stringify(results),
		{
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
			},
		},
	)
}
