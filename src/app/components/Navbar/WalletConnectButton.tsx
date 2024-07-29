import { Button } from "@nextui-org/react";
import { useWeb3Modal } from "@web3modal/ethers/react";

export const WalletConnectButton = () => {
  const { open } = useWeb3Modal();
  return (
    <Button onClick={() => open()} color="primary" radius="full">
      WalletConnect
    </Button>
  );
};
