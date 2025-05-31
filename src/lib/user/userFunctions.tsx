import { authSignUp } from "@/lib/firebase/firebaseAuth";
import { setUserData, getUserData } from "@/lib/firebase/firestore";

export async function userSignUp(
  name: string,
  email: string,
  password: string
) {
  try {
    // 在authentication上註冊
    const userData = await authSignUp(email, password);
    if (userData) {
      // 在firestore database裡儲存資料
      await setUserData(userData.uid, name, email);

      // 取得firestore database裡的資料，驗證資料已寫入
      const docData = await getUserData(userData.uid);
      return docData;
    }
  } catch (error) {
    console.log("userSignUp錯誤", error);
  }
}
