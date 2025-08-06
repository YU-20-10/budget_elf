"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { ComfirmDialogType } from "@/types/DialogType";
import { ReactNode } from "react";

type ComfirmDialogProps = ComfirmDialogType & {
  dialogOnClose: () => void;
  children: ReactNode;
};

export default function ComfirmDialog({
  comfirmIsOpen,
  title,
  confirmBtn = "確定",
  confirmBtnHandler,
  // content,
  children,
  dialogOnClose,
}: ComfirmDialogProps) {
  return (
    <div>
      <Dialog
        open={comfirmIsOpen}
        onClose={dialogOnClose}
        transition
        className="fixed inset-0 flex w-screen items-center justify-center bg-black/30 p-4 transition duration-300 ease-out data-closed:opacity-0 z-3"
      >
        <DialogPanel className="max-w-lg min-w-2xs md:min-w-md space-y-4 bg-white p-6 lg:p-10 rounded-xl lg:max-h-5/6 overflow-auto text-black">
          <DialogTitle className="font-bold text-black">{title}</DialogTitle>
          <div autoFocus>{children}</div>

          <div className="flex justify-end">
            <button
              className="border rounded-xl px-5 py-2 me-3"
              onClick={dialogOnClose}
            >
              取消
            </button>
            <button
              className="block border py-3 px-5 rounded-xl bg-secondary text-white cursor-pointer hover:bg-primary hover:text-black hover:font-bold hover:border-primary"
              onClick={(event) => {
                confirmBtnHandler(event);
              }}
            >
              {confirmBtn}
            </button>
          </div>
        </DialogPanel>
      </Dialog>
    </div>
  );
}
