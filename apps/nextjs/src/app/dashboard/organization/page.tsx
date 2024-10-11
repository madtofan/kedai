import { HydrateClient } from "~/trpc/server";

export default async function DashboardOrganizationPage() {
  return (
    <HydrateClient>
      <main>{"DashboardOrganizationPage"}</main>
    </HydrateClient>
  );
}
