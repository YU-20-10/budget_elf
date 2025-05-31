"use client";

// import Image from "next/image";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

import { AccountingRecordType } from "@/types/AccountingBookType";
// import { CategoryType } from "@/types/CategoryType";

type DialogProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  // category: CategoryType[];
  record: AccountingRecordType;
};

export default function CardModalDialog({
  isOpen,
  setIsOpen,
  record,
}: // category,
DialogProps) {
  // const imgSrc = category.find((el) => el.name === record.mainCategory)?.[
  //   "icon"
  // ];

  return (
    <>
      {/* <div onClick={() => setIsOpen(true)} className="cursor-pointer bg-light rounded-lg p-3">
        <div>{record.recorderUid}</div>
        <div className="bg-secondary h-px w-full my-2"></div>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white flex justify-center items-center rounded-full me-2">
              {imgSrc ? (
                <Image
                  src={imgSrc}
                  alt="category icon"
                  width={24}
                  height={24}
                ></Image>
              ) : (
                <Image
                  src="/icon/question_dark_icon.svg"
                  alt="category icon"
                  width={24}
                  height={24}
                ></Image>
              )}
            </div>
            <div>
              <p>{record.subCategory}</p>
              <p>{record.decription}</p>
            </div>
          </div>
          <div>
            <p>{record.amount}</p>
          </div>
        </div>
      </div> */}
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
                {record?.recorderUid}
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
                <span className="font-bold">分類：</span>
                {`${record.categoryType} - ${record.mainCategory} - ${record.subCategory}`}
              </li>
              <li>
                <span className="font-bold">付款方式：</span>
                {record?.paymentRule}
              </li>
              <li>
                <span className="font-bold">備註：</span>
                {record?.description}
              </li>
            </ul>
          </div>
          <div className="flex justify-end">
            <button
              className="border rounded-xl px-3 py-2 me-3"
              onClick={() => setIsOpen(false)}
            >
              刪除
            </button>
            <button
              className="border rounded-xl px-3 py-2"
              onClick={() => setIsOpen(false)}
            >
              修改
            </button>
          </div>
        </DialogPanel>
      </Dialog>
    </>
  );
}

