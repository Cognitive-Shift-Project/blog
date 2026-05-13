import { type ClassValue, clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * Lightweight utility to concatenate multiple css classnames separated by spaces; omits falsey values.
 */
export function cx(...classes: (string | undefined | null | false)[]): string {
	return classes.filter(Boolean).join(' ')
}

/**
 * Extended tailwind-merge.
 * Register any custom classes and utilities here so they can be merged correctly.
 */
const twMerge = extendTailwindMerge({
	override: {},
	extend: {
		theme: {
			text: ['tiny', 'lead', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
		},
	},
})

export function cn(...args: ClassValue[]): string {
	return twMerge(clsx(args))
}
