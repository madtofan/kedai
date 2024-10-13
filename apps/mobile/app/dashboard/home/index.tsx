import * as React from "react";
import { View } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { useRouter } from "expo-router";
import { api } from "~/lib/api";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { data } = api.post.hello.useQuery({ text: "from TRPC" });
  const onStorePress = (storeId: number) => {
    router.push(`/dashboard/home/${storeId}`);
  };

  return (
    <View className="flex-1 justify-center items-center gap-5 p-6 bg-secondary/30">
      <Button onPress={() => onStorePress(1)}>
        <Text>Store 1</Text>
      </Button>
      <Text>This page should display the stores available for the user</Text>
      <Text>Hello {user?.emailAddresses[0].emailAddress}</Text>
      <Text>{data ? data.greeting : "Loading tRPC query..."}</Text>
    </View>
  );
}
