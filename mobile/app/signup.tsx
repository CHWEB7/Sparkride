import { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { SparkrideLogo } from "../components/SparkrideLogo";
import { PrimaryButton } from "../components/form";
import { signUpWithEmail } from "../lib/customer-auth";
import { COLORS } from "../lib/theme";

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  async function handleSignup() {
    setLoading(true);
    setError("");
    try {
      const data = await signUpWithEmail({
        email: email.trim(),
        password,
        name: name.trim(),
        phone: phone.trim(),
      });

      if (data.session) {
        router.replace("/");
        return;
      }

      setSubmittedEmail(email.trim());
      setVerificationSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  if (verificationSent) {
    return (
      <View style={styles.root}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.successWrap}>
            <SparkrideLogo size="md" />
            <View style={styles.iconCircle}>
              <Ionicons name="mail-outline" size={32} color={COLORS.brandStart} />
            </View>
            <Text style={styles.title}>Check your email</Text>
            <Text style={styles.successLead}>We&apos;ve sent a verification link to</Text>
            <Text style={styles.emailHighlight}>{submittedEmail}</Text>
            <Text style={styles.successBody}>
              Open the email and tap the link to verify your account. Then sign in to book
              your transfer.
            </Text>
            <PrimaryButton
              label="Sign in"
              onPress={() => router.replace("/login")}
              style={styles.btn}
            />
            <Text style={styles.hint}>
              Didn&apos;t receive it? Check your spam folder or try again with the same
              email.
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
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
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Required to book airport transfers</Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Text style={styles.label}>Full name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} />

            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <PrimaryButton
              label={loading ? "Sending..." : "Send verification email"}
              onPress={handleSignup}
              disabled={loading}
              style={styles.btn}
            />

            <Pressable onPress={() => router.push("/login")} style={styles.linkWrap}>
              <Text style={styles.link}>Already have an account? Sign in</Text>
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
  scroll: { padding: 24, paddingTop: 48, paddingBottom: 40 },
  successWrap: {
    flex: 1,
    padding: 24,
    paddingTop: 48,
    alignItems: "center",
  },
  iconCircle: {
    marginTop: 28,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(106, 104, 222, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginTop: 20,
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.white,
    textAlign: "center",
  },
  subtitle: { marginTop: 8, fontSize: 15, color: "rgba(255,255,255,0.65)" },
  successLead: {
    marginTop: 16,
    fontSize: 15,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  emailHighlight: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.brandEnd,
    textAlign: "center",
  },
  successBody: {
    marginTop: 16,
    fontSize: 14,
    lineHeight: 22,
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
    maxWidth: 320,
  },
  hint: {
    marginTop: 16,
    fontSize: 12,
    lineHeight: 18,
    color: "rgba(255,255,255,0.45)",
    textAlign: "center",
    maxWidth: 300,
  },
  label: { marginTop: 16, marginBottom: 6, fontSize: 13, fontWeight: "600", color: COLORS.muted },
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
  btn: { marginTop: 24, width: "100%", maxWidth: 320 },
  error: { marginTop: 16, color: COLORS.danger, fontSize: 14 },
  linkWrap: { marginTop: 20, alignItems: "center" },
  link: { color: COLORS.brandEnd, fontSize: 15, fontWeight: "600" },
});
