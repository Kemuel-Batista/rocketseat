import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { cryptoAlertsMock } from "../../../__mocks__/storage/cryptoAlerts";
import { useAlertProviderState } from "./useAlertProvider";

describe("Context: AlertProvider", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should add an alert", async () => {
    const { result } = await renderHook(() => useAlertProviderState());

    await waitFor(() => {
      expect(result.current.alerts).toHaveLength(0);
    });

    await act(() => {
      result.current.addAlert({
        cryptocurrency: "Bitcoin",
        symbol: "BTC",
        targetPrice: 100000,
        condition: "above",
      });
    });
    expect(result.current.alerts).toHaveLength(1);
  });

  it("should delete an alert", async () => {
    const { result } = await renderHook(() => useAlertProviderState())

    await waitFor(() => {
      expect(result.current.alerts).toHaveLength(0);
    });

    await act(() => {
      result.current.addAlert({
        cryptocurrency: "Bitcoin",
        symbol: "BTC",
        targetPrice: 100000,
        condition: "above",
      });
    });
    expect(result.current.alerts).toHaveLength(1);
    const alertToDelete = result.current.alerts[0];
    await act(() => {
      result.current.deleteAlert(alertToDelete.id);
    });
    expect(result.current.alerts).toHaveLength(0);
  });

  it('should load alerts from AsyncStorage', async () => {
    jest
      .spyOn(AsyncStorage, "getItem")
      .mockResolvedValueOnce(JSON.stringify(cryptoAlertsMock));
    const { result } = await renderHook(() => useAlertProviderState());
    await waitFor(() => {
      expect(result.current.alerts).toHaveLength(2);
    });
  });

  it('should save alerts to AsyncStorage', async () => {
    const { result } = await renderHook(() => useAlertProviderState());

    await waitFor(() => {
      expect(result.current.alerts).toHaveLength(0);
    });

    await act(() => {
      result.current.addAlert({
        cryptocurrency: "Bitcoin",
        symbol: "BTC",
        targetPrice: 100000,
        condition: "above",
      });
    });
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "cryptoAlerts",
        JSON.stringify(result.current.alerts),
      );
    });
  });
});
