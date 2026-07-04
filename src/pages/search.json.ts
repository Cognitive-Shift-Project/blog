import type { APIRoute } from 'astro'

import { getBlogPostHref, getPublishedBlogPosts, getReadTimeMinutes } from '@/lib/blog'
import { formatDate } from '@/lib/dates'

export const GET: APIRoute = async () => {
	const posts = await getPublishedBlogPosts()

	return new Response(
		JSON.stringify(
			posts.map((post) => ({
				title: post.data.title,
				description: post.data.description ?? '',
				tags: post.data.tags,
				href: getBlogPostHref(post),
				publishedAt: formatDate(post.data.publishedAt),
				readTime: getReadTimeMinutes(post.body),
			})),
		),
		{
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
			},
		},
	)
}
