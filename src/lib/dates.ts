import { type DateFormat, DEFAULT_DATE_FORMAT, DEFAULT_LOCALE } from '@/constants'
import { ensureValue } from '@/lib/ensure'

export function formatDate(
	date: Date | string,
	format: DateFormat = DEFAULT_DATE_FORMAT,
	locale: Intl.LocalesArgument = DEFAULT_LOCALE,
): string {
	const inputDate = typeof date === 'string' ? new Date(date) : date

	if (format === 'iso') {
		return ensureValue(inputDate.toISOString().split('T')[0], `Invalid date: ${String(date)}`)
	}

	return inputDate.toLocaleDateString(locale, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	})
}
