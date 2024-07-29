"use client";

import { Button, Divider, Flex, Image, Space, Spin, Typography } from "antd";

import { WalletConnectButton } from "./Navbar/WalletConnectButton";
import { useWalletProvider } from "../hooks";

export const WalletList = () => {
  const { selectedWallet, wallets, connectInstalledWallet } =
    useWalletProvider();

  return (
    <Flex align="center" justify="center" style={{ height: "90vh" }}>
      {!selectedWallet && (
        <Flex vertical justify="center" align="center">
          <div>
            <h2>Wallets Detected:</h2>
            <Flex vertical gap={16}>
              {Object.values(wallets).map((provider: EIP6963ProviderDetail) => (
                <Button
                  shape="round"
                  size="large"
                  key={provider.info.uuid}
                  onClick={() => connectInstalledWallet(provider.info.rdns)}
                >
                  <Image src={provider.info.icon} alt={provider.info.name} />
                  <div>{provider.info.name}</div>
                </Button>
              ))}
            </Flex>
          </div>
          <Divider>Or</Divider>
          <WalletConnectButton />
        </Flex>
      )}
    </Flex>
  );
};
