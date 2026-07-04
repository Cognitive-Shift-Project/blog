import { type CollectionEntry, getCollection } from 'astro:content'

export type BlogPost = CollectionEntry<'blog'>

export type TagCount = {
	tag: string
	count: number
}

export type BlogPostGroup = {
	period: string
	posts: BlogPost[]
}

export const BLOG_POSTS_PER_PAGE = 8
const WORDS_PER_MINUTE = 200

export function isPublishedBlogPost(post: BlogPost, now = new Date()): boolean {
	return !post.data.draft && post.data.publishedAt <= now
}

export async function getPublishedBlogPosts(now = new Date()): Promise<BlogPost[]> {
	const posts = await getCollection('blog', (post) => isPublishedBlogPost(post, now))

	return posts.sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf())
}

export function getBlogPostHref(post: Pick<BlogPost, 'id'>): string {
	return `/blog/${post.id}/`
}

export function getTagHref(tag: string): string {
	return `/tags/${encodeURIComponent(tag)}/`
}

export function getReadTimeMinutes(body: string | undefined): number {
	if (!body) return 1

	const words = body.trim().split(/\s+/).filter(Boolean)
	return Math.max(1, Math.ceil(words.length / WORDS_PER_MINUTE))
}

export function getTagCounts(posts: BlogPost[]): TagCount[] {
	const counts = new Map<string, number>()

	for (const post of posts) {
		for (const tag of post.data.tags) {
			counts.set(tag, (counts.get(tag) ?? 0) + 1)
		}
	}

	return [...counts.entries()]
		.map(([tag, count]) => ({ tag, count }))
		.sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
}

export function getRelatedPosts(post: BlogPost, posts: BlogPost[], limit = 3): BlogPost[] {
	if (post.data.tags.length === 0) return []

	return posts
		.filter((candidate) => candidate.id !== post.id)
		.map((candidate) => ({
			post: candidate,
			sharedTags: candidate.data.tags.filter((tag) => post.data.tags.includes(tag)).length,
		}))
		.filter((candidate) => candidate.sharedTags > 0)
		.sort(
			(a, b) => b.sharedTags - a.sharedTags || b.post.data.publishedAt.valueOf() - a.post.data.publishedAt.valueOf(),
		)
		.slice(0, limit)
		.map((candidate) => candidate.post)
}

export function groupPostsByMonth(posts: BlogPost[]): BlogPostGroup[] {
	const groups: BlogPostGroup[] = []

	for (const post of posts) {
		const period = post.data.publishedAt.toLocaleDateString('en', {
			month: 'long',
			timeZone: 'UTC',
			year: 'numeric',
		})
		const existing = groups.find((group) => group.period === period)

		if (existing) {
			existing.posts.push(post)
		} else {
			groups.push({ period, posts: [post] })
		}
	}

	return groups
}
