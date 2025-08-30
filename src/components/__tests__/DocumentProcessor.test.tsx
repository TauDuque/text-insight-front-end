import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToastContext } from "@/contexts/ToastContext";
import { usePolling } from "@/hooks/usePolling";
import DocumentProcessor from "../DocumentProcessor";

// Mock dos hooks
jest.mock("@/contexts/LanguageContext");
jest.mock("@/contexts/ToastContext");
jest.mock("@/hooks/usePolling");
jest.mock("@/services/documentService", () => ({
  documentService: {
    uploadDocument: jest.fn(),
    getDocumentByQueueId: jest.fn(),
    retryDocument: jest.fn(),
    downloadDocument: jest.fn(),
  },
}));

const mockUseLanguage = useLanguage as jest.MockedFunction<typeof useLanguage>;
const mockUseToastContext = useToastContext as jest.MockedFunction<
  typeof useToastContext
>;
const mockUsePolling = usePolling as jest.MockedFunction<typeof usePolling>;

describe("DocumentProcessor", () => {
  beforeEach(() => {
    mockUseLanguage.mockReturnValue({
      t: (key: string) => key,
      language: "pt",
      isLoading: false,
    });

    mockUseToastContext.mockReturnValue({
      showSuccess: jest.fn(),
      showError: jest.fn(),
    });

    mockUsePolling.mockReturnValue({
      startPolling: jest.fn(),
      stopPolling: jest.fn(),
    });
  });

  it("deve renderizar o título e descrição", () => {
    render(<DocumentProcessor />);

    expect(screen.getByText("Processador de Documentos")).toBeInTheDocument();
    expect(
      screen.getByText(/Envie documentos para processamento/)
    ).toBeInTheDocument();
  });

  it("deve mostrar o componente de upload", () => {
    render(<DocumentProcessor />);

    expect(screen.getByText("Selecionar Documento")).toBeInTheDocument();
    expect(
      screen.getByText(/Clique ou arraste um arquivo/)
    ).toBeInTheDocument();
  });

  it("deve mostrar formatos aceitos", () => {
    render(<DocumentProcessor />);

    expect(
      screen.getByText(
        /Formatos aceitos: JPG, PNG, GIF, WEBP, PDF, TXT, DOC, DOCX/
      )
    ).toBeInTheDocument();
  });

  it("deve mostrar limite de tamanho", () => {
    render(<DocumentProcessor />);

    expect(screen.getByText(/Máximo: 5MB/)).toBeInTheDocument();
  });
});
