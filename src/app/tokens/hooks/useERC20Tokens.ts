import {
  Contract,
  InfuraProvider,
  TransactionResponse,
  formatUnits,
  parseUnits,
} from "ethers";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ERC20ABI } from "../constants";
import { ITokenData } from "../interfaces";
import Moralis from "moralis";
import { chainData } from "@/app/constants";
import { formatChainAsHex } from "@/app/utils";
import { useForm } from "antd/es/form/Form";
import { useWalletProvider } from "@/app/hooks";

interface UseErc20TokensProps {
  chainId: string;
  account: string;
}

export const useERC20Tokens = ({ chainId, account }: UseErc20TokensProps) => {
  const [form] = useForm();
  const [tokenList, setTokenList] = useState<Record<string, ITokenData>>({});
  const [localLoading, setLocalLoading] = useState<boolean>(false);
  const [currentInfuraChainName, setCurrentInfuraChainName] =
    useState<string>();

  const {
    processErrorMessage,
    getNativeCoinBalance,
    selectedWallet,
    triggerLoading,
    currentProvider,
  } = useWalletProvider();

  const infuraProvider = useMemo(() => {
    return new InfuraProvider(
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
              name: token.name,
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

  const refetchTokenBalance = useCallback(
    async (token: ITokenData) => {
      try {
        const newTokenBalance = await token.contract.balanceOf(account);

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
    [processErrorMessage, account],
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
      if (!token || !account) return;

      triggerLoading(true);
      try {
        const values = await form?.validateFields();
        const { address, value } = values;
        const signer = await currentProvider?.getSigner();
        const contract = new Contract(token.address, ERC20ABI, signer);

        const transactionResponse = (await contract.transfer(
          address,
          parseUnits(value, Number(token.decimals)),
        )) as TransactionResponse;

        // await refetchAccountBalance(account, token);
        return transactionResponse.hash;
      } catch (error) {
        processErrorMessage(error);
      } finally {
        triggerLoading(false);
      }
    },
    [currentProvider, form, processErrorMessage, account, triggerLoading],
  );

  const getTransactionReceipt = useCallback(
    async (transactionHash: string) => {
      try {
        const receipt =
          await infuraProvider.waitForTransaction(transactionHash);

        console.log(receipt);
        return receipt;
      } catch (error) {
        console.error(error);
        processErrorMessage(error);
      }
    },
    [infuraProvider, processErrorMessage],
  );

  useEffect(() => {
    const chain = chainData.find((item) => item.chainId.toString() === chainId);

    if (!chain || !account) return;

    setCurrentInfuraChainName(chain.networkName);

    getTokenList(account);
  }, [chainId, getTokenList, account]);

  return {
    tokenList,
    getTokenList,
    loading: localLoading,
    refetchAccountBalance,
    getTransactionReceipt,
    transferToken,
    importTokenToWallet,
  };
};
