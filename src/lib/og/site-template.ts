import { SITE_URL } from '@/constants'
import { escapeHtml } from '@/lib/html'
import { ogLogoSvg } from '@/lib/og/og-logo-svg'

export interface OpenGraphSiteImageProps {
	siteName: string
	tagline?: string
	widthPx?: number
	heightPx?: number
}

export function getOpenGraphSiteImageTemplate({
	siteName,
	tagline,
	widthPx = 1200,
	heightPx = 630,
}: OpenGraphSiteImageProps): string {
	const safeTagline: string | undefined = tagline
		? tagline.length > 160
			? `${tagline.slice(0, 157)}…`
			: tagline
		: undefined

	const taglineBlock: string = safeTagline
		? `<div style="display: flex; color: rgba(255,255,255,0.6); font-size: 28px; font-weight: 400; line-height: 1.4; text-align: center; max-width: 900px;">${escapeHtml(safeTagline)}</div>`
		: ''

	const urlBlock: string = SITE_URL
		? `<div style="display: flex; color: rgba(255,255,255,0.35); font-size: 18px; font-weight: 500; letter-spacing: 0.04em;">${escapeHtml(SITE_URL)}</div>`
		: ''

	return `\
	<div style="display: flex; flex-direction: column; width: ${widthPx}px; height: ${heightPx}px; padding: 72px; background: #0b0d12; font-family: 'Atkinson Hyperlegible';">
		<div style="display: flex; flex: 1; flex-direction: column; align-items: center; justify-content: center; gap: 32px;">
			<div style="display: flex;">${ogLogoSvg({ color: 'white', logoHeightPx: 64 })}</div>
			<div style="display: flex; color: #ffffff; font-size: 84px; font-weight: 700; letter-spacing: -0.03em; line-height: 1;">
			${escapeHtml(siteName)}
			</div>
			${taglineBlock}
		</div>
		<div style="display: flex; justify-content: center;">${urlBlock}</div>
	</div>`
}
