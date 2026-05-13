import type { APIRoute } from 'astro'

import { IS_PRODUCTION } from '@/constants'

const disallowRobotsTxt = `\
# https://www.rfc-editor.org/rfc/rfc9309
User-agent: *
Disallow: /
`

const getRobotsTxt = (sitemapURL: URL) => `\
# https://www.rfc-editor.org/rfc/rfc9309
User-agent: *
Allow: /
Disallow: /cdn-cgi/

Sitemap: ${sitemapURL.href}
`

/**
 * Take care with Cloudflare Workers as Cloudflare has features to inject its own `robots.txt`
 * content for bots, AI tools, etc. Always check this file on production.
 *
 * @see https://docs.astro.build/en/guides/integrations-guide/sitemap/
 */
export const GET: APIRoute = ({ site }) => {
	const sitemapURL = new URL('sitemap-index.xml', site)
	const robotsTxt = IS_PRODUCTION ? getRobotsTxt(sitemapURL) : disallowRobotsTxt

	return new Response(robotsTxt, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
		},
	})
}
