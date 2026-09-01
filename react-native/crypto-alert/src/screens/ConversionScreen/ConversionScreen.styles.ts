import { StyleSheet } from "react-native";
import { colors } from "@theme/colors";

export const conversionScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 24,
  },
  stack: {
    gap: 24,
  },
  fieldBlock: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  amountLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  amountInput: {
    fontSize: 28,
    color: colors.textPrimary,
    padding: 0,
    minHeight: 40,
  },
  arrowWrap: {
    alignItems: "center",
  },
  arrowCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  resultBox: {
    backgroundColor: colors.resultPanel,
    borderRadius: 16,
    padding: 24,
    minHeight: 120,
    justifyContent: "center",
  },
  resultLabel: {
    fontSize: 14,
    color: colors.resultLabelMuted,
    marginBottom: 8,
  },
  resultPlaceholder: {
    fontSize: 22,
    color: colors.resultLabelMuted,
  },
  resultInvalid: {
    fontSize: 18,
    color: colors.negative,
  },
  resultValue: {
    fontSize: 28,
    fontWeight: "600",
    color: colors.resultText,
  },
});
