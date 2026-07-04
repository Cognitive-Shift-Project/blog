import type { APIContext } from 'astro'
import rss from '@astrojs/rss'

import { META_DESCRIPTION, META_TITLE } from '@/constants'
import { getBlogPostHref, getPublishedBlogPosts } from '@/lib/blog'

export async function GET(context: APIContext) {
	const posts = await getPublishedBlogPosts()

	return rss({
		title: META_TITLE,
		description: META_DESCRIPTION,
		site: context.site ?? context.url.origin,
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.publishedAt,
			link: getBlogPostHref(post),
		})),
		customData: '<language>en-us</language>',
	})
}
