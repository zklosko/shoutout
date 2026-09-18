import { env } from '$env/dynamic/private';
import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';

let _auth: ReturnType<typeof betterAuth> | undefined;

function getAuth() {
	if (!_auth) {
		if (!env.ORIGIN) {
			throw new Error('ORIGIN environment variable is required');
		}

		if (!env.BETTER_AUTH_SECRET) {
			throw new Error('BETTER_AUTH_SECRET environment variable is required');
		}
		
		_auth = betterAuth({
			baseURL: env.ORIGIN,
			secret: env.BETTER_AUTH_SECRET,
			database: drizzleAdapter(db, { provider: 'sqlite' }),
			emailAndPassword: { enabled: true, autoSignIn: false },
			user: {
				additionalFields: {
					role: {
						type: 'string',
						required: true,
						defaultValue: 'submitter',
						input: false // prevents self-assignment
					},
					mustChangePassword: {
						type: 'boolean',
						required: false,
						defaultValue: true,
						input: false
					}
				}
			},
			plugins: [
				sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
			]
		});
	}
	return _auth
}

export const auth = new Proxy({} as ReturnType<typeof betterAuth>, {
	get: (_, prop) => getAuth()[prop as keyof ReturnType<typeof betterAuth>]
})
