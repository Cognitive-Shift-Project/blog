#!/usr/bin/env node
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { execFileSync, spawnSync } = require('node:child_process')

const root = process.cwd()
const skillsRoot = path.join(root, 'src', 'content', 'skills')
const articleRoot = path.join(skillsRoot, 'articles')
const categoryRoot = path.join(skillsRoot, 'categories')
const folderManifestPath = path.join(root, 'src', 'data', 'skills-folder-manifest.json')
const validTypes = new Set(['pdf', 'md', 'folder', 'file', 'other'])
const limits = {
	article: {
		type: 12,
		category: 40,
		name: 18,
		shortDescription: 42,
		description: 260,
		keyword: 24,
		keywords: 12,
	},
	category: {
		slug: 40,
		name: 28,
		description: 220,
	},
}

main()

function main() {
	try {
		const parsed = parseArgs(process.argv.slice(2))
		if (parsed.help || !parsed.command) {
			printUsage()
			return
		}

		if (parsed.command === 'validate' || parsed.command === 'rebuild') {
			validateSkillsContent({ dryRun: parsed.options.dryRun, generatePreviews: parsed.command === 'rebuild' })
			return
		}

		throw new Error('Unknown command. Run `pnpm skills:content -- --help`.')
	} catch (error) {
		console.error(error.message)
		process.exitCode = 1
	}
}

function parseArgs(args) {
	const options = { dryRun: false }
	const positionals = []

	for (let index = 0; index < args.length; index += 1) {
		const arg = args[index]

		if (arg === '--help' || arg === '-h') return { help: true, options, positionals }
		if (arg === '--dry-run') {
			options.dryRun = true
			continue
		}
		if (arg === '--') continue

		positionals.push(arg)
	}

	return { command: positionals[0], options, positionals }
}

function printUsage() {
	console.log(`Usage:
  pnpm skills:content -- validate
  pnpm skills:content -- rebuild [--dry-run]

The skills content source of truth is src/content/skills/**.
This command validates CMS entries, verifies public assets, checks category references,
and regenerates missing/stale PDF cover previews when running rebuild.`)
}

function validateSkillsContent({ dryRun, generatePreviews }) {
	const categories = readCategories()
	const articles = readArticles()
	const categorySlugs = new Set(categories.map((category) => category.slug))

	for (const category of categories) validateCategory(category)

	for (const article of articles) {
		validateArticle(article)
		if (!categorySlugs.has(article.category)) {
			throw new Error(`Skill article ${article.slug} references missing category ${article.category}.`)
		}
		assertPublicAsset(article.resourcePath, `resourcePath for ${article.slug}`)
		assertPublicAsset(article.cover, `cover for ${article.slug}`)
		if (article.coverPreview) assertPublicAsset(article.coverPreview, `coverPreview for ${article.slug}`)
		maybeBuildCoverPreview(article, { dryRun, generatePreviews })
	}

	writeFolderManifest(buildFolderManifest(articles), { dryRun })

	const action = generatePreviews ? 'rebuilt' : 'validated'
	const suffix = dryRun ? ' (dry run)' : ''
	console.log(`Skills content ${action}${suffix}: ${articles.length} articles, ${categories.length} categories.`)
}

function readCategories() {
	if (!fs.existsSync(categoryRoot)) return []

	return fs
		.readdirSync(categoryRoot)
		.filter((name) => name.endsWith('.json'))
		.sort()
		.map((name) => {
			const slug = path.basename(name, '.json')
			const data = readJson(path.join(categoryRoot, name))
			return { slug, ...data }
		})
}

function readArticles() {
	if (!fs.existsSync(articleRoot)) return []

	return fs
		.readdirSync(articleRoot)
		.filter((name) => !name.startsWith('.'))
		.sort()
		.map((slug) => {
			const entryPath = path.join(articleRoot, slug, 'index.mdx')
			const data = readFrontmatter(entryPath)
			return { slug, ...data }
		})
}

