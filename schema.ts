import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  messages: defineTable({
    content: v.string(),
    senderId: v.id("users"),
    createdAt: v.number(),
  }),

  userStatus: defineTable({
    userId: v.id("users"),
    isOnline: v.boolean(),
    lastSeen: v.number(),
  }).index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
