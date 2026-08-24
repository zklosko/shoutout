import { db } from '$lib/server/db';
import { requests, settings, maintenance } from '$lib/server/db/schema';
import { and, eq, inArray, lt } from 'drizzle-orm';

const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; //setting for 24 hours, don't check more than once a day

/**
 * Delete older requests from database, amount to go back specified in general settings
 */
export async function flushOldRequests() {
	const row = await db.select().from(maintenance).where(eq(maintenance.id, 'default')).get();
	const lastRun = row?.lastFlushAt?.getTime() ?? 0;

	if (Date.now() - lastRun < CHECK_INTERVAL_MS) return;

	const settingsRow = await db.select().from(settings).where(eq(settings.id, 'default')).get();
	const retentionDays = settingsRow?.flushRetentionDays ?? 7;

	const cutoff = new Date(Date.now() - retentionDays * CHECK_INTERVAL_MS);

	await db
		.delete(requests)
		.where(
			and(
				inArray(requests.status, ['Approved', 'Rejected', 'Sent']),
				lt(requests.submittedAt, cutoff)
			)
		);

	await db
		.insert(maintenance)
		.values({ id: 'default', lastFlushAt: new Date() })
		.onConflictDoUpdate({
			target: maintenance.id,
			set: { lastFlushAt: new Date() }
		});
}
