import { StyleSheet } from "react-native";
import { colors } from "@theme/colors";

export const createAlertScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  stack: {
    gap: 24,
  },
  label: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  fieldBlock: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  currency: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  priceInput: {
    flex: 1,
    fontSize: 20,
    color: colors.textPrimary,
    padding: 0,
    minHeight: 36,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    marginTop: 8,
  },
  conditionLabel: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  conditionStack: {
    gap: 12,
  },
});
