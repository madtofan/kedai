import { HydrateClient } from "~/trpc/server";
import DashboardMenuPageContent from "./_content";

export default async function DashboardMenuPage() {
  return (
    <HydrateClient>
      <div className="flex h-screen bg-gray-100">
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-200 p-4">
          <DashboardMenuPageContent />
        </main>
      </div>
    </HydrateClient>
  );
}
