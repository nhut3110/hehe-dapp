import { Form, FormInstance, Input, Modal, ModalProps } from "antd";

import React from "react";
import { isAddress } from "ethers";

interface TransferNFTModalProps extends ModalProps {
  form: FormInstance;
  globalLoading: boolean;
}

export const TransferNFTModal = ({
  form,
  globalLoading,
  ...props
}: TransferNFTModalProps) => {
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
      </Form>
    </Modal>
  );
};
