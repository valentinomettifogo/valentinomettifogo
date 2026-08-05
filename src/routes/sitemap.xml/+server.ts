import { listPublishedPosts } from '$lib/server/posts';
import type { RequestHandler } from './$types';

function toUrlEntry(loc: string, lastmod?: string): string {
	const lastmodTag = lastmod ? `<lastmod>${lastmod}</lastmod>` : '';
	return `<url><loc>${loc}</loc>${lastmodTag}</url>`;
}

export const GET: RequestHandler = async ({ url }) => {
	const posts = await listPublishedPosts();

	const entries = [
		toUrlEntry(url.origin),
		toUrlEntry(`${url.origin}/privacy`),
		...posts.map((post) => toUrlEntry(`${url.origin}/posts/${post.id}`, post.date))
	];

	const body = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join('')}</urlset>`;

	return new Response(body, {
		headers: { 'Content-Type': 'application/xml' }
	});
};
