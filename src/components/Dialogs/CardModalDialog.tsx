"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { AccountingRecordType } from "@/types/AccountingBookType";
import { PaymentRulesType } from "@/types/PaymentRulesType";

type DialogProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  haveBtn?: boolean;
  record: AccountingRecordType;
  displayName: Record<string, string> | undefined;
  paymentRule: PaymentRulesType[];
  delBtnClickHandler?: (e: React.MouseEvent) => void;
};

export default function CardModalDialog({
  isOpen,
  setIsOpen,
  haveBtn = false,
  record,
  displayName,
  paymentRule,
  delBtnClickHandler,
}: DialogProps) {
  const usedPaymentRule = record?.paymentRule
    ? paymentRule.find((rule) => record.paymentRule === rule.name)
    : null;
  return (
    <>
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        transition
        className="fixed inset-0 flex w-screen items-center justify-center bg-black/30 transition duration-300 ease-out data-closed:opacity-0"
      >
        <DialogPanel className="max-w-lg min-w-2xs md:min-w-md space-y-4 bg-white p-6 lg:p-10 rounded-xl">
          <DialogTitle className="font-bold">記帳資料</DialogTitle>
          <div>
            <ul>
              <li>
                <span className="font-bold">記帳人：</span>
                {`${
                  displayName?.[record?.recorderUid]
                    ? displayName?.[record?.recorderUid]
                    : record?.recorderUid
                }`}
              </li>
              <li>
                <span className="font-bold">日期：</span>
                {record.transactionDate instanceof Date
                  ? record.transactionDate.toLocaleDateString("zh-TW")
                  : ""}
              </li>
              <li>
                <span className="font-bold">金額：</span>
                {record.amount}
              </li>
              <li>
                <span className="font-bold">付款方式：</span>
                {record?.paymentRule}
              </li>
              <li>
                <span className="font-bold">回饋：</span>
                {usedPaymentRule?.reward
                  ? `+ ${Math.abs(record.amount) * usedPaymentRule?.reward}`
                  : "+ 0"}
              </li>
              <li>
                <span className="font-bold">分類：</span>
                {`${record.categoryType} - ${record.mainCategory} - ${record.subCategory}`}
              </li>

              <li>
                <span className="font-bold">備註：</span>
                {record?.description}
              </li>
            </ul>
          </div>
          <div className={`${haveBtn ? "flex" : "hidden"} justify-end`}>
            <button
              className="border rounded-xl px-3 py-2 me-3"
              onClick={delBtnClickHandler}
            >
              刪除
            </button>
            {/* <button
              className="border rounded-xl px-3 py-2"
              onClick={() => setIsOpen(false)}
            >
              修改
            </button> */}
          </div>
        </DialogPanel>
      </Dialog>
    </>
  );
}
