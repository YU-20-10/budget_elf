import {
  doc,
  collection,
  getDoc,
  getDocs,
  query,
  where,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase/firebaseConfig";
import {
  AccountBookRuleMemberType,
  AccountBookRuleType,
  accountBookInvitesType,
} from "@/types/AccountingBookType";

export async function delAllAccountBookInvitesAndAddRemoveal(
  accountingBookId: string,
  accountingBookName: string,
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

      for (const memberObj of allSharedMember) {
        const docRef = doc(collection(firestore, "accountBookRemovals"));
        transaction.set(docRef, {
          fromUid: ownerUid,
          toUid: memberObj.uid,
          accountingBookId: accountingBookId,
          status: "pending",
          accountingBookName: accountingBookName,
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
