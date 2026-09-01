import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { colors } from "@theme/colors";
import { screenHeaderStyles } from "./ScreenHeader.styles";
import { useScreenHeader } from "./useScreenHeader";

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
}

export function ScreenHeader({ title, onBack }: ScreenHeaderProps) {
  const { handleBack, showBack } = useScreenHeader({ onBack });

  return (
    <View style={screenHeaderStyles.row}>
      {showBack ? (
        <Pressable
          onPress={handleBack}
          style={screenHeaderStyles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={colors.textSecondary} />
        </Pressable>
      ) : null}
      <Text style={screenHeaderStyles.title}>{title}</Text>
    </View>
  );
}
