"use client";
import { useEffect, useState, useRef, ReactNode } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { DayPicker, getDefaultClassNames } from "react-day-picker";

import useAccountBook from "@/hooks/useAccountBook";
import ModalDialog from "@/components/Dialogs/ModalDialog";
import CategoryTab from "@/components/Tabs/CategoryTab";
import CardModalDialog from "@/components/Dialogs/CardModalDialog";
import MessageModalDialog from "@/components/Dialogs/MessageModalDialog";

import {
  defaultExpenseMainCategory,
  defaultExpenseSubCategory,
  defaultIncomeMainCategory,
  defaultIncomeSubCategory,
  defaultOtherMainCategory,
  defaultOtherSubCategory,
} from "@/data/category";
import { AccountingRecordWithIdType } from "@/types/AccountingBookType";
import { PaymentRulesType } from "@/types/PaymentRulesType";
import { defaultPaymentRules } from "@/data/paymentRules";
import {
  addAccountingRecord,
  getAccountingRecord,
  watchAccountingRecord,
  delAccountingRecord,
  // addAccountBook,
  // setAccountBookRule,
} from "@/lib/firebase/firestore";
import useAuth from "@/hooks/useAuth";

type organizeDataType = {
  [key: string]: AccountingRecordWithIdType[];
};

// CategoryTab+CardModalDialog
const expenseMainCategory = [...defaultExpenseMainCategory];
const expenseSubCategory = { ...defaultExpenseSubCategory };
const incomeMainCategory = [...defaultIncomeMainCategory];
const incomeSubCategory = { ...defaultIncomeSubCategory };
const otherMainCategory = [...defaultOtherMainCategory];
const otherSubCategory = { ...defaultOtherSubCategory };

// ModalDialog
const paymentRules = [...defaultPaymentRules];

// Daypicker
const defaultClassNames = getDefaultClassNames();

