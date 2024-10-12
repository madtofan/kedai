import { Stack } from "expo-router";
import { ThemeToggle } from "~/components/ThemeToggle";

export default function AuthRoutesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Home",
          headerRight: () => <ThemeToggle />,
        }}
      />
    </Stack>
  );
}
