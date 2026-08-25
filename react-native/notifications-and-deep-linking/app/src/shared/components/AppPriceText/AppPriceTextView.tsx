import { FC } from "react";
import { useAppPriceTextViewModel } from "./useAppPricetextViewModel";
import { Text, View } from "react-native";

export const AppPriceTextView: FC<
  ReturnType<typeof useAppPriceTextViewModel> & {
    classNameCurrency?: string;
    classNameValue?: string;
  }
> = ({
  classNameCurrency,
  classNameValue,
  curremcySymbol,
  formatPrice,
  value,
  valueText,
}) => {
  return (
    <View className="flex-row items-baseline">
      <Text className={classNameCurrency ?? "text-sm text-gray-900"}>
        {curremcySymbol}
      </Text>
      <Text className={classNameValue ?? "text-2xl font-bold text-gray-900"}>
        {" "}
        {valueText}
      </Text>
    </View>
  );
};
