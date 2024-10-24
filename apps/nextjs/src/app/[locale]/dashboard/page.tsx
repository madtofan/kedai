import { HydrateClient } from "~/trpc/server";
import DashboardContent from "./_content";

export default async function DashboardPage() {
  return (
    <HydrateClient>
      <main>
        <DashboardContent />
      </main>
    </HydrateClient>
  );
}
