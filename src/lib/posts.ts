import { marked } from 'marked';
import type { Post } from './types';

const FRONTMATTER_DELIMITER = '---';

interface Frontmatter {
	date: string;
	title: string;
	body: string;
}

function parseFrontmatter(id: string, raw: string): Frontmatter {
	const lines = raw.split('\n');
	if (lines[0]?.trim() !== FRONTMATTER_DELIMITER) {
		throw new Error(`Post "${id}" is missing its frontmatter block`);
	}

	const endIndex = lines.indexOf(FRONTMATTER_DELIMITER, 1);
	if (endIndex === -1) {
		throw new Error(`Post "${id}" frontmatter block is not closed`);
	}

	const fields = new Map<string, string>();
	for (const line of lines.slice(1, endIndex)) {
		const separatorIndex = line.indexOf(':');
		if (separatorIndex === -1) continue;

		const key = line.slice(0, separatorIndex).trim();
		const value = line.slice(separatorIndex + 1).trim();
		fields.set(key, value);
	}

	const date = fields.get('date');
	const title = fields.get('title');
	if (!date || !title) {
		throw new Error(`Post "${id}" frontmatter must include "date" and "title"`);
	}

	return { date, title, body: lines.slice(endIndex + 1).join('\n').trim() };
}

/** Parses a `.md` post file (frontmatter + markdown body) into a renderable {@link Post}. */
export function parsePost(id: string, raw: string): Post {
	const { date, title, body } = parseFrontmatter(id, raw);
	return { id, date, title, html: marked.parse(body, { async: false }) };
}
