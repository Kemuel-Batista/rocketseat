import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { emptyStateStyles } from "./EmptyState.styles";
import { useEmptyState } from "./useEmptyState";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  const { titleId } = useEmptyState();

  return (
    <View style={emptyStateStyles.wrap}>
      <View style={emptyStateStyles.iconCircle}>{icon}</View>
      <Text
        style={emptyStateStyles.title}
        nativeID={titleId}
        accessibilityRole="header"
      >
        {title}
      </Text>
      {description ? (
        <Text style={emptyStateStyles.description}>{description}</Text>
      ) : null}
      {action ? <View style={emptyStateStyles.actionWrap}>{action}</View> : null}
    </View>
  );
}
