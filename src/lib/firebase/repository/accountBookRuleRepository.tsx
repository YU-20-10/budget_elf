import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase/firebaseConfig";
import {
  AccountBookRuleType,
  AccountBookRuleMemberType,
} from "@/types/AccountingBookType";

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
