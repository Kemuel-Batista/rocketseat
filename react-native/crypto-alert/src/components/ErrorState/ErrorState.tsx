import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { colors } from "@theme/colors";
import { errorStateStyles } from "./ErrorState.styles";
import { useErrorState } from "./useErrorState";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load the data. Please try again.",
  onRetry,
}: ErrorStateProps) {
  const { handleRetry, showRetry } = useErrorState({ onRetry });

  return (
    <View style={errorStateStyles.wrap}>
      <View style={errorStateStyles.iconCircle}>
        <Ionicons name="alert-circle" size={32} color={colors.negative} />
      </View>
      <Text style={errorStateStyles.title}>{title}</Text>
      <Text style={errorStateStyles.message}>{message}</Text>
      {showRetry ? (
        <Pressable
          onPress={handleRetry}
          style={errorStateStyles.retryButton}
          accessibilityRole="button"
          accessibilityLabel="Retry"
        >
          <Text style={errorStateStyles.retryLabel}>Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
