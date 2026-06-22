import { useCallback, useState } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { format } from "date-fns";
import { AppBackHeader } from "../components/AppBackHeader";
import { Screen } from "../components/ui";
import { useAuth } from "../lib/auth-context";
import { fetchMyBookings } from "../lib/customer-auth";
import type { Booking } from "../lib/types";
import { COLORS, formatStatus } from "../lib/theme";

export default function MyBookingsScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useFocusEffect(
    useCallback(() => {
      if (!user) {
        router.replace("/login");
        return;
      }

      setLoading(true);
      fetchMyBookings()
        .then(setBookings)
        .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
        .finally(() => setLoading(false));
    }, [user, router])
  );

  if (authLoading) {
    return (
      <Screen>
        <ActivityIndicator style={{ marginTop: 80 }} color={COLORS.brandStart} />
      </Screen>
    );
  }

  return (
    <Screen>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <AppBackHeader title="My bookings" />

        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.brandStart} />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : bookings.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No bookings yet</Text>
            <Pressable onPress={() => router.push("/book")} style={styles.emptyBtn}>
              <Text style={styles.emptyBtnText}>Book a transfer</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={bookings}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.ref}>{item.reference}</Text>
                <Text style={styles.date}>
                  {format(new Date(item.pickupDate), "EEE d MMM yyyy · HH:mm")}
                </Text>
                <Text style={styles.route} numberOfLines={2}>
                  {item.pickupAddress} → {item.dropoffAddress}
                </Text>
                <Text style={styles.status}>{formatStatus(item.status)}</Text>
              </View>
            )}
          />
        )}
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  ref: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  date: { marginTop: 6, fontSize: 14, color: COLORS.muted },
  route: { marginTop: 6, fontSize: 14, color: COLORS.text },
  status: { marginTop: 10, fontSize: 12, fontWeight: "700", color: COLORS.brandStart },
  error: { padding: 16, color: COLORS.danger },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  emptyText: { fontSize: 16, color: COLORS.muted },
  emptyBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.brandStart,
    borderRadius: 999,
  },
  emptyBtnText: { color: COLORS.white, fontWeight: "600" },
});
