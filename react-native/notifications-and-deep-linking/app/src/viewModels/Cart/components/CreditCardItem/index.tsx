import { Text, TouchableOpacity, View } from "react-native";
import { CreditCard } from "../../../../shared/interfaces/credit-card";
import { FC } from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../../styles/colors";
import { CreditCardItemView } from "./CreditCardItem.view";
import { useCreditCardItemViewModel } from "./useCreditCardItem.viewModel";

interface CreditCardItemParams {
  creditCard: CreditCard;
  isSelected: boolean;
  setSelectedCreditCard: (creditCard: CreditCard) => void;
}

export const CreditCardItem: FC<CreditCardItemParams> = ({
  creditCard,
  isSelected,
  setSelectedCreditCard,
}) => {
  const viewModel = useCreditCardItemViewModel(creditCard);

  return (
    <CreditCardItemView
      isSelected={isSelected}
      setSelectedCreditCard={setSelectedCreditCard}
      {...viewModel}
    />
  );
};
