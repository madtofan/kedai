import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { env } from "./env";
import { organization, oneTap } from "better-auth/plugins";
import { sendOrganizationInvitation } from "./email/organization-invitation";

const organizationPlugin = organization({
  async sendInvitationEmail(data) {
    const inviteLink = `${env.NEXT_PUBLIC_BETTER_AUTH_URL}/accept-invitation/${data.id}`;
    sendOrganizationInvitation({
      email: data.email,
      invitedByUsername: data.inviter.user.name,
      invitedByEmail: data.inviter.user.email,
      teamName: data.organization.name,
      inviteLink,
    });
  },
});

export const betterAuthOptions: BetterAuthOptions = {
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
    },
  },
  advanced: {
    cookiePrefix: "kedai",
  },
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: env.NEXT_PUBLIC_GOOGLE_AUTH_ID,
      clientSecret: env.GOOGLE_AUTH_SECRET,
    },
  },
  plugins: [oneTap(), organizationPlugin],
  trustedOrigins: ["kedai://", "exp://"],
};

export const auth = betterAuth({
  ...betterAuthOptions,
  plugins: [oneTap(), organizationPlugin],
});
