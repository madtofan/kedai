import { HydrateClient } from "~/trpc/server";

export default async function DashboardOrganizationPage() {
  return (
    <HydrateClient>
      <div className="flex h-screen bg-gray-100">
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-200 p-4">
          {"DashboardMenuPage"}
        </main>
      </div>
    </HydrateClient>
  );
}
