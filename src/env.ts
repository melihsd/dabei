import { defineEnvVars } from '@sveltejs/kit/env';

// Optional: empty means "not set".
const optional = (value: string | undefined) => value || undefined;

export const variables = defineEnvVars({
	DATABASE_URL: { description: 'Path to the SQLite file.' },
	ADMIN_PASSWORD: { description: 'Password for the settings page.' },
	COOKIE_SECRET: { description: 'Secret used to sign the admin and login cookies.' },
	OUTLINE_URL: {
		schema: optional,
		description: 'Base URL of your Outline instance (optional login).'
	},
	OAUTH_CLIENT_ID: { schema: optional, description: 'OAuth client id registered in Outline.' },
	OAUTH_CLIENT_SECRET: {
		schema: optional,
		description: 'OAuth client secret registered in Outline.'
	},
	OAUTH_REDIRECT_URI: {
		schema: optional,
		description: 'Callback URL registered in Outline, e.g. https://dabei.example.com/auth/callback.'
	}
});
