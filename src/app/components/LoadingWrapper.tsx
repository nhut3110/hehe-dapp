"use client";

import { Spin, SpinProps } from "antd";

import { LoadingOutlined } from "@ant-design/icons";
import React from "react";
import { useWalletProvider } from "../hooks";

interface LoadingWrapperProps extends Omit<SpinProps, "spinning"> {}

export const LoadingWrapper = (props: LoadingWrapperProps) => {
  const { children, ...restProps } = props;

  const { globalLoading } = useWalletProvider();

  return (
    <Spin
      indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
      {...restProps}
      spinning={globalLoading}
    >
      {children}
    </Spin>
  );
};
