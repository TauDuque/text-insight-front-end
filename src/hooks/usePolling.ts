import { useEffect, useRef, useCallback, useState } from "react";

export function usePolling() {
  const [isPolling, setIsPolling] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startPolling = useCallback(
    (
      callback: () => Promise<unknown>,
      onUpdate: (data: unknown) => void,
      delay: number = 2000
    ) => {
      if (isPolling) return;

      setIsPolling(true);

      const poll = async () => {
        try {
          const result = await callback();
          onUpdate(result);
        } catch (error) {
          console.error("Erro no polling:", error);
        }
      };

      // Executa imediatamente na primeira vez
      poll();

      // Configura o intervalo para execuções subsequentes
      intervalRef.current = setInterval(poll, delay);
    },
    [isPolling]
  );

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  // Cleanup ao desmontar o componente
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isPolling,
    startPolling,
    stopPolling,
  };
}
