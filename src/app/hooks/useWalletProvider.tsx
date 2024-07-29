"use client";

import { useContext } from "react";
import { WalletProviderContext } from "../contexts/WalletContext";

export const useWalletProvider = () => useContext(WalletProviderContext);
