import * as React from "react";
import { View } from "react-native";
import { useUser, useClerk, useAuth } from "@clerk/clerk-expo";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { Redirect } from "expo-router";

export default function HomeScreen() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <Redirect href="/" />;
  }

  const handleSignOutPress = () => {
    signOut({ redirectUrl: "/" });
  };

  return (
    <View className="flex-1 justify-center items-center gap-5 p-6 bg-secondary/30">
      <Text>Hello {user?.emailAddresses[0].emailAddress}</Text>
      <Button
        className="w-full text-sm text-muted-foreground"
        onPress={handleSignOutPress}
      >
        <Text>Sign Out</Text>
      </Button>
    </View>
  );
}
