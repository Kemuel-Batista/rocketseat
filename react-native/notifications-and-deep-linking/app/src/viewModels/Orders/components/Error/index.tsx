import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { colors } from "../../../../styles/colors";
import { AppButton } from "../../../../shared/components/AppButton";

export const Error = () => {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <View className="w-10 h-10 bg-red-300 items-center justify-center rounded-full mb-6">
        <Ionicons name="alert" color={colors.danger} size={23} />
      </View>
      <View className="flex-row items-center justify-center">
        <Text className="text-xl text-danger font-bold">
          Falha ao carregar pedidos
        </Text>
      </View>

      <AppButton className="mt-6">Voltar para produtos</AppButton>
    </View>
  );
};
