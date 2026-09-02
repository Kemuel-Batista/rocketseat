import AsyncStorage from "@react-native-async-storage/async-storage";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { Pressable, Text } from "react-native";
import { cryptoAlertsMock } from "../../../__mocks__/storage/cryptoAlerts";
import { AlertProvider } from "./AlertProvider";
import { useAlerts } from "./useAlertProvider";

describe("AlertProvider", () => {
  afterEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
  });

  it("should render the children", async () => {
    const { getByText } = await render(
      <AlertProvider>
        <Text>Teste</Text>
      </AlertProvider>,
    );

    await waitFor(() => {});
    getByText("Teste");
    expect(getByText("Teste")).toBeTruthy();
  });

  it("should call AsyncStorage.getItem when the component is mounted", async () => {
    const asyncStorageGetItem = jest
      .spyOn(AsyncStorage, "getItem")
      .mockResolvedValue(JSON.stringify(cryptoAlertsMock));

    await render(
      <AlertProvider>
        <Text>Teste</Text>
      </AlertProvider>,
    );

    await waitFor(async () => {
      expect(asyncStorageGetItem).toHaveBeenCalledWith("cryptoAlerts");
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

    const asyncStorageSetItem = jest
      .spyOn(AsyncStorage, "setItem")
      .mockResolvedValue(Promise.resolve());

    const { getByText } = await render(
      <AlertProvider>
        <TestComponent />
      </AlertProvider>,
    );

    await fireEvent.press(getByText("Add Alert"));

    await waitFor(async () => {
      expect(asyncStorageSetItem).toHaveBeenCalledTimes(2);
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

    const { getByText } = await render(
      <AlertProvider>
        <TestComponent />
      </AlertProvider>,
    );

    await fireEvent.press(getByText("Delete Alert"));
    await waitFor(async () => {
      expect(asyncStorageSetItem).toHaveBeenCalledTimes(2);
    });
  });
});
