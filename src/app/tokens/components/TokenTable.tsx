"use client";

import { BiImport, BiRefresh, BiTransfer } from "react-icons/bi";
import {
  Button,
  Pagination,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
  User,
} from "@nextui-org/react";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import React, { useCallback, useMemo, useState } from "react";

import { GiOpenTreasureChest } from "react-icons/gi";
import { ITokenData } from "../interfaces";
import { TransferModal } from "@/app/components";
import { columns } from "../constants";
import { useERC20Tokens } from "../hooks";
import { useForm } from "antd/es/form/Form";
import { useWalletProvider } from "@/app/hooks";

export const TokenTable = () => {
  const [form] = useForm();
  const { selectedAccount, chainId, globalLoading } = useWalletProvider();
  const {
    tokenList,
    importTokenToWallet,
    transferToken,
    refetchAccountBalance,
    getTransactionReceipt,
    loading,
    getTokenList,
  } = useERC20Tokens({
    chainId,
    account: selectedAccount ?? "",
  });
  const [page, setPage] = useState<number>(1);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [currentToken, setCurrentToken] = useState<ITokenData>();
  const rowsPerPage = 4;

  const pages = useMemo(
    () => Math.ceil(Object.values(tokenList).length / rowsPerPage),
    [tokenList],
  );

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return Object.values(tokenList).slice(start, end);
  }, [page, tokenList]);

  const renderCell = useCallback(
    (token: ITokenData, columnKey: string) => {
      switch (columnKey) {
        case "token":
          return (
            <User
              description={token.address}
              name={token.name}
              avatarProps={{
                showFallback: true,
                radius: "full",
                src: token.logoUrl,
                color: "warning",
                isBordered: true,
                fallback: (
                  <Jazzicon
                    diameter={100}
                    seed={jsNumberForAddress(token.address)}
                  />
                ),
              }}
            >
              {token.decimals}
            </User>
          );

        case "balance":
          return (
            <div className="font-medium">{`${token.balance} ${token.symbol}`}</div>
          );

        case "actions":
          return (
            <div className="relative flex items-center gap-2">
              <Tooltip content="Transfer token">
                <Button
                  key={`transfer-${globalLoading}`}
                  isIconOnly
                  isDisabled={globalLoading}
                  color="secondary"
                  variant="faded"
                  onClick={() => {
                    setCurrentToken(token);
                    setOpenModal(true);
                  }}
                >
                  <BiTransfer size={22} />
                </Button>
              </Tooltip>
              <Tooltip content="Import token to wallet">
                <Button
                  key={`import-${globalLoading}`}
                  isIconOnly
                  isDisabled={globalLoading}
                  color="secondary"
                  variant="faded"
                  onClick={() => importTokenToWallet(token)}
                >
                  <BiImport size={28} />
                </Button>
              </Tooltip>
            </div>
          );

        default:
          return "";
      }
    },
    [globalLoading, importTokenToWallet],
  );

  const onOk = useCallback(async () => {
    try {
      await form?.validateFields();
      await transferToken(currentToken);
    } catch (error) {
      console.error(error);
    }
  }, [currentToken, form, transferToken]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-center mb-5">
        <p className="text-3xl text-transparent font-semibold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text animate-gradient">
          ERC20 Tokens Table
        </p>
        <Button
          isIconOnly
          isLoading={loading}
          onClick={() => getTokenList(selectedAccount as string)}
          color="warning"
        >
          <BiRefresh size={28} />
        </Button>
      </div>
      <Table
        aria-label="ERC20 Tokens"
        removeWrapper
        bottomContent={
          <div className="flex w-full justify-center">
            {!!items.length && (
              <Pagination
                isCompact
                showControls
                showShadow
                color="secondary"
                page={page}
                total={pages}
                onChange={(page) => setPage(page)}
              />
            )}
          </div>
        }
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key} align={"start"}>
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={items}
          isLoading={loading}
          loadingContent={
            <Spinner color="warning" label="Finding treasure..." />
          }
          emptyContent={
            <div className="flex flex-col gap-5 w-full justify-center items-center">
              <GiOpenTreasureChest size={70} />
              <p className="text-lg text-gray font-medium">
                Let&apos;s make your treasure full
              </p>
            </div>
          }
        >
          {items.map((item) => (
            <TableRow key={item.address} className="my-2 p-2">
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey as string)}</TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TransferModal
        open={openModal}
        onCancel={() => setOpenModal(false)}
        onOk={onOk}
        globalLoading={globalLoading}
        form={form}
        currentBalance={
          Object.values(tokenList).find(
            (item) => item.address === currentToken?.address,
          )?.balance
        }
      />
    </div>
  );
};
