import { Contract } from "ethers";

export interface ITokenData {
  symbol: string;
  balance: string;
  decimals: string;
  address: string;
  contract: Contract;
  logoUrl: string;
  name: string;
}
