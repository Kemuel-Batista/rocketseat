import { StyleSheet } from "react-native";
import { colors } from "@theme/colors";

export const primaryButtonStyles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  fullWidth: {
    alignSelf: "stretch",
  },
  label: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  labelSmall: {
    fontSize: 14,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pressed: {
    opacity: 0.9,
  },
});
