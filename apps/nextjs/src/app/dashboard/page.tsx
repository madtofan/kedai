import { HydrateClient, api } from "~/trpc/server";

export default async function DashboardPage() {
  const hello = await api.post.hello({ text: "from tRPC" });
  void api.post.getLatest.prefetch();
  return (
    <HydrateClient>
      <main>
        {"DashboardPage"}
        {hello ? hello.greeting : "Loading tRPC query..."}
      </main>
    </HydrateClient>
  );
}
