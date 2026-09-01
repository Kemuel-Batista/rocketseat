import { StyleSheet } from "react-native";
import { colors } from "@theme/colors";

export const cryptoCardStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarLetter: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  symbol: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  right: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  changePositive: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.positive,
    marginTop: 2,
  },
  changeNegative: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.negative,
    marginTop: 2,
  },
  alertBadge: {
    marginTop: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: colors.primarySubtle,
  },
  alertBadgeText: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.onPrimary,
  },
  alertHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  alertChevron: {
    transform: [{ rotate: "0deg" }],
  },
  alertChevronExpanded: {
    transform: [{ rotate: "90deg" }],
  },
  alertList: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 4,
  },
  alertItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  alertItemTitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  alertItemValue: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.textPrimary,
  },
});

