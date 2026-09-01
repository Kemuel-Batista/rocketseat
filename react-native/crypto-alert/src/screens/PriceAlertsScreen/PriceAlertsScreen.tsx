import { Ionicons } from "@expo/vector-icons";
import { FlatList, Text, View } from "react-native";
import { AlertCard } from "@components/AlertCard/AlertCard";
import { EmptyState } from "@components/EmptyState/EmptyState";
import { PrimaryButton } from "@components/PrimaryButton/PrimaryButton";
import { colors } from "@theme/colors";
import { priceAlertsScreenStyles } from "./PriceAlertsScreen.styles";
import { usePriceAlertsScreen } from "./usePriceAlertsScreen";

export function PriceAlertsScreen() {
  const { alerts, deleteAlert, goToCreate } = usePriceAlertsScreen();

  return (
    <View style={priceAlertsScreenStyles.container}>
      <View style={priceAlertsScreenStyles.header}>
        <Text style={priceAlertsScreenStyles.title}>Price Alerts</Text>
        <PrimaryButton
          label="New Alert"
          onPress={goToCreate}
          size="sm"
          leftIcon={
            <Ionicons name="add" size={18} color={colors.onPrimary} />
          }
        />
      </View>

      {alerts.length === 0 ? (
        <EmptyState
          icon={<Ionicons name="notifications-outline" size={32} color={colors.iconMuted} />}
          title="No alerts yet"
          description="Create your first price alert to get notified when a cryptocurrency reaches your target price."
          action={
            <PrimaryButton
              label="Create Alert"
              onPress={goToCreate}
              fullWidth
            />
          }
        />
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AlertCard alert={item} onDelete={deleteAlert} />
          )}
          contentContainerStyle={priceAlertsScreenStyles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
