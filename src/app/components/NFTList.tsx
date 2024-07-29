"use client";

import { Avatar, Button, Divider, Image, List, Skeleton, message } from "antd";
import { Contract, InfuraProvider, TransactionResponse } from "ethers";
import { ERC721ABI, TOKEN_STANDARDS, chainData } from "../constants";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { formatChainAsHex, parseIPFSToNormalUrl } from "../utils";

import InfiniteScroll from "react-infinite-scroll-component";
import Moralis from "moralis";
import { NFTData } from "../interfaces";
import { TransferNFTModal } from "./TransferNFTModal";
import axios from "axios";
import { useForm } from "antd/es/form/Form";
import { useWalletProvider } from "../hooks";

export const NFTList = () => {
  const [form] = useForm();

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [currentNFT, setCurrentNFT] = useState<NFTData>();
  const [nftList, setNFTList] = useState<NFTData[]>([]);
  const [canLoadMore, setCanLoadMore] = useState<boolean>(true);
  const [currentCursor, setCurrentCursor] = useState<string>();
  const [currentInfuraChainName, setCurrentInfuraChainName] =
    useState<string>();

  const {
    chainId,
    selectedAccount,
    currentProvider,
    getNativeCoinBalance,
    processErrorMessage,
    triggerLoading,
    globalLoading,
  } = useWalletProvider();

  const infuraProvider = useMemo(() => {
    return new InfuraProvider(
      currentInfuraChainName,
      process.env.NEXT_PUBLIC_INFURA_API_KEY,
    );
  }, [currentInfuraChainName]);

  const resetNFTList = useCallback(() => {
    setNFTList([]);
    setCurrentCursor(undefined);
    setCanLoadMore(true);
  }, []);

  const parseNFTMetadata = useCallback(
    async (metadata?: string, tokenUri?: string) => {
      try {
        if (metadata) return JSON.parse(metadata);
        if (tokenUri) {
          const { data: nftData } = await axios.get(
            parseIPFSToNormalUrl(tokenUri),
          );

          return nftData;
        }

        return {};
      } catch (error) {
        console.error(error);
      }
    },
    [],
  );

  const getNFTList = useCallback(async () => {
    if (!selectedAccount) return;

    try {
      const { raw } = await Moralis.EvmApi.nft.getWalletNFTs({
        chain: formatChainAsHex(Number(chainId)),
        limit: 10,
        cursor: currentCursor,
        format: "decimal",
        normalizeMetadata: true,
        mediaItems: false,
        address: selectedAccount,
      });

      setCanLoadMore(!!raw.cursor);

      setCurrentCursor(raw.cursor);

      raw.result.forEach(async (item) => {
        const metadata = await parseNFTMetadata(item.metadata, item.token_uri);

        setNFTList((prevList) => [
          ...prevList,
          {
            name: metadata?.name ?? "N/A",
            description: metadata?.description ?? "N/A",
            attributes: metadata?.attributes ?? [],
            image: metadata?.image,
            address: item.token_address,
            tokenId: item.token_id,
            symbol: item.symbol,
            collectionName: item.name,
            type: item.contract_type,
          },
        ]);
      });
    } catch (error) {
      console.error(error);
    }
  }, [chainId, currentCursor, parseNFTMetadata, selectedAccount]);

  const refetchDataAfterCompleteTransfer = useCallback(async () => {
    try {
      setNFTList([]);
      setCurrentCursor(undefined);
      await getNativeCoinBalance(selectedAccount as string);

      // Delay 3s before get data again
      await getNFTList();
    } catch (error) {
      processErrorMessage(error);
    }
  }, [getNFTList, getNativeCoinBalance, processErrorMessage, selectedAccount]);

  const transferNFT = useCallback(
    async (nft: NFTData) => {
      if (nft.type === TOKEN_STANDARDS.ERC721) {
        if (!currentProvider) return;

        triggerLoading(true);
        try {
          const { address } = await form.validateFields();
          const signer = await currentProvider.getSigner();
          const contract = new Contract(nft.address, ERC721ABI, signer);

          const transactionResponse = (await contract?.safeTransferFrom(
            selectedAccount,
            address,
            nft.tokenId,
          )) as TransactionResponse;

          setOpenModal(false);

          const receipt = await infuraProvider.waitForTransaction(
            transactionResponse.hash,
          );

          console.log(receipt);
          message.success("Transaction completed");
        } catch (error) {
          processErrorMessage(error);
        } finally {
          await refetchDataAfterCompleteTransfer();
          triggerLoading(false);
          form.resetFields();
        }
      } else message.info("Currently only support ERC721");
    },
    [
      currentProvider,
      form,
      infuraProvider,
      processErrorMessage,
      refetchDataAfterCompleteTransfer,
      selectedAccount,
      triggerLoading,
    ],
  );
  const onOk = useCallback(async () => {
    if (!currentNFT) return;

    try {
      await form?.validateFields();
      await transferNFT(currentNFT);
    } catch (error) {
      console.error(error);
    }
  }, [currentNFT, form, transferNFT]);

  useEffect(() => {
    resetNFTList();
    getNFTList();
  }, [chainId, selectedAccount]);

  useEffect(() => {
    const chain = chainData.find((item) => item.chainId.toString() === chainId);

    if (!chain || !selectedAccount) return;

    setCurrentInfuraChainName(chain.networkName);
  }, [chainId, selectedAccount]);

  return (
    <div
      id="scrollableDiv"
      style={{
        height: 400,
        overflow: "auto",
      }}
    >
      <InfiniteScroll
        dataLength={nftList.length}
        next={getNFTList}
        hasMore={canLoadMore}
        loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
        endMessage={<Divider plain>It is all, nothing more 🤐</Divider>}
        scrollableTarget="scrollableDiv"
      >
        {!!nftList.length && (
          <List
            itemLayout="vertical"
            dataSource={nftList}
            renderItem={(item) => (
              <List.Item
                style={{ minWidth: "300px" }}
                key={`${item.address} - ${item.tokenId}`}
                extra={
                  <Image
                    src={parseIPFSToNormalUrl(item.image ?? "")}
                    alt={item.name}
                    height={100}
                  />
                }
                actions={[
                  <Button
                    key={"nft-transfer"}
                    onClick={() => {
                      setCurrentNFT(item);
                      setOpenModal(true);
                    }}
                  >
                    Transfer
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar>{item.symbol}</Avatar>}
                  title={item.name}
                  description={item.collectionName}
                />
                <div>{item.description}</div>
              </List.Item>
            )}
          />
        )}
      </InfiniteScroll>
      <TransferNFTModal
        open={openModal}
        onCancel={() => setOpenModal(false)}
        onOk={onOk}
        globalLoading={globalLoading}
        form={form}
      />
    </div>
  );
};
