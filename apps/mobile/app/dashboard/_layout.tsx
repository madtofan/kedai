import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuth, useClerk } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { ThemeToggle } from "~/components/ThemeToggle";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import { TouchableOpacity, View } from "react-native";
import { Separator } from "~/components/ui/separator";
import { Menu } from "~/lib/icons/Menu";

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { signOut } = useClerk();

  const handleSignOutPress = () => {
    signOut({ redirectUrl: "/" });
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <View>
        <DrawerItemList {...props} />
      </View>
      <View>
        <Separator />
        <DrawerItem label="Sign Out" onPress={handleSignOutPress} />
      </View>
    </DrawerContentScrollView>
  );
}

export default function DashboardLayout() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <Redirect href={"/"} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        initialRouteName="home"
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={(props) => {
          return {
            headerLeft: () => (
              <TouchableOpacity
                className="p-4"
                onPress={() => props.navigation.openDrawer()}
              >
                <Menu className="text-black" />
              </TouchableOpacity>
            ),
            headerShown: false,
            headerRight: () => <ThemeToggle />,
          };
        }}
      >
        <Drawer.Screen
          name="home"
          options={{
            title: "Store List",
          }}
        />
        <Drawer.Screen
          name="notifications"
          options={{
            title: "Notifications",
            headerShown: true,
          }}
        />
        <Drawer.Screen
          name="orders"
          options={{
            title: "Orders",
            headerShown: true,
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
