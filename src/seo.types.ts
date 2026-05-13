import type { CollectionEntry, CollectionKey } from 'astro:content'

type BaseSeoMeta = {
	title: string
	description?: string | undefined
	robots?: 'noindex' | 'noindex,nofollow' | 'nofollow' | undefined
}

export type SeoMetaType = 'page' | Extract<CollectionKey, 'blog'>

export type PostSeoMeta = BaseSeoMeta &
	Pick<CollectionEntry<'blog'>['data'], 'publishedAt' | 'updatedAt'> & {
		type: 'blog'
		ogImageUrl?: string | undefined // support override of default dynamic OG image generation
		canonicalUrl?: string | undefined // support override for cross-posted content or legacy URLs
	}

export type PageSeoMeta = BaseSeoMeta & {
	type: 'page'
	ogImageUrl?: string | undefined // optional custom static OG image for any pages (defaults to /og.png)
}

export type SeoMeta<T extends SeoMetaType = 'page'> = T extends 'blog'
	? PostSeoMeta
	: T extends 'page'
		? PageSeoMeta
		: never
