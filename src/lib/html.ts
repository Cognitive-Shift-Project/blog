/**
 * Escape a string for safe interpolation inside HTML text content or attribute values.
 * Replaces the five characters that can break out of either context with their corresponding HTML entities.
 */
export function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
}
