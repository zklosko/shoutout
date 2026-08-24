import { db } from '$lib/server/db';
import { auditLog } from './db/schema';

/**
 * Insert log into database
 * @param params
 */
export async function logEvent(params: {
	action: string;
	actorId: string;
	actorName: string;
	targetType?: string;
	targetId?: string;
	details?: string;
}) {
	await db.insert(auditLog).values(params);
}
