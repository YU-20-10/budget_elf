import {
  doc,
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  DocumentSnapshot,
  Timestamp,
  onSnapshot,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase/firebaseConfig";
import {
  UserAbleAccountBookType,
  AccountingBookType,
} from "@/types/AccountingBookType";
import getDocWithRetry from "@/lib/firebase/autoRetry";

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

export async function getUserAbleAccountBook(
  ableBookArr: UserAbleAccountBookType[]
) {
  const ableBookRefs = ableBookArr.map((ableBook) =>
    doc(firestore, "accountingBooks", ableBook.accountingBookId)
  );
  const ableBookSnapShots = await Promise.all(
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
      return b.createTime.getTime() - a.createTime.getTime();
    });
  return allAbleBook;
}

export function watchUserAbleAccountBook(
  uid: string,
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
