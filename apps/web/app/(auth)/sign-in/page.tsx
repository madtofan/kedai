import { cookies } from "next/headers";
import SignIn from "./_sign-in";
import { SignUp } from "./_sign-up";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export default function Page() {
  const cookieStore = cookies();
  if (!cookieStore.has("kedai.session_token")) {
    redirect("/dashboard");
  }

  return (
    <div className="w-full">
      <div className="flex w-full flex-col items-center justify-center md:py-10">
        <Tabs defaultValue="sign-in" className="w-[400px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sign-in">Sign In</TabsTrigger>
            <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="sign-in">
            <SignIn />
          </TabsContent>
          <TabsContent value="sign-up">
            <SignUp />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
