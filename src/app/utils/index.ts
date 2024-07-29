import { BigNumberish, formatEther } from "ethers";
import { parseUnits, toBeHex } from "ethers";

import { IPFS_PROVIDER_URL } from "../constants";

export const formatBalance = (rawBalance: string) => {
  const balance = (parseInt(rawBalance) / 1000000000000000000).toFixed(2);
  return balance;
};

export const formatChainAsNum = (chainIdHex: string) => {
  const chainIdNum = parseInt(chainIdHex);
  return chainIdNum;
};

export const formatAddress = (addr: string) => {
  const upperAfterLastTwo = addr.slice(0, 2) + addr.slice(2);
  return `${upperAfterLastTwo.substring(0, 5)}...${upperAfterLastTwo.substring(
    39,
  )}`;
};

export const formatChainAsHex = (chainId: number) => {
  return `0x${chainId.toString(16)}`;
};

export const formatValueToHexWei = (value: string) => {
  return toBeHex(parseUnits(value, "ether"));
};

export const formatHexEncodedMessage = (message: string) => {
  return `0x${Buffer.from(message, "utf8").toString("hex")}`;
};

export const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + "...";
};

export const formatRoundEther = (wei: BigNumberish): string => {
  let ether = formatEther(wei);
  ether = (+ether).toFixed(4);

  return ether;
};

export const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const parseIPFSToNormalUrl = (uri: string) => {
  if (uri.includes("ipfs://")) return uri.replace("ipfs://", IPFS_PROVIDER_URL);

  if (uri.includes("/ipfs/")) {
    const splittedUri = uri.split("/ipfs/");

    return `${IPFS_PROVIDER_URL}${splittedUri.pop()}`;
  }

  return uri;
};
