"use client";

import { createContext, useState, useEffect, ReactNode, useRef } from "react";

import {
  getAllAccountBook,
  watchAllAccountBook,
  getUserAbleAccountBookIdArr,
  getUserAbleAccountBook,
  watchUserAbleAccountBook,
  watchSelectedAccountingBook,
} from "@/lib/firebase/firestore";
import useAuth from "@/hooks/useAuth";
import {
  AccountingBookType,
  AccountBookContextType,
  AccountingRecordWithIdType,
} from "@/types/AccountingBookType";
// import { useRouter } from "next/navigation";

export const AccountBookContext = createContext<
  AccountBookContextType | undefined
>(undefined);

export function AccountBookProvider({ children }: { children: ReactNode }) {
  // const router = useRouter();
  const { user, loading: authLoading, invitesData } = useAuth();
  // 帳簿
  const [ownAccountBook, setOwnAccountBook] = useState<AccountingBookType[]>(
    []
  );
  const [sharedAccountBook, setSharedAccountBook] = useState<
    AccountingBookType[]
  >([]);
  const [allAccountBook, setAllAccountBook] = useState<AccountingBookType[]>(
    []
  );
  const accountBookRef = useRef<AccountingBookType[] | null>(null);
  const ableAccountBookRef = useRef<AccountingBookType[] | null>(null);
  const [selectedAccountingBook, setSelectedAccountingBook] = useState<
    AccountingBookType | undefined
  >(undefined);
  // 記帳資料
  const [selectedBookRecord, setSelectedBookRecord] = useState<
    AccountingRecordWithIdType[] | undefined
  >(undefined);
  useEffect(() => {
    if (!user?.uid || authLoading) return;

    const id = user?.uid;
    let unsubscribe: () => void;

    if (accountBookRef.current !== null) {
      setOwnAccountBook(accountBookRef.current);
    } else {
      // 取得一次資料
      (async () => {
        try {
          if (id) {
            const allAccountBook = await getAllAccountBook(id);
            accountBookRef.current = allAccountBook;
            setOwnAccountBook(allAccountBook);
          }
        } catch (error) {
          console.log("遠端取資料失敗", error);
        }
      })();
    }

    // 啟動監聽
    if (id) {
      unsubscribe = watchAllAccountBook(id, (books) => {
        accountBookRef.current = books;
        setOwnAccountBook(books);
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, authLoading]);
  useEffect(() => {
    const id = user?.uid;
    let unsubscribe: () => void;
    if (id) {
      if (ableAccountBookRef.current !== null) {
        setSharedAccountBook(ableAccountBookRef.current);
      } else {
        (async () => {
          const allAbleAccountBookArr = await getUserAbleAccountBookIdArr(id);
          const ableAccountBooks = await getUserAbleAccountBook(
            allAbleAccountBookArr
          );
          ableAccountBookRef.current = ableAccountBooks;
          setSharedAccountBook(ableAccountBooks);
          // console.log(ableAccountBooks);
        })();
      }
      unsubscribe = watchUserAbleAccountBook(
        id,
        async (ableAccountBookIdArr) => {
          const allableAccountBooks = await getUserAbleAccountBook(
            ableAccountBookIdArr
          );
          ableAccountBookRef.current = allableAccountBooks;
          setSharedAccountBook(allableAccountBooks);
        }
      );
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user?.uid, invitesData]);
  useEffect(() => {
    setAllAccountBook([...ownAccountBook, ...sharedAccountBook]);
  }, [ownAccountBook, sharedAccountBook]);
  useEffect(() => {
    if (!selectedAccountingBook) return;

    const unsubscribe = watchSelectedAccountingBook(
      selectedAccountingBook.id,
      (book) => {
        if (JSON.stringify(book) !== JSON.stringify(selectedAccountingBook)) {
          setSelectedAccountingBook(book);
        }
      }
    );

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [selectedAccountingBook]);
  return (
    <AccountBookContext.Provider
      value={{
        allAccountBook,
        selectedAccountingBook,
        setSelectedAccountingBook,
        selectedBookRecord,
        setSelectedBookRecord,
      }}
    >
      {children}
    </AccountBookContext.Provider>
  );
}
