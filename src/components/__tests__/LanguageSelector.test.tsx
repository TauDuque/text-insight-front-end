// frontend/src/components/__tests__/LanguageSelector.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageProvider } from "../../contexts/LanguageContext";
import LanguageSelector from "../LanguageSelector";

// Mock do localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// Wrapper para fornecer o contexto de idioma
const renderWithLanguageProvider = (component: React.ReactElement) => {
  return render(<LanguageProvider>{component}</LanguageProvider>);
};

describe("LanguageSelector Component", () => {
  beforeEach(() => {
    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue("pt"); // Idioma padrão
  });

  it("should render language selector with current language", () => {
    renderWithLanguageProvider(<LanguageSelector />);

    // Verifica se o seletor de idioma está visível
    const languageSelector = screen.getByRole("button");
    expect(languageSelector).toBeInTheDocument();
  });

  it("should display current language", () => {
    renderWithLanguageProvider(<LanguageSelector />);

    // Verifica se o idioma atual está sendo exibido
    expect(screen.getByText(/português/i)).toBeInTheDocument();
  });

  it("should open dropdown when clicked", () => {
    renderWithLanguageProvider(<LanguageSelector />);

    const languageSelector = screen.getByRole("button");
    fireEvent.click(languageSelector);

    // Verifica se as opções de idioma estão visíveis (em português)
    expect(screen.getByText(/espanhol/i)).toBeInTheDocument();
    expect(screen.getByText(/inglês/i)).toBeInTheDocument();
  });

  it("should change language when option is selected", () => {
    renderWithLanguageProvider(<LanguageSelector />);

    const languageSelector = screen.getByRole("button");
    fireEvent.click(languageSelector);

    // Clica na opção de inglês
    const englishOption = screen.getByText(/inglês/i);
    fireEvent.click(englishOption);

    // Verifica se o idioma foi alterado
    expect(localStorageMock.setItem).toHaveBeenCalledWith("language", "en");
  });
});
