import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { format } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { fetchBookings, getApiBaseUrl } from "@/lib/api";
import type { Booking } from "@/lib/types";
import { COLORS, STATUS_COLORS, formatStatus } from "@/lib/theme";
import { ErrorText, Screen, SectionTitle } from "@/components/ui";

export default function DriverListScreen() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const data = await fetchBookings();
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function renderItem({ item }: { item: Booking }) {
    const colors = STATUS_COLORS[item.status] || STATUS_COLORS.PENDING;
    return (
      <Pressable
        style={styles.card}
        onPress={() => router.push(`/driver/${item.id}`)}
      >
        <View style={styles.cardTop}>
          <Text style={styles.ref}>{item.reference}</Text>
          <View style={[styles.badge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.badgeText, { color: colors.text }]}>
              {formatStatus(item.status)}
            </Text>
          </View>
        </View>
        <Text style={styles.date}>
          {format(new Date(item.pickupDate), "EEE d MMM yyyy · HH:mm")}
        </Text>
        <View style={styles.routeRow}>
          <Ionicons name="location-outline" size={16} color={COLORS.muted} />
          <Text style={styles.route} numberOfLines={1}>
            {item.pickupAddress}
          </Text>
        </View>
        <View style={styles.routeRow}>
          <Ionicons name="flag-outline" size={16} color={COLORS.muted} />
          <Text style={styles.route} numberOfLines={1}>
            {item.dropoffAddress}
          </Text>
        </View>
        <Text style={styles.customer}>{item.customerName}</Text>
      </Pressable>
    );
  }

  return (
    <Screen>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <SectionTitle title="Driver bookings" subtitle="All active and upcoming jobs" />
          <Text style={styles.apiHint}>API: {getApiBaseUrl()}</Text>
          <ErrorText message={error} />
        </View>

        {loading && !refreshing ? (
          <View style={styles.center}>
            <ActivityIndicator color={COLORS.brandStart} size="large" />
          </View>
        ) : (
          <FlatList
            data={bookings}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />
            }
            ListEmptyComponent={
              <Text style={styles.empty}>No bookings yet. Pull to refresh.</Text>
            }
          />
        )}
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 8 },
  apiHint: { fontSize: 12, color: COLORS.muted, marginBottom: 8 },
  list: { padding: 20, paddingTop: 8, paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  ref: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  date: { color: COLORS.muted, marginBottom: 10 },
  routeRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  route: { flex: 1, color: COLORS.text },
  customer: { marginTop: 8, fontWeight: "600", color: COLORS.brandStart },
  empty: { textAlign: "center", color: COLORS.muted, marginTop: 40 },
});
