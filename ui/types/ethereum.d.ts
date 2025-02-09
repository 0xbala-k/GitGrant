interface RequestArguments {
    method: string;
    params?: unknown[] | object;
  }
  
  interface EthereumProvider {
    request: (args: RequestArguments) => Promise<unknown>;
    on: (event: string, listener: (params: unknown) => void) => void;
    removeListener: (event: string, listener: (params: unknown) => void) => void;
    isMetaMask?: boolean;
    isConnected: () => boolean;
    selectedAddress: string | null;
    chainId: string;
  }
  
  interface Window {
    ethereum?: EthereumProvider;
  }