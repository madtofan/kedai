import SignIn from "./_sign-in";
import { SignUp } from "./_sign-up";
import { getSession } from "~/lib/auth-client";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

export default function Page() {
  // TODO - fix get cookie and check current session
  getSession()
    .then((response) => {
      console.log({ response });
      if (!!response.data) {
        redirect("/dashboard");
      }
    })
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    .catch(() => {});
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
