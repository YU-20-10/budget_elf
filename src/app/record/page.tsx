"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { DayPicker, getDefaultClassNames } from "react-day-picker";

import useAccountBook from "@/hooks/useAccountBook";
import ModalDialog from "@/components/Dialogs/ModalDialog";
import CategoryTab from "@/components/Tabs/CategoryTab";
import CardModalDialog from "@/components/Dialogs/CardModalDialog";
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

export default function Record() {
  // 使用者
  const userData = useAuth();
  // 帳簿
  const { selectedAccountingBook, selectedBookRecord, setSelectedBookRecord } =
    useAccountBook();
  // 記帳資料
  const accountingRecordRef = useRef<AccountingRecordWithIdType[] | undefined>(
    undefined
  );
  // Daypicker
  const defaultClassNames = getDefaultClassNames();

  // --- useState ---
  // 記帳
  const [selectCategoryType, setSelectCategoryType] = useState<string>("支出");
  // Daypicker
  const [selected, setSelected] = useState<Date>(new Date());
  // CategoryTab
  const [categoryDisplay, setCategoryDisplay] =
    useState<string>("mainCategory");
  const [selectedMainCategory, setSelectedMainCategory] = useState<
    string | undefined
  >(undefined);
  const [selectedSubCategory, setSelectedSubCategory] = useState<
    string | undefined
  >(undefined);
  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);
  // ModalDialog
  const [amountInput, setAmountInput] = useState<string>("");
  const [categoryIsOpen, setcategoryIsOpen] = useState<boolean>(false);
  const [dateIsOpen, setDateIsOpen] = useState<boolean>(false);
  const [paymentIsOpen, setPaymentIsOpen] = useState<boolean>(false);
  const [selectedPaymentRule, setSelectedPaymentRule] =
    useState<PaymentRulesType | null>(null);
  const [inputDescription, setInputDescription] = useState<string | null>(null);
  // CardModalDialog
  const [cardModalIsOpen, setCardModalIsOpen] = useState<boolean>(false);
  // 記帳資料
  const [organizeAccountingRecord, setOrganizeAccountingRecord] =
    useState<organizeDataType>({});
  const [activeRecord, setActiveRecord] =
    useState<AccountingRecordWithIdType | null>(null);
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
      alert("表單未填寫完整");
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
        const result = await addAccountingRecord(
          selectedAccountingBook?.id,
          record
        );
        console.log(result);
      } catch (error) {
        console.log("記帳錯誤", error);
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
  // useEffect(() => {
  //   console.log(inputDescription);
  // }, [inputDescription]);
  // useEffect(() => {
  //   console.log("selectedMainCategory", selectedMainCategory);
  //   console.log("selectedSubCategory", selectedSubCategory);
  //   // console.log("isOpen", isOpen);
  //   console.log("selectedTabIndex", selectedTabIndex);
  // }, [categoryDisplay, selectedTabIndex]);
  // --- useEffect ---

  return (
    <main className="flex flex-col items-center p-6 lg:min-h-[calc(100vh-100px)] mb-25 lg:mb-0">
      <div className="container grow">
        <div className="flex flex-col lg:flex-row-reverse h-full">
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
                className="block w-full bg-secondary text-white rounded-xl p-3"
                onClick={recordSubmitHandler}
              >
                送出
              </button>
            </div>
          </div>
          <div className="lg:w-1/2 py-3 grow p-3 lg:me-3 lg:h-[calc(100vh-150px)]">
            <div className="border h-full p-3 overflow-auto">
              {/* <p>記帳</p>
              <p>{selectedAccountingBook?.bookName}</p> */}
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
                            <div key={record.id} className="mt-3 my-4">
                              <CardModalDialog
                                isOpen={cardModalIsOpen}
                                setIsOpen={setCardModalIsOpen}
                                record={record}
                              ></CardModalDialog>
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
                    ></CardModalDialog>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
