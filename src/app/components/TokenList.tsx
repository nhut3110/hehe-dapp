"use client";

import { Avatar, Button, List, Spin, message } from "antd";
import { ERC20ABI, chainData } from "../constants";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ethers, formatUnits, parseUnits } from "ethers";
import { formatAddress, formatChainAsHex } from "../utils";

import { Contract } from "ethers";
import { ITokenData } from "../interfaces";
import Moralis from "moralis";
import { TransactionResponse } from "ethers";
import { TransferModal } from "./TransferModal";
import { useForm } from "antd/es/form/Form";
import { useWalletProvider } from "../hooks";

export const TokenList = () => {
  const [form] = useForm();
  const [tokenList, setTokenList] = useState<Record<string, ITokenData>>({});
  const [currentToken, setCurrentToken] = useState<ITokenData>();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [localLoading, setLocalLoading] = useState<boolean>(false);
  const [currentInfuraChainName, setCurrentInfuraChainName] =
    useState<string>();
  const {
    selectedWallet,
    chainId,
    selectedAccount,
    triggerLoading,
    processErrorMessage,
    globalLoading,
    currentProvider,
    getNativeCoinBalance,
  } = useWalletProvider();

  const infuraProvider = useMemo(() => {
    return new ethers.InfuraProvider(
      currentInfuraChainName,
      process.env.NEXT_PUBLIC_INFURA_API_KEY,
    );
  }, [currentInfuraChainName]);

  const getTokenList = useCallback(
    async (accountAddress: string) => {
      setLocalLoading(true);
      setTokenList({});
      try {
        const { raw } = await Moralis.EvmApi.token.getWalletTokenBalances({
          chain: formatChainAsHex(Number(chainId)),
          address: accountAddress,
        });

        raw.forEach((token) => {
          setTokenList((prev) => ({
            ...prev,
            [token.token_address]: {
              balance: formatUnits(token.balance, token.decimals),
              symbol: token.symbol as string,
              address: token.token_address as string,
              decimals: Number(token.decimals).toString(),
              contract: new Contract(
                token.token_address,
                ERC20ABI,
                infuraProvider,
              ),
              logoUrl: token.logo ?? "",
            },
          }));
        });
      } catch (error) {
        console.error(error);
        processErrorMessage(error);
      } finally {
        setLocalLoading(false);
      }
    },
    [chainId, infuraProvider, processErrorMessage],
  );

  useEffect(() => {
    const chain = chainData.find((item) => item.chainId.toString() === chainId);

    if (!chain || !selectedAccount) return;

    setCurrentInfuraChainName(chain.networkName);

    getTokenList(selectedAccount);
  }, [chainId, getTokenList, selectedAccount]);

  const refetchTokenBalance = useCallback(
    async (token: ITokenData) => {
      try {
        const newTokenBalance = await token.contract.balanceOf(selectedAccount);

        setTokenList((prevTokenList) => ({
          ...prevTokenList,
          [token.address]: {
            ...prevTokenList[token.address],
            balance: formatUnits(newTokenBalance, BigInt(token.decimals)),
          },
        }));
      } catch (error) {
        console.error(error);
        processErrorMessage(error);
      }
    },
    [processErrorMessage, selectedAccount],
  );

  const refetchAccountBalance = useCallback(
    async (accountAddress: string, token: ITokenData) => {
      try {
        await refetchTokenBalance(token);
        await getNativeCoinBalance(accountAddress);
      } catch (error) {
        console.error(error);
        processErrorMessage(error);
      }
    },
    [getNativeCoinBalance, processErrorMessage, refetchTokenBalance],
  );

  const importTokenToWallet = useCallback(
    async (token: ITokenData) => {
      triggerLoading(true);
      try {
        await selectedWallet?.provider.request({
          method: "wallet_watchAsset",
          params: {
            type: "ERC20",
            options: {
              address: token.address,
              symbol: token.symbol,
              decimals: token.decimals,
            },
          } as any,
        });
      } catch (error) {
        console.log(error);
        processErrorMessage(error);
      } finally {
        triggerLoading(false);
      }
    },
    [processErrorMessage, selectedWallet?.provider, triggerLoading],
  );

  const transferToken = useCallback(
    async (token?: ITokenData) => {
      if (!token || !selectedAccount) return;

      triggerLoading(true);
      try {
        const values = await form?.validateFields();
        setOpenModal(false);
        const { address, value } = values;
        const signer = await currentProvider?.getSigner();
        const contract = new ethers.Contract(token.address, ERC20ABI, signer);

        const transactionResponse = (await contract.transfer(
          address,
          parseUnits(value, Number(token.decimals)),
        )) as TransactionResponse;

        const receipt = await infuraProvider.waitForTransaction(
          transactionResponse.hash,
        );

        console.log(receipt);
        message.success("Transaction completed");
        await refetchAccountBalance(selectedAccount, token);
      } catch (error) {
        processErrorMessage(error);
      } finally {
        triggerLoading(false);
      }
    },
    [
      currentProvider,
      form,
      infuraProvider,
      processErrorMessage,
      refetchAccountBalance,
      selectedAccount,
      triggerLoading,
    ],
  );

  const onOk = useCallback(async () => {
    try {
      await form?.validateFields();
      await transferToken(currentToken);
    } catch (error) {
      console.error(error);
    }
  }, [currentToken, form, transferToken]);

  return (
    <>
      {selectedAccount && (
        <div>
          <List
            dataSource={Object.values(tokenList)}
            itemLayout="vertical"
            loading={localLoading}
            renderItem={(item) => (
              <Spin spinning={localLoading}>
                <List.Item
                  actions={[
                    <Button
                      key={"add-token"}
                      onClick={() => importTokenToWallet(item)}
                      disabled={globalLoading}
                    >
                      Import {item.symbol}
                    </Button>,
                    <Button
                      key={"transfer-token"}
                      onClick={() => {
                        setCurrentToken(item);
                        setOpenModal(true);
                      }}
                      disabled={globalLoading}
                    >
                      Transfer
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      item.logoUrl ? (
                        <Avatar src={item.logoUrl} alt={item.symbol} />
                      ) : (
                        <Avatar>{item.symbol}</Avatar>
                      )
                    }
                    title={formatAddress(item.address)}
                    description={`Balance: ${item.balance}`}
                  />
                </List.Item>
              </Spin>
            )}
          />
          <TransferModal
            open={openModal}
            onCancel={() => setOpenModal(false)}
            onOk={onOk}
            globalLoading={globalLoading}
            form={form}
            currentBalance={
              Object.values(tokenList).find(
                (item) => item.address === currentToken?.address,
              )?.balance
            }
          />
        </div>
      )}
    </>
  );
};
