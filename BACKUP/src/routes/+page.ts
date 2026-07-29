// The homepage reads neither cookies nor session, so it can become a static file
// served from the CDN. That is why all auth loading lives inside (protected).
export const prerender = true;
