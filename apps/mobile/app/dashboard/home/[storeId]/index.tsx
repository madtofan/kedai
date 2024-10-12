import { useLocalSearchParams, useRouter } from "expo-router";
import * as React from "react";
import { View } from "react-native";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";

export default function StoreScreen() {
  const router = useRouter();
  const { storeId } = useLocalSearchParams();

  const onTablePress = (tableId: number) => {
    router.push(`/dashboard/home/${storeId}/${tableId}/`);
  };

  return (
    <View className="flex-1 justify-center items-center gap-5 p-6 bg-secondary/30">
      <Text>{`Store ${storeId}`} </Text>
      <Button onPress={() => onTablePress(1)}>
        <Text>Table 1</Text>
      </Button>
    </View>
  );
}
