/**
 * Return the input string normalized to have exactly one leading slash.
 * Returns '/' if input is an empty string.
 */
export function ensureLeadingSlash(input: string): string {
	return `/${input.replace(/^\/+/g, '')}`
}

/**
 * Return the input string normalized to have exactly one trailing slash.
 * Returns '/' if input is an empty string.
 */
export function ensureTrailingSlash(input: string): string {
	return `${input.replace(/\/+$/g, '')}/`
}

/**
 * Return the input string normalized to exactly one leading slash and one trailing slash.
 * Returns '/' for inputs of '', '/', and '//', for consistency when processing pathnames and URLs.
 */
export function ensureSlashes(input: string): string {
	return input === '' || input === '/' || input === '//' ? '/' : `/${input.replace(/(^\/+|\/+$)/g, '')}/`
}

/**
 * Remove all leading slashes from the input string if any are present.
 * Returns an empty string for input '/'.
 */
export function stripLeadingSlashes(input: string): string {
	return input.replace(/^\/+/, '')
}

/**
 * Remove all trailing slashes from the input string if any are present.
 * Returns an empty string for input '/'.
 */
export function stripTrailingSlashes(input: string): string {
	return input.replace(/\/+$/, '')
}

/**
 * Remove all leading and trailing slashes from the input string if any are present.
 * Empty string '' and '/' both return '' for consistency when used to process pathnames and URLs.
 */
export function stripTerminalSlashes(input: string): string {
	return input.replace(/(^\/+|\/+$)/g, '')
}
