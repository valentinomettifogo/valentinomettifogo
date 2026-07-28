import { createHash, timingSafeEqual } from 'node:crypto';

/** Hex sha256. Used for `webhook_token_hash`. */
export function sha256Hex(value: string): string {
	return createHash('sha256').update(value, 'utf8').digest('hex');
}

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
