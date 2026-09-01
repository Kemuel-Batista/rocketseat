import { Ionicons } from "@expo/vector-icons";
import { FlatList, Text, View } from "react-native";
import { CryptoCard } from "@components/CryptoCard/CryptoCard";
import { EmptyState } from "@components/EmptyState/EmptyState";
import { ErrorState } from "@components/ErrorState/ErrorState";
import { LoadingState } from "@components/LoadingState/LoadingState";
import { colors } from "@theme/colors";
import { cryptoListScreenStyles } from "./CryptoListScreen.styles";
import { useCryptoListScreen } from "./useCryptoListScreen";

export function CryptoListScreen() {
  const { loadingState, cryptocurrencies, handleRetry } = useCryptoListScreen();

  return (
    <View style={cryptoListScreenStyles.container}>
      <Text style={cryptoListScreenStyles.title}>Cryptocurrencies</Text>

      {loadingState === "loading" ? (
        <LoadingState message="Loading cryptocurrencies..." />
      ) : null}

      {loadingState === "error" ? (
        <ErrorState
          title="Failed to load"
          message="Unable to fetch cryptocurrency data. Please try again."
          onRetry={handleRetry}
        />
      ) : null}

      {loadingState === "empty" ? (
        <EmptyState
          icon={<Ionicons name="search" size={32} color={colors.iconMuted} />}
          title="No cryptocurrencies found"
          description="There are no cryptocurrencies to display at the moment."
        />
      ) : null}

      {loadingState === "idle" ? (
        <FlatList
          data={cryptocurrencies}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <CryptoCard crypto={item} />}
          contentContainerStyle={cryptoListScreenStyles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : null}
    </View>
  );
}
