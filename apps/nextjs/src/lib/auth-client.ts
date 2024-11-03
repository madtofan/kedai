import { createAuthClient } from "better-auth/react";
import { env } from "~/env";
import { toast } from "./use-toast";
import { passkeyClient } from "better-auth/plugins";

export const client = createAuthClient({
  baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL, // the base url of your auth server
  plugins: [passkeyClient()],
  fetchOptions: {
    onError(e) {
      if (e.error.status === 429) {
        toast({
          title: "Too many requests",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    },
  },
});

export const { signUp, signIn, signOut, useSession } = client;
