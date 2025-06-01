import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  onSnapshot,
  Timestamp,
  orderBy,
  updateDoc,
  arrayUnion,
  DocumentReference,
  DocumentSnapshot,
  // documentId,
  // runTransaction,
} from "firebase/firestore";

import { firestore } from "@/lib/firebase/firebaseConfig";
import {
  AccountingBookType,
  addAccountingBookInputType,
  AccountingRecordType,
  AccountingRecordWithIdType,
  AccountBookRuleType,
  AccountBookRuleMemberType,
  UserAbleAccountBookType,
  accountBookInvitesType,
} from "@/types/AccountingBookType";
import { FirebaseError } from "firebase/app";

// 分割陣列為小陣列
// function chunkArr<T>(array: T[], size: number) {
//   const result: T[][] = [];
//   for (let i = 0; i < array.length; i += size) {
//     result.push(array.slice(i, i + size));
//   }
//   return result;
// }

// 新增使用者資料
export async function setUserData(uid: string, name: string, email: string) {
  const docRef = doc(firestore, "users", uid);
  try {
    await setDoc(docRef, {
      name,
      email,
      createTime: new Date(),
    });
  } catch (error) {
    console.log("setUserData錯誤", error);
    throw error;
  }
}

// 取得使用者資料
export async function getUserData(uid: string) {
  const docRef = doc(firestore, "users", uid);
  let userData = null;
  try {
    const rowUserData = await getDoc(docRef);
    // .exists()為firebase提供的方法，確認讀取到的文件是否存在
    if (rowUserData.exists()) {
      userData = rowUserData.data();
    }
    return userData;
  } catch (error) {
    console.log("getUserData錯誤", error);
    throw error;
  }
}

// 新增帳簿
export async function addAccountBook(
  addAccountingBookInput: addAccountingBookInputType
) {
  try {
    const docRef = await addDoc(collection(firestore, "accountingBooks"), {
      ...addAccountingBookInput,
      createTime: serverTimestamp(),
    });
    // userDefinedCategory 子集合
    //  {
    //     mainCategory: [],
    //     subCategory: [],
    //   },
    // accountingRecords 子集合
    // userDefinedCreditCardRules 子集合
    console.log(docRef);
    return docRef;
  } catch (error) {
    console.log("setAccountBook錯誤", error);
    throw error;
  }
}

// 取得使用者所有帳簿資訊
export async function getAllAccountBook(
  uid: string
): Promise<AccountingBookType[]> {
  const docRef = collection(firestore, "accountingBooks");
  const accountBookQuery = query(docRef, where("bookOwnerUid", "==", uid));
  const result = await getDocs(accountBookQuery);
  return result.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<AccountingBookType, "id">),
  }));
}

// 監聽所有帳簿+給context用的取消監聽
export function watchAllAccountBook(
  uid: string,
  // 此參數為callback function，會接收一個參數books，不會回傳任何東西
  callbackFn: (books: AccountingBookType[]) => void
  // () => void --> watchAllAccountBook的回傳值是一個函式，不帶參數也沒有回傳值的函式
): () => void {
  const docRef = collection(firestore, "accountingBooks");
  const accountBookQuery = query(docRef, where("bookOwnerUid", "==", uid));

  // onSnapshot() 會回傳一個取消監聽的函式
  // onSnapshot()可以監聽整個collection或是一個查詢結果
  // 監聽collection：onSnapshot(collectionRef, callback)
  // 監聽查詢結果onSnapshot(query, callback)
  const unsubscribe = onSnapshot(
    accountBookQuery,
    (querySnapshot) => {
      const books = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<AccountingBookType, "id">),
      }));
      callbackFn(books);
    },
    (error) => {
      console.log("Firestore 監聽錯誤：", error);
    }
  );

  return unsubscribe;
}

// 更新帳簿設定(帳簿名稱、帳簿描述、自訂義分類)
export async function updateAccountBook() {}

// 更新帳簿設定(帳簿內顯示名稱)
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

// 新增帳簿規則
export async function setAccountBookRule(
  accountBookId: string,
  accountBookRule: AccountBookRuleType
) {
  try {
    const docRef = setDoc(
      doc(firestore, "accountBookRule", accountBookId),
      accountBookRule
    );
    return docRef;
  } catch (error) {
    console.log("setAccountBookRule錯誤", error);
    throw error;
  }
}

// 取得指定帳簿的規則

