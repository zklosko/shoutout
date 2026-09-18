import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { user } from './auth.schema';

export const requests = sqliteTable('requests', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	childNumber: text('child_number').notNull(),
	note: text('note'),
	status: text('status', { enum: ['Pending', 'Approved', 'Rejected', 'Sent', 'Failed'] })
		.notNull()
		.default('Pending'),
	submittedBy: text('submitted_by')
		.notNull()
		.references(() => user.id),
	submittedAt: integer('submitted_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	reviewedBy: text('reviewed_by').references(() => user.id),
	reviewedAt: integer('reviewed_at', { mode: 'timestamp' })
});

export const integrations = sqliteTable('integrations', {
	type: text('type', { enum: ['propresenter', 'companion', 'freeshow'] })
		.primaryKey()
		.notNull(),
	host: text('host').notNull(),
	port: integer('port').notNull(),
	enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true)
});

export const companionSettings = sqliteTable('companion_settings', {
	type: text('id').primaryKey().default('companion'),
	page: integer().notNull().default(1),
	row: integer().notNull().default(0),
	col: integer().notNull().default(0),
	variable: text()
});

export const propresenterSettings = sqliteTable('propresenter_settings', {
	id: text('id').primaryKey().default('propresenter'),
	messageUuid: text(),
	messageName: text(),
	tokenUuid: text(),
	tokenName: text(),
	themeUuid: text(),
	themeName: text()
});

export const auditLog = sqliteTable('audit_log', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	action: text('action').notNull(),
	actorId: text('actor_id'),
	actorName: text('actor_name').notNull(),
	targetType: text('target_type'),
	targetId: text('target_id'),
	details: text('details'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

export const settings = sqliteTable('settings', {
	id: text('id').primaryKey().default('default'),
	flushRetentionDays: integer('flush_retention_days').notNull().default(7)
});

export const maintenance = sqliteTable('maintenance', {
	id: text('id').primaryKey().default('default'),
	lastFlushAt: integer('last_flush_at', { mode: 'timestamp' })
});

export * from './auth.schema';
