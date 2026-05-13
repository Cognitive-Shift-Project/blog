// support importing Astro components in TypeScript files
declare module '*.astro'

/**
 * `astro check` currently lacks correct typings for the `Intl` API.
 */
declare namespace Intl {
	interface Locale {
		getTextInfo(): { direction: 'ltr' | 'rtl' }
	}
}
