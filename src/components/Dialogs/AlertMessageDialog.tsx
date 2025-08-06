"use client";

import { Dialog, DialogPanel } from "@headlessui/react";
import { AlertMessageDialogType } from "@/types/DialogType";

type AlertMessageDialogProps = {
  dialogProps: AlertMessageDialogType;
  dialogOnClose: () => void;
};

export default function AlertMessageDialog({
  dialogProps,
  dialogOnClose,
}: AlertMessageDialogProps) {
  const { alertIsOpen, content } = dialogProps;
  return (
    <div>
      <Dialog
        open={alertIsOpen}
        onClose={dialogOnClose}
        transition
        className="fixed inset-0 flex w-screen items-center justify-center bg-black/30 p-4 transition duration-300 ease-out data-closed:opacity-0 z-3"
      >
        <DialogPanel className="max-w-lg min-w-2xs md:min-w-md space-y-4 bg-white p-6 lg:p-10 rounded-xl lg:max-h-5/6 overflow-auto text-black">
          <div autoFocus>
            <div className="min-h-15 flex items-center text-black">
              {content}
            </div>
          </div>
          <div className="flex justify-end">
            <button
              className="border rounded-xl px-5 py-2 cursor-pointer hover:bg-primary hover:text-bold hover:border-primary"
              onClick={dialogOnClose}
            >
              確定
            </button>
          </div>
        </DialogPanel>
      </Dialog>
    </div>
  );
}
