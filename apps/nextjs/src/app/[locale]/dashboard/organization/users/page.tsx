import { HydrateClient } from "~/trpc/server";

export default async function DashboardOrganizationUsersPage() {
  return (
    <HydrateClient>
      <main>{"DashboardOrganizationUsersPage"}</main>
    </HydrateClient>
  );
}
