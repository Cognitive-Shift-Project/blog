import { env } from 'cloudflare:workers'

import { getCollection } from 'astro:content'
import type { APIRoute } from 'astro'
import { CustomFont, cache, ImageResponse } from 'cf-workers-og/html'

import { DEFAULT_OG_HEIGHT_PX, DEFAULT_OG_WIDTH_PX } from '@/constants'
import { loadLocalFont } from '@/lib/og/fonts'
import { getOpenGraphPostImageTemplate } from '@/lib/og/post-template'

export const prerender = false

/**
 * Generate an OG image for a blog post using Cloudflare Workers and the workers-og library.
 *
 * The path pattern of this endpoint must be included in `assets.run_worker_first` of the `wrangler.jsonc` config.
 *
 * Route renamed back to `og.png.ts` with our custom middleware that skips trailing slash for file extensions.
 *
 * This route _was_ named `og.ts` with `trailingSlash: always` because it adds a trailing slash to the path
 * for non-root pages and URLs with `/og.png/` are awkward vs. `/og/`.
 */
export const GET: APIRoute = async ({ locals, request, params }) => {
	if (!params.slug) {
		console.warn(`Post slug not provided in request for post OG image: ${request.url}`)
		return new Response('Not found', { status: 404 })
	}

	const currentDate = new Date()
	const posts = await getCollection('blog', ({ data }) => !data.draft && data.publishedAt <= currentDate)
	const post = posts.find((post) => post.id === params.slug)

	if (!post) {
		console.warn(`Post not found in request for post OG image: ${request.url}`)
		return new Response('Not found', { status: 404 })
	}

	// required for font caching
	cache.setExecutionContext(locals.cfContext)

	const atkinsonRegularPromise = loadLocalFont(
		env.ASSETS,
		new URL('/fonts/atkinson-regular.woff', request.url).toString(),
	)

	const atkinsonBoldPromise = loadLocalFont(env.ASSETS, new URL('/fonts/atkinson-bold.woff', request.url).toString())

	return ImageResponse.create(
		getOpenGraphPostImageTemplate({ post: post.data, widthPx: DEFAULT_OG_WIDTH_PX, heightPx: DEFAULT_OG_HEIGHT_PX }),
		{
			format: 'png',
			width: DEFAULT_OG_WIDTH_PX,
			height: DEFAULT_OG_HEIGHT_PX,
			fonts: [
				new CustomFont('Atkinson Hyperlegible', atkinsonRegularPromise, { weight: 400, style: 'normal' }),
				new CustomFont('Atkinson Hyperlegible', atkinsonBoldPromise, { weight: 700, style: 'normal' }),
			],
		},
	)
}

export const ALL: APIRoute = ({ request }) => {
	return new Response(JSON.stringify({ error: `Method ${request.method} Not Allowed` }), {
		status: 405,
		headers: {
			'Content-Type': 'application/json',
			Allow: 'GET',
		},
	})
}
