import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";

import React from "react";
import { formatAddress } from "@/app/utils";
import { useWalletProvider } from "@/app/hooks";

export const AvatarMenu = () => {
  const { selectedAccount } = useWalletProvider();

  if (!selectedAccount) return <></>;

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Avatar
          isBordered
          as="button"
          className="transition-transform"
          color="secondary"
          name="Jason Hughes"
          size="sm"
          src={`https://api.multiavatar.com/${selectedAccount}.png`}
        />
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Profile Actions"
        variant="flat"
        disabledKeys={["address"]}
      >
        <DropdownItem key="address" className="h-14 gap-2">
          <p className="font-semibold">Connected with</p>
          <p className="font-semibold">{formatAddress(selectedAccount)}</p>
        </DropdownItem>
        <DropdownItem key="profile">My Profile</DropdownItem>
        <DropdownItem key="transfer">Transfer</DropdownItem>
        <DropdownItem key="switch-chain">Switch chain</DropdownItem>
        <DropdownItem key="disconnect" color="danger" className="text-red-500">
          Disconnect
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};
