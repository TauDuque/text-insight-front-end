// frontend/src/components/__tests__/Button.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
// Supondo que você tenha um componente de botão genérico
// import Button from '../Button';

// Se não tiver, vamos simular um para o teste
const Button = ({
  onClick,
  children,
  disabled,
}: {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) => (
  <button onClick={onClick} disabled={disabled}>
    {children}
  </button>
);

describe("Button Component", () => {
  it("should render with the correct text", () => {
    render(<Button onClick={() => {}}>Clique Aqui</Button>);

    // Procura por um elemento com o role 'button' e o nome 'Clique Aqui'
    const buttonElement = screen.getByRole("button", { name: /clique aqui/i });
    expect(buttonElement).toBeInTheDocument();
  });

  it("should call the onClick function when clicked", () => {
    const handleClick = jest.fn(); // Cria uma função "mock" (espiã)
    render(<Button onClick={handleClick}>Clique Aqui</Button>);

    const buttonElement = screen.getByRole("button", { name: /clique aqui/i });
    fireEvent.click(buttonElement);

    // Verifica se a função foi chamada exatamente 1 vez
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should be disabled when the disabled prop is true", () => {
    render(
      <Button onClick={() => {}} disabled>
        Clique Aqui
      </Button>
    );

    const buttonElement = screen.getByRole("button", { name: /clique aqui/i });

    // Verifica se o botão tem o atributo 'disabled'
    expect(buttonElement).toBeDisabled();
  });
});
