import { env } from 'cloudflare:workers'

import type { APIRoute } from 'astro'
import { CustomFont, cache, ImageResponse } from 'cf-workers-og/html'

import { DEFAULT_OG_HEIGHT_PX, DEFAULT_OG_WIDTH_PX, OG_TAGLINE, SITE_BRAND_NAME } from '@/constants'
import { loadLocalFont } from '@/lib/og/fonts'
import { getOpenGraphSiteImageTemplate } from '@/lib/og/site-template'

export const prerender = false

/**
 * Cloudflare on production will assume requests for `*.png` are static assets and won't route
 * them to the worker unless `assets.run_worker_first` in `wrangler.jsonc` includes the path/pattern.
 *
 * Alternately you can omit the extension and manually set `Content-Type: image/png` on the
 * response to ensure correct MIME type.
 *
 * @see https://github.com/jillesme/cf-workers-og/tree/main
 * @see https://github.com/jillesme/cf-workers-og/blob/main/examples/worker/src/index.tsx
 */
export const GET: APIRoute = async ({ locals, request }) => {
	// required for font caching
	cache.setExecutionContext(locals.cfContext)

	const atkinsonRegularPromise = loadLocalFont(
		env.ASSETS,
		new URL('/fonts/atkinson-regular.woff', request.url).toString(),
	)

	const atkinsonBoldPromise = loadLocalFont(env.ASSETS, new URL('/fonts/atkinson-bold.woff', request.url).toString())

	return ImageResponse.create(getOpenGraphSiteImageTemplate({ siteName: SITE_BRAND_NAME, tagline: OG_TAGLINE }), {
		format: 'png',
		width: DEFAULT_OG_WIDTH_PX,
		height: DEFAULT_OG_HEIGHT_PX,
		fonts: [
			new CustomFont('Atkinson Hyperlegible', atkinsonRegularPromise, { weight: 400, style: 'normal' }),
			new CustomFont('Atkinson Hyperlegible', atkinsonBoldPromise, { weight: 700, style: 'normal' }),

			// you can load Google Fonts as follows:
			// new GoogleFont('Inter', { weight: 700 }),
		],
	})
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
