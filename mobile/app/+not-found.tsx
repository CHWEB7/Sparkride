import { Redirect, Stack } from "expo-router";

export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Redirect href="/book" />
    </>
  );
}
