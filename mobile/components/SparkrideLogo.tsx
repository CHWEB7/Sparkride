import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../lib/theme";

type Size = "md" | "lg";

const SIZES = {
  md: { box: 72, icon: 32, text: 28 },
  lg: { box: 96, icon: 42, text: 36 },
};

export function SparkrideLogo({
  size = "lg",
  light = true,
}: {
  size?: Size;
  light?: boolean;
}) {
  const s = SIZES[size];

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.mark,
          {
            width: s.box,
            height: s.box,
            borderRadius: s.box / 2,
          },
        ]}
      >
        <Ionicons name="airplane" size={s.icon} color={COLORS.white} />
      </View>
      <Text
        style={[
          styles.name,
          { fontSize: s.text },
          light ? styles.nameLight : styles.nameDark,
        ]}
      >
        Sparkride
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    gap: 16,
  },
  mark: {
    backgroundColor: COLORS.brandStart,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.brandEnd,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  name: {
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  nameLight: {
    color: COLORS.white,
  },
  nameDark: {
    color: COLORS.text,
  },
});
