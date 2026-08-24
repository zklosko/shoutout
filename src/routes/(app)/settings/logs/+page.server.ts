import { auditLog } from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import type { PageServerLoad, Actions } from './$types';
import { desc } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	const logs = await db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(200);
	return { logs };
};

export const actions: Actions = {
	clearLogs: async () => {
		await db.delete(auditLog);
		return { success: true };
	}
};
