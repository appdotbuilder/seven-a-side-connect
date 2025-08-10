import { z } from 'zod';

// Enum definitions
export const userRoleEnum = z.enum(['USER', 'FIELD_OWNER', 'ADMIN']);
export type UserRole = z.infer<typeof userRoleEnum>;

export const skillLevelEnum = z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']);
export type SkillLevel = z.infer<typeof skillLevelEnum>;

export const matchTypeEnum = z.enum(['FRIENDLY', 'COMPETITIVE']);
export type MatchType = z.infer<typeof matchTypeEnum>;

export const postTypeEnum = z.enum(['FIND_OPPONENT', 'FIELD_AVAILABLE']);
export type PostType = z.infer<typeof postTypeEnum>;

export const matchStatusEnum = z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']);
export type MatchStatus = z.infer<typeof matchStatusEnum>;

export const notificationTypeEnum = z.enum(['MATCH_REQUEST', 'MATCH_CONFIRMED', 'MATCH_CANCELLED', 'MESSAGE_RECEIVED', 'TEAM_INVITATION']);
export type NotificationType = z.infer<typeof notificationTypeEnum>;

// User schema
export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  password_hash: z.string(),
  full_name: z.string(),
  phone: z.string().nullable(),
  zalo: z.string().nullable(),
  role: userRoleEnum,
  city: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

