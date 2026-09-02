import { fireEvent, render, screen } from "@testing-library/react-native";
import { SelectField } from "./SelectField";
import { SelectOption } from "./useSelectField";

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

describe("Component: SelectField", () => {
  it("should return the current value selected", async () => {
    const options = [
      { value: "1", title: "Bitcoin" },
      { value: "2", title: "Ethereum" },
      { value: "3", title: "Litecoin" },
    ];

    await render(
      <SelectField
        label="Select Field"
        options={options}
        value="1"
        onChange={() => {}}
      />,
    );

    const selectedOption = screen.getByText("Bitcoin");
    expect(selectedOption).toBeTruthy();
  });

  it("should open the modal when the user presses the button", async () => {
    const options = [
      { value: "1", title: "Bitcoin-BTC" },
      { value: "2", title: "Ethereum-ETH" },
      { value: "3", title: "Litecoin-LTC" },
    ];

    await render(
      <SelectField
        label="Select Field"
        options={options}
        value=""
        onChange={(value) => console.log("onChange", value)}
      />,
    );

    const button = screen.getByRole("button");
    await fireEvent.press(button);
    const modal = screen.queryByTestId("select-field-modal");
    expect(modal).toBeTruthy();
  });

  it("should call the onChange function when the user selects an option", async () => {
    const options = [
      { value: "1", title: "Bitcoin-BTC" },
      { value: "2", title: "Ethereum-ETH" },
      { value: "3", title: "Litecoin-LTC" },
    ];
    const onChange = jest.fn();

    await render(
      <SelectField
        label="Select Field"
        options={options}
        value=""
        onChange={onChange}
      />,
    );
    const button = screen.getByRole("button");
    await fireEvent.press(button);

    const selectedOption = screen.getByText(/Ethereum/i);
    await fireEvent.press(selectedOption);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("should call the onChange function with the correct value when the user selects an option", async () => {
    const options = [
      { value: "1", title: "Bitcoin-BTC" },
      { value: "2", title: "Ethereum-ETH" },
      { value: "3", title: "Litecoin-LTC" },
    ];
    const onChange = jest.fn();

    await render(
      <SelectField
        label="Select Field"
        options={options}
        value=""
        onChange={onChange}
      />,
    );

    const button = screen.getByRole("button");
    await fireEvent.press(button);
    const selectedOption = screen.getByText(/bitcoin/i);
    await fireEvent.press(selectedOption);
    expect(onChange).toHaveBeenCalledWith("1");
  });

  it("should show empty state when the options are empty", async () => {
    const options = [] as SelectOption[];

    await render(
      <SelectField
        label="Select Field"
        options={options}
        value=""
        onChange={() => {}}
      />,
    );
    const button = screen.getByRole("button");
    await fireEvent.press(button);

    const emptyStateElement = screen.queryByText(/No options found/i);
    expect(emptyStateElement).toBeTruthy();
  });

  it("should flatlist data be empty when the options are empty", async () => {
    const options = [] as SelectOption[];

    await render(
      <SelectField
        label="Select Field"
        options={options}
        value=""
        onChange={() => {}}
      />,
    );

    const button = screen.getByRole("button");
    await fireEvent.press(button);
    const list = screen.queryByTestId("select-field-list");
    expect(list?.props.data).toHaveLength(0);
  });
});
