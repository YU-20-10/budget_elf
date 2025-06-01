"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import React, { ReactNode } from "react";

type MessageModalDialogProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onCloseHandler?: () => void;
  setParentIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
  content: ReactNode;
  withConfirmBtn?: boolean;
  withCancelBtn?: boolean;
  confirmBtnHandler?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

export default function MessageModalDialog({
  isOpen,
  setIsOpen,
  onCloseHandler = () => {
    setIsOpen(false);
    if (setParentIsOpen) {
      setParentIsOpen(false);
    }
  },
  setParentIsOpen,
  title,
  content,
  withConfirmBtn = false,
  withCancelBtn = false,
  confirmBtnHandler,
}: MessageModalDialogProps) {
  return (
    <div>
      <Dialog
        open={isOpen}
        onClose={onCloseHandler}
        transition
        className="fixed inset-0 flex w-screen items-center justify-center bg-black/30 p-4 transition duration-300 ease-out data-closed:opacity-0"
      >
        <DialogPanel className="max-w-lg min-w-2xs md:min-w-md space-y-4 bg-white p-6 lg:p-10 rounded-xl lg:max-h-5/6 overflow-auto">
          <DialogTitle className="font-bold">{title}</DialogTitle>
          <div>{content}</div>

          <div className="flex justify-end">
            {withCancelBtn ? (
              <button
                className="border rounded-xl px-5 py-2 me-3"
                onClick={() => setIsOpen(false)}
              >
                取消
              </button>
            ) : (
              <></>
            )}
            {withConfirmBtn ? (
              <button
                className="border rounded-xl px-5 py-2"
                onClick={(event) => {
                  confirmBtnHandler?.(event);
                }}
              >
                確定
              </button>
            ) : (
              <></>
            )}
          </div>
        </DialogPanel>
      </Dialog>
    </div>
  );
}
