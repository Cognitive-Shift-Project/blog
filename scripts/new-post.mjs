#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { access, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { stdin as input, stdout as output } from 'node:process'
import readline from 'node:readline/promises'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const BLOG_DIR = path.join(ROOT, 'src', 'content', 'blog')
const TEMPLATES_DIR = path.join(__dirname, 'templates')

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function slugify(input) {
	return input
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
}

function todayLocalIso() {
	const d = new Date()
	const y = d.getFullYear()
	const m = String(d.getMonth() + 1).padStart(2, '0')
	const day = String(d.getDate()).padStart(2, '0')
	return `${y}-${m}-${day}`
}

async function fileExists(p) {
	try {
		await access(p)
		return true
	} catch {
		return false
	}
}

function fail(msg) {
	console.error(`\u2717 ${msg}`)
	process.exit(1)
}

async function main() {
	const rl = readline.createInterface({ input, output })

	let title = ''
	try {
		while (true) {
			title = (await rl.question('Title: ')).trim()
			if (!title) {
				console.log('  Title is required.')
				continue
			}
			if (!slugify(title)) {
				console.log('  Title must contain at least one alphanumeric character.')
				continue
			}
			break
		}

		const description = (await rl.question('Description (optional): ')).trim()

		const defaultDate = todayLocalIso()
		let publishedAt = ''
		while (true) {
			const answer = (await rl.question(`publishedAt [${defaultDate}]: `)).trim()
			publishedAt = answer || defaultDate
			if (!ISO_DATE_RE.test(publishedAt)) {
				console.log('  Date must match YYYY-MM-DD.')
				continue
			}
			const parsed = new Date(`${publishedAt}T00:00:00Z`)
			if (Number.isNaN(parsed.getTime())) {
				console.log('  Not a real calendar date.')
				continue
			}
			break
		}

		const draftRaw = (await rl.question('Draft? (y/N): ')).trim().toLowerCase()
		const draft = draftRaw === 'y' || draftRaw === 'yes'

		let template = ''
		while (true) {
			const answer = (await rl.question('Template — basic or showcase [basic]: ')).trim().toLowerCase()
			const choice = answer || 'basic'
			if (choice === 'basic' || choice === 'showcase') {
				template = choice
				break
			}
			console.log('  Choose "basic" or "showcase".')
		}

		rl.close()

		if (typeof title !== 'string' || title.length === 0) {
			fail('title is required (string).')
		}
		if (!ISO_DATE_RE.test(publishedAt)) {
			fail(`publishedAt "${publishedAt}" does not match YYYY-MM-DD.`)
		}

		const slug = slugify(title)
		if (!slug) fail('Slug is empty after slugify; pick a different title.')

		const filename = `${publishedAt}-${slug}.mdx`
		const outPath = path.join(BLOG_DIR, filename)

		if (await fileExists(outPath)) {
			fail(`Refusing to overwrite existing file: ${outPath}`)
		}

		const templatePath = path.join(TEMPLATES_DIR, `post-${template}.mdx`)
		const raw = await readFile(templatePath, 'utf8')

		const descriptionLine = description ? `description: ${description}\n` : ''
		const draftLine = draft ? `draft: true\n` : ''

		const rendered = raw
			.replaceAll('{{TITLE}}', title)
			.replaceAll('{{DESCRIPTION_LINE}}', descriptionLine)
			.replaceAll('{{PUBLISHED_AT}}', publishedAt)
			.replaceAll('{{DRAFT_LINE}}', draftLine)

		await writeFile(outPath, rendered, 'utf8')
		console.log(`\u2713 Created ${outPath}`)

		try {
			const child = spawn('code', [outPath], {
				detached: true,
				stdio: 'ignore',
				shell: process.platform === 'win32',
			})
			child.on('error', () => {})
			child.unref()
		} catch {
			// swallow — `code` may not be on PATH
		}

		process.exit(0)
	} catch (err) {
		try {
			rl.close()
		} catch {}
		if (err && err.code === 'ERR_USE_AFTER_CLOSE') {
			fail('Aborted.')
		}
		fail(err instanceof Error ? err.message : String(err))
	}
}

main()
