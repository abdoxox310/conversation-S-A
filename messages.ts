import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const send = mutation({
  args: { content: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    await ctx.db.insert("messages", {
      content: args.content,
      senderId: userId,
      createdAt: Date.now(),
    });
  },
});

export const list = query({
  handler: async (ctx) => {
    const messages = await ctx.db
      .query("messages")
      .order("desc")
      .take(50);
    
    return Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.senderId);
        return {
          ...message,
          senderName: sender?.name ?? "Unknown",
        };
      })
    );
  },
});
