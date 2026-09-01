import { ActivityIndicator, Text, View } from "react-native";
import { colors } from "@theme/colors";
import { loadingStateStyles } from "./LoadingState.styles";
import { useLoadingState } from "./useLoadingState";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message }: LoadingStateProps) {
  const { displayMessage } = useLoadingState({ message });

  return (
    <View style={loadingStateStyles.wrap}>
      <ActivityIndicator size="large" color={colors.textMuted} />
      <Text style={loadingStateStyles.message}>{displayMessage}</Text>
    </View>
  );
}
