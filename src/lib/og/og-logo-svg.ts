export interface OgLogoSvgOptions {
	logoHeightPx?: number
	/** CSS color value applied to stroke so the mark renders on dark OG backgrounds. */
	color?: string
}

// square mark — aspect ratio is 1:1
const LOGO_ASPECT_RATIO = 1

// biome-ignore format: SVG path data should not be reformatted
// Outer ring (circle r=29, center 32,32) + two interlocking lobes (ellipse rx=17 ry=10, rotated -40°)
// Lobe 1 center (24,22): start (37.02,11.07) end (10.98,32.93)
// Lobe 2 center (40,42): start (53.02,31.07) end (26.98,52.93)
const LOGO_PATH_D =
  'M 3 32 A 29 29 0 1 0 61 32 A 29 29 0 1 0 3 32 M 37.02 11.07 A 17 10 -40 1 0 10.98 32.93 A 17 10 -40 1 0 37.02 11.07 M 53.02 31.07 A 17 10 -40 1 0 26.98 52.93 A 17 10 -40 1 0 53.02 31.07'

/**
 * Logo SVG markup for Open Graph templates returned as a string `<svg>..</svg>`.
 *
 * Suitable for interpolation into OG image templates passed to `ImageResponse.create(..)`
 * exported by the `cf-workers-og/html` package.
 */
export function ogLogoSvg(options: OgLogoSvgOptions = {}): string {
	const { logoHeightPx = 40, color = 'currentColor' } = options
	const widthPx = logoHeightPx * LOGO_ASPECT_RATIO

	return `\
	<svg xmlns="http://www.w3.org/2000/svg" width="${widthPx}" height="${logoHeightPx}" fill="none" viewBox="0 0 64 64">
		<path fill="none" stroke="${color}" stroke-width="2" d="${LOGO_PATH_D}"/>
	</svg>`
}
