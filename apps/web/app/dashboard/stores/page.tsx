import { HydrateClient } from "~/trpc/server";
import DashboardStorePageContent from "./_content";

export default async function DashboardStorePage() {
  return (
    <main>
      <HydrateClient>
        <DashboardStorePageContent />
      </HydrateClient>
    </main>
  );
}
