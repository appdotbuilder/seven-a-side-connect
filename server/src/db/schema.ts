import { serial, text, pgTable, timestamp, numeric, integer, boolean, pgEnum, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enum definitions
export const userRoleEnum = pgEnum('user_role', ['USER', 'FIELD_OWNER', 'ADMIN']);
export const skillLevelEnum = pgEnum('skill_level', ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']);
export const matchTypeEnum = pgEnum('match_type', ['FRIENDLY', 'COMPETITIVE']);
export const postTypeEnum = pgEnum('post_type', ['FIND_OPPONENT', 'FIELD_AVAILABLE']);
export const matchStatusEnum = pgEnum('match_status', ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']);
export const notificationTypeEnum = pgEnum('notification_type', ['MATCH_REQUEST', 'MATCH_CONFIRMED', 'MATCH_CANCELLED', 'MESSAGE_RECEIVED', 'TEAM_INVITATION']);

// Users table
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  full_name: text('full_name').notNull(),
  phone: text('phone'),
  zalo: text('zalo'),
  role: userRoleEnum('role').notNull().default('USER'),
  city: text('city').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Teams table
export const teamsTable = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  owner_id: integer('owner_id').notNull(),
  city: text('city').notNull(),
  skill_level: skillLevelEnum('skill_level').notNull(),
  description: text('description'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Team members table
export const teamMembersTable = pgTable('team_members', {
  id: serial('id').primaryKey(),
  team_id: integer('team_id').notNull(),
  user_id: integer('user_id').notNull(),
  skill_evaluation: text('skill_evaluation'),
  joined_at: timestamp('joined_at').defaultNow().notNull()
});

// Fields table
export const fieldsTable = pgTable('fields', {
  id: serial('id').primaryKey(),
  owner_id: integer('owner_id').notNull(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  surface_type: text('surface_type').notNull(),
  capacity: integer('capacity').notNull(),
  hourly_rate: numeric('hourly_rate', { precision: 10, scale: 2 }).notNull(),
  description: text('description'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Field availability table
export const fieldAvailabilityTable = pgTable('field_availability', {
  id: serial('id').primaryKey(),
  field_id: integer('field_id').notNull(),
  date: date('date').notNull(),
  start_time: text('start_time').notNull(),
  end_time: text('end_time').notNull(),
  is_booked: boolean('is_booked').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Match posts table
export const matchPostsTable = pgTable('match_posts', {
  id: serial('id').primaryKey(),
  author_id: integer('author_id').notNull(),
  team_id: integer('team_id'),
  field_id: integer('field_id'),
  post_type: postTypeEnum('post_type').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  match_date: date('match_date').notNull(),
  start_time: text('start_time').notNull(),
  end_time: text('end_time').notNull(),
  required_skill_level: skillLevelEnum('required_skill_level').notNull(),
  match_type: matchTypeEnum('match_type').notNull(),
  city: text('city').notNull(),
  contact_phone: text('contact_phone'),
  contact_zalo: text('contact_zalo'),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Matches table
export const matchesTable = pgTable('matches', {
  id: serial('id').primaryKey(),
  post_id: integer('post_id').notNull(),
  team1_id: integer('team1_id').notNull(),
  team2_id: integer('team2_id'),
  field_id: integer('field_id').notNull(),
  match_date: date('match_date').notNull(),
  start_time: text('start_time').notNull(),
  end_time: text('end_time').notNull(),
  status: matchStatusEnum('status').notNull().default('PENDING'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Team ratings table
export const teamRatingsTable = pgTable('team_ratings', {
  id: serial('id').primaryKey(),
  match_id: integer('match_id').notNull(),
  rater_team_id: integer('rater_team_id').notNull(),
  rated_team_id: integer('rated_team_id').notNull(),
  skill_rating: integer('skill_rating').notNull(),
  fair_play_rating: integer('fair_play_rating').notNull(),
  comment: text('comment'),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Messages table
export const messagesTable = pgTable('messages', {
  id: serial('id').primaryKey(),
  sender_id: integer('sender_id').notNull(),
  recipient_id: integer('recipient_id').notNull(),
  match_post_id: integer('match_post_id'),
  content: text('content').notNull(),
  is_read: boolean('is_read').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Notifications table
export const notificationsTable = pgTable('notifications', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull(),
  type: notificationTypeEnum('type').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  related_id: integer('related_id'),
  is_read: boolean('is_read').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Relations
export const usersRelations = relations(usersTable, ({ many }) => ({
  ownedTeams: many(teamsTable),
  teamMemberships: many(teamMembersTable),
  ownedFields: many(fieldsTable),
  authoredPosts: many(matchPostsTable),
  sentMessages: many(messagesTable, { relationName: 'sender' }),
  receivedMessages: many(messagesTable, { relationName: 'recipient' }),
  notifications: many(notificationsTable)
}));

export const teamsRelations = relations(teamsTable, ({ one, many }) => ({
  owner: one(usersTable, {
    fields: [teamsTable.owner_id],
    references: [usersTable.id]
  }),
  members: many(teamMembersTable),
  matchPosts: many(matchPostsTable),
  matches1: many(matchesTable, { relationName: 'team1' }),
  matches2: many(matchesTable, { relationName: 'team2' }),
  givenRatings: many(teamRatingsTable, { relationName: 'rater' }),
  receivedRatings: many(teamRatingsTable, { relationName: 'rated' })
}));

export const teamMembersRelations = relations(teamMembersTable, ({ one }) => ({
  team: one(teamsTable, {
    fields: [teamMembersTable.team_id],
    references: [teamsTable.id]
  }),
  user: one(usersTable, {
    fields: [teamMembersTable.user_id],
    references: [usersTable.id]
  })
}));

export const fieldsRelations = relations(fieldsTable, ({ one, many }) => ({
  owner: one(usersTable, {
    fields: [fieldsTable.owner_id],
    references: [usersTable.id]
  }),
  availability: many(fieldAvailabilityTable),
  matchPosts: many(matchPostsTable),
  matches: many(matchesTable)
}));

export const fieldAvailabilityRelations = relations(fieldAvailabilityTable, ({ one }) => ({
  field: one(fieldsTable, {
    fields: [fieldAvailabilityTable.field_id],
    references: [fieldsTable.id]
  })
}));

export const matchPostsRelations = relations(matchPostsTable, ({ one, many }) => ({
  author: one(usersTable, {
    fields: [matchPostsTable.author_id],
    references: [usersTable.id]
  }),
  team: one(teamsTable, {
    fields: [matchPostsTable.team_id],
    references: [teamsTable.id]
  }),
  field: one(fieldsTable, {
    fields: [matchPostsTable.field_id],
    references: [fieldsTable.id]
  }),
  matches: many(matchesTable),
  messages: many(messagesTable)
}));

export const matchesRelations = relations(matchesTable, ({ one, many }) => ({
  post: one(matchPostsTable, {
    fields: [matchesTable.post_id],
    references: [matchPostsTable.id]
  }),
  team1: one(teamsTable, {
    fields: [matchesTable.team1_id],
    references: [teamsTable.id],
    relationName: 'team1'
  }),
  team2: one(teamsTable, {
    fields: [matchesTable.team2_id],
    references: [teamsTable.id],
    relationName: 'team2'
  }),
  field: one(fieldsTable, {
    fields: [matchesTable.field_id],
    references: [fieldsTable.id]
  }),
  ratings: many(teamRatingsTable)
}));

export const teamRatingsRelations = relations(teamRatingsTable, ({ one }) => ({
  match: one(matchesTable, {
    fields: [teamRatingsTable.match_id],
    references: [matchesTable.id]
  }),
  raterTeam: one(teamsTable, {
    fields: [teamRatingsTable.rater_team_id],
    references: [teamsTable.id],
    relationName: 'rater'
  }),
  ratedTeam: one(teamsTable, {
    fields: [teamRatingsTable.rated_team_id],
    references: [teamsTable.id],
    relationName: 'rated'
  })
}));

export const messagesRelations = relations(messagesTable, ({ one }) => ({
  sender: one(usersTable, {
    fields: [messagesTable.sender_id],
    references: [usersTable.id],
    relationName: 'sender'
  }),
  recipient: one(usersTable, {
    fields: [messagesTable.recipient_id],
    references: [usersTable.id],
    relationName: 'recipient'
  }),
  matchPost: one(matchPostsTable, {
    fields: [messagesTable.match_post_id],
    references: [matchPostsTable.id]
  })
}));

export const notificationsRelations = relations(notificationsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [notificationsTable.user_id],
    references: [usersTable.id]
  })
}));

// Export all tables for relation queries
export const tables = {
  users: usersTable,
  teams: teamsTable,
  teamMembers: teamMembersTable,
  fields: fieldsTable,
  fieldAvailability: fieldAvailabilityTable,
  matchPosts: matchPostsTable,
  matches: matchesTable,
  teamRatings: teamRatingsTable,
  messages: messagesTable,
  notifications: notificationsTable
};