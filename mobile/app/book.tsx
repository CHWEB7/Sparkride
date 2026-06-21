import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppBackHeader } from "../components/AppBackHeader";
import { Chip, Field, PrimaryButton } from "../components/form";
import { Card, ErrorText, Label, Screen, SectionTitle } from "../components/ui";
import { createBooking, fetchMeta } from "../lib/api";
import type { Airport, BookingInput } from "../lib/types";
import { COLORS, estimatePrice } from "../lib/theme";

const defaultForm: BookingInput = {
  serviceType: "AIRPORT_TRANSFER",
  journeyType: "SINGLE",
  tripType: "TO_AIRPORT",
  airportCode: "LBA",
  pickupAddress: "",
  dropoffAddress: "",
  pickupDate: "",
  pickupTime: "09:00",
  returnDate: "",
  returnTime: "17:00",
  passengers: 1,
  luggage: 1,
  vehicleType: "SALOON",
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  flightNumber: "",
  notes: "",
};

export default function BookScreen() {
  const [form, setForm] = useState<BookingInput>(defaultForm);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMeta()
      .then((meta) => setAirports(meta.airports))
      .catch(() =>
        setAirports([{ code: "LBA", name: "Leeds Bradford", city: "Leeds", region: "Yorkshire" }])
      )
      .finally(() => setBootLoading(false));
  }, []);

  const price = useMemo(
    () =>
      estimatePrice(form.vehicleType, form.tripType, form.journeyType, form.serviceType),
    [form]
  );

  function update<K extends keyof BookingInput>(key: K, value: BookingInput[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "airportCode" && typeof value === "string") {
        const airport = airports.find((a) => a.code === value);
        if (airport && next.serviceType === "AIRPORT_TRANSFER") {
          const label = `${airport.name} Airport (${airport.code})`;
          if (next.journeyType === "RETURN" || next.tripType === "TO_AIRPORT") {
            next.dropoffAddress = label;
          } else {
            next.pickupAddress = label;
          }
        }
      }
      return next;
    });
  }

  async function submit() {
    setError("");
    setLoading(true);
    try {
      const result = await createBooking(form);
      Alert.alert(
        "Booking confirmed",
        `Reference: ${result.reference}\nEstimated price: £${result.estimatedPrice}`,
        [{ text: "OK", onPress: () => setForm(defaultForm) }]
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setLoading(false);
    }
  }

  if (bootLoading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.brandStart} size="large" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <AppBackHeader title="New booking" />
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <SectionTitle
            title="Book a transfer"
            subtitle="Airport transfers and pre-booked journeys"
          />

          <Card>
            <Label>Journey type</Label>
            <View style={styles.row}>
              <Chip
                label="Single"
                selected={form.journeyType === "SINGLE"}
                onPress={() => update("journeyType", "SINGLE")}
              />
              <Chip
                label="Return"
                selected={form.journeyType === "RETURN"}
                onPress={() => update("journeyType", "RETURN")}
              />
            </View>

            <Label>Service</Label>
            <View style={styles.row}>
              <Chip
                label="Airport transfer"
                selected={form.serviceType === "AIRPORT_TRANSFER"}
                onPress={() => update("serviceType", "AIRPORT_TRANSFER")}
              />
              <Chip
                label="Pre-booked"
                selected={form.serviceType === "PRE_BOOKED"}
                onPress={() => update("serviceType", "PRE_BOOKED")}
              />
            </View>

            {form.serviceType === "AIRPORT_TRANSFER" && form.journeyType === "SINGLE" && (
              <>
                <Label>Direction</Label>
                <View style={styles.row}>
                  <Chip
                    label="To airport"
                    selected={form.tripType === "TO_AIRPORT"}
                    onPress={() => update("tripType", "TO_AIRPORT")}
                  />
                  <Chip
                    label="From airport"
                    selected={form.tripType === "FROM_AIRPORT"}
                    onPress={() => update("tripType", "FROM_AIRPORT")}
                  />
                </View>
              </>
            )}

            {form.serviceType === "AIRPORT_TRANSFER" && (
              <>
                <Label>Airport</Label>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.row}>
                    {airports.map((airport) => (
                      <Chip
                        key={airport.code}
                        label={airport.code}
                        selected={form.airportCode === airport.code}
                        onPress={() => update("airportCode", airport.code)}
                      />
                    ))}
                  </View>
                </ScrollView>
              </>
            )}

            <Field
              label="Pickup address"
              value={form.pickupAddress}
              onChangeText={(v) => update("pickupAddress", v)}
              placeholder="Street, city, postcode"
            />
            <Field
              label="Drop-off address"
              value={form.dropoffAddress}
              onChangeText={(v) => update("dropoffAddress", v)}
              placeholder="Street, city, postcode"
            />
            <Field
              label="Pickup date (YYYY-MM-DD)"
              value={form.pickupDate}
              onChangeText={(v) => update("pickupDate", v)}
              placeholder="2026-06-20"
            />
            <Field
              label="Pickup time (HH:MM)"
              value={form.pickupTime}
              onChangeText={(v) => update("pickupTime", v)}
              placeholder="09:00"
            />

            {form.journeyType === "RETURN" && (
              <>
                <Field
                  label="Return date (YYYY-MM-DD)"
                  value={form.returnDate || ""}
                  onChangeText={(v) => update("returnDate", v)}
                  placeholder="2026-06-27"
                />
                <Field
                  label="Return time (HH:MM)"
                  value={form.returnTime || ""}
                  onChangeText={(v) => update("returnTime", v)}
                  placeholder="17:00"
                />
              </>
            )}

            <Label>Vehicle</Label>
            <View style={styles.row}>
              {(["SALOON", "ESTATE", "MPV", "EXECUTIVE"] as const).map((v) => (
                <Chip
                  key={v}
                  label={v.charAt(0) + v.slice(1).toLowerCase()}
                  selected={form.vehicleType === v}
                  onPress={() => update("vehicleType", v)}
                />
              ))}
            </View>

            <Field
              label="Passengers"
              value={String(form.passengers)}
              onChangeText={(v) => update("passengers", Number(v) || 1)}
              keyboardType="number-pad"
            />
            <Field
              label="Luggage"
              value={String(form.luggage)}
              onChangeText={(v) => update("luggage", Number(v) || 0)}
              keyboardType="number-pad"
            />
            <Field
              label="Your name"
              value={form.customerName}
              onChangeText={(v) => update("customerName", v)}
            />
            <Field
              label="Email"
              value={form.customerEmail}
              onChangeText={(v) => update("customerEmail", v)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Field
              label="Phone"
              value={form.customerPhone}
              onChangeText={(v) => update("customerPhone", v)}
              keyboardType="phone-pad"
            />
            <Field
              label="Flight number (optional)"
              value={form.flightNumber || ""}
              onChangeText={(v) => update("flightNumber", v)}
            />
            <Field
              label="Notes (optional)"
              value={form.notes || ""}
              onChangeText={(v) => update("notes", v)}
              multiline
            />

            <View style={styles.priceBox}>
              <Text style={styles.priceLabel}>Estimated price</Text>
              <Text style={styles.priceValue}>£{price}</Text>
            </View>

            <ErrorText message={error} />
            <PrimaryButton
              label={loading ? "Submitting..." : "Confirm booking"}
              onPress={submit}
              disabled={loading}
              style={{ marginTop: 8 }}
            />
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
  row: { flexDirection: "row", flexWrap: "wrap" },
  priceBox: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: { color: COLORS.muted, fontWeight: "600" },
  priceValue: { fontSize: 22, fontWeight: "700", color: COLORS.brandStart },
});
