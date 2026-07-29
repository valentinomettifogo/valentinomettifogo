import { createHash, timingSafeEqual } from 'node:crypto';

/**
 * Constant-time comparison. It hashes first because `timingSafeEqual` throws on
 * buffers of different length: the hash equalises it without leaking anything.
 */
export function safeEqual(a: string, b: string): boolean {
	return timingSafeEqual(
		createHash('sha256').update(a, 'utf8').digest(),
		createHash('sha256').update(b, 'utf8').digest()
	);
}
