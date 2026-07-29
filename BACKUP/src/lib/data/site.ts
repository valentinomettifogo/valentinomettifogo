/**
 * Fixed copy for the header and footer. It lives here rather than inside the
 * components so the site is maintained by editing data and pushing, like the posts.
 */
export const site = {
	/** The name is split for rendering: the last chunk goes red. */
	nameLead: 'Valentino',
	nameRest: 'Mettifo',
	nameAccent: 'go',

	role: ['BI Consultant', 'Go Developer', 'Veneto, IT'],

	tagline: 'I build small things, often unfinished, almost always in Go.',

	/** The first tag is the one highlighted in red. */
	tags: ['GO', 'SVELTE', 'QLIK'],

	email: 'valentino.mettifogo@gmail.com',

	title: 'Valentino Mettifogo',
	description: 'BI consultant and developer. Qlik Sense Cloud, Go, SvelteKit.'
};
