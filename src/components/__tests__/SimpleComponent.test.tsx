// frontend/src/components/__tests__/SimpleComponent.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";

// Componente simples para teste
const SimpleComponent = ({ text }: { text: string }) => (
  <div data-testid="simple-component">
    <h1>{text}</h1>
    <p>Este é um componente de teste</p>
  </div>
);

describe("SimpleComponent", () => {
  it("should render with the provided text", () => {
    render(<SimpleComponent text="Título de Teste" />);

    // Verifica se o texto está sendo renderizado
    expect(screen.getByText("Título de Teste")).toBeInTheDocument();
    expect(
      screen.getByText("Este é um componente de teste")
    ).toBeInTheDocument();
  });

  it("should have the correct test id", () => {
    render(<SimpleComponent text="Teste" />);

    // Verifica se o elemento com o testid está presente
    const component = screen.getByTestId("simple-component");
    expect(component).toBeInTheDocument();
  });
});
