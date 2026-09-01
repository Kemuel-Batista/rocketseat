import type { ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { screenContainerStyles } from "./ScreenContainer.styles";

interface ScreenContainerProps {
  children: ReactNode;
}

export function ScreenContainer({ children }: ScreenContainerProps) {

  return (
    <SafeAreaView
      style={screenContainerStyles.safe}
      edges={["top","left","right"]}
    >
      {children}
    </SafeAreaView>
  );
}
