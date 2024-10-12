import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { TouchableOpacity } from "react-native-gesture-handler";
import { ThemeToggle } from "~/components/ThemeToggle";
import { ArrowLeft } from "~/lib/icons/ArrowLeft";
import { Menu } from "~/lib/icons/Menu";

export default function HomeLayout() {
  const router = useRouter();
  const segment = useSegments();
  const nav = useNavigation<DrawerNavigationProp<{}>>();
  return (
    <Stack
      screenOptions={{
        headerBackButtonMenuEnabled: true,
        headerLeft: () => {
          if (!router.canGoBack() || !segment.some((s) => s === "[storeId]"))
            return (
              <TouchableOpacity onPress={() => nav.openDrawer()}>
                <Menu />
              </TouchableOpacity>
            );
          return (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft />
            </TouchableOpacity>
          );
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Store List",
          headerRight: () => <ThemeToggle />,
        }}
      />
      <Stack.Screen
        name="[storeId]/index"
        options={{
          title: "Table List",
        }}
      />
      <Stack.Screen
        name="[storeId]/[tableId]/index"
        options={{
          title: "Ordered Item List",
        }}
      />
      <Stack.Screen
        name="[storeId]/[tableId]/[orderId]"
        options={{
          title: "Checkout",
        }}
      />
    </Stack>
  );
}
