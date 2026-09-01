import { StyleSheet } from "react-native";
import { colors } from "@theme/colors";

export const cryptoListScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 24,
  },
  list: {
    gap: 12,
  },
  listContent: {
    paddingBottom: 16,
    gap: 12,
  },
});
