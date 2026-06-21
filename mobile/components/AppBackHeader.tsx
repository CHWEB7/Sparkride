import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../lib/theme";

export function AppBackHeader({ title }: { title?: string }) {
  const router = useRouter();

  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
        style={styles.backBtn}
      >
        <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        <Text style={styles.backText}>Home</Text>
      </Pressable>
      {title ? <Text style={styles.title}>{title}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingRight: 12,
  },
  backText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.muted,
  },
});
