import { useAlerts } from "@/context/AlertProvider/useAlertProvider";
import { cryptoCurrenciesMock } from "@__mocks__/data/cryptoCurrencies";
import { cryptoAlertsMock } from "@__mocks__/storage/cryptoAlerts";
import { act, renderHook, waitFor } from "@__tests__/utils/test-utils";
import { useCryptoCard } from "./useCryptoCard";

jest.mock("@context/AlertProvider/useAlertProvider", () => ({
  ...jest.requireActual("@context/AlertProvider/useAlertProvider"),
  useAlerts: jest.fn().mockReturnValue({
    alerts: [],
  }),
}))

describe("useCryptoCard", () => {
  it("should return the correct values", async () => {
    const { result } = await renderHook(() => useCryptoCard(cryptoCurrenciesMock[0]))
    await waitFor(() => {
      expect(result.current.alertsForCrypto).toHaveLength(0)
      expect(result.current.expanded).toBe(false)
      expect(result.current.toggleExpanded).toBeDefined()
      expect(result.current.isPositive).toBe(true)
      expect(result.current.hasAlert).toBe(false)
    })
  })
  it("should return the correct values when there are alerts", async () => {
    (useAlerts as jest.Mock).mockReturnValue({
      alerts: cryptoAlertsMock,
    })
    const { result } = await renderHook(() => useCryptoCard(cryptoCurrenciesMock[0]))
    await waitFor(() => {
      expect(result.current.alertsForCrypto).toHaveLength(1)
      expect(result.current.expanded).toBe(false)
      expect(result.current.toggleExpanded).toBeDefined()
      expect(result.current.isPositive).toBe(true)
      expect(result.current.hasAlert).toBe(true)
    })
  })
  it("should call toggleExpanded when there are alerts", async () => {
    (useAlerts as jest.Mock).mockReturnValue({
      alerts: cryptoAlertsMock,
    })
    const { result } = await renderHook(() => useCryptoCard(cryptoCurrenciesMock[0]))
    await waitFor(() => {
      expect(result.current.expanded).toBe(false)
    })
    await act(() => {
      result.current.toggleExpanded()
    })
    expect(result.current.expanded).toBe(true)
  })
  it("should not change expanded state when there are no alerts", async () => {
    (useAlerts as jest.Mock).mockReturnValue({
      alerts: [],
    })
    const { result } = await renderHook(() => useCryptoCard(cryptoCurrenciesMock[0]))
    await waitFor(() => {
      expect(result.current.expanded).toBe(false)
    })
    await act(() => {
      result.current.toggleExpanded()
    })
    expect(result.current.expanded).toBe(false)
  })
})