function readFrontmatter(filePath) {
	if (!fs.existsSync(filePath)) throw new Error(`Skill article not found: ${filePath}`)

	const source = fs.readFileSync(filePath, 'utf8')
	const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)
	if (!match) throw new Error(`Missing YAML frontmatter in ${filePath}`)

	const data = {}
	const lines = match[1].split(/\r?\n/)
	for (let index = 0; index < lines.length; index += 1) {
		const line = lines[index]
		const pair = line.match(/^([A-Za-z0-9_-]+):(?:\s*(.*))?$/)
		if (!pair) continue

		const key = pair[1]
		const rawValue = pair[2] ?? ''
		if (rawValue === '') {
			const list = []
			while (index + 1 < lines.length && /^\s+-\s+/.test(lines[index + 1])) {
				index += 1
				list.push(parseScalar(lines[index].replace(/^\s+-\s+/, '')))
			}
			data[key] = list
			continue
		}

		data[key] = parseScalar(rawValue)
	}

	return data
}

function parseScalar(value) {
	const trimmed = String(value).trim()
	if (trimmed === 'true') return true
	if (trimmed === 'false') return false
	if (trimmed.startsWith('"') || trimmed.startsWith("'")) {
		try {
			return JSON.parse(trimmed)
		} catch {
			return trimmed.slice(1, -1)
		}
	}
	return trimmed
}

function readJson(filePath) {
	try {
		return JSON.parse(fs.readFileSync(filePath, 'utf8'))
	} catch (error) {
		throw new Error(`Invalid JSON in ${filePath}: ${error.message}`)
	}
}

function validateArticle(article) {
	const required = ['type', 'category', 'name', 'shortDescription', 'description', 'cover', 'resourcePath']

	for (const key of required) {
		if (!article[key] || typeof article[key] !== 'string') {
			throw new Error(`Skill article ${article.slug} must include string field "${key}".`)
		}
	}

	enforceMaxLength(article.type, limits.article.type, `${article.slug} type`)
	enforceMaxLength(article.category, limits.article.category, `${article.slug} category`)
	enforceMaxLength(article.name, limits.article.name, `${article.slug} name`)
	enforceMaxLength(article.shortDescription, limits.article.shortDescription, `${article.slug} shortDescription`)
	enforceMaxLength(article.description, limits.article.description, `${article.slug} description`)

	if (!validTypes.has(article.type)) {
		throw new Error(`Skill article ${article.slug} type must be one of: ${Array.from(validTypes).join(', ')}.`)
	}

	if (!Array.isArray(article.keywords)) {
		throw new Error(`Skill article ${article.slug} must include keywords as an array.`)
	}

	if (article.keywords.length > limits.article.keywords) {
		throw new Error(`Skill article ${article.slug} keywords must contain at most ${limits.article.keywords} items.`)
	}

	for (const keyword of article.keywords) {
		if (!keyword || typeof keyword !== 'string') {
			throw new Error(`Skill article ${article.slug} keywords must contain only non-empty strings.`)
		}
		enforceMaxLength(keyword, limits.article.keyword, `${article.slug} keyword`)
	}
}

function validateCategory(category) {
	enforceMaxLength(category.slug, limits.category.slug, `Category ${category.slug} slug`)
	if (!category.name || typeof category.name !== 'string') {
		throw new Error(`Category ${category.slug} must include string field "name".`)
	}
	if (typeof category.description !== 'string') {
		throw new Error(`Category ${category.slug} must include string field "description".`)
	}
	enforceMaxLength(category.name, limits.category.name, `Category ${category.slug} name`)
	enforceMaxLength(category.description, limits.category.description, `Category ${category.slug} description`)
}

function assertPublicAsset(publicPath, label) {
	if (!publicPath.startsWith('/')) throw new Error(`${label} must start with "/".`)

	const filePath = path.join(root, 'public', publicPath.replace(/^\/+/, ''))
	if (!fs.existsSync(filePath)) throw new Error(`${label} does not exist: ${publicPath}`)
}

function buildFolderManifest(articles) {
	const manifest = {}

	for (const article of articles) {
		if (article.type !== 'folder') continue

		const publicPath = article.resourcePath.replace(/^\/+/, '').replace(/\/+$/, '')
		const folderPath = path.join(root, 'public', publicPath)
		if (!fs.existsSync(folderPath) || !fs.statSync(folderPath).isDirectory()) {
			manifest[article.slug] = []
			continue
		}

		const entries = []
		visitFolder(folderPath, folderPath, publicPath, entries)
		manifest[article.slug] = entries.sort((a, b) => a.path.localeCompare(b.path))
	}

	return manifest
}

