import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalProps,
} from "@nextui-org/react";
import { Form, FormInstance } from "antd";

import React from "react";
import { isAddress } from "ethers";

interface TransferModalProps extends ModalProps {
  globalLoading: boolean;
  currentBalance?: string;
  form: FormInstance;
  onSubmit: () => void;
}

export const TransferModal = ({
  form,
  globalLoading,
  currentBalance,
  onSubmit,
  ...props
}: TransferModalProps) => {
  return (
    <Modal {...props}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Transfer token</ModalHeader>
            <ModalBody>
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

                        if (
                          !value ||
                          parseFloat(value) <= parseFloat(currentBalance)
                        ) {
                          return Promise.resolve();
                        }

                        return Promise.reject(
                          new Error(`Value cannot exceed ${currentBalance}`),
                        );
                      },
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Form>
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="flat" onPress={onClose}>
                Close
              </Button>
              <Button color="secondary" onClick={onSubmit}>
                Transfer
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
