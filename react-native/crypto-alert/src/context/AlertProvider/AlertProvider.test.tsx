import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { AlertProvider } from "./AlertProvider";

describe("AlertProvider", () => {
  it("should render the children", async () => {
    const { debug } = await render(
      <AlertProvider>
        <Text>Teste</Text>
      </AlertProvider>,
    );
    debug();
  });
});
