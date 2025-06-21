"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { emptyCheck, emailCheck, passwordCheck } from "@/lib/inputCheck";
import { authSignIn } from "@/lib/firebase/firebaseAuth";

type SignInInputData = {
  signInEmail: string;
  signInPassword: string;
};

export default function SignIn() {
  const [signInInputData, setSignUpInputData] = useState<SignInInputData>({
    signInEmail: "",
    signInPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState<Partial<SignInInputData>>(
    {}
  );
  const router = useRouter();

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

    if (name === "signInEmail" && !emailCheck(trimValue)) {
      error = "email格式錯誤";
    } else if (name === "signInPassword" && !passwordCheck(trimValue)) {
      error = "密碼為6~15個字元";
    }
    setErrorMessage((prev) => ({ ...prev, [name]: error }));
  }

  async function clickHandler() {
    if (errorMessage.signInEmail || errorMessage.signInPassword) {
      alert("請確認每個欄位是否都有填寫正確");
      return;
    }
    try {
      await authSignIn(
        signInInputData.signInEmail,
        signInInputData.signInPassword
      );
      alert("登入成功");
      router.push("/accountingBook");
    } catch (error) {
      alert(`登入失敗,${error}`);
    }
  }

  return (
    <main className="flex justify-center h-[calc(100vh-80px)] bg-primary overflow-hidden relative z-1">
      <div className="container max-w-7xl px-4 py-15">
        <h2 className="text-center mb-10 text-3xl">登入</h2>
        <div className="flex justify-center mb-4">
          <div className="max-w-3/4">
            <div className="flex flex-col items-start mb-2">
              <label htmlFor="signInEmail">email</label>
              <input
                type="text"
                name="signInEmail"
                id="signInEmail"
                placeholder="請輸入email"
                value={signInInputData.signInEmail}
                onChange={changeHandler}
                className={`block border rounded-lg p-2 bg-[var(--color-background)] focus:outline-focus-outline ${
                  errorMessage.signInEmail ? "border-red-600" : ""
                }`}
              />
              <p className="h-5 text-sm text-red-600">
                {errorMessage.signInEmail}
              </p>
            </div>
            <div className="flex flex-col items-start mb-2">
              <label htmlFor="ignInPassword">密碼</label>
              <input
                type="password"
                name="signInPassword"
                id="signInPassword"
                placeholder="請輸入密碼"
                value={signInInputData.signInPassword}
                onChange={changeHandler}
                className={`block border rounded-lg p-2 bg-[var(--color-background)] focus:outline-focus-outline ${
                  errorMessage.signInPassword ? "border-red-600" : ""
                }`}
              />
              <p className="h-5 text-sm text-red-600">
                {errorMessage.signInPassword}
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={clickHandler}
            className="border rounded-xl px-6 py-2 block cursor-pointer"
          >
            登入
          </button>
        </div>
        <div className="absolute bottom-[-380px] lg:bottom-[-250px]  left-[-150px] h-[500px] w-[500px] bg-[#6A717B] rounded-[50%] -z-1"></div>
        <div className="absolute top-[-310px] lg:top-[-200px] right-[-150px] h-[400px] w-[400px] bg-[#E0E3E8] rounded-[50%] -z-1"></div>
      </div>
    </main>
  );
}
