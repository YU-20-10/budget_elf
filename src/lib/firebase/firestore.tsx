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
  deleteDoc,
  // documentId,
  runTransaction,
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
  AccountingRecordWithIdAndBookIdType,
  accountBookRemovalType,
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

// 取得使用者資料by id
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

//取得使用者資料by email
export async function getUserDataByEmail(email: string) {
  try {
    const q = query(
      collection(firestore, "users"),
      where("email", "==", email)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return "";
    const rowUserData = snapshot.docs[0];
    return {
      id: rowUserData.id,
      ...rowUserData.data(),
    };
  } catch (error) {
    console.log("getUserDataByEmail錯誤", error);
    return "";
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

// 監聽所有帳簿+給context用的取消監聽
export function watchAllAccountBook(
  uid: string,
  // 此參數為callback function，會接收一個參數books，不會回傳任何東西
  callbackFn: (books: AccountingBookType[]) => void
  // () => void --> watchAllAccountBook的回傳值是一個函式，不帶參數也沒有回傳值的函式
): () => void {
  const docRef = collection(firestore, "accountingBooks");
  const accountBookQuery = query(
    docRef,
    where("bookOwnerUid", "==", uid),
    orderBy("createTime", "desc")
  );

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

// 刪除帳簿
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
export async function getAccountBookRule(accountBookId: string) {
  const docRef = doc(firestore, "accountBookRule", accountBookId);
  try {
    const ruleDoc = await getDoc(docRef);
    if (ruleDoc.exists()) {
      return ruleDoc.data() as AccountBookRuleType;
    } else {
      return false;
    }
  } catch (error) {
    console.log("getAccountBookRule", error);
    return false;
  }
}

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

// 更新帳簿規則-刪除帳簿共用人
export async function updateAccountBookRuleRemoveMember(
  accountBookRuleId: string,
  delBookMemberId: string
) {
  const docRef = doc(firestore, "accountBookRule", accountBookRuleId);

  try {
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error("帳簿ID錯誤或是沒有該帳簿");

    const bookMember = snap.data().bookMember as AccountBookRuleMemberType[];
    const editedBookMember = bookMember.filter(
      (member: AccountBookRuleMemberType) => member.uid !== delBookMemberId
    );
    await updateDoc(docRef, { bookMember: editedBookMember });
    return true;
  } catch (error) {
    console.log("updateAccountBookRuleRemoveMember", error);
    return false;
  }
}

// 刪除帳簿規則
export async function delAccountBookRule(accountBookRuleId: string) {
  try {
    const docRef = doc(firestore, "accountBookRule", accountBookRuleId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.log("delAccountBookRule", error);
    return false;
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

export async function getAccountBookInvites(
  accountingBookId: string,
  ownerUid: string,
  delMemberUid: string
) {
  try {
    const collectionRef = collection(firestore, "accountBookInvites");
    const q = query(
      collectionRef,
      where("accountingBookId", "==", accountingBookId),
      where("fromUid", "==", ownerUid),
      where("toUid", "==", delMemberUid)
    );
    const snaps = await getDocs(q);
    const invitesDataArr = snaps.docs.map((doc) => {
      return {
        invitesId: doc.id,
        ...(doc.data() as Omit<accountBookInvitesType, "invitesId">),
      };
    });
    return invitesDataArr;
  } catch (error) {
    console.log("getAccountBookInvites", error);
    return false;
  }
}

// 刪除單筆邀請資料
export async function delAccountBookInvites(invitesId: string) {
  try {
    const docRef = doc(firestore, "accountBookInvites", invitesId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.log("delAccountBookInvites", error);
    throw {
      invitesId,
      error,
    };
  }
}

// 刪除指定帳簿的所有邀請資料
export async function delAllAccountBookInvites(
  accountingBookId: string,
  ownerUid: string
) {
  try {
    let allSharedMember: AccountBookRuleMemberType[] = [];
    const rowRuleData = await getDoc(
      doc(firestore, "accountBookRule", accountingBookId)
    );
    if (rowRuleData.exists()) {
      const rule = rowRuleData.data() as AccountBookRuleType;
      allSharedMember = rule.bookMember.filter(
        (member) => member.uid !== rule.bookOwnerUid
      );
    }
    const rowAllInvites = await Promise.all(
      allSharedMember.map(async (memberObj) => {
        const collectionRef = collection(firestore, "accountBookInvites");
        const q = query(
          collectionRef,
          where("accountingBookId", "==", accountingBookId),
          where("fromUid", "==", ownerUid),
          where("toUid", "==", memberObj.uid)
        );
        const snaps = await getDocs(q);
        const invitesDataArr = snaps.docs.map((doc) => {
          return {
            invitesId: doc.id,
            ...(doc.data() as Omit<accountBookInvitesType, "invitesId">),
          };
        });
        return invitesDataArr as accountBookInvitesType[];
      })
    );
    const allInvites: accountBookInvitesType[] = rowAllInvites.flat();

    await runTransaction(firestore, async (transaction) => {
      for (const invite of allInvites) {
        const docRef = doc(
          firestore,
          "accountBookInvites",
          invite.invitesId
        );
        transaction.delete(docRef);
      }
    });
    return true;
  } catch (error) {
    console.log("delAllAccountBookInvites", error);
    return false;
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

export async function delUserAbleAccountBook(
  uid: string,
  accountingBookId: string
) {
  const docRef = doc(
    firestore,
    "userAbleAccountBooks",
    uid,
    "ableAccountBooks",
    accountingBookId
  );
  try {
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.log("delUserAbleAccountBook", error);
    return false;
  }
}

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
          // console.log(`權限錯誤，第${i + 1}次重試...`);
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
  const allAbleBook = ableBookSnapShots
    .filter(
      (docSnap): docSnap is DocumentSnapshot =>
        docSnap !== null && docSnap.exists()
    )
    .map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<AccountingBookType, "id">),
      createTime:
        docSnap.data()?.createTime instanceof Timestamp
          ? docSnap.data()?.createTime.toDate()
          : docSnap.data()?.createTime instanceof Date
          ? docSnap.data()?.createTime
          : null,
    }))
    .sort((a, b) => {
      if (!a.createTime) return 1;
      if (!b.createTime) return -1;
      return b.createTime.getTime() - a.createTime.getTime(); // 由新到舊排序
    });
  return allAbleBook;
}

// 監聽可共用帳簿是否更新，如果更新返回新的資料
export function watchUserAbleAccountBook(
  uid: string,
  // callbackFn: (ableAccountBooks: AccountingBookType[]) => void
  callbackFn: (ableAccountBookIdArr: UserAbleAccountBookType[]) => void
): () => void {
  const ableBookRef = collection(
    firestore,
    "userAbleAccountBooks",
    uid,
    "ableAccountBooks"
  );
  const unsubscribe = onSnapshot(ableBookRef, async (snapshot) => {
    const ableBookIdArr = snapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...(doc.data() as Omit<UserAbleAccountBookType, "id">),
        createTime:
          doc.data()?.createTime instanceof Timestamp
            ? doc.data()?.createTime.toDate()
            : doc.data()?.createTime instanceof Date
            ? doc.data()?.createTime
            : "",
      };
    });
    if (ableBookIdArr.length < 0) {
      callbackFn([]);
    } else {
      callbackFn(ableBookIdArr);
    }
  });

  return unsubscribe;
}

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

// 取得所有記帳資料包含自己的以及被共用的
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

// 移除單筆記帳紀錄
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

// 移除所有記帳紀錄
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

// 移除共用者請求 (要確認傳入值)
export async function addAccountBookRemoval(
  uid: string,
  RemoveUid: string,
  accountingBookId: string,
  accountingBookName: string
) {
  try {
    const docRef = collection(firestore, "accountBookRemovals");
    const data = await addDoc(docRef, {
      fromUid: uid,
      toUid: RemoveUid,
      accountingBookId: accountingBookId,
      status: "pending",
      accountingBookName: accountingBookName,
      createTime: serverTimestamp(),
    });
    return data;
  } catch (error) {
    console.log("addAccountBookRemoval", error);
    return false;
  }
}

// 變更移除共用者請求
export async function updateAccountBookRemoval(
  removeId: string,
  status: string
) {
  const docRef = doc(firestore, "accountBookRemovals", removeId);
  try {
    await updateDoc(docRef, {
      status,
    });
  } catch (error) {
    console.log("updateAccountBookRemoval", { removeId, status, error });
  }
}

// 監聽移除共用者請求
export function watchAccountBookRemoval(
  uid: string,
  callbackFn: (removeArr: accountBookRemovalType[]) => void
) {
  const ref = collection(firestore, "accountBookRemovals");
  const q = query(
    ref,
    where("toUid", "==", uid),
    where("status", "==", "pending")
  );
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const removeArr = snapshot.docs.map((doc) => {
      return {
        removeId: doc.id,
        ...(doc.data() as Omit<accountBookRemovalType, "removeId">),
      };
    });
    callbackFn(removeArr);
  });
  return unsubscribe;
}

