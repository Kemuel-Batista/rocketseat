import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AppPriceText } from "../../../../shared/components/AppPriceText";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../../styles/colors";
import { AppButton } from "../../../../shared/components/AppButton";
import { FC } from "react";
import { useCartFooterViewModel } from "./useCartFooter.viewModel";
import { CartFooterParams } from ".";
import { CreditCardItem } from "../CreditCardItem";

export const CartFooterView: FC<
  ReturnType<typeof useCartFooterViewModel> & CartFooterParams
> = ({
  creditCards,
  loadingCreditCards,
  openCartBottomSheet,
  total,
  selectedCreditCard,
  setSelectedCreditCard,
  isOrderLoading,
  submitOrderMutation,
}) => {
  return (
    <View className="bg-white p-4 rounded-lg mt-6">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xs font-semibold text-gray-600">VALOR TOTAL</Text>
        <AppPriceText
          value={total}
          classNameCurrency="text-base text-gray-900 font-bold"
          classNameValue="text-base text-gray-900 font-bold"
        />
      </View>

      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-[10px] font-semibold text-gray-600">
            CARTÕES DE CRÉDITO
          </Text>

          <TouchableOpacity className="flex-row items-center">
            <Ionicons
              name="card-outline"
              size={20}
              color={colors["purple-base"]}
            />
            <Text
              onPress={openCartBottomSheet}
              className="text-purple-base ml-2 text-sm font-bold"
            >
              Adicionar cartão
            </Text>
          </TouchableOpacity>
        </View>

        {loadingCreditCards ? (
          <View className="py-4 items-center">
            <ActivityIndicator size={"small"} color={colors["purple-base"]} />
            <Text className="text-gray-500 text-xm mt-2">
              Carregando cartões
            </Text>
          </View>
        ) : (
          <FlatList
            data={creditCards}
            renderItem={({ item: creditCard }) => (
              <CreditCardItem
                isSelected={creditCard.id === selectedCreditCard?.id}
                creditCard={creditCard}
                setSelectedCreditCard={setSelectedCreditCard}
              />
            )}
            className="gap-2"
          />
        )}

        <AppButton
          onPress={submitOrderMutation}
          className="mt-4"
          isLoading={isOrderLoading}
        >
          Confirmar Compra
        </AppButton>
      </View>
    </View>
  );
};
