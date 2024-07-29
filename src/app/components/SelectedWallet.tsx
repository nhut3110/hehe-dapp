"use client";

import { Avatar, Button, Card, Flex, Space } from "antd";
import { useEffect, useState } from "react";

import { IChainData } from "../interfaces";
import { chainData } from "../constants";
import { formatAddress } from "../utils";
import { useWalletProvider } from "../hooks";

const { Meta } = Card;

export const SelectedWallet = () => {
  const [currentChain, setCurrentChain] = useState<IChainData>();

  const {
    selectedWallet,
    selectedAccount,
    disconnectWallet,
    chainId,
    currentBalance,
    globalLoading,
  } = useWalletProvider();

  useEffect(() => {
    const chain = chainData.find(
      (item) => BigInt(item.chainId) === BigInt(chainId),
    );

    setCurrentChain(chain);
  }, [chainId]);

  return (
    <Flex vertical justify="center" align="center" gap={16}>
      {selectedAccount && (
        <Card
          extra={
            <Button
              type="text"
              danger
              onClick={disconnectWallet}
              disabled={globalLoading}
            >
              Disconnect
            </Button>
          }
          title={<div>{selectedWallet?.info.name}</div>}
          style={{ minWidth: "300px" }}
        >
          <Meta
            title={formatAddress(selectedAccount)}
            description={
              <Space>
                <Avatar>{currentChain?.nativeCurrency?.symbol ?? "?"}</Avatar>
                <div>{`${currentBalance} ${currentChain?.nativeCurrency.name}`}</div>
              </Space>
            }
          />
        </Card>
      )}
    </Flex>
  );
};
