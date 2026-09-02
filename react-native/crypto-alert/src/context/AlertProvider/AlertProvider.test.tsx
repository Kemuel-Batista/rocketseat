import AsyncStorage from "@react-native-async-storage/async-storage";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { Pressable, Text } from "react-native";
import { cryptoAlertsMock } from "../../../__mocks__/storage/cryptoAlerts";
import { AlertProvider } from "./AlertProvider";
import { useAlerts } from "./useAlertProvider";

// beforeEach, afterEach, afterAll, beforeAll

describe("AlertProvider", () => {
  const renderWithProvider = async (children: React.ReactNode) => {
    return await render(<AlertProvider>{children}</AlertProvider>);
  };

  let getItemSpy: jest.SpiedFunction<typeof AsyncStorage.getItem>;
  let setItemSpy: jest.SpiedFunction<typeof AsyncStorage.setItem>;

  beforeEach(() => {
    getItemSpy = jest
      .spyOn(AsyncStorage, "getItem")
      .mockResolvedValue(JSON.stringify(cryptoAlertsMock));
    setItemSpy = jest
      .spyOn(AsyncStorage, "setItem")
      .mockResolvedValue(Promise.resolve());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render the children", async () => {
    const { getByText } = await renderWithProvider(<Text>Teste</Text>);
    await waitFor(() => {});
    getByText("Teste");
    expect(getByText("Teste")).toBeTruthy();
  });

  it("should call AsyncStorage.getItem when the component is mounted", async () => {
    await renderWithProvider(<Text>Teste</Text>);

    await waitFor(async () => {
      expect(getItemSpy).toHaveBeenCalledWith("cryptoAlerts");
    });
  });

  it("should call AsyncStorage.setItem when alerts are added", async () => {
    function TestComponent() {
      const { addAlert } = useAlerts();
      return (
        <Pressable
          onPress={() =>
            addAlert({
              cryptocurrency: "Bitcoin",
              symbol: "BTC",
              targetPrice: 100000,
              condition: "above",
            })
          }
        >
          <Text>Add Alert</Text>
        </Pressable>
      );
    }
    const { getByText } = await renderWithProvider(<TestComponent />);
    await fireEvent.press(getByText("Add Alert"));
    await waitFor(async () => {
      expect(setItemSpy).toHaveBeenCalledTimes(2);
    });
  });

  it("should call AsyncStorage.setItem when alerts are deleted", async () => {
    function TestComponent() {
      const { deleteAlert } = useAlerts();
      return (
        <Pressable onPress={() => deleteAlert("1")}>
          <Text>Delete Alert</Text>
        </Pressable>
      );
    }
    const asyncStorageSetItem = jest
      .spyOn(AsyncStorage, "setItem")
      .mockResolvedValue(Promise.resolve());
    const { getByText } = await renderWithProvider(<TestComponent />);

    await fireEvent.press(getByText("Delete Alert"));
    await waitFor(async () => {
      expect(asyncStorageSetItem).toHaveBeenCalledTimes(2);
    });
  });
});