// 更新帳簿規則-新增帳簿共用人
export async function updateAccountBookRuleAddBookMember(
  accountBookRuleId: string,
  bookMemberData: AccountBookRuleMemberType
) {
  const docRef = doc(firestore, "accountBookRule", accountBookRuleId);
  try {
    await updateDoc(docRef, { bookMember: arrayUnion(bookMemberData) });
    return true;
  } catch (error) {
    console.log("updateccountBookRuleAddBookMember錯誤", error);
  }
}

// 新增帳簿共用請求
export async function addAccountBookInvites(
  uid: string,
  InviteUid: string,
  accountingBookId: string,
  accountingBookName: string
) {
  const collectionRef = collection(firestore, "accountBookInvites");
  try {
    const result = await addDoc(collectionRef, {
      fromUid: uid,
      toUid: InviteUid,
      accountingBookId: accountingBookId,
      status: "pending",
      accountingBookName: accountingBookName,
      createTime: serverTimestamp(),
    });
    return result;
  } catch (error) {
    console.log("addAccountBookInvites錯誤", error);
  }
}

// 更新帳簿共用請求
export async function updateAccountBookInvites(
  invitesId: string,
  status: string
) {
  try {
    await updateDoc(doc(firestore, "accountBookInvites", invitesId), {
      status: status,
    });
  } catch (error) {
    console.log("updateAccountBookInvites錯誤", error);
  }
}

// 監聽帳簿共用請求
export function watchAccountBookInvites(
  uid: string,
  callbackFn: (InvitesArr: accountBookInvitesType[]) => void
) {
  const q = query(
    collection(firestore, "accountBookInvites"),
    where("toUid", "==", uid),
    where("status", "==", "pending")
  );
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const invitesArr = snapshot.docs.map((doc) => {
      return {
        invitesId: doc.id,
        ...(doc.data() as Omit<accountBookInvitesType, "invitesId">),
      };
    });
    callbackFn(invitesArr);
  });
  return unsubscribe;
}

// 新增共用帳簿資料至可讀取帳簿
export async function setUserAbleAccountBook(
  accountingBookId: string,
  uid: string
) {
  try {
    const docRef = doc(
      firestore,
      "userAbleAccountBooks",
      uid,
      "ableAccountBooks",
      accountingBookId
    );
    await setDoc(docRef, {
      accountingBookId: accountingBookId,
    });
    return true;
  } catch (error) {
    console.log("setUserAbleAccountBook錯誤", error);
    return false;
  }
}

// 新增共用帳簿資料至可讀取帳簿+更新帳簿內名稱->因為有依賴關係
// export async function setUserAbleAccountBookandUpdateThisName(
//   accountingBookId: string,
//   uid: string,
//   displayName: string
// ) {
//   try {
//     await runTransaction(firestore, async (transaction) => {
//       // 讀取當前able account book的資料
//       const accountingBookRef = doc(
//         firestore,
//         "accountingBooks",
//         accountingBookId
//       );
//       const snapshot = await transaction.get(accountingBookRef);
//       const accountingBookData = snapshot.data();

//       // 新增到able account book
//       const userAbleAccountBookRef = doc(
//         firestore,
//         "userAbleAccountBooks",
//         uid,
//         "ableAccountBooks",
//         accountingBookId
//       );
//       transaction.set(userAbleAccountBookRef, {
//         accountingBookId: accountingBookId,
//       });

//       // 更新displayName
//       transaction.update(accountingBookRef, {
//         displayNames: {
//           ...accountingBookData?.displayNames,
//           [uid]: displayName,
//         },
//       });
//     });
//     return true;
//   } catch (error) {
//     console.log("setUserAbleAccountBook錯誤", error);
//   }
// }
// match /userAbleAccountBooks/{userId}/ableAccountBooks/{bookId} {
//   allow read, write: if request.auth != null && request.auth.uid == userId;
// }
// match /accountBookInvites/{inviteId} {
//   allow create: if request.auth != null; // 任何登入者可建立邀請
//   allow read, update: if request.auth != null && (
//     request.auth.uid == resource.data.toUid || // 被邀請人可讀與接受/拒絕
//     request.auth.uid == resource.data.fromUid   // 邀請人可查看
//   );
// }

// 取得被共用的可讀取帳簿的id及暱稱物件的陣列
export async function getUserAbleAccountBookIdArr(uid: string) {
  const bookRef = collection(
    firestore,
    "userAbleAccountBooks",
    uid,
    "ableAccountBooks"
  );
  const ableAccountBookSnapShot = await getDocs(bookRef);
  const allAbleAccountBookArr = ableAccountBookSnapShot.docs.map(
    (doc) => doc.data() as UserAbleAccountBookType
  );
  return allAbleAccountBookArr;
}

