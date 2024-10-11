import { HydrateClient } from "~/trpc/server";

export default async function DashboardStorePage() {
  return (
    <HydrateClient>
      <main>{"DashboardStorePage"}</main>
    </HydrateClient>
  );
}
