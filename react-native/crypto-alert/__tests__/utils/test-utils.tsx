import { AlertProvider } from "@/context/AlertProvider/AlertProvider";
import { renderHook } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

jest.mock("react-native-safe-area-context");

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider>
      <AlertProvider>{children}</AlertProvider>
    </SafeAreaProvider>
  );
}

const customRenderHook = <T,>(hook: () => T) => {
  return renderHook(hook, {
    wrapper: Providers,
  });
};

export * from "@testing-library/react-native";

export { customRenderHook as renderHook };
