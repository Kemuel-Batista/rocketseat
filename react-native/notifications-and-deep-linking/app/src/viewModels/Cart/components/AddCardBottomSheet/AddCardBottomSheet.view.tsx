import { FC } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAddCardBottomSheetViewModel } from "./useAddCardBottomSheet.viewModel";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../../styles/colors";
import { AppInput } from "../../../../shared/components/AppInput";
import { AppButton } from "../../../../shared/components/AppButton";
import { AppInputController } from "../../../../shared/components/AppInputController";
import { CreditCard } from "./components/CreditCard";

export const AddCardBottomSheetView: FC<
  ReturnType<typeof useAddCardBottomSheetViewModel>
> = ({
  handleCreateCreditCard,
  control,
  expirationDateMask,
  cardNumberMask,
  handleFieldBlur,
  handleFieldFocus,
  isFlipped,
  focusedField,
  carData,
}) => {
  return (
    <ScrollView className="flex-1">
      <View className="p-8">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="font-bol text-2xl text-center text-gray-900">
            Adicionar cartão
          </Text>
          <TouchableOpacity className="w-8 items-center justify-center border border-gray-400 rounded-[10px]">
            <Ionicons name="close" size={24} color={colors.gray[400]} />
          </TouchableOpacity>
        </View>

        <CreditCard
          cardData={carData}
          focusedField={focusedField}
          isFlipped={isFlipped}
        />

        <View className="mt-6 gap-4">
          <AppInputController
            control={control}
            name="titularName"
            leftIcon="person-outline"
            label="NOME DO TITULAR"
            placeholder="Nome completo"
            onFocus={() => handleFieldFocus("name")}
            onBlur={handleFieldBlur}
          />

          <AppInputController
            control={control}
            name="number"
            leftIcon="card-outline"
            label="NÚMERO"
            placeholder="Número do cartão"
            mask={cardNumberMask}
            maxLength={19}
            onFocus={() => handleFieldFocus("number")}
            onBlur={handleFieldBlur}
          />

          <View className="flex-row gap-2">
            <View className="flex-1">
              <AppInputController
                control={control}
                name="expirationDate"
                leftIcon="calendar-outline"
                label="VENCIMENTO"
                placeholder="MM/AA"
                keyboardType="numeric"
                maxLength={5}
                mask={expirationDateMask}
                onFocus={() => handleFieldFocus("expiry")}
                onBlur={handleFieldBlur}
              />
            </View>
            <View className="flex-1">
              <AppInputController
                control={control}
                name="CVV"
                leftIcon="lock-closed-outline"
                label="CVV"
                placeholder="000"
                keyboardType="numeric"
                onFocus={() => handleFieldFocus("cvv")}
                onBlur={handleFieldBlur}
                maxLength={3}
              />
            </View>
          </View>
        </View>

        <View className="flex-row gap-4 pb-5 mt-8">
          <View className="flex-1">
            <AppButton variant="outlined">Cancelar</AppButton>
          </View>

          <View className="flex-1">
            <AppButton onPress={handleCreateCreditCard}>Salvar</AppButton>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};
