import { HydrateClient } from "~/trpc/server";

export default async function DashboardStoreActiveOrders() {
  return (
    <HydrateClient>
      <main>{"DashboardStoreActiveOrders"}</main>
    </HydrateClient>
  );
}
