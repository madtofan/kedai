import { useLocalSearchParams, useRouter } from "expo-router";
import * as React from "react";
import { View } from "react-native";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";

export default function TableScreen() {
  const router = useRouter();
  const { storeId, tableId } = useLocalSearchParams();

  const onCheckoutPress = (orderId: number) => {
    router.push(`/dashboard/home/${storeId}/${tableId}/${orderId}`);
  };

  return (
    <View className="flex-1 justify-center items-center gap-5 p-6 bg-secondary/30">
      <Text>{`Table ${tableId}`} </Text>
      <Button onPress={() => onCheckoutPress(1)}>
        <Text>Check Out</Text>
      </Button>
    </View>
  );
}
