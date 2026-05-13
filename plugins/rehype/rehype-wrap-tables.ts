import type { Element, Parents, Root } from 'hast'
import { visit } from 'unist-util-visit'

const TABLE_WRAPPER_CLASS = 'table-wrapper'

/**
 * Check if a given parent node is already a wrapper for tables by checking for the class name.
 */
function isAlreadyWrapped(parent: Parents): boolean {
	if (parent.type !== 'element') {
		return false
	}

	const className = parent.properties.className

	if (!Array.isArray(className)) {
		return false
	}

	return className.includes(TABLE_WRAPPER_CLASS)
}

/**
 * Rehype plugin to wrap tables in a div with class `TABLE_WRAPPER_CLASS` to enable custom styling
 * such as rounded corners and horizontal scrolling on smaller viewports.
 *
 * @see astro.config.ts
 */
export function rehypeWrapTables() {
	return (tree: Root): void => {
		visit(tree, 'element', (node, index, parent) => {
			if (node.tagName !== 'table' || !parent || index === undefined) {
				return
			}

			if (isAlreadyWrapped(parent)) {
				return
			}

			const wrapper: Element = {
				type: 'element',
				tagName: 'div',
				properties: { className: [TABLE_WRAPPER_CLASS] },
				children: [node],
			}

			parent.children[index] = wrapper
		})
	}
}
