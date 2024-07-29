import {
  Form,
  FormInstance,
  Input,
  InputNumber,
  Modal,
  ModalProps,
} from "antd";

import React from "react";
import { isAddress } from "ethers";

interface TransferModalProps extends ModalProps {
  form: FormInstance;
  globalLoading: boolean;
  currentBalance?: string;
}

export const TransferModal = ({
  form,
  globalLoading,
  currentBalance,
  ...props
}: TransferModalProps) => {
  return (
    <Modal
      {...props}
      okButtonProps={{ loading: globalLoading, ...props.okButtonProps }}
    >
      <Form form={form} layout="vertical" disabled={globalLoading}>
        <Form.Item
          label={"Address"}
          name={"address"}
          rules={[
            {
              required: true,
              message: "Please input an address",
            },
            {
              validator: (_, value) => {
                if (!isAddress(value))
                  return Promise.reject(new Error("Invalid address"));

                return Promise.resolve();
              },
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={"Value"}
          name={"value"}
          rules={[
            {
              required: true,
              message: "Please input value",
            },
            {
              pattern: /^[0-9.]+$/,
              message: "Please input a valid number",
            },
            {
              validator: (_, value) => {
                if (!currentBalance) return Promise.resolve();

                if (!value || parseFloat(value) <= parseFloat(currentBalance)) {
                  return Promise.resolve();
                }

                return Promise.reject(
                  new Error(`Value cannot exceed ${currentBalance}`),
                );
              },
            },
          ]}
        >
          <InputNumber style={{ width: "100%" }} stringMode controls={false} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
