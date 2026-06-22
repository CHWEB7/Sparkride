import { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
import { sendMfaEmailCode, verifyMfaEmailCode } from "../lib/customer-auth";
import { supabase } from "../lib/supabase";
import { COLORS } from "../lib/theme";

const OTP_STORAGE_KEY = "sparkride_otp_requested";

export default function Verify2faScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  const sendCode = useCallback(async () => {
    setSending(true);
    setError("");
    setInfo("");
    try {
      const result = await sendMfaEmailCode();
      setCodeSent(true);
      setResendIn(result.resendIn);
      if (result.skipped) {
        setInfo("Please wait before requesting another code. Check your inbox.");
        return;
      }
      await AsyncStorage.setItem(OTP_STORAGE_KEY, String(Date.now()));
      setInfo("Verification code sent — check your inbox and spam folder.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setSending(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        router.replace("/login");
        return;
      }
      setEmail(user.email);

      const lastRequested = await AsyncStorage.getItem(OTP_STORAGE_KEY);
      if (lastRequested) {
        const elapsed = (Date.now() - Number(lastRequested)) / 1000;
        if (elapsed < 120) {
          setCodeSent(true);
          setResendIn(Math.ceil(120 - elapsed));
        }
      }
    })();
  }, [router]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((n) => n - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  async function handleVerify() {
    if (!email || code.trim().length < 6) return;
    setLoading(true);
    setError("");
    try {
      await verifyMfaEmailCode(code.trim());
      await AsyncStorage.removeItem(OTP_STORAGE_KEY);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code");
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
            <View style={styles.iconCircle}>
              <Ionicons name="shield-checkmark-outline" size={32} color={COLORS.brandStart} />
            </View>
            <Text style={styles.title}>Verify your email</Text>
            <Text style={styles.subtitle}>
              {codeSent
                ? "Enter the 6-digit code we sent. Required once per day; your session ends at midnight."
                : "We will email you a one-time code to continue."}
            </Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}
            {info ? <Text style={styles.info}>{info}</Text> : null}

            {email ? (
              <Text style={styles.emailLine}>
                {codeSent ? "Code sent to" : "Code will be sent to"}{" "}
                <Text style={styles.emailHighlight}>{email}</Text>
              </Text>
            ) : null}

            {!codeSent ? (
              <PrimaryButton
                label={sending ? "Sending..." : "Send verification code"}
                onPress={sendCode}
                disabled={sending || !email}
                style={styles.btn}
              />
            ) : (
              <>
                <Text style={styles.label}>Verification code</Text>
                <TextInput
                  style={[styles.input, styles.codeInput]}
                  value={code}
                  onChangeText={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))}
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholder="000000"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                />

                <PrimaryButton
                  label={loading ? "Verifying..." : "Verify and continue"}
                  onPress={handleVerify}
                  disabled={loading || code.length < 6}
                  style={styles.btn}
                />

                <Pressable
                  onPress={sendCode}
                  disabled={sending || resendIn > 0}
                  style={styles.linkWrap}
                >
                  <Text style={[styles.link, (sending || resendIn > 0) && styles.linkDisabled]}>
                    {sending
                      ? "Sending..."
                      : resendIn > 0
                        ? `Resend code in ${resendIn}s`
                        : "Resend code"}
                  </Text>
                </Pressable>
              </>
            )}
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
  iconCircle: {
    marginTop: 24,
    alignSelf: "center",
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
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
  },
  emailLine: {
    marginTop: 20,
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
  },
  emailHighlight: { color: COLORS.brandEnd, fontWeight: "700" },
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
  codeInput: {
    textAlign: "center",
    fontSize: 22,
    letterSpacing: 8,
    fontVariant: ["tabular-nums"],
  },
  btn: { marginTop: 24 },
  error: { marginTop: 16, color: COLORS.danger, fontSize: 14, textAlign: "center" },
  info: { marginTop: 16, color: COLORS.brandEnd, fontSize: 14, textAlign: "center" },
  linkWrap: { marginTop: 20, alignItems: "center" },
  link: { color: COLORS.brandEnd, fontSize: 15, fontWeight: "600" },
  linkDisabled: { opacity: 0.5 },
});
