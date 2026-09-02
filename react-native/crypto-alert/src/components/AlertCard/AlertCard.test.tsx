import { cryptoAlertsMock } from "@mocks/storage/cryptoAlerts";
import { render } from "@testing-library/react-native";
import { AlertCard } from "./AlertCard";

describe("Component: AlertCard", () => {
  it("should render the alert card", async () => {
    await render(
      <AlertCard alert={cryptoAlertsMock[0]} onDelete={jest.fn()} />,
    );
  });
});
