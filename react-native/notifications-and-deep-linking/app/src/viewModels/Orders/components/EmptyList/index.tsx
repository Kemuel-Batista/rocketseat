import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { colors } from "../../../../styles/colors";
import { AppButton } from "../../../../shared/components/AppButton";
import { router } from "expo-router";

export const EmptyList = () => {
  return (
    <View className="flex-1 items-center px-20 pt-16">
      <Ionicons name="clipboard-outline" size={80} color={colors.gray[200]} />

      <Text className="text-xl font-bold text-gray-700 my-4 text-center">
        Você ainda não tem pedidos
      </Text>

      <Text className="text-base text-gray-400 mb-8 text-center">
        Explore o catálogo de produtos e faça sua primeira compra
      </Text>

      <AppButton
        onPress={() => router.push("/home")}
        leftIcon="storefront-outline"
        variant="outlined"
      >
        Explorar produtos
      </AppButton>
    </View>
  );
};
