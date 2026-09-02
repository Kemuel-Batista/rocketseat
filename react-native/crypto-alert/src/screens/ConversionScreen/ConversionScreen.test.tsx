import { formatPrice } from "@/utils";
import {
    cryptoCurrenciesMock,
    fiatCurrenciesMock,
} from "@mocks/data/cryptoCurrencies";
import {
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react-native";
import { ConversionScreen } from "./ConversionScreen";

jest.mock("@data/cryptoData", () => {
  const {
    cryptoCurrenciesMock,
    fiatCurrenciesMock,
  } = require("@mocks/data/cryptoCurrencies");
  return {
    cryptocurrencies: cryptoCurrenciesMock,
    fiatCurrencies: fiatCurrenciesMock,
    fetchCryptocurrenciesFromApi: jest
      .fn()
      .mockResolvedValue(cryptoCurrenciesMock),
  };
});

jest.mock("@utils/index", () => ({
  formatPrice: jest.fn((value) => value.toFixed(2)),
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

describe("Screen: ConversionScreen", () => {
  it("should render correctly", async () => {
    const { getByText } = await render(<ConversionScreen />);
    expect(getByText("Convert Crypto")).toBeTruthy();
    expect(getByText("Enter an amount")).toBeTruthy();
  });

  it("should render the invalid amount message when the amount is invalid", async () => {
    await render(<ConversionScreen />);
    const amountInput = screen.getByPlaceholderText("0.00");
    await fireEvent.changeText(amountInput, "1,00");
    await waitFor(() => {
      expect(screen.getByText("Invalid amount")).toBeTruthy();
    });
  });

  it("should show the converted amount when the amount is valid", async () => {
    await render(<ConversionScreen />);
    const amountInput = screen.getByPlaceholderText("0.00");
    await fireEvent.changeText(amountInput, "1");
    await waitFor(() => {
      expect(
        screen.getByText(
          `$${formatPrice(cryptoCurrenciesMock[0].price * fiatCurrenciesMock[0].rate)}`,
        ),
      ).toBeTruthy();
    });
  });

  it("should show the converted amount when the amount is valid and the fiat currency is selected", async () => {
    await render(<ConversionScreen />);
    const amountInput = screen.getByPlaceholderText("0.00");
    await fireEvent.changeText(amountInput, "1");
    await waitFor(() => {
      expect(
        screen.getByText(
          `$${formatPrice(cryptoCurrenciesMock[0].price * fiatCurrenciesMock[0].rate)}`,
        ),
      ).toBeTruthy();
    });
    // selecionar uma crypto
    const selectCryptoButton = screen.getByLabelText("Cryptocurrency");
    await fireEvent.press(selectCryptoButton);
    const selectedCrypto = screen.getByText("Ethereum");
    await fireEvent.press(selectedCrypto);
    const selectFiatButton = screen.getByLabelText("Fiat Currency");
    await fireEvent.press(selectFiatButton);
    const selectedFiat = screen.getByText("BRL");
    await fireEvent.press(selectedFiat);
    await waitFor(() => {
      expect(
        screen.getByText(
          `R$${formatPrice(cryptoCurrenciesMock[1].price * fiatCurrenciesMock[1].rate)}`,
        ),
      ).toBeTruthy();
    });
  });
});
