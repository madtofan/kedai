"use client";

import { Tabs } from "~/components/ui/tabs2";
import SignIn from "./_sign-in";
import { SignUp } from "./_sign-up";
import { useSession } from "~/lib/auth-client";
import { useRouter } from "next/navigation";
import { Spinner } from "~/components/ui/spinner";

export default function Page() {
  const { data, isPending } = useSession();
  const router = useRouter();
  if (data) {
    router.replace("/dashboard");
  }
  if (isPending) {
    return <Spinner />;
  }
  return (
    <div className="w-full">
      <div className="flex w-full flex-col items-center justify-center md:py-10">
        <div className="md:w-[400px]">
          <Tabs
            tabs={[
              {
                title: "Sign In",
                value: "sign-in",
                content: <SignIn />,
              },
              {
                title: "Sign Up",
                value: "sign-up",
                content: <SignUp />,
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
