import { db } from '$lib/server/db';
import { integrations } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { createDriver } from './factory';

type SendResult = {
	targetId: string;
	targetLabel: string;
	success: boolean;
	error?: string;
};

export async function sendChildNumberToAllTargets(
	childNumber: string,
	note: string | null
): Promise<SendResult[]> {
	const targets = await db.select().from(integrations).where(eq(integrations.enabled, true));

	const results = await Promise.all(
		targets.map(async (row): Promise<SendResult> => {
			const driver = createDriver(row);
			const { success, error } = await driver.sendChildNumber(childNumber, note);
			return { targetId: row.id, targetLabel: row.label, success, error };
		})
	);

	return results;
}
