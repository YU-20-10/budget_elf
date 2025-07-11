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
  btnStyle?: string;
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
  btnStyle,
  title,
  decription,
  content,
  isOpen = false,
  setIsOpen,
  full = false,
  minWidth,
}: DialogProps) {
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`block border border-primary rounded-xl p-3 overflow-hidden cursor-pointer hover:border-black ${btnStyle} ${
          full ? "w-full" : ""
        } ${minWidth ? "min-w-[120px]" : ""}`}
      >
        {modalBtn}
      </button>
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        transition
        className="fixed inset-0 flex w-screen items-center justify-center bg-black/30 transition duration-300 ease-out data-closed:opacity-0 z-3"
      >
        <DialogPanel className="max-w-lg min-w-2xs md:min-w-md space-y-4 bg-white p-6 lg:p-10 rounded-xl max-h-5/6 overflow-auto">
          <DialogTitle className="font-bold">{title}</DialogTitle>
          <Description>{decription ? decription : ""}</Description>
          <div>{content}</div>
        </DialogPanel>
      </Dialog>
    </>
  );
}
