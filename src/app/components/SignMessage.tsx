"use client";

import React, { useCallback } from "react";

import { Button } from "antd";
import { formatHexEncodedMessage } from "../utils";
import { useWalletProvider } from "../hooks";

export const SignMessage = () => {
  const {
    selectedWallet,
    selectedAccount,
    processErrorMessage,
    triggerLoading,
    globalLoading,
  } = useWalletProvider();

  const signMessage = useCallback(
    async (message: string) => {
      triggerLoading(true);
      try {
        const from = selectedAccount;
        const msg = formatHexEncodedMessage(message);
        const sign = await selectedWallet?.provider.request({
          method: "personal_sign",
          params: [msg, from],
        });

        console.log(sign);
      } catch (err) {
        console.error(err);
        processErrorMessage(err);
      } finally {
        triggerLoading(false);
      }
    },
    [
      processErrorMessage,
      selectedAccount,
      selectedWallet?.provider,
      triggerLoading,
    ],
  );

  return (
    <div>
      {selectedWallet && (
        <Button
          onClick={() => signMessage("This is a hello message")}
          disabled={globalLoading}
        >
          Sign hello message
        </Button>
      )}
    </div>
  );
};
