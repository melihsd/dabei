import {
	OAUTH_CLIENT_ID,
	OAUTH_CLIENT_SECRET,
	OAUTH_REDIRECT_URI,
	OUTLINE_URL
} from '$app/env/private';

export type OutlineUser = { id: string; name: string; email: string };

export function outlineConfigured() {
	return Boolean(OUTLINE_URL && OAUTH_CLIENT_ID && OAUTH_CLIENT_SECRET && OAUTH_REDIRECT_URI);
}

export const outlineRedirectUri = OAUTH_REDIRECT_URI;

const base = () => (OUTLINE_URL ?? '').replace(/\/+$/, '');

export function authorizationUrl(state: string) {
	const url = new URL(`${base()}/oauth/authorize`);
	url.searchParams.set('response_type', 'code');
	url.searchParams.set('client_id', OAUTH_CLIENT_ID ?? '');
	url.searchParams.set('redirect_uri', OAUTH_REDIRECT_URI ?? '');
	url.searchParams.set('state', state);
	url.searchParams.set('scope', 'read');
	return url;
}

async function exchangeCode(code: string): Promise<string> {
	const res = await fetch(`${base()}/oauth/token`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			grant_type: 'authorization_code',
			code,
			redirect_uri: OAUTH_REDIRECT_URI ?? '',
			client_id: OAUTH_CLIENT_ID ?? '',
			client_secret: OAUTH_CLIENT_SECRET ?? ''
		})
	});
	if (!res.ok) throw new Error(`Outline token exchange failed (${res.status})`);
	const data = await res.json();
	if (typeof data.access_token !== 'string') throw new Error('Outline returned no access token');
	return data.access_token;
}

/** Trades the authorization code for the signed-in Outline user. */
export async function fetchOutlineUser(code: string): Promise<OutlineUser> {
	const token = await exchangeCode(code);
	const res = await fetch(`${base()}/api/users.info`, {
		method: 'POST',
		headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
		body: '{}'
	});
	if (!res.ok) throw new Error(`Outline user lookup failed (${res.status})`);

	const body = await res.json();
	const user = body.data ?? body;
	if (!user?.id || !user?.name) throw new Error('Outline returned no user');
	return { id: String(user.id), name: String(user.name), email: String(user.email ?? '') };
}
