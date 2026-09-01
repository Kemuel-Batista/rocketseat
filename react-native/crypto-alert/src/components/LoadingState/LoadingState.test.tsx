import { render, screen } from "@testing-library/react-native";
import { LoadingState } from "./LoadingState";

describe("Component: LoadingState", () => {
  it("should render the message", async () => {
    const message = "Teste de Loading...";

    const { getByText } = await render(<LoadingState message={message} />);
    screen.debug();
    expect(getByText(message)).toBeTruthy();
  });
});
