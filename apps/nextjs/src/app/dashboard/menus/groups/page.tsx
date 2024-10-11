import { HydrateClient } from "~/trpc/server";

export default async function DashboardMenuGroupPage() {
  return (
    <HydrateClient>
      <main>{"DashboardMenuGroupPage"}</main>
    </HydrateClient>
  );
}