function visitFolder(rootFolder, currentFolder, publicPath, entries) {
	for (const entry of fs.readdirSync(currentFolder, { withFileTypes: true })) {
		if (entry.name.startsWith('.')) continue

		const absoluteEntryPath = path.join(currentFolder, entry.name)
		if (entry.isDirectory()) {
			visitFolder(rootFolder, absoluteEntryPath, publicPath, entries)
			continue
		}

		if (!entry.isFile()) continue

		const relativePath = path.relative(rootFolder, absoluteEntryPath).replaceAll('\\', '/')
		const extension = entry.name.includes('.') ? entry.name.split('.').pop().toLowerCase() : ''

		entries.push({
			name: relativePath,
			path: relativePath,
			href: `/${publicPath}/${relativePath}`.replaceAll('\\', '/'),
			sizeBytes: fs.statSync(absoluteEntryPath).size,
			extension,
		})
	}
}

function writeFolderManifest(manifest, { dryRun }) {
	const nextContent = `${JSON.stringify(manifest, null, 2)}\n`
	const currentContent = fs.existsSync(folderManifestPath) ? fs.readFileSync(folderManifestPath, 'utf8') : ''
	if (currentContent === nextContent) return

	if (dryRun) {
		console.log(`[dry-run] Would update ${path.relative(root, folderManifestPath)}.`)
		return
	}

	fs.mkdirSync(path.dirname(folderManifestPath), { recursive: true })
	fs.writeFileSync(folderManifestPath, nextContent)
	console.log(`Updated ${path.relative(root, folderManifestPath)}.`)
}

function maybeBuildCoverPreview(article, { dryRun, generatePreviews }) {
	if (!article.cover.toLowerCase().endsWith('.pdf')) return

	const coverPath = path.join(root, 'public', article.cover.replace(/^\/+/, ''))
	const previewPath = article.coverPreview
		? path.join(root, 'public', article.coverPreview.replace(/^\/+/, ''))
		: coverPath.replace(/\.pdf$/i, '-preview.png')

	const needsPreview = !fs.existsSync(previewPath) || fs.statSync(previewPath).mtimeMs < fs.statSync(coverPath).mtimeMs
	if (!needsPreview) return

	if (dryRun || !generatePreviews) {
		console.log(`[dry-run] Would generate cover preview for ${article.slug}.`)
		return
	}

	const pdftoppm = findPdfToPpm()
	if (!pdftoppm) {
		throw new Error('A cover PDF needs a preview, but pdftoppm was not found. Install Poppler or set PDFTOPPM.')
	}

	const prefix = previewPath.replace(/\.png$/i, '')
	execFileSync(pdftoppm, ['-png', '-singlefile', '-r', '144', coverPath, prefix], {
		stdio: 'pipe',
		shell: process.platform === 'win32' && pdftoppm.toLowerCase().endsWith('.cmd'),
	})
	console.log(`Generated cover preview for ${article.slug}.`)
}

function findPdfToPpm() {
	if (process.env.PDFTOPPM && fs.existsSync(process.env.PDFTOPPM)) return process.env.PDFTOPPM

	const found =
		process.platform === 'win32'
			? spawnSync('where.exe', ['pdftoppm'], { encoding: 'utf8' })
			: spawnSync('command', ['-v', 'pdftoppm'], { shell: true, encoding: 'utf8' })
	const firstLine = found.stdout?.split(/\r?\n/).find(Boolean)
	if (firstLine) {
		const commandPath = firstLine.trim()
		const resolvedPopplerExe = commandPath.replace(/\\bin\\pdftoppm\.cmd$/i, '\\native\\poppler\\Library\\bin\\pdftoppm.exe')
		if (fs.existsSync(resolvedPopplerExe)) return resolvedPopplerExe
		return commandPath
	}

	const bundled = path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/pdftoppm')
	const bundledExe = path.join(
		os.homedir(),
		'.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin/pdftoppm.exe',
	)
	if (fs.existsSync(bundledExe)) return bundledExe
	return fs.existsSync(bundled) ? bundled : null
}

function enforceMaxLength(value, max, label) {
	if (String(value).length > max) {
		throw new Error(`${label} must be ${max} characters or fewer.`)
	}
}
