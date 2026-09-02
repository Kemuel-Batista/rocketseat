import { AlertProvider } from "@context/AlertProvider/AlertProvider";
import { render } from "@testing-library/react-native";
import { cryptoCurrenciesMock } from "../../../__mocks__/data/cryptoCurrencies";
import { CryptoCard } from "./CryptoCard";

describe("Component: CryptoCard", () => {
  it("should render the component", async () => {
    const { getByText } = await render(
      <AlertProvider>
        <CryptoCard crypto={cryptoCurrenciesMock[0]} />
      </AlertProvider>,
    );

    getByText(cryptoCurrenciesMock[0].name);
    expect(getByText(cryptoCurrenciesMock[0].name)).toBeTruthy();
  });
});
