import "react-native-gesture-handler";

import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AlertProvider } from "@context/AlertProvider/AlertProvider";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AlertProvider>
        <StatusBar style="light" />
        <Slot />
      </AlertProvider>
    </SafeAreaProvider>
  );
}
