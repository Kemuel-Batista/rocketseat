import { render, screen } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("should render the title and description", async () => {
    const title = "Nenhum alert encontrado";
    const description =
      "Crie seu primeiro alerta para ser notificado quando uma criptomoeda atingir seu preço alvo.";
    const icon = "🚀";

    const { getByText } = await render(
      <EmptyState
        icon={<Text>{icon}</Text>}
        title={title}
        description={description}
      />,
    );

    expect(getByText(icon)).toBeTruthy();
    expect(getByText(title)).toBeTruthy();
    expect(getByText(description)).toBeTruthy();
  });

  it("should render the action when provided", async () => {
    const title = "Nenhum alert encontrado";
    const description =
      "Crie seu primeiro alerta para ser notificado quando uma criptomoeda atingir seu preço alvo.";
    const icon = "🚀";
    const action = <Text>Criar alerta</Text>;

    const { getByText } = await render(
      <EmptyState
        icon={<Text>{icon}</Text>}
        title={title}
        description={description}
        action={<Text>{action}</Text>}
      />,
    );

    expect(getByText("Criar alerta")).toBeTruthy();
  });

  it("should not render the action when not provided", async () => {
    const title = "Nenhum alert encontrado";
    const description =
      "Crie seu primeiro alerta para ser notificado quando uma criptomoeda atingir seu preço alvo.";
    const icon = "🚀";
    const action = <Text>Criar alerta</Text>;
    await render(
      <EmptyState
        icon={<Text>{icon}</Text>}
        title={title}
        description={description}
        action={action}
      />,
    );
    const actionElement = screen.queryByTestId("EmptyStateAction");
    expect(actionElement).toBeNull();
  });
});
