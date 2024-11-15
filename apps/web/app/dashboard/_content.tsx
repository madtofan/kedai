"use client";
import { api } from "~/trpc/react";

export default function DashboardContent() {
  const { data: stores, error } = api.store.getAllStore.useQuery();
  if (error) {
    return <>{error.message}</>;
  }
  return (
    <>
      {"DashboardPage"}
      {stores
        ? stores.map((store) => <p key={store.id}>{store.name}</p>)
        : "Loading tRPC query..."}
    </>
  );
}
