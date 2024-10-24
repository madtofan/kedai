import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { db } from "../db";
import { auth } from "@clerk/nextjs/server";
import { users } from "../db/schema";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  return {
    db,
    ...opts,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * Protected (authenticated) procedure
 *
 * This guarantees that the user has logged in, and the userId can be obtained from ctx.user.userId
 */
export const protectedProcedure = publicProcedure.use(async (opts) => {
  const clerkUser = auth();
  if (!clerkUser.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  let user = await opts.ctx.db.query.users.findFirst({
    where: (user, { eq }) => eq(user.clerkId, clerkUser.userId),
    with: {
      organizationRole: true,
    },
  });
  if (!user) {
    const createdUsers = await opts.ctx.db.insert(users).values({
      clerkId: clerkUser.userId,
      enabled: false,
    });
    if (createdUsers.length > 0 && createdUsers[0]) {
      user = createdUsers[0];
    }
  }
  return opts.next({
    ctx: {
      user,
    },
  });
});

/**
 * Organization (authenticated with existing organization) procedure
 *
 * This guarantees that the user has logged in and the user has an existing organization, and the userId can be obtained from ctx.user.userId
 */
export const organizationProcedure = protectedProcedure.use(async (opts) => {
  if (!opts.ctx.user?.organizationRole?.organizationId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "User must be in an existing to perform this operation.",
    });
  }
  const organizationId = opts.ctx.user.organizationRole.organizationId;
  return opts.next({
    ctx: {
      organizationId,
    },
  });
});
