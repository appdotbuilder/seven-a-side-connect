import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import {
  createUserInputSchema,
  loginInputSchema,
  createTeamInputSchema,
  updateTeamInputSchema,
  addTeamMemberInputSchema,
  createFieldInputSchema,
  createFieldAvailabilityInputSchema,
  createMatchPostInputSchema,
  updateMatchPostInputSchema,
  createMatchInputSchema,
  updateMatchStatusInputSchema,
  createTeamRatingInputSchema,
  sendMessageInputSchema,
  createNotificationInputSchema,
  skillLevelEnum,
  matchTypeEnum,
  postTypeEnum
} from './schema';

// Import handlers
import { registerUser, loginUser, getUserById } from './handlers/auth';
import {
  createTeam,
  updateTeam,
  getTeamsByOwner,
  getTeamById,
  addTeamMember,
  removeTeamMember,
  getTeamMembers,
  updateTeamMemberEvaluation
} from './handlers/teams';
import {
  createField,
  getFieldsByOwner,
  getFieldById,
  getFieldsByCity,
  createFieldAvailability,
  getFieldAvailability,
  getAvailableFields,
  bookFieldSlot
} from './handlers/fields';
import {
  createMatchPost,
  updateMatchPost,
  getMatchPosts,
  getMatchPostById,
  getMatchPostsByAuthor,
  deactivateMatchPost,
  searchMatchPosts
} from './handlers/match_posts';
import {
  createMatch,
  updateMatchStatus,
  getMatchesByTeam,
  getMatchById,
  getUpcomingMatchesByUser,
  getPastMatchesByUser,
  cancelMatch
} from './handlers/matches';
import {
  createTeamRating,
  getTeamRatings,
  getTeamRatingStats,
  getRatingsGivenByTeam,
  getRatingForMatch,
  canRateTeam
} from './handlers/ratings';
import {
  sendMessage,
  getMessagesByUser,
  getConversation,
  markMessageAsRead,
  markAllMessagesAsRead,
  getUnreadMessageCount,
  getMessagesForMatchPost,
  deleteMessage
} from './handlers/messages';
import {
  createNotification,
  getNotificationsByUser,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
  deleteNotification
} from './handlers/notifications';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Authentication routes
  auth: router({
    register: publicProcedure
      .input(createUserInputSchema)
      .mutation(({ input }) => registerUser(input)),
    
    login: publicProcedure
      .input(loginInputSchema)
      .mutation(({ input }) => loginUser(input)),
    
    getUser: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getUserById(input.id))
  }),

  // Team management routes
  teams: router({
    create: publicProcedure
      .input(createTeamInputSchema)
      .mutation(({ input }) => createTeam(input)),
    
    update: publicProcedure
      .input(updateTeamInputSchema)
      .mutation(({ input }) => updateTeam(input)),
    
    getByOwner: publicProcedure
      .input(z.object({ ownerId: z.number() }))
      .query(({ input }) => getTeamsByOwner(input.ownerId)),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getTeamById(input.id)),
    
    addMember: publicProcedure
      .input(addTeamMemberInputSchema)
      .mutation(({ input }) => addTeamMember(input)),
    
    removeMember: publicProcedure
      .input(z.object({ teamId: z.number(), userId: z.number() }))
      .mutation(({ input }) => removeTeamMember(input.teamId, input.userId)),
    
    getMembers: publicProcedure
      .input(z.object({ teamId: z.number() }))
      .query(({ input }) => getTeamMembers(input.teamId)),
    
    updateMemberEvaluation: publicProcedure
      .input(z.object({ teamId: z.number(), userId: z.number(), evaluation: z.string() }))
      .mutation(({ input }) => updateTeamMemberEvaluation(input.teamId, input.userId, input.evaluation))
  }),

  // Field management routes
  fields: router({
    create: publicProcedure
      .input(createFieldInputSchema)
      .mutation(({ input }) => createField(input)),
    
    getByOwner: publicProcedure
      .input(z.object({ ownerId: z.number() }))
      .query(({ input }) => getFieldsByOwner(input.ownerId)),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getFieldById(input.id)),
    
    getByCity: publicProcedure
      .input(z.object({ city: z.string() }))
      .query(({ input }) => getFieldsByCity(input.city)),
    
    createAvailability: publicProcedure
      .input(createFieldAvailabilityInputSchema)
      .mutation(({ input }) => createFieldAvailability(input)),
    
    getAvailability: publicProcedure
      .input(z.object({ fieldId: z.number() }))
      .query(({ input }) => getFieldAvailability(input.fieldId)),
    
    getAvailable: publicProcedure
      .input(z.object({
        city: z.string(),
        date: z.coerce.date(),
        startTime: z.string(),
        endTime: z.string()
      }))
      .query(({ input }) => getAvailableFields(input.city, input.date, input.startTime, input.endTime)),
    
    bookSlot: publicProcedure
      .input(z.object({ availabilityId: z.number() }))
      .mutation(({ input }) => bookFieldSlot(input.availabilityId))
  }),

  // Match post routes
  matchPosts: router({
    create: publicProcedure
      .input(createMatchPostInputSchema)
      .mutation(({ input }) => createMatchPost(input)),
    
    update: publicProcedure
      .input(updateMatchPostInputSchema)
      .mutation(({ input }) => updateMatchPost(input)),
    
    getAll: publicProcedure
      .input(z.object({
        city: z.string().optional(),
        skillLevel: skillLevelEnum.optional(),
        matchType: matchTypeEnum.optional(),
        postType: postTypeEnum.optional()
      }))
      .query(({ input }) => getMatchPosts(input.city, input.skillLevel, input.matchType, input.postType)),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getMatchPostById(input.id)),
    
    getByAuthor: publicProcedure
      .input(z.object({ authorId: z.number() }))
      .query(({ input }) => getMatchPostsByAuthor(input.authorId)),
    
    deactivate: publicProcedure
      .input(z.object({ id: z.number(), authorId: z.number() }))
      .mutation(({ input }) => deactivateMatchPost(input.id, input.authorId)),
    
    search: publicProcedure
      .input(z.object({ query: z.string(), city: z.string().optional() }))
      .query(({ input }) => searchMatchPosts(input.query, input.city))
  }),

  // Match management routes
  matches: router({
    create: publicProcedure
      .input(createMatchInputSchema)
      .mutation(({ input }) => createMatch(input)),
    
    updateStatus: publicProcedure
      .input(updateMatchStatusInputSchema)
      .mutation(({ input }) => updateMatchStatus(input)),
    
    getByTeam: publicProcedure
      .input(z.object({ teamId: z.number() }))
      .query(({ input }) => getMatchesByTeam(input.teamId)),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getMatchById(input.id)),
    
    getUpcomingByUser: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(({ input }) => getUpcomingMatchesByUser(input.userId)),
    
    getPastByUser: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(({ input }) => getPastMatchesByUser(input.userId)),
    
    cancel: publicProcedure
      .input(z.object({ matchId: z.number(), userId: z.number(), reason: z.string().optional() }))
      .mutation(({ input }) => cancelMatch(input.matchId, input.userId, input.reason))
  }),

  // Team rating routes
  ratings: router({
    create: publicProcedure
      .input(createTeamRatingInputSchema)
      .mutation(({ input }) => createTeamRating(input)),
    
    getByTeam: publicProcedure
      .input(z.object({ teamId: z.number() }))
      .query(({ input }) => getTeamRatings(input.teamId)),
    
    getStats: publicProcedure
      .input(z.object({ teamId: z.number() }))
      .query(({ input }) => getTeamRatingStats(input.teamId)),
    
    getGivenByTeam: publicProcedure
      .input(z.object({ teamId: z.number() }))
      .query(({ input }) => getRatingsGivenByTeam(input.teamId)),
    
    getForMatch: publicProcedure
      .input(z.object({ matchId: z.number(), raterTeamId: z.number(), ratedTeamId: z.number() }))
      .query(({ input }) => getRatingForMatch(input.matchId, input.raterTeamId, input.ratedTeamId)),
    
    canRate: publicProcedure
      .input(z.object({ matchId: z.number(), raterTeamId: z.number(), ratedTeamId: z.number() }))
      .query(({ input }) => canRateTeam(input.matchId, input.raterTeamId, input.ratedTeamId))
  }),

  // Messaging routes
  messages: router({
    send: publicProcedure
      .input(sendMessageInputSchema)
      .mutation(({ input }) => sendMessage(input)),
    
    getByUser: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(({ input }) => getMessagesByUser(input.userId)),
    
    getConversation: publicProcedure
      .input(z.object({ user1Id: z.number(), user2Id: z.number() }))
      .query(({ input }) => getConversation(input.user1Id, input.user2Id)),
    
    markAsRead: publicProcedure
      .input(z.object({ messageId: z.number(), userId: z.number() }))
      .mutation(({ input }) => markMessageAsRead(input.messageId, input.userId)),
    
    markAllAsRead: publicProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(({ input }) => markAllMessagesAsRead(input.userId)),
    
    getUnreadCount: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(({ input }) => getUnreadMessageCount(input.userId)),
    
    getForMatchPost: publicProcedure
      .input(z.object({ matchPostId: z.number() }))
      .query(({ input }) => getMessagesForMatchPost(input.matchPostId)),
    
    delete: publicProcedure
      .input(z.object({ messageId: z.number(), userId: z.number() }))
      .mutation(({ input }) => deleteMessage(input.messageId, input.userId))
  }),

  // Notification routes
  notifications: router({
    create: publicProcedure
      .input(createNotificationInputSchema)
      .mutation(({ input }) => createNotification(input)),
    
    getByUser: publicProcedure
      .input(z.object({ userId: z.number(), limit: z.number().optional() }))
      .query(({ input }) => getNotificationsByUser(input.userId, input.limit)),
    
    markAsRead: publicProcedure
      .input(z.object({ notificationId: z.number(), userId: z.number() }))
      .mutation(({ input }) => markNotificationAsRead(input.notificationId, input.userId)),
    
    markAllAsRead: publicProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(({ input }) => markAllNotificationsAsRead(input.userId)),
    
    getUnreadCount: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(({ input }) => getUnreadNotificationCount(input.userId)),
    
    delete: publicProcedure
      .input(z.object({ notificationId: z.number(), userId: z.number() }))
      .mutation(({ input }) => deleteNotification(input.notificationId, input.userId))
  })
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();