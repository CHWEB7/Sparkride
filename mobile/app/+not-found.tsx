import { Link, Stack } from "expo-router";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../lib/theme";

export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.root}>
        <SafeAreaView style={styles.safe}>
          <Text style={styles.title}>Screen not found</Text>
          <Text style={styles.body}>
            This build may be outdated. Reinstall the latest APK from the website or Expo.
          </Text>
          <Link href="/" asChild>
            <Pressable style={styles.button}>
              <Text style={styles.buttonText}>Go to home</Text>
            </Pressable>
          </Link>
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  safe: { flex: 1, padding: 24, justifyContent: "center", gap: 16 },
  title: { fontSize: 22, fontWeight: "700", color: COLORS.text },
  body: { fontSize: 15, color: COLORS.muted, lineHeight: 22 },
  button: {
    marginTop: 8,
    backgroundColor: COLORS.brandStart,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: { color: COLORS.white, fontWeight: "600", fontSize: 16 },
});
