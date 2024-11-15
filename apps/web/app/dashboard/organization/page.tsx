import { HydrateClient } from "~/trpc/server";
import DashboardOrganizationContent from "./_content";

export default async function DashboardOrganizationPage() {
  return (
    <HydrateClient>
      <main>
        <DashboardOrganizationContent />
      </main>
    </HydrateClient>
  );
}
