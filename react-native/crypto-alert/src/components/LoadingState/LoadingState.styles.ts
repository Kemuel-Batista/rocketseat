import { StyleSheet } from "react-native";
import { colors } from "@theme/colors";

export const loadingStateStyles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  message: {
    marginTop: 16,
    fontSize: 14,
    color: colors.textSecondary,
  },
});
