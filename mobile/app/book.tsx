import { SafeAreaView } from "react-native-safe-area-context";
import { AppBackHeader } from "../components/AppBackHeader";
import { BookingWizard } from "../components/BookingWizard";
import { Screen } from "../components/ui";

export default function BookScreen() {
  return (
    <Screen>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <AppBackHeader title="New booking" />
        <BookingWizard />
      </SafeAreaView>
    </Screen>
  );
}
