import {
  doc,
  collection,
  addDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  runTransaction,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase/firebaseConfig";
import {
  addAccountingBookInputType,
  AccountingBookType,
  AccountingRecordWithIdType,
  AccountingRecordType,
  AccountingRecordWithIdAndBookIdType,
} from "@/types/AccountingBookType";

export async function addAccountBook(
  addAccountingBookInput: addAccountingBookInputType
) {
  try {
    const docRef = await addDoc(collection(firestore, "accountingBooks"), {
      ...addAccountingBookInput,
      createTime: serverTimestamp(),
    });
    return docRef;
  } catch (error) {
    console.log("setAccountBook錯誤", error);
    throw error;
  }
}

export async function getAllAccountBook(
  uid: string
): Promise<AccountingBookType[]> {
  const docRef = collection(firestore, "accountingBooks");
  const accountBookQuery = query(
    docRef,
    where("bookOwnerUid", "==", uid),
    orderBy("createTime", "desc")
  );
  const result = await getDocs(accountBookQuery);
  return result.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<AccountingBookType, "id">),
    createTime:
      doc.data()?.createTime instanceof Timestamp
        ? doc.data()?.createTime.toDate()
        : doc.data()?.createTime instanceof Date
        ? doc.data()?.createTime
        : "",
  }));
}

export function watchAllAccountBook(
  uid: string,
  callbackFn: (books: AccountingBookType[]) => void
): () => void {
  const docRef = collection(firestore, "accountingBooks");
  const accountBookQuery = query(
    docRef,
    where("bookOwnerUid", "==", uid),
    orderBy("createTime", "desc")
  );

  const unsubscribe = onSnapshot(
    accountBookQuery,
    (querySnapshot) => {
      const books = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<AccountingBookType, "id">),
        createTime:
          doc.data()?.createTime instanceof Timestamp
            ? doc.data()?.createTime.toDate()
            : doc.data()?.createTime instanceof Date
            ? doc.data()?.createTime
            : "",
      }));
      callbackFn(books);
    },
    (error) => {
      console.log("Firestore 監聽錯誤：", error);
    }
  );

  return unsubscribe;
}

