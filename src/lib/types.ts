export interface Post {
	id: string;
	date: string;
	title: string;
	body: string;
	link: string;
	linkLabel: string;
}

export type Role = 'user' | 'analytics' | 'admin';
