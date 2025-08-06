import {
  getDoc,
  DocumentReference,
  DocumentSnapshot,
} from "firebase/firestore";
import { FirebaseError } from "firebase/app";

export default async function getDocWithRetry(
  ref: DocumentReference,
  retry: number = 2,
  delay: number = 200
): Promise<DocumentSnapshot | null> {
  for (let i = 0; i <= retry; i++) {
    try {
      const snap = await getDoc(ref);
      if (snap.exists()) return snap;
      return null;
    } catch (err: unknown) {
      if (err instanceof FirebaseError) {
        if (err.code === "permission-denied") {
          await new Promise((res) => setTimeout(res, delay));
        } else {
          console.error("Firebase 錯誤：", err);
          break;
        }
      } else {
        console.error("非 Firebase 錯誤：", err);
        break;
      }
    }
  }
  return null;
}
