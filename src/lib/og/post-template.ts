import type { CollectionEntry } from 'astro:content'

import { SITE_URL } from '@/constants'
import { formatDate } from '@/lib/dates'
import { escapeHtml } from '@/lib/html'
import { ogLogoSvg } from '@/lib/og/og-logo-svg'

export interface OpenGraphPostImageProps {
	post: Pick<CollectionEntry<'blog'>['data'], 'title' | 'description' | 'publishedAt' | 'updatedAt'>
	widthPx?: number
	heightPx?: number
}

export function getOpenGraphPostImageTemplate({
	post,
	widthPx = 1200,
	heightPx = 630,
}: OpenGraphPostImageProps): string {
	const { title, description, publishedAt, updatedAt } = post

	const safeTitle = title.length > 80 ? `${title.slice(0, 77)}…` : title
	const safeDescription = description
		? description.length > 140
			? `${description.slice(0, 137)}…`
			: description
		: undefined

	const publishedDisplayDate: string | undefined = publishedAt ? formatDate(publishedAt) : undefined
	const updatedDisplayDate: string | undefined = updatedAt ? formatDate(updatedAt) : undefined
	const showUpdated: boolean = Boolean(updatedDisplayDate && updatedDisplayDate !== publishedDisplayDate)

	// scale title to keep layout stable across short/long titles
	const titleFontSize: string = safeTitle.length > 60 ? '56px' : safeTitle.length > 30 ? '68px' : '78px'

	const dateLine: string = publishedDisplayDate
		? `${escapeHtml(publishedDisplayDate)}${showUpdated && updatedDisplayDate ? ` · Updated ${escapeHtml(updatedDisplayDate)}` : ''}`
		: ''

	const dateBlock: string = publishedDisplayDate
		? `<div style="display: flex; color: rgba(255,255,255,0.5); font-size: 20px; font-weight: 400; letter-spacing: 0.02em;">${dateLine}</div>`
		: ''

	const descriptionBlock: string = safeDescription
		? `<div style="display: flex; color: rgba(255,255,255,0.6); font-size: 24px; font-weight: 400; line-height: 1.4; max-width: 960px;">${escapeHtml(safeDescription)}</div>`
		: ''

	const urlBlock: string = SITE_URL
		? `<div style="display: flex; color: rgba(255,255,255,0.4); font-size: 20px; font-weight: 500; letter-spacing: 0.02em;">${escapeHtml(SITE_URL)}</div>`
		: ''

	return `<div style="display: flex; flex-direction: column; width: ${widthPx}px; height: ${heightPx}px; padding: 72px; background: #0b0d12; font-family: 'Atkinson Hyperlegible'; justify-content: space-between;"><div style="display: flex; align-items: center;">${dateBlock}</div><div style="display: flex; flex-direction: column; gap: 24px;"><div style="display: flex; color: #ffffff; font-size: ${titleFontSize}; font-weight: 700; line-height: 1.1; letter-spacing: -0.02em; max-width: 1000px;">${escapeHtml(safeTitle)}</div>${descriptionBlock}</div><div style="display: flex; align-items: center; justify-content: space-between;"><div style="display: flex; align-items: center;">${ogLogoSvg({ color: 'white' })}</div>${urlBlock}</div></div>`
}
