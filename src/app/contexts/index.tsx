import { NextUIProvider } from "@nextui-org/react";
import { PropsWithChildren } from "react";
import { WalletProvider } from "./WalletContext";

export const AppContext: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <NextUIProvider>
      <WalletProvider>{children}</WalletProvider>
    </NextUIProvider>
  );
};

export * from "./web3modal";
