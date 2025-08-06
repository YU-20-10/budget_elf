import {
  doc,
  collection,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase/firebaseConfig";

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

export async function getUserData(uid: string) {
  const docRef = doc(firestore, "users", uid);
  let userData = null;
  try {
    const rowUserData = await getDoc(docRef);
    if (rowUserData.exists()) {
      userData = rowUserData.data();
    }
    return userData;
  } catch (error) {
    console.log("getUserData錯誤", error);
    throw error;
  }
}

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
