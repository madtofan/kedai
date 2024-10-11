import { HydrateClient } from "~/trpc/server";

export default async function DashboardMenuPage() {
  return (
    <HydrateClient>
      <main>{"DashboardMenuPage"}</main>
    </HydrateClient>
  );
}
