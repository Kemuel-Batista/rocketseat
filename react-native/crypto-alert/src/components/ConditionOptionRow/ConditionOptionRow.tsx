import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { colors } from "@theme/colors";
import { conditionOptionRowStyles } from "./ConditionOptionRow.styles";
import { useConditionOptionRow } from "./useConditionOptionRow";

interface ConditionOptionRowProps {
  value: "above" | "below";
  selected: boolean;
  title: string;
  subtitle: string;
  variant: "above" | "below";
  onSelect: (value: "above" | "below") => void;
}

export function ConditionOptionRow({
  value,
  selected,
  title,
  subtitle,
  variant,
  onSelect,
}: ConditionOptionRowProps) {
  const { handlePress } = useConditionOptionRow({ value, onSelect });

  const isAbove = variant === "above";

  return (
    <Pressable
      onPress={handlePress}
      style={[
        conditionOptionRowStyles.card,
        selected ? conditionOptionRowStyles.cardSelected : null,
      ]}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
    >
      <View style={conditionOptionRowStyles.row}>
        <View
          style={[
            conditionOptionRowStyles.radioOuter,
            selected ? conditionOptionRowStyles.radioOuterSelected : null,
          ]}
        >
          {selected ? <View style={conditionOptionRowStyles.radioInner} /> : null}
        </View>
        <View
          style={
            isAbove
              ? conditionOptionRowStyles.iconWrapAbove
              : conditionOptionRowStyles.iconWrapBelow
          }
        >
          <Ionicons
            name={isAbove ? "trending-up" : "trending-down"}
            size={20}
            color={isAbove ? colors.positive : colors.negative}
          />
        </View>
        <View style={conditionOptionRowStyles.textBlock}>
          <Text style={conditionOptionRowStyles.title}>{title}</Text>
          <Text style={conditionOptionRowStyles.subtitle}>{subtitle}</Text>
        </View>
      </View>
    </Pressable>
  );
}
