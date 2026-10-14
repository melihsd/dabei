import {
	OAUTH_CLIENT_ID,
	OAUTH_CLIENT_SECRET,
	OAUTH_REDIRECT_URI,
	OUTLINE_URL
} from '$app/env/private';

export type OutlineUser = { id: string; name: string; email: string; isAdmin: boolean };
export type OutlineGroup = { id: string; name: string };

export function outlineConfigured() {
	return Boolean(OUTLINE_URL && OAUTH_CLIENT_ID && OAUTH_CLIENT_SECRET && OAUTH_REDIRECT_URI);
}

export const outlineRedirectUri = OAUTH_REDIRECT_URI;

const base = () => (OUTLINE_URL ?? '').replace(/\/+$/, '');

/** Where people change their name: their Outline profile. */
export const outlineProfileUrl = () => `${base()}/settings`;

/** Where admins manage people: Outline's member settings. */
export const outlineMembersUrl = () => `${base()}/settings/members`;

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

async function api(token: string, method: string, body: object) {
	const res = await fetch(`${base()}/api/${method}`, {
		method: 'POST',
		headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Outline ${method} failed (${res.status})`);
	return (await res.json()).data;
}

/** Trades the authorization code for the signed-in Outline user and a token for further lookups. */
export async function fetchOutlineUser(
	code: string
): Promise<{ user: OutlineUser; token: string }> {
	const token = await exchangeCode(code);
	const user = await api(token, 'users.info', {});
	if (!user?.id || !user?.name) throw new Error('Outline returned no user');
	return {
		token,
		user: {
			id: String(user.id),
			name: String(user.name),
			email: String(user.email ?? ''),
			isAdmin: user.role === 'admin' || user.isAdmin === true
		}
	};
}

/** All groups of the Outline team, or only those the given user is in. */
export async function fetchOutlineGroups(token: string, userId?: string): Promise<OutlineGroup[]> {
	const groups: OutlineGroup[] = [];
	const limit = 100;
	for (let offset = 0; ; offset += limit) {
		const data = await api(token, 'groups.list', { userId, limit, offset });
		// Newer Outline versions wrap the list in `groups`, older ones return it directly.
		const page: { id: unknown; name: unknown }[] = Array.isArray(data)
			? data
			: (data?.groups ?? []);
		groups.push(...page.map((g) => ({ id: String(g.id), name: String(g.name) })));
		if (page.length < limit) return groups;
	}
}
