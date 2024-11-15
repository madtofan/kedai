import { HydrateClient } from "~/trpc/server";

export default async function DashboardStoreTablesPage() {
  return (
    <HydrateClient>
      <main>{"DashboardStoreTablesPage"}</main>
    </HydrateClient>
  );
}
