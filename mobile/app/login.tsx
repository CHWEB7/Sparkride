import { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SparkrideLogo } from "../components/SparkrideLogo";
import { PrimaryButton } from "../components/form";
import { signInWithEmail } from "../lib/customer-auth";
import { COLORS } from "../lib/theme";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    setLoading(true);
    setError("");
    try {
      await signInWithEmail(email.trim(), password);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <SparkrideLogo size="md" />
            <Text style={styles.title}>Sign in</Text>
            <Text style={styles.subtitle}>Sign in to book and manage your transfers</Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />

            <PrimaryButton
              label={loading ? "Signing in..." : "Sign in"}
              onPress={handleLogin}
              disabled={loading}
              style={styles.btn}
            />

            <Pressable onPress={() => router.push("/signup")} style={styles.linkWrap}>
              <Text style={styles.link}>No account? Create one</Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#191c23" },
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: { padding: 24, paddingTop: 48 },
  title: {
    marginTop: 24,
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.white,
  },
  subtitle: { marginTop: 8, fontSize: 15, color: "rgba(255,255,255,0.65)" },
  label: { marginTop: 20, marginBottom: 6, fontSize: 13, fontWeight: "600", color: COLORS.muted },
  input: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.white,
    fontSize: 16,
  },
  btn: { marginTop: 24 },
  error: { marginTop: 16, color: COLORS.danger, fontSize: 14 },
  linkWrap: { marginTop: 20, alignItems: "center" },
  link: { color: COLORS.brandEnd, fontSize: 15, fontWeight: "600" },
});