export async function delAllAccountBook(accountBookId: string) {
  try {
    const docRef = doc(firestore, "accountingBooks", accountBookId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.log("delAllAccountBook", error);
    return false;
  }
}

export async function updateAccountBookDisplayName(
  accountingBookId: string,
  uid: string,
  displayName: string
) {
  try {
    const ref = doc(firestore, "accountingBooks", accountingBookId);
    const snapshot = await getDoc(ref);
    const data = snapshot.data();
    const newDisplayNames = {
      ...data?.displayNames,
      [uid]: displayName,
    };
    await updateDoc(doc(firestore, "accountingBooks", accountingBookId), {
      displayNames: newDisplayNames,
    });
    return true;
  } catch (error) {
    if (error instanceof Error) {
      console.log("updateAccountBookDisplayName錯誤", error.message);
    } else {
      console.log("updateAccountBookDisplayName錯誤，非Error物件", error);
    }
    return false;
  }
}

export async function addAccountingRecord(
  accountBookId: string,
  accountingRecord: AccountingRecordType
) {
  try {
    const docRef = addDoc(
      collection(
        firestore,
        "accountingBooks",
        accountBookId,
        "accountingRecords"
      ),
      { ...accountingRecord }
    );
    return docRef;
  } catch (error) {
    console.log("addAccountingRecords錯誤", error);
    throw error;
  }
}

export async function getAccountingRecord(accountBookId: string) {
  const subCollectionRef = collection(
    firestore,
    "accountingBooks",
    accountBookId,
    "accountingRecords"
  );
  const q = query(subCollectionRef, orderBy("transactionDate", "desc"));
  try {
    const snapshot = await getDocs(q);
    const record: AccountingRecordWithIdType[] = snapshot.docs.map((doc) => {
      const data = doc.data() as AccountingRecordType;
      return {
        id: doc.id,
        ...data,
        transactionDate:
          data.transactionDate instanceof Timestamp
            ? data.transactionDate.toDate()
            : data.transactionDate instanceof Date
            ? data.transactionDate
            : null,
      };
    });
    return record;
  } catch (error) {
    console.log("getAccountingRecord", error);
  }
}

export async function getAllAccountingRecord(accountBookIdArr: string[]) {
  const recordRefs = accountBookIdArr.map((bookId) =>
    collection(firestore, "accountingBooks", bookId, "accountingRecords")
  );
  const recordSnapshots = await Promise.all(
    recordRefs.map((ref) => getDocs(ref))
  );
  const allRecord: AccountingRecordWithIdAndBookIdType[] = [];
  accountBookIdArr.forEach((bookId, index) => {
    const snapshot = recordSnapshots[index];
    snapshot.docs.forEach((doc) => {
      const data = doc.data() as Omit<AccountingRecordType, "id">;
      allRecord.push({
        accountingBookId: bookId,
        recordId: doc.id,
        ...data,
        transactionDate:
          data.transactionDate instanceof Timestamp
            ? data.transactionDate.toDate()
            : data.transactionDate instanceof Date
            ? data.transactionDate
            : null,
      });
    });
  });
  return allRecord;
}

export async function getAllMyAccountingRecord(
  accountBookIdArr: string[],
  uid: string
) {
  const recordQuerys = accountBookIdArr.map((bookId) =>
    query(
      collection(firestore, "accountingBooks", bookId, "accountingRecords"),
      where("recorderUid", "==", uid)
    )
  );
  const recordSnapshots = await Promise.all(
    recordQuerys.map((q) => getDocs(q))
  );
  const allRecord: AccountingRecordWithIdAndBookIdType[] = [];
  accountBookIdArr.forEach((bookId, index) => {
    const snapshot = recordSnapshots[index];
    snapshot.docs.forEach((doc) => {
      const data = doc.data() as Omit<AccountingRecordType, "id">;
      allRecord.push({
        accountingBookId: bookId,
        recordId: doc.id,
        ...data,
        transactionDate:
          data.transactionDate instanceof Timestamp
            ? data.transactionDate.toDate()
            : data.transactionDate instanceof Date
            ? data.transactionDate
            : null,
      });
    });
  });
  return allRecord;
}

export function watchAccountingRecord(
  accountBookId: string,
  callbackFn: (records: AccountingRecordWithIdType[]) => void
): () => void {
  const subCollectionRef = collection(
    firestore,
    "accountingBooks",
    accountBookId,
    "accountingRecords"
  );
  const q = query(subCollectionRef, orderBy("transactionDate", "desc"));
  const unsubscribe = onSnapshot(
    q,
    (recordSnapshot) => {
      const records = recordSnapshot.docs.map((doc) => {
        const data = doc.data() as AccountingRecordType;
        return {
          id: doc.id,
          ...data,
          transactionDate:
            data.transactionDate instanceof Timestamp
              ? data.transactionDate.toDate()
              : data.transactionDate instanceof Date
              ? data.transactionDate
              : null,
        };
      });
      callbackFn(records);
    },
    (error) => {
      console.log("watchAccountingRecord", error);
    }
  );

  return unsubscribe;
}

export async function delAccountingRecord(
  accountBookId: string,
  recordId: string
) {
  try {
    const docRef = doc(
      firestore,
      "accountingBooks",
      accountBookId,
      "accountingRecords",
      recordId
    );
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.log("delAccountingRecord", error);
    return false;
  }
}

export async function delAllAccountingRecord(accountingBookId: string) {
  try {
    const collectionRef = collection(
      firestore,
      "accountingBooks",
      accountingBookId,
      "accountingRecords"
    );
    const snaps = await getDocs(collectionRef);
    await runTransaction(firestore, async (transaction) => {
      snaps.docs.forEach((record) => {
        const docRef = doc(
          firestore,
          "accountingBooks",
          accountingBookId,
          "accountingRecords",
          record.id
        );
        transaction.delete(docRef);
      });
    });
    return true;
  } catch (error) {
    console.log("delAllAccountingRecord", error);
    return false;
  }
}

export function watchSelectedAccountingBook(
  accountBookId: string,
  callbackFn: (book: AccountingBookType) => void
) {
  try {
    const docRef = doc(firestore, "accountingBooks", accountBookId);
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        callbackFn({
          id: snap.id,
          ...(snap.data() as Omit<AccountingBookType, "id">),
        });
      }
    });
    return unsubscribe;
  } catch (error) {
    console.log("watchSelectedAccountingBook", error);
  }
}
