import { StyleSheet } from "react-native";
import { colors } from "@theme/colors";

export const priceAlertsScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: colors.textPrimary,
    flex: 1,
  },
  listContent: {
    gap: 12,
    paddingBottom: 16,
  },
});
