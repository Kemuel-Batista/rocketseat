import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import type { PriceAlert } from "@context/AlertProvider/useAlertProvider";
import { formatPrice } from "@utils/index";
import { colors } from "@theme/colors";
import { alertCardStyles } from "./AlertCard.styles";
import { useAlertCard } from "./useAlertCard";

interface AlertCardProps {
  alert: PriceAlert;
  onDelete: (id: string) => void;
}

export function AlertCard({ alert, onDelete }: AlertCardProps) {
  const { isAbove, handleDelete } = useAlertCard({ alert, onDelete });

  return (
    <View style={alertCardStyles.card}>
      <View style={alertCardStyles.row}>
        <View style={alertCardStyles.left}>
          <View
            style={
              isAbove
                ? alertCardStyles.iconWrapAbove
                : alertCardStyles.iconWrapBelow
            }
          >
            <Ionicons
              name={isAbove ? "trending-up" : "trending-down"}
              size={20}
              color={isAbove ? colors.positive : colors.negative}
            />
          </View>
          <View style={alertCardStyles.body}>
            <Text style={alertCardStyles.title}>{alert.cryptocurrency}</Text>
            <Text style={alertCardStyles.subtitle}>
              Alert when price goes{" "}
              <Text style={alertCardStyles.condition}>{alert.condition}</Text>
            </Text>
            <Text style={alertCardStyles.price}>
              ${formatPrice(alert.targetPrice)}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={handleDelete}
          style={alertCardStyles.deleteBtn}
          accessibilityRole="button"
          accessibilityLabel="Delete alert"
        >
          <Ionicons name="trash-outline" size={20} color={colors.iconMuted} />
        </Pressable>
      </View>
    </View>
  );
}
