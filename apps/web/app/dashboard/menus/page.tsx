import { HydrateClient } from "~/trpc/server";
import DashboardMenuPageContent from "./_content";

export default async function DashboardMenuPage() {
  return (
    <HydrateClient>
      <main>
        <DashboardMenuPageContent />
      </main>
    </HydrateClient>
  );
}
