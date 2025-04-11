import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const updateStatus = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;

    const existing = await ctx.db
      .query("userStatus")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        isOnline: true,
        lastSeen: Date.now(),
      });
    } else {
      await ctx.db.insert("userStatus", {
        userId,
        isOnline: true,
        lastSeen: Date.now(),
      });
    }
  },
});

export const getOnlineUsers = query({
  handler: async (ctx) => {
    const statuses = await ctx.db
      .query("userStatus")
      .filter((q) => q.eq(q.field("isOnline"), true))
      .collect();

    return Promise.all(
      statuses.map(async (status) => {
        const user = await ctx.db.get(status.userId);
        return {
          userId: status.userId,
          name: user?.name,
          lastSeen: status.lastSeen,
        };
      })
    );
  },
});
