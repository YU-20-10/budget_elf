"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

import useAuth from "@/hooks/useAuth";
import useAccountBook from "@/hooks/useAccountBook";
import RecordCalendar from "@/components/Calendar/RecordCalendar";
import DoughnutChart from "@/components/Chart/DoughnutChart";
// import ParallelTab from "@/components/Tabs/ParallelTab";
import ModalDialog from "@/components/Dialogs/ModalDialog";
import MessageModalDialog from "@/components/Dialogs/MessageModalDialog";
import YearAndMonthOrDayPicker from "@/components/Calendar/YearAndMonthOrDayPickerPicker";
import {
  // getAllAccountingRecord,
  getAllMyAccountingRecord,
} from "@/lib/firebase/firestore";
import {
  AccountingRecordSortType,
  AccountingRecordWithIdAndBookIdType,
} from "@/types/AccountingBookType";
import { getLocalTime } from "@/lib/time";
import {
  defaultExpenseMainCategory,
  // defaultExpenseSubCategory,
  defaultIncomeMainCategory,
  // defaultIncomeSubCategory,
  defaultOtherMainCategory,
  // defaultOtherSubCategory,
} from "@/data/category";

const expenseMainCategory = [...defaultExpenseMainCategory];
// const expenseSubCategory = { ...defaultExpenseSubCategory };
const incomeMainCategory = [...defaultIncomeMainCategory];
// const incomeSubCategory = { ...defaultIncomeSubCategory };
const otherMainCategory = [...defaultOtherMainCategory];
// const otherSubCategory = { ...defaultOtherSubCategory };

// const selectedFilterList = ["依月分檢視", "依日期檢視", "依帳簿檢視"];
const selectedFilterList = ["依月分檢視", "依日期檢視"];

function recordsSortByDate(records: AccountingRecordWithIdAndBookIdType[]) {
  const allRecordSortByDateObj = records.reduce((acc, value) => {
    let time: string = "";
    if (value.transactionDate instanceof Date) {
      time = getLocalTime(value.transactionDate);
    }
    if (acc?.[time]) {
      acc[time].push(value);
    } else {
      acc[time] = [value];
    }
    return acc;
  }, {} as Record<string, AccountingRecordWithIdAndBookIdType[]>);
  return allRecordSortByDateObj;
}

// function recordsSortByBook(records: AccountingRecordWithIdAndBookIdType[]) {
//   const allRecordSortByBookObj = records.reduce((acc, value) => {
//     const accountingBookId = value.accountingBookId;
//     if (acc?.[accountingBookId]) {
//       acc[accountingBookId].push(value);
//     } else {
//       acc[accountingBookId] = [value];
//     }
//     return acc;
//   }, {} as Record<string, AccountingRecordWithIdAndBookIdType[]>);
//   return allRecordSortByBookObj;
// }

function allCategoryAmount(records: AccountingRecordWithIdAndBookIdType[]) {
  const allCategoryAmountObj = records.reduce((acc, value) => {
    const mainCategory = value.mainCategory;
    if (acc?.[mainCategory]) {
      acc[mainCategory] += value.amount;
    } else {
      acc[mainCategory] = value.amount;
    }
    return acc;
  }, {} as Record<string, number>);
  return allCategoryAmountObj;
}

function countTotalAmount(records: AccountingRecordWithIdAndBookIdType[]) {
  const totalObj = records.reduce(
    (acc, value) => {
      if (value.categoryType === "支出") {
        acc["支出"] += value.amount;
      } else if (value.categoryType === "收入") {
        acc["收入"] += value.amount;
      }
      return acc;
    },
    { 支出: 0, 收入: 0 } as Record<string, number>
  );
  return totalObj;
}