// 若遇到資料建立時間差導致無法取得資料，進行retry，至多2次
async function getDocWithRetry(
  ref: DocumentReference,
  retry: number = 2,
  delay: number = 200
): Promise<DocumentSnapshot | null> {
  for (let i = 0; i <= retry; i++) {
    try {
      const snap = await getDoc(ref);
      if (snap.exists()) return snap;
      return null; // 不存在的資料不 retry
    } catch (err: unknown) {
      if (err instanceof FirebaseError) {
        if (err.code === "permission-denied") {
          console.log(`權限錯誤，第${i + 1}次重試...`);
          await new Promise((res) => setTimeout(res, delay));
        } else {
          console.error("Firebase 錯誤：", err);
          break; // 不是權限問題就不要 retry
        }
      } else {
        console.error("非 Firebase 錯誤：", err);
        break;
      }
    }
  }
  return null;
}

// 取得被共用的可讀取帳簿
export async function getUserAbleAccountBook(
  ableBookArr: UserAbleAccountBookType[]
) {
  const ableBookRefs = ableBookArr.map((ableBook) =>
    doc(firestore, "accountingBooks", ableBook.accountingBookId)
  );
  const ableBookSnapShots = await Promise.all(
    // ableBookRefs.map((ref) => getDoc(ref))
    ableBookRefs.map((ref) => getDocWithRetry(ref))
  );
  // const allAbleBook = ableBookSnapShots
  //   .filter((docSnap) => docSnap.exists)
  //   .map((docSnap) => ({
  //     id: docSnap.id,
  //     ...(docSnap.data() as Omit<AccountingBookType, "id">),
  //   }));
  const allAbleBook = ableBookSnapShots
    .filter(
      (docSnap): docSnap is DocumentSnapshot =>
        docSnap !== null && docSnap.exists()
    )
    .map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<AccountingBookType, "id">),
    }));
  return allAbleBook;
}

// 監聽可共用帳簿是否更新，如果更新返回新的資料
export function watchUserAbleAccountBook(
  uid: string,
  // callbackFn: (ableAccountBooks: AccountingBookType[]) => void
  callbackFn: (ableAccountBookIdArr: UserAbleAccountBookType[]) => void
) {
  const ableBookRef = collection(
    firestore,
    "userAbleAccountBooks",
    uid,
    "ableAccountBooks"
  );
  const unsubscribe = onSnapshot(ableBookRef, async (snapshot) => {
    const ableBookIdArr = snapshot.docs.map(
      (doc) => doc.data() as UserAbleAccountBookType
    );
    if (ableBookIdArr.length < 0) {
      callbackFn([]);
    } else {
      callbackFn(ableBookIdArr);
    }
    // if (ableBookIdArr.length < 0) {
    //   callbackFn([]);
    //   return;
    // }
    // console.log(ableBookIdArr);
    // Firestore 限制 where(..., "in", [...])最多只能10筆
    // const newAbleBookArr = chunkArr(ableBookIdArr, 10);
    // const allAbleBook: AccountingBookType[] = [];
    // for (const bookArr of newAbleBookArr) {
    //   const q = query(
    //     collection(firestore, "accountingBooks"),
    //     where(documentId(), "in", bookArr)
    //   );
    //   const snap = await getDocs(q);
    //   snap.forEach((doc) => {
    //     allAbleBook.push({
    //       id: doc.id,
    //       ...(doc.data() as Omit<AccountingBookType, "id">),
    //     });
    //   });
    // }
    // console.log(allAbleBook);
    // callbackFn(allAbleBook);
  });

  return unsubscribe;
}

// 監聽被共用的帳簿的記帳資料---已寫入監聽當前記帳資料

// 新增記帳紀錄
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

// 取得單一帳簿的記帳資料
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
        // 確認取得的是Timestamp(Firebase的物件不是JS的)還是Date(JS物件)
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

// 監聽帳簿資料是否更新，如果更新返回新的資料
export function watchAccountingRecord(
  accountBookId: string,
  callbackFn: (records: AccountingRecordWithIdType[]) => void
): () => void {
  // 設定子集合路徑
  const subCollectionRef = collection(
    firestore,
    "accountingBooks",
    accountBookId,
    "accountingRecords"
  );
  const q = query(subCollectionRef, orderBy("transactionDate", "desc"));
  // onSnapshot(query,snapshotFn,errorFn)
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
          // transactionDate:
          //   data.transactionDate instanceof Date
          //     ? data.transactionDate
          //     : data.transactionDate.toDate(),
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
