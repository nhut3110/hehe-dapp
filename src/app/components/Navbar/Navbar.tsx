"use client";

import {
  Button,
  Link,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Navbar as NextUINavbar,
} from "@nextui-org/react";

import { AvatarMenu } from "./AvatarMenu";
import { ConnectButton } from "./ConnectButton";
import React from "react";
import { navbarItems } from "@/app/constants";
import { useWalletProvider } from "../../hooks";

export const Navbar = () => {
  const { selectedWallet, selectedAccount } = useWalletProvider();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <NextUINavbar onMenuOpenChange={setIsMenuOpen}>
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
        <NavbarBrand>
          <p className="font-bold text-inherit">HEHE</p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {navbarItems.map((item, index) => (
          <NavbarItem key={`${item.name}-${index}`} className="mx-3">
            <Link
              color="foreground"
              href={item.link}
              className="text-lg font-medium"
            >
              {item.name}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>
      <NavbarContent justify="end">
        {!!selectedWallet && !!selectedAccount ? (
          <AvatarMenu />
        ) : (
          <NavbarItem>
            <ConnectButton />
          </NavbarItem>
        )}
      </NavbarContent>
      <NavbarMenu>
        {navbarItems.map((item, index) => (
          <NavbarMenuItem key={`${item.name}-${index}`}>
            <Link
              color={
                index === 2
                  ? "primary"
                  : index === navbarItems.length - 1
                    ? "danger"
                    : "foreground"
              }
              className="w-full"
              href={item.link}
              size="lg"
            >
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </NextUINavbar>
  );
};