export default function Summary() {
  const { allAccountBook } = useAccountBook();
  const { user } = useAuth();

  //---useState---
  // 取得遠端資料後儲存用
  const [allRecordRow, setAllRecordRow] = useState<
    AccountingRecordWithIdAndBookIdType[]
  >([]);

  // 元件控制用
  const [recordedDate, setRecordedDate] = useState<Set<string>>(new Set());
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
  const [selectFilterIsOpen, setSelectFilterIsOpen] = useState<boolean>(false);
  const [recordDetailIsOpen, setRecordDetailIsOpen] = useState<boolean>(false);
  const [selectRecordDetail, setSelectRecordDetail] = useState<
    AccountingRecordWithIdAndBookIdType | undefined
  >(undefined);

  // 資料顯示用 / 排序歸類資料
  const [allAccountBookName, setAllAccountBookName] = useState<
    Record<string, string>
  >({});
  // const [filterAllRecord, setFilterAllRecord] = useState<
  //   AccountingRecordWithIdAndBookIdType[]
  // >([]); // 依照選取日期篩選所有record // 可刪除
  const [allRecordSortByCategory, setAllRecordSortByCategory] = useState<{
    [key: string]: number;
  }>({}); // 圓餅圖用
  const [allRecordSortByDate, setAllRecordSortByDate] =
    useState<AccountingRecordSortType>({});
  const [totalAmount, setTotalAmount] = useState<Record<string, number>>({
    支出: 0,
    收入: 0,
  });
  // const [allRecordSortByBook, setAllRecordSortByBook] =
  //   useState<AccountingRecordSortType>({});

  // 取得使用者互動資料用
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth()
  );
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedFilter, setSelectedFilter] = useState<string>("依月分檢視");
  //---useState---

  //---function---
  function filterDateChangeHandler(date: Date) {
    setSelectedDate(date);
  }
  //---function---

  //---useEffec---
  useEffect(() => {
    const allAccountBookArr = allAccountBook.map((book) => book.id);
    const allAccountBookNameObj = allAccountBook.reduce((acc, value) => {
      acc[value.id] = value.bookName;
      return acc;
    }, {} as Record<string, string>);
    setAllAccountBookName(allAccountBookNameObj);

    (async () => {
      if (!user?.uid) return;
      const allRecord = await getAllMyAccountingRecord(
        allAccountBookArr,
        user.uid
      );
      setAllRecordRow(allRecord);

      // 整理daypicker日曆上標記用資料
      const allRecordDate = new Set(
        allRecord.map((record) => {
          return record.transactionDate instanceof Date
            ? getLocalTime(record.transactionDate)
            : "";
        })
      );

      setRecordedDate(allRecordDate);
    })();
  }, [allAccountBook, user?.uid]);

  useEffect(() => {
    const selectYear = selectedDate.getFullYear();
    const selectMonth = selectedDate.getMonth();
    const selectDate = selectedDate.getDate();

    let sortedAllRecord: AccountingRecordWithIdAndBookIdType[] = [];
    if (selectedFilter === "依月分檢視") {
      sortedAllRecord = allRecordRow
        .filter((recordObj) => {
          if (recordObj.transactionDate instanceof Date) {
            const year = new Date(recordObj.transactionDate).getFullYear();
            const month = new Date(recordObj.transactionDate).getMonth();
            return year === selectYear && month === selectMonth;
          }
          return false;
        })
        .sort((a, b) => {
          const timeA =
            a.transactionDate instanceof Date ? a.transactionDate.getTime() : 0;
          const timeB =
            b.transactionDate instanceof Date ? b.transactionDate.getTime() : 0;
          return timeB - timeA;
        });
    } else if (selectedFilter === "依日期檢視") {
      sortedAllRecord = allRecordRow.filter((recordObj) => {
        if (recordObj.transactionDate instanceof Date) {
          const year = new Date(recordObj.transactionDate).getFullYear();
          const month = new Date(recordObj.transactionDate).getMonth();
          const date = new Date(recordObj.transactionDate).getDate();
          return (
            year === selectYear && month === selectMonth && date === selectDate
          );
        }
        return false;
      });
    }

    setTotalAmount(countTotalAmount(sortedAllRecord));
    setAllRecordSortByCategory(
      allCategoryAmount(
        sortedAllRecord.filter((record) => record.categoryType === "支出")
      )
    ); // 名稱要改
    setAllRecordSortByDate(recordsSortByDate(sortedAllRecord));
  }, [selectedDate, allRecordRow, selectedFilter]);
  useEffect(() => {
    setSelectedYear(selectedDate.getFullYear());
    setSelectedMonth(selectedDate.getMonth());
    setSelectedDay(selectedDate.getDate());
  }, [selectedDate]);

  //---useEffec---

  //---template---
  const selectedFilterContent = (
    <>
      <ul>
        {selectedFilterList.map((listItem: string, index: number) => {
          return (
            <li
              key={`listItem${listItem}${index}`}
              className="border rounded-md mb-2"
            >
              <button
                className={`block w-full p-2 rounded-md ${
                  selectedFilter === listItem
                    ? `bg-primary text-white`
                    : `bg-white`
                }`}
                onClick={() => {
                  setSelectedFilter(listItem);
                  // setSelectedDate(new Date());
                  setSelectFilterIsOpen(false);
                }}
              >
                {listItem}
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );

  const recordDetailContent = (
    <ul>
      {selectRecordDetail ? (
        <>
          <li>
            <span className="font-bold">帳簿名稱：</span>
            {allAccountBookName[selectRecordDetail.accountingBookId]
              ? allAccountBookName[selectRecordDetail.accountingBookId]
              : selectRecordDetail.accountingBookId}
          </li>
          <li>
            <span className="font-bold">日期：</span>
            {selectRecordDetail.transactionDate instanceof Date
              ? getLocalTime(selectRecordDetail.transactionDate)
              : ""}
          </li>
          <li>
            <span className="font-bold">金額：</span>
            {selectRecordDetail.amount}
          </li>
          <li>
            <span className="font-bold">分類：</span>
            {`${selectRecordDetail.categoryType} - ${selectRecordDetail.mainCategory} - ${selectRecordDetail.subCategory}`}
          </li>
          <li>
            <span className="font-bold">付款方式：</span>
            {selectRecordDetail.paymentRule}
          </li>
          <li>
            <span className="font-bold">備註：</span>
            {selectRecordDetail.description}
          </li>
        </>
      ) : (
        <></>
      )}
    </ul>
  );

  //---template---

  return (
    <main className="flex flex-col items-center p-6 lg:h-[calc(100vh-50px)] mb-25 lg:mb-0 overflow-auto">
      <div className="container grow flex flex-col h-full">
        <div className="flex flex-col mb-4">
          <div className="bg-light p-3 flex flex-col lg:flex-row">
            <div className="lg:w-1/3">
              <div className="py-4 text-center p-2">
                <p className="font-bold text-lg">
                  {`${selectedMonth + 1}月`}盈餘
                </p>
                <p className="">
                  {totalAmount["收入"] + totalAmount["支出"] > 0
                    ? `${totalAmount["收入"] + totalAmount["支出"]}`
                    : `- ${Math.abs(
                        totalAmount["收入"] + totalAmount["支出"]
                      )}`}
                </p>
              </div>
            </div>
            <div className="flex bg-white relative after:content-[''] after:absolute after:bg-light after:w-px after:h-full after:start-1/2 lg:w-2/3">
              <div className="py-4 w-1/2 flex mx-4 p-3">
                <div className="flex items-center justify-center py-2 px-3 me-2 bg-green-50">
                  <i className="bi bi-arrow-down text-xl"></i>
                </div>
                <div className="flex flex-col items-center grow">
                  <p className="font-bold text-sm text-primary">總收入</p>
                  <p className="">{`+ ${totalAmount["收入"]}`}</p>
                </div>
              </div>
              <div className="py-4 w-1/2 flex mx-4 p-3">
                <div className="flex items-center justify-center py-2 px-3 me-2 bg-red-50">
                  <i className="bi bi-arrow-up text-xl"></i>
                </div>
                <div className="flex flex-col items-center grow">
                  <p className="font-bold text-sm text-primary">總支出</p>
                  <p className="">{`- ${Math.abs(totalAmount["支出"])}`}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex w-full flex-col lg:flex-row">
          <div className="lg:w-1/2 mb-4 lg:mb-0 lg:max-h-95 flex justify-center items-center">
            <DoughnutChart
              labels={Object.keys(allRecordSortByCategory)}
              data={Object.values(allRecordSortByCategory).map((amount) =>
                Math.abs(amount)
              )}
            ></DoughnutChart>
            {/* <ul>
              {Object.keys(allRecordSortByCategory).map((category) => (
                <li key={`category${category}`} className="flex">
                  <p>{category}：</p>
                  <p>{allRecordSortByCategory[category]}</p>
                </li>
              ))}
            </ul> */}
          </div>
          <div className="lg:w-1/2 lg:max-h-95">
            <RecordCalendar
              selected={selectedDate}
              // setSelected={setSelectedDate}
              recordedDate={recordedDate}
              dayClickHandler={filterDateChangeHandler}
            ></RecordCalendar>
          </div>
        </div>
        <div className="flex py-4 justify-around">
          <div className="w-full flex flex-col bg-light p-2">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">收支明細</h2>
              {/* <ParallelTab
                tabListClassName={""}
                tabClassName={""}
                tabContent={tabContent}
                panelContent={panelContent}
              ></ParallelTab> */}
              <div className="my-3">
                <div className="mb-2">
                  <ModalDialog
                    modalBtn={selectedFilter}
                    title="選擇檢視方式"
                    full={true}
                    isOpen={selectFilterIsOpen}
                    setIsOpen={setSelectFilterIsOpen}
                    content={selectedFilterContent}
                  ></ModalDialog>
                </div>
                <div>
                  <div
                    className={`${
                      selectedFilter === "依月分檢視" ? "blcok" : "hidden"
                    }`}
                  >
                    <YearAndMonthOrDayPicker
                      year={selectedYear}
                      setYear={setSelectedYear}
                      month={selectedMonth}
                      setMonth={setSelectedMonth}
                      onChange={filterDateChangeHandler}
                    ></YearAndMonthOrDayPicker>
                  </div>
                  <div
                    className={`${
                      selectedFilter === "依日期檢視" ? "blcok" : "hidden"
                    }`}
                  >
                    <YearAndMonthOrDayPicker
                      year={selectedYear}
                      setYear={setSelectedYear}
                      month={selectedMonth}
                      setMonth={setSelectedMonth}
                      haveDay={true}
                      day={selectedDay}
                      setDay={setSelectedDay}
                      onChange={filterDateChangeHandler}
                    ></YearAndMonthOrDayPicker>
                  </div>
                  {/* <div
                    className={`${
                      selectedFilter === "依帳簿檢視" ? "blcok" : "hidden"
                    }`}
                  >
                    3
                  </div> */}
                </div>
              </div>
            </div>
            <div className="max-h-[400px] grow overflow-auto pb-4">
              {Object.keys(allRecordSortByDate).length > 0 ? (
                Object.keys(allRecordSortByDate).map((date) => {
                  return (
                    <div key={`date+${date}`} className="bg-white">
                      <div className="text-lg font-bold  p-2">{date}</div>
                      {allRecordSortByDate[date].map((record) => {
                        const imgSrc = [
                          ...expenseMainCategory,
                          ...incomeMainCategory,
                          ...otherMainCategory,
                        ].find((el) => el.name === record.mainCategory)?.[
                          "icon"
                        ];
                        return (
                          <div key={record.recordId} className="mb-2">
                            <div
                              className="flex items-center justify-between cursor-pointer rounded-lg p-3"
                              onClick={() => {
                                setSelectRecordDetail(record);
                                setRecordDetailIsOpen(true);
                              }}
                            >
                              <div className="flex">
                                <div className="w-10 h-10 bg-light flex justify-center items-center rounded-full me-2">
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
                                <div className="flex flex-col">
                                  <div className="text-sm text-primary">
                                    {allAccountBookName[record.accountingBookId]
                                      ? allAccountBookName[
                                          record.accountingBookId
                                        ]
                                      : record.accountingBookId}
                                  </div>
                                  <div className="flex">
                                    <div>{record.subCategory}</div>
                                  </div>
                                </div>
                              </div>
                              <div>{record.amount}</div>
                            </div>
                            <div className="bg-light h-px w-full"></div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              ) : (
                <div className="text-center">該區間目前沒有消費紀錄</div>
              )}
            </div>
            <MessageModalDialog
              isOpen={recordDetailIsOpen}
              setIsOpen={setRecordDetailIsOpen}
              title="紀錄明細"
              content={recordDetailContent}
            ></MessageModalDialog>
            {/* <RecordCalendar
              selected={selectedDate}
              setSelected={setSelectedDate}
              recordedDate={recordedDate}
            ></RecordCalendar> */}
            {/* <div className="bg-light h-px w-full my-2"></div> */}
            <div></div>
          </div>
        </div>
      </div>
    </main>
  );
}
