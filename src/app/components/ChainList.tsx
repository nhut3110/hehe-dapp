import { Form, Modal, ModalProps, Select } from "antd";
import React, { useCallback } from "react";

import { IChainData } from "../interfaces";
import { chainData } from "../constants";
import { useForm } from "antd/es/form/Form";

interface ChainListProps extends Omit<ModalProps, "onCancel" | "onOk"> {
  onSwitchChain: (chain: IChainData) => Promise<void>;
  onCancel?: () => void;
}

export const ChainList = ({
  onSwitchChain,
  onCancel,
  ...props
}: ChainListProps) => {
  const [form] = useForm();

  const handleFinish = useCallback(async () => {
    const values = await form?.validateFields();
    const { chainId } = values;

    const chain = chainData.find((item) => item.chainId === chainId);

    if (!chain) {
      onCancel?.();
      return;
    }

    onSwitchChain(chain);
    onCancel?.();
  }, [form, onCancel, onSwitchChain]);

  return (
    <Modal {...props} onCancel={onCancel} onOk={handleFinish}>
      <Form form={form} layout="vertical">
        <Form.Item label={"Select Chain"} name="chainId">
          <Select
            options={chainData.map((chain) => ({
              key: chain.chainId,
              label: chain.name,
              value: chain.chainId,
            }))}
            allowClear
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
