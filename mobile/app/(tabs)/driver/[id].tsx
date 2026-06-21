import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { format } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { fetchBookings, updateBookingStatus } from "@/lib/api";
import type { Booking } from "@/lib/types";
import { COLORS, STATUS_COLORS, formatStatus } from "@/lib/theme";
import { Card, ErrorText, Label, Screen } from "@/components/ui";
import { Chip } from "@/components/form";

const STATUSES = ["PENDING", "CONFIRMED", "EN_ROUTE", "COMPLETED", "CANCELLED"];

export default function DriverDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const all = await fetchBookings();
      const found = all.find((b) => b.id === id) || null;
      setBooking(found);
      if (!found) setError("Booking not found");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load booking");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function changeStatus(status: string) {
    if (!booking) return;
    setUpdating(true);
    setError("");
    try {
      const updated = await updateBookingStatus(booking.id, status);
      setBooking(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setUpdating(false);
    }
  }

  function callCustomer() {
    if (booking?.customerPhone) {
      Linking.openURL(`tel:${booking.customerPhone}`);
    }
  }

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.brandStart} size="large" />
        </View>
      </Screen>
    );
  }

  if (!booking) {
    return (
      <Screen>
        <SafeAreaView style={styles.safe}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <ErrorText message={error || "Booking not found"} />
        </SafeAreaView>
      </Screen>
    );
  }

  const colors = STATUS_COLORS[booking.status] || STATUS_COLORS.PENDING;

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.titleRow}>
            <Text style={styles.ref}>{booking.reference}</Text>
            <View style={[styles.badge, { backgroundColor: colors.bg }]}>
              <Text style={[styles.badgeText, { color: colors.text }]}>
                {formatStatus(booking.status)}
              </Text>
            </View>
          </View>

          <Card>
            <Label>Schedule</Label>
            <Text style={styles.value}>
              {format(new Date(booking.pickupDate), "EEEE d MMMM yyyy · HH:mm")}
            </Text>
            {booking.returnPickupDate && (
              <Text style={styles.subValue}>
                Return: {format(new Date(booking.returnPickupDate), "EEE d MMM · HH:mm")}
              </Text>
            )}
          </Card>

          <Card>
            <Label>Route</Label>
            <Text style={styles.routeLabel}>Pickup</Text>
            <Text style={styles.value}>{booking.pickupAddress}</Text>
            <Text style={styles.routeLabel}>Drop-off</Text>
            <Text style={styles.value}>{booking.dropoffAddress}</Text>
            {booking.airportName && (
              <Text style={styles.subValue}>Airport: {booking.airportName}</Text>
            )}
          </Card>

          <Card>
            <Label>Customer</Label>
            <Text style={styles.value}>{booking.customerName}</Text>
            <Pressable onPress={callCustomer} style={styles.phoneRow}>
              <Ionicons name="call-outline" size={18} color={COLORS.brandStart} />
              <Text style={styles.phone}>{booking.customerPhone}</Text>
            </Pressable>
            {booking.flightNumber && (
              <Text style={styles.subValue}>Flight: {booking.flightNumber}</Text>
            )}
            {booking.notes && <Text style={styles.subValue}>Notes: {booking.notes}</Text>}
          </Card>

          <Card>
            <Label>Vehicle & passengers</Label>
            <Text style={styles.value}>
              {booking.vehicleType} · {booking.passengers} passengers · {booking.luggage} bags
            </Text>
            {booking.estimatedPrice != null && (
              <Text style={styles.price}>£{booking.estimatedPrice}</Text>
            )}
          </Card>

          <Card>
            <Label>Update status</Label>
            <View style={styles.statusRow}>
              {STATUSES.map((status) => (
                <Chip
                  key={status}
                  label={formatStatus(status)}
                  selected={booking.status === status}
                  onPress={() => changeStatus(status)}
                />
              ))}
            </View>
            {updating && (
              <ActivityIndicator color={COLORS.brandStart} style={{ marginTop: 12 }} />
            )}
            <ErrorText message={error} />
          </Card>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backText: { fontSize: 16, fontWeight: "600", color: COLORS.text },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  ref: { fontSize: 22, fontWeight: "700", color: COLORS.text },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  value: { fontSize: 16, color: COLORS.text, lineHeight: 22 },
  subValue: { fontSize: 14, color: COLORS.muted, marginTop: 6 },
  routeLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.muted,
    marginTop: 10,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  phoneRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  phone: { fontSize: 16, fontWeight: "600", color: COLORS.brandStart },
  price: { fontSize: 20, fontWeight: "700", color: COLORS.brandStart, marginTop: 8 },
  statusRow: { flexDirection: "row", flexWrap: "wrap" },
});
