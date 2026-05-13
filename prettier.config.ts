import type { Config } from 'prettier'

/**
 * Prettier configuration for Astro projects.
 * The settings here are intended to be in sync with those in `biome.jsonc`.
 *
 * The official Astro VSCode extension uses prettier to format `*.astro` files
 * and may reference this config.
 *
 * Refer to `.vscode/settings.json` where `astro-build.astro-vscode` is set as the
 * default formatter for Astro files and Biome is set for TypeScript, etc.
 *
 * Biome's partial support for Astro is currently too buggy for use and is likely
 * to completely clobber `*.astro` files.
 *
 * @see .prettierignore
 */
const config: Config = {
	useTabs: true,
	tabWidth: 2,
	printWidth: 120,
	endOfLine: 'lf',
	trailingComma: 'all',
	semi: false,
	singleQuote: true,
	jsxSingleQuote: false,
	bracketSameLine: false,
	plugins: ['prettier-plugin-astro'],
	overrides: [
		{
			files: '*.astro',
			options: {
				parser: 'astro',
			},
		},
	],
}

export default config
