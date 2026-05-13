import { i18n } from 'astro:config/client'

export const SITE_URL = import.meta.env.SITE
export const BASE_PATHNAME = import.meta.env.BASE_URL

export const IS_DEVELOPMENT = import.meta.env.DEV
export const IS_PRODUCTION = import.meta.env.PROD

export const DEFAULT_LOCALE = i18n?.defaultLocale || 'en'
export const LOCALES = i18n?.locales || [DEFAULT_LOCALE]

export type DateFormat = 'iso' | 'short'
export const DEFAULT_DATE_FORMAT: DateFormat = 'iso'

export const META_TITLE = 'AstroFlareOG'
export const META_DESCRIPTION = 'Open Source Astro theme for Cloudflare Workers by @firxworx'

export const SITE_BRAND_NAME = 'AstroFlareOG'

export const LAYOUT_NAV_LINKS = [
	{ label: 'Blog', href: '/blog/' },
	{ label: 'Docs', href: '/docs/' },
]

/**
 * Short tagline for site OG image (default `/og.png` image off the root pathname).
 */
export const OG_TAGLINE = 'Open Source Theme for Astro + Cloudflare'

export const DEFAULT_OG_WIDTH_PX = 1200
export const DEFAULT_OG_HEIGHT_PX = 630

/**
 * Set to the X (Twitter) handle associated with the author/creator
 * (or `undefined` to omit the `twitter:creator` meta tag).
 */
export const OG_TWITTER_CREATOR_HANDLE: string | undefined = undefined

/**
 * Set to the X (Twitter) handle associated with the site owner / organization
 * (or `undefined` to omit `twitter:site` meta tag).
 */
export const OG_TWITTER_SITE_HANDLE: string | undefined = OG_TWITTER_CREATOR_HANDLE

/**
 * Repository URL for the project.
 * Related to AstroFlareOG starter; may be replaced or removed for your own project.
 */
export const PROJECT_REPO_URL = 'https://github.com/firxworx/astroflare-og-public'
