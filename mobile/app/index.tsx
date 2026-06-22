import { useRef, useState } from "react";
import { useRouter } from "expo-router";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { SparkrideLogo } from "../components/SparkrideLogo";
import { PrimaryButton } from "../components/form";
import { BUILD_LABEL } from "../lib/build-info";
import { isDriverModeUnlocked, unlockDriverMode } from "../lib/driver-access";
import { COLORS } from "../lib/theme";

const TAP_WINDOW_MS = 2500;
const TAPS_REQUIRED = 5;

export default function HomeScreen() {
  const router = useRouter();
  const appVersion = Constants.expoConfig?.version ?? "?";
  const [driverUnlocked, setDriverUnlocked] = useState(isDriverModeUnlocked());
  const [versionTaps, setVersionTaps] = useState(0);
  const lastTapAt = useRef(0);

  function handleVersionTap() {
    const now = Date.now();
    const nextCount = now - lastTapAt.current > TAP_WINDOW_MS ? 1 : versionTaps + 1;
    lastTapAt.current = now;
    setVersionTaps(nextCount);

    if (nextCount >= TAPS_REQUIRED) {
      unlockDriverMode();
      setDriverUnlocked(true);
      setVersionTaps(0);
    }
  }

  return (
    <View style={styles.root}>
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

            {driverUnlocked && (
              <Pressable
                onPress={() => router.push("/driver")}
                style={styles.secondaryBtn}
              >
                <Ionicons name="list-outline" size={20} color={COLORS.white} />
                <Text style={styles.secondaryText}>Driver bookings</Text>
              </Pressable>
            )}
          </View>
        </View>

        <Pressable onPress={handleVersionTap} style={styles.footerPress}>
          <Text style={styles.footer}>
            Sparkride · v{appVersion} · {BUILD_LABEL}
          </Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#191c23" },
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
  secondaryText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  footerPress: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  footer: {
    textAlign: "center",
    fontSize: 11,
    color: "rgba(255,255,255,0.45)",
    paddingBottom: 12,
  },
});
