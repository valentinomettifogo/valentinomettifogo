/**
 * Accepts internal paths only. Without this check, `?next=https://…` would turn
 * the login into an open redirect. The double slash is excluded because `//host`
 * is a protocol-relative URL.
 */
export function safeNext(raw: string | null, fallback = '/alerts'): string {
	if (!raw) return fallback;
	if (!raw.startsWith('/') || raw.startsWith('//')) return fallback;
	return raw;
}
