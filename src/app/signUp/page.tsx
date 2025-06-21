"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  emptyCheck,
  nameCheck,
  emailCheck,
  passwordCheck,
} from "@/lib/inputCheck";
// import { authSignUp } from "@/lib//firebase/firebaseAuth";
import { userSignUp } from "@/lib/user/userFunctions";
// import useAuth from "@/hooks/useAuth";


type SignUpInputData = {
  signUpUserName: string;
  signUpEmail: string;
  signUpPassword: string;
};

export default function SignUp() {
  const [signUpInputData, setSignUpInputData] = useState<SignUpInputData>({
    signUpUserName: "",
    signUpEmail: "",
    signUpPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState<Partial<SignUpInputData>>(
    {}
  );
  const router = useRouter();
  // const user = useAuth();

  function changeHandler(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    const trimValue = value.trim();
    setSignUpInputData((prev) => ({ ...prev, [name]: value }));
    let error = "";
    if (!emptyCheck(trimValue)) {
      error = "此欄位為必填欄位，不能為空";
      setErrorMessage((prev) => ({ ...prev, [name]: error }));
      return;
    }
    if (name === "signUpUserName" && !nameCheck(trimValue)) {
      error = "使用者名稱必須為2~8個字元";
    } else if (name === "signUpEmail" && !emailCheck(trimValue)) {
      error = "email格式錯誤";
    } else if (name === "signUpPassword" && !passwordCheck(trimValue)) {
      error = "密碼必須為6~15個字元";
    }
    setErrorMessage((prev) => ({ ...prev, [name]: error }));
  }

  // e:React.MouseEvent<HTMLButtonElement>
  async function clickHandler() {
    if (
      errorMessage.signUpUserName ||
      errorMessage.signUpEmail ||
      errorMessage.signUpPassword
    ) {
      alert("請確認每個欄位是否都有填寫正確");
      return;
    }
    try {

      const userDoc = await userSignUp(
        signUpInputData.signUpUserName,
        signUpInputData.signUpEmail,
        signUpInputData.signUpPassword
      );
      console.log(userDoc);
      if (userDoc) {
        alert("註冊成功");
        router.push("/accountingBook");
      } else {
        alert("註冊失敗");
      }
    } catch (error) {
      alert(`註冊失敗,${error}`);
    }
  }

  useEffect(() => {
    // console.log(signUpInputData);
  }, [signUpInputData]);

  return (
    <main className="flex justify-center h-[calc(100vh-80px)] bg-primary overflow-hidden relative z-1">
      <div className="container max-w-7xl px-4 py-15">
        <h2 className="text-center mb-10 text-3xl">註冊</h2>
        <div className="flex justify-center mb-4">
          <div className="max-w-3/4">
            <div className="flex flex-col items-start mb-2">
              <label htmlFor="signUpUserName">使用者名稱</label>
              <input
                type="text"
                name="signUpUserName"
                id="signUpUserName"
                placeholder="設定使用者名稱，2~8個字元"
                value={signUpInputData.signUpUserName}
                onChange={changeHandler}
                className={`block border rounded-lg p-2 bg-[var(--color-background)] focus:outline-focus-outline ${
                  errorMessage.signUpUserName ? "border-red-600" : ""
                }`}
              />
              <p className="h-5 text-sm text-red-600">
                {errorMessage.signUpUserName}
              </p>
            </div>
            <div className="flex flex-col items-start mb-2">
              <label htmlFor="signUpEmail">email</label>
              <input
                type="text"
                name="signUpEmail"
                id="signUpEmail"
                placeholder="設定登入email"
                value={signUpInputData.signUpEmail}
                onChange={changeHandler}
                className={`block border rounded-lg p-2 bg-[var(--color-background)] focus:outline-focus-outline ${
                  errorMessage.signUpEmail ? "border-red-600" : ""
                }`}
              />
              <p className="h-5 text-sm text-red-600">
                {errorMessage.signUpEmail}
              </p>
            </div>
            <div className="flex flex-col items-start">
              <label htmlFor="ignUpPassword">密碼</label>
              <input
                type="password"
                name="signUpPassword"
                id="signUpPassword"
                placeholder="設定密碼，6~15個字元"
                value={signUpInputData.signUpPassword}
                onChange={changeHandler}
                className={`block border rounded-lg p-2 bg-[var(--color-background)] focus:outline-focus-outline ${
                  errorMessage.signUpPassword ? "border-red-600" : ""
                }`}
              />
              <p className="h-5 text-sm text-red-600">
                {errorMessage.signUpPassword}
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <button
            type="button"
            className="border rounded-xl px-6 py-2 block cursor-pointer"
            onClick={clickHandler}
          >
            註冊
          </button>
        </div>
        <div className="absolute bottom-[-380px] lg:bottom-[-250px]  left-[-150px] h-[500px] w-[500px] bg-[#6A717B] rounded-[50%] -z-1"></div>
        <div className="absolute top-[-310px] lg:top-[-200px] right-[-150px] h-[400px] w-[400px] bg-[#E0E3E8] rounded-[50%] -z-1"></div>
      </div>
    </main>
  );
}
