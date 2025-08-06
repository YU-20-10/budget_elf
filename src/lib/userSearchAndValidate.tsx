import { emailCheck } from "@/utils/inputCheck";
import { getUserDataByEmail } from "@/lib/firebase/repository/usersRepository";

export default async function userSearchAndValidate(
  type: "share" | "remove",
  userEmail: string | undefined | null,
  userInput: string | undefined
) {
  if (!userInput || userEmail === userInput) {
    if (type === "share") {
      return {
        ok: false,
        message: "請輸入要邀請共用的email",
      };
    } else {
      return {
        ok: false,
        message: "請輸入要解除共用的email",
      };
    }
  }
  const check = emailCheck(userInput);
  if (!check) {
    return {
      ok: false,
      message: "email格式錯誤",
    };
  }
  const otherUserData = await getUserDataByEmail(userInput);
  if (!otherUserData) {
    return {
      ok: false,
      message: "使用者email有誤，查無資料",
    };
  } else {
    return { ok: true, id: otherUserData.id };
  }
}
