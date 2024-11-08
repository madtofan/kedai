import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { db } from "../db";
import { auth } from "../auth";

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
  const clientSession = await auth.api.getSession({
    headers: opts.ctx.headers,
  });
  if (!clientSession?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return opts.next({
    ctx: {
      session: clientSession.session,
      user: clientSession.user,
    },
  });
});

/**
 * Organization (authenticated with existing organization) procedure
 *
 * This guarantees that the user has logged in and the user has an existing organization, and the userId can be obtained from ctx.user.userId
 */
export const organizationProcedure = protectedProcedure.use(async (opts) => {
  console.log({ path: opts.path });
  let organizationId = opts.ctx.session.activeOrganizationId;
  if (!organizationId) {
    organizationId = (
      await opts.ctx.db.query.user.findFirst({
        where: (usr, { eq }) => eq(usr.id, opts.ctx.user.id),
        columns: {
          id: false,
          name: false,
          email: false,
          emailVerified: false,
          image: false,
          createdAt: false,
          updatedAt: false,
        },
        with: {
          members: {
            columns: {
              organizationId: true,
            },
          },
        },
      })
    )?.members.find(Boolean)?.organizationId;
    if (!organizationId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "User must be in an existing to perform this operation.",
      });
    }

    await auth.api.setActiveOrganization({
      headers: opts.ctx.headers,
      body: {
        orgId: organizationId,
      },
    });
  }
  return opts.next({
    ctx: {
      organizationId,
    },
  });
});
