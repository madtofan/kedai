import { useSignIn, useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { View } from "react-native";
import React, { useCallback } from "react";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { LoaderCircle } from "~/lib/icons/LoaderCircle";
import { Label } from "~/components/ui/label";
import { Redirect } from "expo-router";
import SignInWithOAuth from "~/components/SignInWithOAuth";

export default function SignInScreen() {
  const { isSignedIn } = useAuth();
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");

  const onSignInPress = useCallback(() => {
    if (!isLoaded) {
      return;
    }
    signIn
      .create({
        identifier: emailAddress,
        password,
      })
      .then((signInAttempt) => {
        if (signInAttempt.status === "complete") {
          setActive({ session: signInAttempt.createdSessionId }).then(() => {
            router.replace("/dashboard");
          });
        } else {
          // See https://clerk.com/docs/custom-flows/error-handling
          // for more info on error handling
          console.error(JSON.stringify(signInAttempt, null, 2));
        }
      })
      .catch((err) => {
        console.error(JSON.stringify(err, null, 2));
      });
  }, [isLoaded, emailAddress, password]);

  if (isSignedIn) {
    return <Redirect href="/dashboard" />;
  }

  return (
    <View className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Kedai Login</CardTitle>
          <CardDescription>
            <Text>Choose your preferred login method</Text>
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <SignInWithOAuth />
          <Text className="flex text-center flex-shrink px-2 text-xs text-muted-foreground">
            or continue with
          </Text>
          <View className="grid gap-1">
            <Label>Email</Label>
            <Input
              id="email"
              keyboardType="email-address"
              placeholder="Email..."
              value={emailAddress}
              onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
            />
          </View>
          <View className="grid gap-1 mt-2">
            <Label>Password</Label>
            <Input
              id="password"
              keyboardType="visible-password"
              value={password}
              placeholder="Password..."
              secureTextEntry={true}
              onChangeText={(password) => setPassword(password)}
            />
          </View>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full mt-4"
            disabled={!isLoaded}
            onPress={onSignInPress}
          >
            {!isLoaded && (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            )}
            <Text>Login with Email</Text>
          </Button>
        </CardFooter>
      </Card>
    </View>
  );
}
