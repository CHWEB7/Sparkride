import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../lib/theme";

export function OptionCard({
  label,
  description,
  selected,
  onPress,
  icon,
}: {
  label: string;
  description: string;
  selected: boolean;
  onPress: () => void;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, selected && styles.cardSelected]}
    >
      <Ionicons name={icon} size={36} color={COLORS.brandStart} style={styles.icon} />
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.desc}>{description}</Text>
    </Pressable>
  );
}

export function StepHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.heading}>
      <View style={styles.accent} />
      <View style={styles.headingText}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

export function QuoteCard({
  form,
  price,
  currentStep,
}: {
  form: {
    journeyType: string;
    serviceType: string;
    tripType: string;
    airportCode: string;
  };
  price: number;
  currentStep: string;
}) {
  const isReturn = form.journeyType === "RETURN";
  const isAirport = form.serviceType === "AIRPORT_TRANSFER";

  return (
    <View style={styles.quote}>
      <View style={styles.quoteHeader}>
        <View style={styles.quoteDot} />
        <Text style={styles.quoteTitle}>YOUR QUOTE</Text>
      </View>
      <View style={styles.quoteRow}>
        <Text style={styles.quoteLabel}>Journey</Text>
        <Text style={styles.quoteValue}>{isReturn ? "Return" : "Single"}</Text>
      </View>
      <View style={styles.quoteRow}>
        <Text style={styles.quoteLabel}>Service</Text>
        <Text style={styles.quoteValue}>{isAirport ? "Airport transfer" : "Pre-booked"}</Text>
      </View>
      {form.journeyType === "SINGLE" && isAirport && (
        <View style={styles.quoteRow}>
          <Text style={styles.quoteLabel}>Direction</Text>
          <Text style={styles.quoteValue}>
            {form.tripType === "TO_AIRPORT" ? "To airport" : "From airport"}
          </Text>
        </View>
      )}
      {isAirport && !["journey", "service"].includes(currentStep) && (
        <View style={styles.quoteRow}>
          <Text style={styles.quoteLabel}>Airport</Text>
          <Text style={styles.quoteValue}>{form.airportCode}</Text>
        </View>
      )}
      <View style={styles.quoteTotal}>
        <Text style={styles.quoteTotalLabel}>Estimated total</Text>
        <Text style={styles.quotePrice}>£{price}</Text>
        {isReturn && <Text style={styles.discount}>Includes 10% return discount</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardSelected: {
    borderColor: COLORS.brandStart,
    backgroundColor: "#eef0fc",
  },
  icon: { marginBottom: 12 },
  label: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  desc: { fontSize: 14, color: COLORS.muted, marginTop: 6, lineHeight: 20 },
  heading: { flexDirection: "row", marginBottom: 20, gap: 12 },
  accent: {
    width: 4,
    borderRadius: 4,
    backgroundColor: COLORS.brandStart,
    minHeight: 32,
  },
  headingText: { flex: 1 },
  title: { fontSize: 24, fontWeight: "600", color: COLORS.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: COLORS.muted, marginTop: 4 },
  quote: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  quoteHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  quoteDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.brandStart },
  quoteTitle: { fontSize: 12, fontWeight: "700", color: COLORS.muted, letterSpacing: 0.5 },
  quoteRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  quoteLabel: { fontSize: 14, color: COLORS.muted },
  quoteValue: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  quoteTotal: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  quoteTotalLabel: { fontSize: 14, color: COLORS.muted },
  quotePrice: { fontSize: 32, fontWeight: "700", color: COLORS.brandStart, marginTop: 4 },
  discount: { fontSize: 12, color: COLORS.brandStart, marginTop: 4 },
});
