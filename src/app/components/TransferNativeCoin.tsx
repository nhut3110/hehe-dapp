"use client";

import { Button, message } from "antd";
import React, { useCallback, useState } from "react";
import { chainData, sepoliaChainId } from "../constants";

import { TransferModal } from "./TransferModal";
import { ethers } from "ethers";
import { formatValueToHexWei } from "../utils";
import { useForm } from "antd/es/form/Form";
import { useWalletProvider } from "../hooks";

export const TransferNativeCoin = () => {
  const [form] = useForm();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const {
    selectedWallet,
    selectedAccount,
    chainId,
    triggerLoading,
    globalLoading,
    processErrorMessage,
    currentBalance,
    getNativeCoinBalance,
  } = useWalletProvider();

  const handleTransfer = useCallback(async () => {
    if (!selectedWallet || !selectedAccount) return;
    triggerLoading(true);
    try {
      const values = await form?.validateFields();
      const { address, value } = values;
      setOpenModal(false);

      const transactionHash = (await selectedWallet?.provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            to: address,
            from: selectedAccount,
            value: formatValueToHexWei(value.toString()),
          },
        ],
      })) as string;

      const currentNetworkName = chainData.find(
        (item) => item.chainId.toString() === chainId,
      );
      if (currentNetworkName) {
        try {
          const provider = new ethers.EtherscanProvider(
            currentNetworkName.networkName,
            process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY,
          );
          const receipt = await provider.waitForTransaction(transactionHash);
          console.log(receipt);
          message.success("Transaction completed");
        } catch (error) {
          processErrorMessage(error);
        }
      }

      await getNativeCoinBalance(selectedAccount);
    } catch (error) {
      console.error(error);
      processErrorMessage(error);
    } finally {
      triggerLoading(false);
    }
  }, [
    selectedWallet,
    selectedAccount,
    triggerLoading,
    form,
    chainId,
    getNativeCoinBalance,
    processErrorMessage,
  ]);

  const onOk = useCallback(async () => {
    try {
      await form?.validateFields();
      await handleTransfer();
    } catch (error) {
      console.error(error);
    }
  }, [form, handleTransfer]);

  return (
    <>
      {selectedWallet && (
        <>
          <Button onClick={() => setOpenModal(true)} disabled={globalLoading}>
            Transfer
          </Button>
          <TransferModal
            open={openModal}
            onCancel={() => setOpenModal(false)}
            onOk={onOk}
            okButtonProps={{
              loading: globalLoading,
            }}
            globalLoading={globalLoading}
            currentBalance={currentBalance}
            form={form}
          />
        </>
      )}
    </>
  );
};
