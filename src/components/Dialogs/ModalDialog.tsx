"use client";

import React, { ReactNode } from "react";
import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";

type DialogProps = {
  modalBtn?: string;
  title: string;
  decription?: string;
  content?: ReactNode;
  confirmBtn?: string;
  isOpen?: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  full?: boolean;
  minWidth?: boolean;
};

export default function ModalDialog({
  modalBtn = "預設",
  title,
  decription,
  content,
  // confirmBtn = "確認",
  isOpen = false,
  setIsOpen,
  full = false,
  minWidth,
}: DialogProps) {
  // console.log(isOpen);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`block border border-primary rounded-xl p-3 overflow-hidden ${
          full ? "w-full" : ""
        } ${minWidth ? "min-w-[120px]" : ""}`}
      >
        {modalBtn}
      </button>
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        transition
        className="fixed inset-0 flex w-screen items-center justify-center bg-black/30 transition duration-300 ease-out data-closed:opacity-0"
      >
        <DialogPanel className="max-w-lg min-w-2xs md:min-w-md space-y-4 bg-white p-6 lg:p-10 rounded-xl max-h-5/6 overflow-auto">
          <DialogTitle className="font-bold">{title}</DialogTitle>
          <Description>{decription ? decription : ""}</Description>
          <div>{content}</div>
          {/* <div className="flex justify-end">
            <button
              className="border rounded-xl px-3 py-2 me-3"
              onClick={() => setIsOpen(false)}
            >
              取消
            </button>
            <button
              className="border rounded-xl px-3 py-2"
              onClick={() => setIsOpen(false)}
            >
              {confirmBtn}
            </button>
          </div> */}
        </DialogPanel>
      </Dialog>
    </>
  );
}
