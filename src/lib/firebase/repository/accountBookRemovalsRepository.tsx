import {
  doc,
  collection,
  addDoc,
  updateDoc,
  query,
  onSnapshot,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase/firebaseConfig";
import { accountBookRemovalType } from "@/types/AccountingBookType";

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
