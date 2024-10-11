import { HydrateClient } from "~/trpc/server";

export default async function DashboardPage() {
  return (
    <HydrateClient>
      <main>{"DashboardPage"}</main>
    </HydrateClient>
  );
}
