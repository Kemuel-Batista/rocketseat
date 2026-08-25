import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../../../styles/colors";
import { FC } from "react";
import { useCreditCardItemViewModel } from "./useCreditCardItem.viewModel";
import { CreditCard } from "../../../../shared/interfaces/credit-card";

export const CreditCardItemView: FC<
  ReturnType<typeof useCreditCardItemViewModel> & {
    isSelected: boolean;
    setSelectedCreditCard: (creditCard: CreditCard) => void;
  }
> = ({
  creditCard,
  formatedExpirationDate,
  formatedCardNumber,
  isSelected,
  setSelectedCreditCard,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => setSelectedCreditCard(creditCard)}
      className={`p-4 rounded-lg border-[1px] bg-white ${
        isSelected ? "border-purple-base" : "border-gray-100"
      }`}
    >
      <View className="flex-row justify-between">
        <View className="mr-4">
          <Ionicons
            name="card-outline"
            size={24}
            color={colors["purple-base"]}
          />
        </View>

        <View className="flex-1">
          <Text className="text-base">Cartão final {formatedCardNumber}</Text>
          <Text className="text-sm text-gray-500 mt-1">
            {formatedExpirationDate}
          </Text>
        </View>

        <TouchableOpacity>
          <Ionicons color={colors["purple-base"]} name="pencil" size={18} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};
