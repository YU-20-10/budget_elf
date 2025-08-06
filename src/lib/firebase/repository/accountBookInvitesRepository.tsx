import {
  doc,
  collection,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase/firebaseConfig";
import {
  accountBookInvitesType,
  AccountBookRuleMemberType,
  AccountBookRuleType,
} from "@/types/AccountingBookType";

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
        const docRef = doc(firestore, "accountBookInvites", invite.invitesId);
        transaction.delete(docRef);
      }
    });
    return true;
  } catch (error) {
    console.log("delAllAccountBookInvites", error);
    return false;
  }
}

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
