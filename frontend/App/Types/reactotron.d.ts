export {};

declare global {
  interface Console {
    tron: {
      log?: (...args: any[]) => void;
      overlay?: (App: React.ReactNode) => void;
      createSagaMonitor?: () => any;
      display: (config?: any) => void;
    };
  }
}
