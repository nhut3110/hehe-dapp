import {
  Button,
  Divider,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";

import React from "react";
import { WalletConnectButton } from "./WalletConnectButton";
import { useWalletProvider } from "@/app/hooks";

export const ConnectButton = () => {
  const { wallets, connectInstalledWallet } = useWalletProvider();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  return (
    <div>
      <Button color="secondary" variant="flat" onPress={onOpen}>
        Connect Wallet
      </Button>
      <Modal
        isOpen={isOpen}
        placement={"center"}
        onOpenChange={onOpenChange}
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader>Connect your wallet</ModalHeader>
          <ModalBody>
            <div className="flex justify-center align-middle flex-col gap-4 my-5">
              <h2>Wallets Detected:</h2>
              <div className="flex flex-col gap-3">
                {Object.values(wallets).map(
                  (provider: EIP6963ProviderDetail) => (
                    <Button
                      radius="full"
                      size="md"
                      key={provider.info.uuid}
                      onClick={() => connectInstalledWallet(provider.info.rdns)}
                      startContent={
                        <Image
                          src={provider.info.icon}
                          alt={provider.info.name}
                        />
                      }
                    >
                      <div>{provider.info.name}</div>
                    </Button>
                  ),
                )}
              </div>
              <Divider orientation="horizontal" />
              <WalletConnectButton />
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};
