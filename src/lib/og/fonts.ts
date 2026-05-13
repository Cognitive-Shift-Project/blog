import { cache } from 'cf-workers-og/html'

/**
 * Load a font from Cloudflare ASSETS binding.
 *
 * The font format must be supported by `satori`: NO woff2, NO variable fonts.
 */
export async function loadLocalFont(assetsBinding: Fetcher, url: string): Promise<ArrayBuffer> {
	const cfCache = (caches as unknown as { default: Cache }).default

	let response = await cfCache.match(url)

	if (!response) {
		// fetch directly from ASSETS binding (no network round trip or routing)
		response = new Response(
			(await assetsBinding.fetch(new Request(url))).body,
			{ headers: { 'Cache-Control': 's-maxage=15552000' } }, // 6 months in seconds (60 * 60 * 24 * 180)
		)

		// clone for cache.put so the response body remains readable for arrayBuffer()
		cache.waitUntil(cfCache.put(url, response.clone()))
	}

	return response.arrayBuffer()
}
