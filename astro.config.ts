import type { AstroUserConfig } from 'astro'
import { defineConfig, fontProviders } from 'astro/config'
import cloudflare from '@astrojs/cloudflare'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'

import { rehypeWrapTables } from './plugins/rehype/rehype-wrap-tables'

const DEPLOY_DOMAIN = 'cognitive-shift-project.raphael-gabbay.workers.dev'
const ASTRO_SITE = (
	process.env.NODE_ENV === 'production' ? `https://${DEPLOY_DOMAIN}` : 'http://localhost:4321'
) satisfies AstroUserConfig['site']

/**
 * Astro v6 config with Cloudflare adapter.
 *
 * This config must be mutually compatible with the `wrangler.jsonc` configuration especially
 * regarding `base`, `build`, trailing slash scheme, and wrangler's "run_worker_first" setting.
 *
 * Astro does NOT have access to any vars or secrets defined on the Cloudflare side at build-time;
 * the `envField()` feature is NOT integrated with the Cloudflare adapter.
 *
 * @see https://astro.build/config
 * @see https://docs.astro.build/en/guides/integrations-guide/cloudflare/
 * @see https://developers.cloudflare.com/workers/vite-plugin/
 */
export default defineConfig({
	site: ASTRO_SITE,
	base: '/',
	trailingSlash: 'ignore',
	output: 'static',
	devToolbar: {
		enabled: false,
	},
	build: {
		format: 'directory',
	},
	adapter: cloudflare({
		prerenderEnvironment: 'workerd',
		sessionKVBindingName: 'SESSION',
		persistState: true,
		imageService: {
			build: 'compile',
			runtime: 'cloudflare-binding',
		},
		experimental: {
			headersAndRedirectsDevModeSupport: true,
		},
	}),
	integrations: [
		mdx(),
		sitemap({
			// example filter to remove `/api` routes from the sitemap (customize as required)
			// filter: (page) => {
			// 	return ![/^https?:\/\/[^/]+\/api(\/|$)/].some((pattern) => pattern.test(page))
			// },
		}),
	],
	vite: {
		plugins: [tailwindcss()],
		optimizeDeps: {
			exclude: ['astro/runtime/client/dev-toolbar/entrypoint'],
		},
	},
	session: {
		cookie: 'astro-session',
		ttl: 86400, // 24 hours
	},
	i18n: {
		defaultLocale: 'en',
		locales: ['en'],
		routing: {
			prefixDefaultLocale: false,
		},
	},
	image: {
		domains: [DEPLOY_DOMAIN], // e.g. ['images.unsplash.com', 'cdn.pixabay.com', 'cdn.bsky.app']
		remotePatterns: [], // e.g. ['https://example.com/images/**', 'https://**.examplecdn.com/**']
		responsiveStyles: false,
	},
	fonts: [
		{
			provider: fontProviders.fontsource(),
			name: 'Atkinson Hyperlegible Next',
			cssVariable: '--font-atkinson-next',
			weights: ['200 800'],
			styles: ['normal', 'italic'],
			fallbacks: ['system-ui', 'sans-serif'],
		},
		{
			provider: fontProviders.fontsource(),
			name: 'Atkinson Hyperlegible Mono',
			cssVariable: '--font-atkinson-mono',
			weights: ['600 800'],
			styles: ['normal', 'italic'],
			subsets: ['latin'],
			fallbacks: ['ui-monospace', 'monospace'],
		},
	],

	/**
	 * Warning: Astro's new `security.csp` feature is not compatible with shiki and the documented
	 * alternative of Prism is currently not compatible with the Cloudflare Workers runtime (workerd).
	 *
	 * @see https://docs.astro.build/en/reference/configuration-reference/#security
	 */
	security: {
		csp: false,
		checkOrigin: true,
		actionBodySizeLimit: 2 * 1024 * 1024, // 2 MB
		serverIslandBodySizeLimit: 1 * 1024 * 1024, // 1 MB
		allowedDomains: [
			{
				hostname: 'localhost',
				protocol: 'http',
			},
			{
				hostname: DEPLOY_DOMAIN,
				protocol: 'https',
			},
		],
	},

	/**
	 * Warning: Astro's new `security.csp` feature is not compatible with shiki and the documented
	 * alternative of Prism is currently not compatible with the Cloudflare Workers runtime (workerd).
	 *
	 * @see https://docs.astro.build/en/reference/configuration-reference/#markdown-options
	 */
	markdown: {
		shikiConfig: {
			themes: { light: 'github-light', dark: 'github-dark-dimmed' },
			wrap: false,
		},
		rehypePlugins: [rehypeWrapTables],
	},
})
