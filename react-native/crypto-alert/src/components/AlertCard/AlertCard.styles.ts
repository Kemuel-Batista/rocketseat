import { StyleSheet } from "react-native";
import { colors } from "@theme/colors";

export const alertCardStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  left: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    gap: 12,
  },
  iconWrapAbove: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.positiveBg,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapBelow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.negativeBg,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  condition: {
    fontWeight: "600",
  },
  price: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
    marginTop: 8,
  },
  deleteBtn: {
    padding: 8,
    marginRight: -8,
    marginTop: -4,
  },
});
