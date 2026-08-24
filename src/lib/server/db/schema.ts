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
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	label: text('label').notNull(),
	type: text('type', { enum: ['propresenter', 'companion', 'freeshow'] }).notNull(),
	host: text('host').notNull(),
	port: integer('port').notNull(),
	settings: text('settings', { mode: 'json' }).notNull().default('{}'),
	enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
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
