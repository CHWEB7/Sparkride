import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SparkrideLogo } from "../components/SparkrideLogo";
import { PrimaryButton } from "../components/form";
import { COLORS } from "../lib/theme";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={["#191c23", "#222836", "#1a2840"]}
      style={styles.fill}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />

        <View style={styles.content}>
          <SparkrideLogo size="lg" />

          <Text style={styles.tagline}>Airport transfers across the UK</Text>
          <Text style={styles.subtitle}>
            Fixed prices · Professional drivers · 24/7 service
          </Text>

          <View style={styles.actions}>
            <PrimaryButton
              label="Book a new ride"
              onPress={() => router.push("/book")}
              style={styles.primaryBtn}
            />

            <Pressable
              onPress={() => router.push("/driver")}
              style={({ pressed }) => [
                styles.secondaryBtn,
                pressed && styles.secondaryBtnPressed,
              ]}
            >
              <Ionicons name="list-outline" size={20} color={COLORS.white} />
              <Text style={styles.secondaryText}>Driver bookings</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.footer}>Sparkride · Castleford, West Yorkshire</Text>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  safe: { flex: 1 },
  glowTop: {
    position: "absolute",
    top: 80,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 999,
    backgroundColor: COLORS.brandStart,
    opacity: 0.15,
  },
  glowBottom: {
    position: "absolute",
    bottom: 120,
    left: -40,
    width: 160,
    height: 160,
    borderRadius: 999,
    backgroundColor: COLORS.brandEnd,
    opacity: 0.12,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  tagline: {
    marginTop: 28,
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.white,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
    lineHeight: 22,
  },
  actions: {
    marginTop: 40,
    width: "100%",
    maxWidth: 320,
    gap: 14,
  },
  primaryBtn: {
    width: "100%",
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  secondaryBtnPressed: {
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  secondaryText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    paddingBottom: 24,
  },
});
