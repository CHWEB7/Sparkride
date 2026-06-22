import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { COLORS } from "../lib/theme";

type AuthMode = "signup" | "login";

export function AuthModeTabs({ mode }: { mode: AuthMode }) {
  const router = useRouter();

  return (
    <View style={styles.wrap} accessibilityRole="tablist">
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: mode === "signup" }}
        onPress={() => mode !== "signup" && router.replace("/signup")}
        style={[styles.tab, mode === "signup" && styles.tabActive]}
      >
        <Text style={[styles.tabText, mode === "signup" && styles.tabTextActive]}>
          Sign up
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: mode === "login" }}
        onPress={() => mode !== "login" && router.replace("/login")}
        style={[styles.tab, mode === "login" && styles.tabActive]}
      >
        <Text style={[styles.tabText, mode === "login" && styles.tabTextActive]}>
          Sign in
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: COLORS.white,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.65)",
  },
  tabTextActive: {
    color: COLORS.text,
  },
});
