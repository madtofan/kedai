import { useLocalSearchParams } from "expo-router";
import * as React from "react";
import { View } from "react-native";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";

export default function CheckoutScreen() {
  const { orderId } = useLocalSearchParams();

  const onCheckoutPress = () => {
    alert(`Checking out for order ${orderId}`);
  };

  return (
    <View className="flex-1 justify-center items-center gap-5 p-6 bg-secondary/30">
      <Text>{`Order ${orderId}`} </Text>
      <Button onPress={onCheckoutPress}>
        <Text>Check Out</Text>
      </Button>
    </View>
  );
}
