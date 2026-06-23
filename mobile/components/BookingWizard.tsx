import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DEFAULT_AIRPORTS } from "../lib/airports";
import { createBooking, fetchMeta } from "../lib/api";
import { fetchCustomerProfile } from "../lib/customer-auth";
import {
  getSteps,
  INITIAL_FORM,
  STEP_META,
  toBookingPayload,
  validateStep,
  type StepId,
  type WizardForm,
} from "../lib/booking-steps";
import type { Airport } from "../lib/types";
import { COLORS, estimatePrice } from "../lib/theme";
import { Chip, Field, PrimaryButton } from "./form";
import { ErrorText, Label } from "./ui";
import { OptionCard, QuoteCard, StepHeading } from "./booking/BookingUi";

export function BookingWizard() {
  const [form, setForm] = useState<WizardForm>(INITIAL_FORM);
  const [airports, setAirports] = useState<Airport[]>(DEFAULT_AIRPORTS);
  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const steps = useMemo(() => getSteps(form.journeyType, form.serviceType), [form]);
  const currentStep = steps[stepIndex] ?? "journey";
  const isReturn = form.journeyType === "RETURN";
  const isAirport = form.serviceType === "AIRPORT_TRANSFER";
  const selectedAirport = airports.find((a) => a.code === form.airportCode);

  const price =
    form.journeyType && form.serviceType
      ? estimatePrice("SALOON", form.tripType, form.journeyType, form.serviceType)
      : 0;

  useEffect(() => {
    fetchMeta()
      .then((meta) => {
        if (meta.airports?.length) setAirports(meta.airports);
      })
      .catch(() => {});

    fetchCustomerProfile()
      .then((profile) => {
        setForm((prev) => ({
          ...prev,
          customerName: profile.name ?? prev.customerName,
          customerEmail: profile.email,
          customerPhone: profile.phone ?? prev.customerPhone,
        }));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (stepIndex >= steps.length) {
      setStepIndex(Math.max(0, steps.length - 1));
    }
  }, [steps.length, stepIndex]);

  function goTo(index: number) {
    setStepIndex(index);
    setError("");
  }

  function next() {
    if (stepIndex < steps.length - 1) goTo(stepIndex + 1);
  }

  function back() {
    if (stepIndex > 0) goTo(stepIndex - 1);
  }

  function update<K extends keyof WizardForm>(key: K, value: WizardForm[K]) {
    setForm((prev) => {
      const nextForm = { ...prev, [key]: value };
      if (key === "journeyType" && value === "RETURN") {
        nextForm.tripType = "TO_AIRPORT";
      }
      if (key === "airportCode" || key === "journeyType" || key === "tripType") {
        const airport = airports.find(
          (a) => a.code === (key === "airportCode" ? value : nextForm.airportCode)
        );
        if (airport && nextForm.serviceType === "AIRPORT_TRANSFER") {
          const label = `${airport.name} Airport (${airport.code})`;
          if (nextForm.journeyType === "RETURN" || nextForm.tripType === "TO_AIRPORT") {
            if (!nextForm.dropoffAddress.includes("Airport")) {
              nextForm.dropoffAddress = label;
            }
          }
        }
      }
      return nextForm;
    });
  }

  function selectJourney(value: "SINGLE" | "RETURN") {
    update("journeyType", value);
    setTimeout(() => goTo(1), 300);
  }

  function selectService(value: "AIRPORT_TRANSFER" | "PRE_BOOKED") {
    update("serviceType", value);
    setTimeout(() => goTo(stepIndex + 1), 300);
  }

  function selectDirection(value: "TO_AIRPORT" | "FROM_AIRPORT") {
    update("tripType", value);
    setTimeout(() => goTo(stepIndex + 1), 300);
  }

  function handleHomeAddress(value: string) {
    const airport = airports.find((a) => a.code === form.airportCode);
    const label = airport ? `${airport.name} Airport (${airport.code})` : "";
    setForm((prev) => ({
      ...prev,
      pickupAddress: value,
      dropoffAddress: label,
    }));
  }

  function handleContinue() {
    const err = validateStep(currentStep, form);
    if (err) {
      setError(err);
      return;
    }
    next();
  }

  async function handleSubmit() {
    const err = validateStep("contact", form);
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = toBookingPayload(form);
      if (isReturn && isAirport && selectedAirport) {
        payload.dropoffAddress = `${selectedAirport.name} Airport (${selectedAirport.code})`;
      }

      const result = await createBooking(payload);
      Alert.alert(
        "Booking confirmed",
        `Reference: ${result.reference}\nEstimated price: £${result.estimatedPrice}`,
        [
          {
            text: "OK",
            onPress: () => {
              setForm(INITIAL_FORM);
              goTo(0);
            },
          },
        ]
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setLoading(false);
    }
  }

  function renderStep() {
    switch (currentStep) {
      case "journey":
        return (
          <View>
            <StepHeading title="What type of journey?" subtitle="Select one to continue" />
            <View style={styles.optionRow}>
              <OptionCard
                icon="airplane-outline"
                label="Single journey"
                description="One-way airport transfer"
                selected={form.journeyType === "SINGLE"}
                onPress={() => selectJourney("SINGLE")}
              />
              <OptionCard
                icon="swap-horizontal-outline"
                label="Return journey"
                description="Outbound and return trip"
                selected={form.journeyType === "RETURN"}
                onPress={() => selectJourney("RETURN")}
              />
            </View>
          </View>
        );

      case "service":
        return (
          <View>
            <StepHeading
              title="What type of booking?"
              subtitle="Choose your service before selecting a route"
            />
            <View style={styles.optionRow}>
              <OptionCard
                icon="airplane-outline"
                label="Airport transfer"
                description="To or from a UK airport"
                selected={form.serviceType === "AIRPORT_TRANSFER"}
                onPress={() => selectService("AIRPORT_TRANSFER")}
              />
              <OptionCard
                icon="time-outline"
                label="Pre-booked journey"
                description="Private hire for any destination"
                selected={form.serviceType === "PRE_BOOKED"}
                onPress={() => selectService("PRE_BOOKED")}
              />
            </View>
          </View>
        );

      case "direction":
        return (
          <View>
            <StepHeading title="Which direction?" subtitle="Where are you heading?" />
            <View style={styles.optionRow}>
              <OptionCard
                icon="airplane-outline"
                label="To airport"
                description="Home or hotel → airport"
                selected={form.tripType === "TO_AIRPORT"}
                onPress={() => selectDirection("TO_AIRPORT")}
              />
              <OptionCard
                icon="airplane-outline"
                label="From airport"
                description="Airport → your destination"
                selected={form.tripType === "FROM_AIRPORT"}
                onPress={() => selectDirection("FROM_AIRPORT")}
              />
            </View>
          </View>
        );

      case "route":
        return (
          <View>
            <StepHeading
              title="Where are you travelling?"
              subtitle={
                isAirport
                  ? "Select your airport and addresses"
                  : "Enter your pickup and drop-off locations"
              }
            />
            {isAirport && (
              <>
                <Label>Airport</Label>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.chipRow}>
                    {airports.map((airport) => (
                      <Chip
                        key={airport.code}
                        label={`${airport.code} · ${airport.city}`}
                        selected={form.airportCode === airport.code}
                        onPress={() => update("airportCode", airport.code)}
                      />
                    ))}
                  </View>
                </ScrollView>
              </>
            )}
            {isReturn && isAirport ? (
              <Field
                label="Home / pickup address"
                value={form.pickupAddress}
                onChangeText={handleHomeAddress}
                placeholder="e.g. 12 High Street, Castleford"
              />
            ) : (
              <>
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
                  placeholder="Destination address"
                />
              </>
            )}
          </View>
        );

      case "schedule":
        return (
          <View>
            <StepHeading
              title="When do you need us?"
              subtitle={
                isReturn
                  ? "Enter your outbound and return times"
                  : "Pick your date and time"
              }
            />
            <Text style={styles.sectionLabel}>{isReturn ? "OUTBOUND" : "PICKUP"}</Text>
            <Field
              label={isReturn ? "Departure date" : "Date"}
              value={form.pickupDate}
              onChangeText={(v) => update("pickupDate", v)}
              placeholder="YYYY-MM-DD"
            />
            <Field
              label={isReturn ? "Pickup time" : "Time"}
              value={form.pickupTime}
              onChangeText={(v) => update("pickupTime", v)}
              placeholder="HH:MM"
            />
            {isAirport && (
              <Field
                label="Flight number (optional)"
                value={form.flightNumber}
                onChangeText={(v) => update("flightNumber", v)}
                placeholder="e.g. FR1234"
              />
            )}
            {isReturn && (
              <>
                <Text style={[styles.sectionLabel, styles.sectionLabelReturn]}>RETURN</Text>
                <Field
                  label="Return date"
                  value={form.returnDate}
                  onChangeText={(v) => update("returnDate", v)}
                  placeholder="YYYY-MM-DD"
                />
                <Field
                  label={isAirport ? "Landing / pickup time" : "Return pickup time"}
                  value={form.returnTime}
                  onChangeText={(v) => update("returnTime", v)}
                  placeholder="HH:MM"
                />
                {isAirport && (
                  <Field
                    label="Return flight number (optional)"
                    value={form.returnFlightNumber}
                    onChangeText={(v) => update("returnFlightNumber", v)}
                    placeholder="e.g. FR5678"
                  />
                )}
              </>
            )}
            <Text style={styles.sectionLabel}>PARTY SIZE</Text>
            <Field
              label="Passengers"
              value={String(form.passengers)}
              onChangeText={(v) => update("passengers", Number(v) || 1)}
              keyboardType="number-pad"
            />
            <Field
              label="Luggage pieces"
              value={String(form.luggage)}
              onChangeText={(v) => update("luggage", Number(v) || 0)}
              keyboardType="number-pad"
            />
          </View>
        );

      case "contact":
        return (
          <View>
            <StepHeading
              title="Your details"
              subtitle="Almost done — just need your contact info"
            />
            <Field
              label="Full name"
              value={form.customerName}
              onChangeText={(v) => update("customerName", v)}
            />
            <Field
              label="Phone number"
              value={form.customerPhone}
              onChangeText={(v) => update("customerPhone", v)}
              keyboardType="phone-pad"
              placeholder="07xxx xxxxxx"
            />
            <Field
              label="Email address"
              value={form.customerEmail}
              onChangeText={(v) => update("customerEmail", v)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Field
              label="Special requests (optional)"
              value={form.notes}
              onChangeText={(v) => update("notes", v)}
              placeholder="Child seat, wheelchair access, etc."
              multiline
            />
          </View>
        );

      default:
        return null;
    }
  }

  const showNav = form.journeyType && currentStep !== "journey";
  const showContinue =
    showNav &&
    currentStep !== "service" &&
    currentStep !== "direction" &&
    currentStep !== "contact";
  const progress = steps.length ? ((stepIndex + 1) / steps.length) * 100 : 0;

  return (
    <View style={styles.wrapper}>
      {form.journeyType ? (
        <View style={styles.progressWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.stepPills}>
              {steps.map((id, i) => {
                const done = i < stepIndex;
                const active = i === stepIndex;
                return (
                  <Pressable
                    key={id}
                    disabled={i > stepIndex}
                    onPress={() => i < stepIndex && goTo(i)}
                    style={[
                      styles.pill,
                      active && styles.pillActive,
                      done && styles.pillDone,
                    ]}
                  >
                    {done ? (
                      <Ionicons name="checkmark" size={14} color={COLORS.brandStart} />
                    ) : null}
                    <Text
                      style={[
                        styles.pillText,
                        active && styles.pillTextActive,
                        done && styles.pillTextDone,
                      ]}
                    >
                      {STEP_META[id].label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.stepCard}>
          <ErrorText message={error} />
          {renderStep()}
        </View>

        {form.journeyType && form.serviceType ? (
          <QuoteCard form={form} price={price} currentStep={currentStep} />
        ) : null}
      </ScrollView>

      {showNav ? (
        <View style={styles.footer}>
          <Pressable onPress={back} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={18} color={COLORS.muted} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>

          {currentStep === "contact" ? (
            <PrimaryButton
              label={loading ? "Submitting..." : "Confirm booking"}
              onPress={handleSubmit}
              disabled={loading}
              style={styles.continueBtn}
            />
          ) : showContinue ? (
            <PrimaryButton label="Continue" onPress={handleContinue} style={styles.continueBtn} />
          ) : (
            <View style={styles.continueBtn} />
          )}
        </View>
      ) : null}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.brandStart} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  progressWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  stepPills: { flexDirection: "row", gap: 8, paddingBottom: 10 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
  },
  pillActive: { backgroundColor: COLORS.brandStart },
  pillDone: { backgroundColor: "#eef0fc" },
  pillText: { fontSize: 12, fontWeight: "600", color: COLORS.muted },
  pillTextActive: { color: COLORS.white },
  pillTextDone: { color: COLORS.brandStart },
  progressTrack: {
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.brandStart,
    borderRadius: 999,
  },
  scroll: { padding: 16, paddingBottom: 100 },
  stepCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    minHeight: 360,
  },
  optionRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 8 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.brandStart,
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 4,
  },
  sectionLabelReturn: { color: COLORS.brandEnd, marginTop: 16 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 6, padding: 8 },
  backText: { fontSize: 15, fontWeight: "600", color: COLORS.muted },
  continueBtn: { minWidth: 140 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
});
