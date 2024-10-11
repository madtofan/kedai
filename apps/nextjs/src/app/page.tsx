import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  // {hello ? hello.greeting : "Loading tRPC query..."}
  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        {"This is meant to be the page for advertisement of the product"}
      </main>
    </HydrateClient>
  );
}
