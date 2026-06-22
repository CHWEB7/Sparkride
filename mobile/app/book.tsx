import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppBackHeader } from "../components/AppBackHeader";
import { BookingWizard } from "../components/BookingWizard";
import { Screen } from "../components/ui";
import { useAuth } from "../lib/auth-context";
import { ensureDailyMfaAccess } from "../lib/mfa-guard";
import { COLORS } from "../lib/theme";

export default function BookScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    void ensureDailyMfaAccess(router);
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={COLORS.brandStart} size="large" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <AppBackHeader title="New booking" />
        <BookingWizard />
      </SafeAreaView>
    </Screen>
  );
}
