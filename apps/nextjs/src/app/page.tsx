import { HydrateClient } from "~/trpc/server";
import HomeContent from "./_page-content";

export default function Home() {
  return (
    <HydrateClient>
      <main>
        <HomeContent />
      </main>
    </HydrateClient>
  );
}
