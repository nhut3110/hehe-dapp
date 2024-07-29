"use client";

import { BrowserProvider, ethers } from "ethers";
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";
import { capitalizeFirstLetter, formatRoundEther } from "../utils";
import {
  useDisconnect,
  useWalletInfo,
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from "@web3modal/ethers/react";

import { MESSAGE_DURATION } from "../constants";
import Moralis from "moralis";
import { message } from "antd";

type SelectedAccountByWallet = Record<string, string | null>;

interface WalletProviderContext {
  wallets: Record<string, EIP6963ProviderDetail>;
  selectedWallet: EIP6963ProviderDetail | null;
  selectedAccount: string | null;
  errorMessage: string | null;
  chainId: string;
  globalLoading: boolean;
  currentProvider: any;
  currentBalance: string;

  connectInstalledWallet: (walletUuid: string) => Promise<void>;
  disconnectWallet: () => void;
  triggerLoading: (loading: boolean) => void;
  clearError: () => void;
  processErrorMessage: (error: any) => void;
  getNativeCoinBalance: (address: string) => Promise<string>;
  getChainId: () => Promise<string>;
}

declare global {
  interface WindowEventMap {
    "eip6963:announceProvider": CustomEvent;
  }
}

const initialValue: WalletProviderContext = {
  wallets: {},
  selectedWallet: null,
  selectedAccount: null,
  errorMessage: null,
  chainId: "",
  globalLoading: false,
  currentProvider: undefined,
  currentBalance: "",

  connectInstalledWallet: async (id: string) => {},
  disconnectWallet: () => {},
  triggerLoading: (loading: boolean) => {},
  clearError: () => {},
  processErrorMessage: (error: any) => {},
  getNativeCoinBalance: async (address: string) => {
    return "";
  },
  getChainId: async () => "",
};

export const WalletProviderContext =
  createContext<WalletProviderContext>(initialValue);

export const WalletProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { address, isConnected, chainId } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const { walletInfo } = useWalletInfo();
  const { disconnect } = useDisconnect();

  const [selectedWalletRdns, setSelectedWalletRdns] = useState<string | null>(
    null,
  );
  const [selectedAccountByWalletRdns, setSelectedAccountByWalletRdns] =
    useState<SelectedAccountByWallet>({});
  const [wallets, setWallets] = useState<Record<string, EIP6963ProviderDetail>>(
    {},
  );
  const [selectedChain, setSelectedChain] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [currentProvider, setCurrentProvider] = useState<BrowserProvider>();
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [currentWallet, setCurrentWallet] =
    useState<EIP6963ProviderDetail | null>(null);
  const [currentBalance, setCurrentBalance] = useState<string>("0.0");

  const clearError = () => setErrorMessage("");
  const triggerLoading = (value: boolean) => setLoading(value);

  const processErrorMessage = useCallback((error: any) => {
    const walletError: WalletError = error as WalletError;
    const curentMessage = walletError.shortMessage ?? walletError.message;

    if (!curentMessage) return;

    setErrorMessage(`${curentMessage}`);
    message.open({
      content: `${capitalizeFirstLetter(curentMessage)}`,
      duration: MESSAGE_DURATION,
    });
  }, []);

  const getChainId = useCallback(async () => {
    if (!currentWallet?.provider) return "";

    setLoading(true);
    try {
      const chainId = (await currentWallet.provider.request({
        method: "eth_chainId",
      })) as string;

      const convertedChainId = BigInt(chainId).toString();

      setSelectedChain(convertedChainId);

      return convertedChainId;
    } catch (error) {
      console.error(error);
      processErrorMessage(error);
      return "";
    } finally {
      setLoading(false);
    }
  }, [processErrorMessage, currentWallet]);

  const getNativeCoinBalance = useCallback(
    async (address: string) => {
      if (!currentWallet?.provider || !address) return "0.0";

      setLoading(true);
      try {
        const weiValue = (await currentWallet.provider.request({
          method: "eth_getBalance",
          params: [address, "latest"],
        })) as string;

        const formattedBalance = formatRoundEther(weiValue);
        setCurrentBalance(formattedBalance);

        return formattedBalance;
      } catch (error) {
        console.error("Failed to get balance:", error);
        processErrorMessage(error);
        return "0";
      } finally {
        setLoading(false);
      }
    },
    [processErrorMessage, currentWallet],
  );

  const resetApp = useCallback(() => {
    setCurrentAccount("");
    setCurrentProvider(undefined);
    setCurrentWallet(null);
    setSelectedChain("");
  }, []);

  const connectInstalledWallet = useCallback(
    async (walletRdns: string) => {
      try {
        const wallet = wallets[walletRdns];
        const accounts = (await wallet.provider.request({
          method: "eth_requestAccounts",
        })) as string[];

        if (accounts?.[0]) {
          setSelectedWalletRdns(wallet.info.rdns);
          setSelectedAccountByWalletRdns((currentAccounts) => ({
            ...currentAccounts,
            [wallet.info.rdns]: accounts[0],
          }));
          setCurrentAccount(accounts[0]);
          setCurrentWallet(wallet);

          localStorage.setItem("selectedWalletRdns", wallet.info.rdns);
          localStorage.setItem(
            "selectedAccountByWalletRdns",
            JSON.stringify({
              ...selectedAccountByWalletRdns,
              [wallet.info.rdns]: accounts[0],
            }),
          );
        }
      } catch (error) {
        processErrorMessage(error);
      }
    },
    [wallets, selectedAccountByWalletRdns, processErrorMessage],
  );

  const disconnectWallet = useCallback(async () => {
    try {
      if (selectedWalletRdns) {
        await currentWallet?.provider?.request({
          method: "wallet_revokePermissions",
          params: [{ eth_accounts: {} }],
        });
        setSelectedAccountByWalletRdns((currentAccounts) => ({
          ...currentAccounts,
          [selectedWalletRdns]: null,
        }));

        setSelectedWalletRdns(null);
        localStorage.removeItem("selectedWalletRdns");
      } else {
        await disconnect();
      }

      resetApp();
    } catch (error) {
      console.error("Failed to disconnect:", error);
      processErrorMessage(error);
    }
  }, [
    currentWallet?.provider,
    disconnect,
    processErrorMessage,
    resetApp,
    selectedWalletRdns,
  ]);

  useEffect(() => {
    if (walletProvider) {
      const ethersProvider = new ethers.BrowserProvider(walletProvider);

      setCurrentProvider(ethersProvider);
    }
  }, [isConnected, walletProvider]);

  useEffect(() => {
    if (chainId) setSelectedChain(chainId.toString());
  }, [chainId]);

  useEffect(() => {
    if (address) setCurrentAccount(address);
  }, [address]);

  useEffect(() => {
    if (walletInfo && walletProvider) {
      setCurrentWallet({
        info: walletInfo as any,
        provider: walletProvider as EIP1193Provider,
      });
    }
  }, [walletInfo, walletProvider]);

  useEffect(() => {
    // reset app when not connect (for walletconnect option)
    if (!isConnected) resetApp();
  }, [isConnected, resetApp]);

  useEffect(() => {
    if (currentAccount) {
      getNativeCoinBalance(currentAccount);
      getChainId();
    }
  }, [currentAccount, chainId, getNativeCoinBalance, getChainId]);

  useEffect(() => {
    if (selectedWalletRdns && selectedAccountByWalletRdns[selectedWalletRdns]) {
      setCurrentAccount(selectedAccountByWalletRdns[selectedWalletRdns]);
    }
  }, [selectedAccountByWalletRdns, selectedWalletRdns]);

  useEffect(() => {
    if (selectedWalletRdns && wallets[selectedWalletRdns].provider) {
      setCurrentProvider(
        new BrowserProvider(wallets[selectedWalletRdns].provider),
      );
    }
  }, [selectedWalletRdns, wallets]);

  useEffect(() => {
    // TODO: find ways to remove this any
    const provider = window.ethereum as any;
    if (!provider) return;

    // reset app when not connect (for metamask option)
    if (currentWallet && !provider.isConnected()) resetApp();
  }, [currentWallet, resetApp]);

  useEffect(() => {
    Moralis.start({
      apiKey: process.env.NEXT_PUBLIC_MORALIS_KEY,
    });
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;

    // TODO: find ways to remove this any
    const provider = window.ethereum as any;

    provider.on("chainChanged", () => {
      getChainId();
    });
    provider.on("accountsChanged", (addresses: string[]) => {
      if (addresses?.[0]) {
        setCurrentAccount(addresses[0]);
        if (selectedWalletRdns)
          localStorage.setItem(
            "selectedAccountByWalletRdns",
            JSON.stringify({
              ...selectedAccountByWalletRdns,
              [selectedWalletRdns]: addresses[0],
            }),
          );
      } else disconnectWallet();
    });
    provider.on("disconnect", disconnectWallet);

    return () => {
      provider.removeAllListeners();
    };
  }, [
    getChainId,
    disconnectWallet,
    selectedWalletRdns,
    selectedAccountByWalletRdns,
  ]);

  useEffect(() => {
    const savedSelectedWalletRdns = localStorage.getItem("selectedWalletRdns");
    const savedSelectedAccountByWalletRdns = localStorage.getItem(
      "selectedAccountByWalletRdns",
    );

    if (savedSelectedAccountByWalletRdns) {
      setSelectedAccountByWalletRdns(
        JSON.parse(savedSelectedAccountByWalletRdns),
      );
    }

    const onAnnouncement = (event: EIP6963AnnounceProviderEvent) => {
      setWallets((currentWallets) => ({
        ...currentWallets,
        [event.detail.info.rdns]: event.detail,
      }));

      if (
        savedSelectedWalletRdns &&
        event.detail.info.rdns === savedSelectedWalletRdns
      ) {
        setSelectedWalletRdns(savedSelectedWalletRdns);
        setCurrentWallet(event.detail);
      }
    };

    window.addEventListener("eip6963:announceProvider", onAnnouncement);
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    return () =>
      window.removeEventListener("eip6963:announceProvider", onAnnouncement);
  }, []);

  const contextValue: WalletProviderContext = {
    wallets,
    selectedWallet: currentWallet,
    selectedAccount: currentAccount,
    chainId: selectedChain,
    globalLoading: loading,
    currentProvider,
    currentBalance,
    triggerLoading,
    errorMessage,
    connectInstalledWallet,
    disconnectWallet,
    clearError,
    processErrorMessage,
    getNativeCoinBalance,
    getChainId,
  };

  return (
    <WalletProviderContext.Provider value={contextValue}>
      {children}
    </WalletProviderContext.Provider>
  );
};