export default function Record() {
  const router = useRouter();
  const userData = useAuth();
  const {
    allAccountBook,
    selectedAccountingBook,
    setSelectedAccountingBook,
    selectedBookRecord,
    setSelectedBookRecord,
  } = useAccountBook();

  // 記帳資料
  const accountingRecordRef = useRef<AccountingRecordWithIdType[] | undefined>(
    undefined
  );

  // --- useState ---
  // 取得遠端資料後儲存用

  // 元件控制用
  // Daypicker
  const [selected, setSelected] = useState<Date>(new Date());
  // CategoryTab
  const [categoryDisplay, setCategoryDisplay] =
    useState<string>("mainCategory");
  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);
  // Dialog
  const [categoryIsOpen, setcategoryIsOpen] = useState<boolean>(false);
  const [dateIsOpen, setDateIsOpen] = useState<boolean>(false);
  const [paymentIsOpen, setPaymentIsOpen] = useState<boolean>(false);
  const [alertMessageIsOpen, setAlertMessageIsOpen] = useState<boolean>(false);
  // const [cardModalIsOpen, setCardModalIsOpen] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [addBookOpen, setAddBookOpen] = useState<boolean>(false);

  // 資料顯示用 / 排序歸類資料
  const [organizeAccountingRecord, setOrganizeAccountingRecord] =
    useState<organizeDataType>({});
  const [activeRecord, setActiveRecord] =
    useState<AccountingRecordWithIdType | null>(null);
  const [alertMessageContent, setAlertMessageContent] = useState<ReactNode>(
    <></>
  );
  const [modalContent, setModalContent] = useState<ReactNode>(null);

  // 取得使用者互動資料用
  const [selectCategoryType, setSelectCategoryType] = useState<string>("支出");
  const [selectedMainCategory, setSelectedMainCategory] = useState<
    string | undefined
  >(undefined);
  const [selectedSubCategory, setSelectedSubCategory] = useState<
    string | undefined
  >(undefined);
  const [amountInput, setAmountInput] = useState<string>("");
  const [selectedPaymentRule, setSelectedPaymentRule] =
    useState<PaymentRulesType | null>(null);
  const [inputDescription, setInputDescription] = useState<string | null>(null);
  // --- useState ---

  // --- function ---
  // Daypicker
  function daySelectedHandler(date: Date) {
    setSelected(date);
    setDateIsOpen(false);
  }
  // CategoryTab
  function tabChangeHandler(index: number): void {
    setSelectedTabIndex(index);
    setCategoryDisplay("mainCategory");
    switch (index) {
      case 0:
        setSelectCategoryType("支出");
        break;
      case 1:
        setSelectCategoryType("收入");
        break;
      case 2:
        setSelectCategoryType("其他");
        break;
    }
  }
  function categoryClickHandler(event: React.MouseEvent<HTMLButtonElement>) {
    const main = event.currentTarget.dataset.main;
    const sub = event.currentTarget.dataset.sub;
    if (categoryDisplay === "mainCategory") {
      setCategoryDisplay("subCategory");
      setSelectedMainCategory(main);
    } else if (sub === "返回") {
      setCategoryDisplay("mainCategory");
    } else {
      setSelectedSubCategory(sub);
      setcategoryIsOpen(false);
    }
  }
  // 記帳
  async function recordSubmitHandler() {
    if (amountInput === "" || !selectedMainCategory || !selectedSubCategory) {
      setAlertMessageContent(<p>表單未填寫完整</p>);
      setAlertMessageIsOpen(true);
      return;
    }
    const record = {
      recorderUid: userData?.user?.uid ?? "",
      categoryType: selectCategoryType,
      mainCategory: selectedMainCategory,
      subCategory: selectedSubCategory,
      transactionDate: selected,
      amount:
        selectCategoryType === "支出"
          ? -Number(amountInput)
          : Number(amountInput),
      paymentRule: selectedPaymentRule?.name ?? null,
      description: inputDescription ?? null,
    };
    if (selectedAccountingBook?.id) {
      try {
        await addAccountingRecord(selectedAccountingBook?.id, record);
      } catch (error) {
        console.log("記帳錯誤", error);
      }
    }
  }
  function cardModalDelBtnClickHandler() {
    setAlertMessageContent(
      <div className="w-full">
        <p className="mb-4">確認要刪除此筆紀錄?</p>
        <ul className="border rounded-xl p-3 mb-4">
          <li>
            <span className="font-bold">記帳人：</span>
            {`${
              activeRecord?.recorderUid
                ? selectedAccountingBook?.displayNames?.[
                    activeRecord?.recorderUid
                  ]
                  ? selectedAccountingBook?.displayNames?.[
                      activeRecord?.recorderUid
                    ]
                  : activeRecord?.recorderUid
                : ""
            }`}
          </li>
          <li>
            <span className="font-bold">日期：</span>
            {activeRecord?.transactionDate instanceof Date
              ? activeRecord?.transactionDate.toLocaleDateString("zh-TW")
              : ""}
          </li>
          <li>
            <span className="font-bold">金額：</span>
            {activeRecord?.amount}
          </li>
          <li>
            <span className="font-bold">付款方式：</span>
            {activeRecord?.paymentRule}
          </li>
          <li>
            <span className="font-bold">分類：</span>
            {`${activeRecord?.categoryType} - ${activeRecord?.mainCategory} - ${activeRecord?.subCategory}`}
          </li>

          <li>
            <span className="font-bold">備註：</span>
            {activeRecord?.description}
          </li>
        </ul>
        <div className="flex justify-around">
          <button
            type="button"
            className="block border px-4 py-3 rounded-xl cursor-pointer hover:bg-primary hover:text-white hover:font-bold focus:bg-primary focus:font-bold"
            onClick={() => setAlertMessageIsOpen(false)}
          >
            取消
          </button>
          <button
            type="button"
            className="block bg-secondary text-white px-4 py-3 rounded-xl cursor-pointer hover:bg-primary hover:text-black hover:font-bold hover:border-primary focus:bg-primary focus:font-bold"
            onClick={confirmDelRecord}
          >
            確認
          </button>
        </div>
      </div>
    );
    setAlertMessageIsOpen(true);
  }

  async function confirmDelRecord() {
    if (selectedAccountingBook?.id && activeRecord?.id) {
      const result = await delAccountingRecord(
        selectedAccountingBook.id,
        activeRecord.id
      );
      if (result) {
        setAlertMessageIsOpen(false);
        setAlertMessageContent(<p>紀錄已刪除</p>);
        setActiveRecord(null);
        setAlertMessageIsOpen(true);
      } else {
        setAlertMessageIsOpen(false);
        setAlertMessageContent(<p>紀錄未能刪除，請稍後再試</p>);
        setAlertMessageIsOpen(true);
      }
    }
  }
  // --- function ---

  // --- template ---
  // ModalDialog
  const dateContent = (
    <DayPicker
      animate
      required
      mode="single"
      selected={selected}
      onSelect={daySelectedHandler}
      classNames={{
        today: `text-success`,
        selected: `bg-secondary rounded-full text-white`,
        root: `${defaultClassNames.root} flex flex-col items-center`,
        chevron: `${defaultClassNames.chevron} !fill-secondary`,
      }}
    />
  );
  const categoryContent = (
    <CategoryTab
      categoryDisplay={categoryDisplay}
      selectedMainCategory={selectedMainCategory}
      categoryClickHandler={categoryClickHandler}
      selectedTabIndex={selectedTabIndex}
      tabChangeHandler={tabChangeHandler}
      expenseMainCategory={expenseMainCategory}
      expenseSubCategory={expenseSubCategory}
      incomeMainCategory={incomeMainCategory}
      incomeSubCategory={incomeSubCategory}
      otherMainCategory={otherMainCategory}
      otherSubCategory={otherSubCategory}
    ></CategoryTab>
  );
  const paymentContent = (
    <ul>
      {paymentRules.map((rule: PaymentRulesType) => {
        return (
          <li key={`rule${rule.name}`} className="border rounded-md mb-2">
            <button
              type="button"
              className={`block w-full p-2 rounded-md ${
                selectedPaymentRule?.name === rule.name
                  ? `bg-primary text-white`
                  : `bg-white`
              }`}
              onClick={() => {
                setSelectedPaymentRule(rule);
                setPaymentIsOpen(false);
              }}
            >
              {rule.name}
            </button>
          </li>
        );
      })}
    </ul>
  );
  // --- template ---

  // --- useEffect ---
  useEffect(() => {
    const id = selectedAccountingBook?.id;
    if (!id) return;

    let unsubscribe: () => void;

    if (accountingRecordRef.current !== undefined) {
      setSelectedBookRecord(accountingRecordRef.current);
    } else {
      (async () => {
        try {
          const records = await getAccountingRecord(id);
          accountingRecordRef.current = records;
          setSelectedBookRecord(records);
        } catch (error) {
          console.log("遠端取record資料失敗", error);
        }
      })();
    }

    if (id) {
      unsubscribe = watchAccountingRecord(id, (records) => {
        accountingRecordRef.current = records;
        setSelectedBookRecord(records);
      });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [selectedAccountingBook, setSelectedBookRecord]);
  useEffect(() => {
    function organizeRecord() {
      const data: organizeDataType = {};
      selectedBookRecord?.forEach((record) => {
        let time: string = "";
        if (record.transactionDate instanceof Date) {
          time = record.transactionDate.toLocaleDateString("zh-TW");
        }
        if (data?.[time]) {
          data[time].push(record);
        } else {
          data[time] = [record];
        }
      });
      return setOrganizeAccountingRecord(data);
    }
    organizeRecord();
  }, [selectedBookRecord]);

  useEffect(() => {
    if (allAccountBook.length > 0) {
      // console.log(allAccountBook);
      setModalContent(
        <div>
          <ul className="mb-10">
            {allAccountBook.map((book) => (
              <li
                className="border rounded-xl mb-2 hover:border-primary"
                key={book.id}
              >
                <button
                  type="button"
                  className={`block w-full p-3 rounded-xl cursor-pointer ${
                    selectedAccountingBook?.id === book.id
                      ? `bg-primary text-white`
                      : `bg-white`
                  }`}
                  onClick={() => {
                    setSelectedAccountingBook(book);
                    setIsOpen(false);
                  }}
                >
                  {book.bookName}
                </button>
              </li>
            ))}
          </ul>
        </div>
      );
    } else {
      setModalContent(
        <div>
          <div>
            <button
              type="button"
              onClick={() => setAddBookOpen(true)}
              className="border w-full p-3 rounded-xl bg-secondary text-white"
            >
              新增帳簿
            </button>
          </div>
        </div>
      );
    }
  }, [
    allAccountBook,
    selectedAccountingBook,
    setSelectedAccountingBook,
    addBookOpen,
  ]);

  // --- useEffect ---

  return (
    <main className="flex flex-col items-center p-6 lg:min-h-[calc(100vh-100px)] mb-25 lg:mb-0">
      <div className="container grow">
        <div className="mb-3 flex justify-between">
          <button
            type="button"
            onClick={() => {
              router.push("/accountingBook");
            }}
            className="flex justify-center items-center border border-primary rounded-xl p-3 overflow-hidden min-w-[120px] cursor-pointer hover:bg-primary hover:text-black focus:bg-primary focus:text-black"
          >
            <i className="bi bi-arrow-left-circle-fill text-2xl text-secondary hover:text-black focus:text-black pe-2"></i>
            返回
          </button>
          <ModalDialog
            modalBtn={selectedAccountingBook?.bookName ?? "選擇帳簿"}
            title="帳簿"
            decription="請選擇要使用的帳簿"
            content={modalContent}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            minWidth={true}
            full={false}
          ></ModalDialog>
        </div>
        <div className="flex flex-col lg:flex-row-reverse h-4/5">
          <div className="lg:w-1/2 py-3 flex flex-col grow">
            <div className="mb-3">
              <ModalDialog
                modalBtn={selected.toLocaleDateString()}
                title="日期"
                content={dateContent}
                isOpen={dateIsOpen}
                setIsOpen={setDateIsOpen}
                full={true}
              ></ModalDialog>
            </div>
            <input
              type="number"
              name="amount"
              id="amount"
              placeholder="金額"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              className="block border border-primary rounded-xl p-3 w-full text-center placeholder:text-center mb-3"
            />
            <div className="mb-3">
              <ModalDialog
                modalBtn={
                  selectedMainCategory && selectedSubCategory
                    ? `${selectedMainCategory} - ${selectedSubCategory}`
                    : "收支分類"
                }
                title="收支分類"
                content={categoryContent}
                isOpen={categoryIsOpen}
                setIsOpen={setcategoryIsOpen}
                full={true}
              ></ModalDialog>
            </div>
            {selectedTabIndex === 0 ? (
              <div className="mb-3">
                <ModalDialog
                  modalBtn={
                    selectedPaymentRule ? selectedPaymentRule.name : "付款方式"
                  }
                  title="付款方式"
                  content={paymentContent}
                  isOpen={paymentIsOpen}
                  setIsOpen={setPaymentIsOpen}
                  full={true}
                ></ModalDialog>
              </div>
            ) : (
              <></>
            )}

            <textarea
              name="description"
              id="decription"
              placeholder="備註"
              value={inputDescription ? inputDescription : undefined}
              onChange={(e) => setInputDescription(e.target.value)}
              className="block border border-primary rounded-xl p-3 w-full mb-3"
              rows={5}
            ></textarea>
            <div className="grow flex items-end">
              <button
                type="button"
                className="block w-full bg-secondary text-white rounded-xl p-3 cursor-pointer hover:bg-primary hover:text-black hover:font-bold hover:border-primary focus:bg-primary focus:font-bold"
                onClick={recordSubmitHandler}
              >
                送出
              </button>
            </div>
          </div>
          <div className="lg:w-1/2 py-3 grow p-3 lg:me-3 lg:h-[calc(100vh-170px)]">
            <div className="border h-full p-3 overflow-auto">
              <div className="lg:h-full overflow-auto">
                {Object.keys(organizeAccountingRecord).length > 0 ? (
                  Object.keys(organizeAccountingRecord).map((date) => {
                    return (
                      <div key={`date${date}`} className="p-2">
                        <div className="text-lg font-bold">{date}</div>
                        {organizeAccountingRecord[date].map((record) => {
                          const imgSrc = [
                            ...expenseMainCategory,
                            ...incomeMainCategory,
                            ...otherMainCategory,
                          ].find((el) => el.name === record.mainCategory)?.[
                            "icon"
                          ];
                          return (
                            <div
                              key={record.id}
                              className="mt-3 my-4 hover:border focus:border rounded-lg"
                            >
                              {/* <CardModalDialog
                                isOpen={cardModalIsOpen}
                                setIsOpen={setCardModalIsOpen}
                                record={record}
                                displayName={selectedAccountingBook?.displayNames}
                                paymentRule={paymentRules}
                              ></CardModalDialog> */}
                              <div
                                onClick={() => {
                                  // setCardModalIsOpen(true);
                                  setActiveRecord(record);
                                }}
                                className="cursor-pointer bg-light rounded-lg p-3"
                              >
                                <div>
                                  {selectedAccountingBook?.displayNames?.[
                                    record.recorderUid
                                  ]
                                    ? selectedAccountingBook?.displayNames?.[
                                        record.recorderUid
                                      ]
                                    : record.recorderUid}
                                </div>
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
                                      <p>{record.description}</p>
                                    </div>
                                  </div>
                                  <div className="flex">
                                    <p className="me-2 text-lime-600">
                                      {paymentRules.map((rule) => (
                                        <span
                                          key={`rule+${rule?.name}+${record.id}`}
                                        >
                                          {rule?.name === record.paymentRule
                                            ? `+${
                                                Math.abs(record.amount) *
                                                rule.reward
                                              }`
                                            : null}
                                        </span>
                                      ))}
                                    </p>
                                    <p>{record.amount}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div className="bg-primary h-px w-full"></div>
                      </div>
                    );
                  })
                ) : (
                  <p>尚未有記帳資料</p>
                )}
                {activeRecord && (
                  <div key={activeRecord.id} className="my-3">
                    <CardModalDialog
                      isOpen={!!activeRecord}
                      setIsOpen={(open) => {
                        if (!open) setActiveRecord(null);
                      }}
                      record={activeRecord}
                      displayName={selectedAccountingBook?.displayNames}
                      paymentRule={paymentRules}
                      haveBtn={
                        activeRecord.recorderUid === userData?.user?.uid
                          ? true
                          : false
                      }
                      delBtnClickHandler={cardModalDelBtnClickHandler}
                    ></CardModalDialog>
                  </div>
                )}
                <MessageModalDialog
                  isOpen={alertMessageIsOpen}
                  setIsOpen={setAlertMessageIsOpen}
                  title=""
                  content={
                    <div className="min-h-25 flex justify-center items-center">
                      {alertMessageContent}
                    </div>
                  }
                ></MessageModalDialog>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