// 監聽所選的帳簿
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

// 刪除指定帳簿的所有邀請資料並發送刪除請求
export async function delAllAccountBookInvitesAndAddRemoveal(
  accountingBookId: string,
  ownerUid: string
) {
  try {
    let allSharedMember: AccountBookRuleMemberType[] = [];
    const rowRuleData = await getDoc(
      doc(firestore, "accountBookRule", accountingBookId)
    );
    if (rowRuleData.exists()) {
      const rule = rowRuleData.data() as AccountBookRuleType;
      allSharedMember = rule.bookMember.filter(
        (member) => member.uid !== rule.bookOwnerUid
      );
    }
    const rowAllInvites = await Promise.all(
      allSharedMember.map(async (memberObj) => {
        const collectionRef = collection(firestore, "accountBookInvites");
        const q = query(
          collectionRef,
          where("accountingBookId", "==", accountingBookId),
          where("fromUid", "==", ownerUid),
          where("toUid", "==", memberObj.uid)
        );
        const snaps = await getDocs(q);
        const invitesDataArr = snaps.docs.map((doc) => {
          return {
            invitesId: doc.id,
            ...(doc.data() as Omit<accountBookInvitesType, "invitesId">),
          };
        });
        return invitesDataArr as accountBookInvitesType[];
      })
    );
    const allInvites: accountBookInvitesType[] = rowAllInvites.flat();

    await runTransaction(firestore, async (transaction) => {
      for (const invite of allInvites) {
        const docRef = doc(
          firestore,
          "accountBookInvites",
          invite.invitesId
        );
        transaction.delete(docRef);
      }

      for (const memberObj of allSharedMember) {
        const docRef = doc(collection(firestore, "accountBookRemovals"));
        transaction.set(docRef, {
          fromUid: ownerUid,
          toUid: memberObj.uid,
          accountingBookId: accountingBookId,
          status: "pending",
          accountingBookName: accountingBookId,
          createTime: serverTimestamp(),
        });
      }
    });
    return true;
  } catch (error) {
    console.log("delAllAccountBookInvites", error);
    return false;
  }
}