// Team schema
export const teamSchema = z.object({
  id: z.number(),
  name: z.string(),
  owner_id: z.number(),
  city: z.string(),
  skill_level: skillLevelEnum,
  description: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Team = z.infer<typeof teamSchema>;

// Team member schema
export const teamMemberSchema = z.object({
  id: z.number(),
  team_id: z.number(),
  user_id: z.number(),
  skill_evaluation: z.string().nullable(),
  joined_at: z.coerce.date()
});

export type TeamMember = z.infer<typeof teamMemberSchema>;

// Field schema
export const fieldSchema = z.object({
  id: z.number(),
  owner_id: z.number(),
  name: z.string(),
  address: z.string(),
  city: z.string(),
  surface_type: z.string(),
  capacity: z.number().int(),
  hourly_rate: z.number(),
  description: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Field = z.infer<typeof fieldSchema>;

// Field availability schema
export const fieldAvailabilitySchema = z.object({
  id: z.number(),
  field_id: z.number(),
  date: z.coerce.date(),
  start_time: z.string(),
  end_time: z.string(),
  is_booked: z.boolean(),
  created_at: z.coerce.date()
});

export type FieldAvailability = z.infer<typeof fieldAvailabilitySchema>;

// Match post schema
export const matchPostSchema = z.object({
  id: z.number(),
  author_id: z.number(),
  team_id: z.number().nullable(),
  field_id: z.number().nullable(),
  post_type: postTypeEnum,
  title: z.string(),
  description: z.string().nullable(),
  match_date: z.coerce.date(),
  start_time: z.string(),
  end_time: z.string(),
  required_skill_level: skillLevelEnum,
  match_type: matchTypeEnum,
  city: z.string(),
  contact_phone: z.string().nullable(),
  contact_zalo: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type MatchPost = z.infer<typeof matchPostSchema>;

// Match schema
export const matchSchema = z.object({
  id: z.number(),
  post_id: z.number(),
  team1_id: z.number(),
  team2_id: z.number().nullable(),
  field_id: z.number(),
  match_date: z.coerce.date(),
  start_time: z.string(),
  end_time: z.string(),
  status: matchStatusEnum,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Match = z.infer<typeof matchSchema>;

// Team rating schema
export const teamRatingSchema = z.object({
  id: z.number(),
  match_id: z.number(),
  rater_team_id: z.number(),
  rated_team_id: z.number(),
  skill_rating: z.number().int().min(1).max(5),
  fair_play_rating: z.number().int().min(1).max(5),
  comment: z.string().nullable(),
  created_at: z.coerce.date()
});

export type TeamRating = z.infer<typeof teamRatingSchema>;

// Message schema
export const messageSchema = z.object({
  id: z.number(),
  sender_id: z.number(),
  recipient_id: z.number(),
  match_post_id: z.number().nullable(),
  content: z.string(),
  is_read: z.boolean(),
  created_at: z.coerce.date()
});

export type Message = z.infer<typeof messageSchema>;

// Notification schema
export const notificationSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  type: notificationTypeEnum,
  title: z.string(),
  content: z.string(),
  related_id: z.number().nullable(),
  is_read: z.boolean(),
  created_at: z.coerce.date()
});

export type Notification = z.infer<typeof notificationSchema>;

// Input schemas for creating entities
export const createUserInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().min(1),
  phone: z.string().nullable(),
  zalo: z.string().nullable(),
  role: userRoleEnum,
  city: z.string().min(1)
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;

export const loginInputSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export type LoginInput = z.infer<typeof loginInputSchema>;

export const createTeamInputSchema = z.object({
  name: z.string().min(1),
  owner_id: z.number(),
  city: z.string().min(1),
  skill_level: skillLevelEnum,
  description: z.string().nullable()
});

export type CreateTeamInput = z.infer<typeof createTeamInputSchema>;

export const addTeamMemberInputSchema = z.object({
  team_id: z.number(),
  user_id: z.number(),
  skill_evaluation: z.string().nullable()
});

export type AddTeamMemberInput = z.infer<typeof addTeamMemberInputSchema>;

export const createFieldInputSchema = z.object({
  owner_id: z.number(),
  name: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  surface_type: z.string().min(1),
  capacity: z.number().int().positive(),
  hourly_rate: z.number().positive(),
  description: z.string().nullable()
});

export type CreateFieldInput = z.infer<typeof createFieldInputSchema>;

export const createFieldAvailabilityInputSchema = z.object({
  field_id: z.number(),
  date: z.coerce.date(),
  start_time: z.string(),
  end_time: z.string()
});

export type CreateFieldAvailabilityInput = z.infer<typeof createFieldAvailabilityInputSchema>;

export const createMatchPostInputSchema = z.object({
  author_id: z.number(),
  team_id: z.number().nullable(),
  field_id: z.number().nullable(),
  post_type: postTypeEnum,
  title: z.string().min(1),
  description: z.string().nullable(),
  match_date: z.coerce.date(),
  start_time: z.string(),
  end_time: z.string(),
  required_skill_level: skillLevelEnum,
  match_type: matchTypeEnum,
  city: z.string().min(1),
  contact_phone: z.string().nullable(),
  contact_zalo: z.string().nullable()
});

export type CreateMatchPostInput = z.infer<typeof createMatchPostInputSchema>;

export const createMatchInputSchema = z.object({
  post_id: z.number(),
  team1_id: z.number(),
  team2_id: z.number().nullable(),
  field_id: z.number(),
  match_date: z.coerce.date(),
  start_time: z.string(),
  end_time: z.string()
});

export type CreateMatchInput = z.infer<typeof createMatchInputSchema>;

export const createTeamRatingInputSchema = z.object({
  match_id: z.number(),
  rater_team_id: z.number(),
  rated_team_id: z.number(),
  skill_rating: z.number().int().min(1).max(5),
  fair_play_rating: z.number().int().min(1).max(5),
  comment: z.string().nullable()
});

export type CreateTeamRatingInput = z.infer<typeof createTeamRatingInputSchema>;

export const sendMessageInputSchema = z.object({
  sender_id: z.number(),
  recipient_id: z.number(),
  match_post_id: z.number().nullable(),
  content: z.string().min(1)
});

export type SendMessageInput = z.infer<typeof sendMessageInputSchema>;

export const createNotificationInputSchema = z.object({
  user_id: z.number(),
  type: notificationTypeEnum,
  title: z.string().min(1),
  content: z.string().min(1),
  related_id: z.number().nullable()
});

export type CreateNotificationInput = z.infer<typeof createNotificationInputSchema>;

// Update schemas
export const updateTeamInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  skill_level: skillLevelEnum.optional(),
  description: z.string().nullable().optional()
});

export type UpdateTeamInput = z.infer<typeof updateTeamInputSchema>;

export const updateMatchPostInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  match_date: z.coerce.date().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  required_skill_level: skillLevelEnum.optional(),
  match_type: matchTypeEnum.optional(),
  contact_phone: z.string().nullable().optional(),
  contact_zalo: z.string().nullable().optional(),
  is_active: z.boolean().optional()
});

export type UpdateMatchPostInput = z.infer<typeof updateMatchPostInputSchema>;

export const updateMatchStatusInputSchema = z.object({
  id: z.number(),
  status: matchStatusEnum
});

export type UpdateMatchStatusInput = z.infer<typeof updateMatchStatusInputSchema>;