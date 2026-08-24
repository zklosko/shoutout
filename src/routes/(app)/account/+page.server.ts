import { db } from '$lib/server/db';
import { user } from '$lib/server/db/auth.schema';
import { eq } from 'drizzle-orm';
import type { Actions } from '../../$types';

export const actions: Actions = {
	clearForcedChangeFlag: async ({ locals }) => {
		await db.update(user).set({ mustChangePassword: false }).where(eq(user.id, locals.user!.id));

		return { success: true };
	}
};
