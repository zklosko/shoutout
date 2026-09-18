import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

let _db: ReturnType<typeof drizzle> | undefined;

function getDb() {
	if (!_db) {
		if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
		_db = drizzle(new Database(env.DATABASE_URL), { schema });
	}
	return _db;
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
	get: (_, prop) => getDb()[prop as keyof ReturnType<typeof drizzle>]
});
