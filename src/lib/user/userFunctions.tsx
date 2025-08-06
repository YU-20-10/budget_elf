import { authSignUp } from "@/lib/firebase/firebaseAuth";
import {
  setUserData,
  getUserData,
} from "@/lib/firebase/repository/usersRepository";

export async function userSignUp(
  name: string,
  email: string,
  password: string
) {
  try {
    const userData = await authSignUp(email, password);
    if (userData) {
      await setUserData(userData.uid, name, email);

      const docData = await getUserData(userData.uid);
      return docData;
    }
  } catch (error) {
    console.log("userSignUp錯誤", error);
  }
}
