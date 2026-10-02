import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	DATABASE_URL: { description: 'Path to the SQLite file.' },
	ADMIN_PASSWORD: { description: 'Password for the settings page.' },
	COOKIE_SECRET: { description: 'Secret used to sign the admin cookie.' }
});
