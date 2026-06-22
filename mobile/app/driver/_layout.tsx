import { Redirect, Stack } from "expo-router";
import { isDriverModeUnlocked } from "../../lib/driver-access";

export default function DriverLayout() {
  if (!isDriverModeUnlocked()) {
    return <Redirect href="/" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
