"use client";
import { useState, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { emptyCheck, emailCheck, passwordCheck } from "@/utils/inputCheck";
import { authSignIn } from "@/lib/firebase/firebaseAuth";
import { AlertMessageDialogType, ComfirmDialogType } from "@/types/DialogType";
import ModalDialog from "@/components/Dialogs/ModalDialog";
import AlertMessageDialog from "@/components/Dialogs/AlertMessageDialog";
import ComfirmDialog from "@/components/Dialogs/ComfirmDialog";

type SignInInputData = {
  signInEmail: string;
  signInPassword: string;
};

export default function SignIn() {
  const router = useRouter();

  // --- useState ---

  // 元件控制用
  const [loginSelectIsOpen, setLoginSelectIsOpen] = useState<boolean>(false);
  const [alertDialog, setAlertDialog] = useState<AlertMessageDialogType>({
    alertIsOpen: false,
    content: <></>,
  });
  const [comfirmDialog, setComfirmDialog] = useState<
    ComfirmDialogType & { content: ReactNode }
  >({
    comfirmIsOpen: false,
    title: "",
    content: <></>,
    confirmBtnHandler: () => {},
  });

  // 畫面顯示用
  const [errorMessage, setErrorMessage] = useState<Partial<SignInInputData>>(
    {}
  );

  // 取得使用者互動資料用
  const [signInInputData, setSignInInputData] = useState<SignInInputData>({
    signInEmail: "test@test.com",
    signInPassword: "testtest",
  });
  const [selectedItem, setSelectedItem] = useState<string>("測試帳號一");

  // --- useState ---

  // --- function ---
  function inputCheck(name: string, value: string) {
    const trimValue = value.trim();
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
  function changeHandler(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setSignInInputData((prev) => ({ ...prev, [name]: value }));
  }

  function showMessageDialog(): Promise<void> {
    return new Promise((resolve) => {
      const loginInConfirmHandler = () => {
        console.log(123);
        setComfirmDialog((prev) => ({ ...prev, comfirmIsOpen: false }));
        resolve();
      };
      setComfirmDialog({
        comfirmIsOpen: true,
        title: "",
        content: <p className="text-lg">登入成功</p>,
        confirmBtnHandler: loginInConfirmHandler,
      });
    });
  }

  async function clickHandler() {
    if (errorMessage.signInEmail || errorMessage.signInPassword) {
      setAlertDialog({
        alertIsOpen: true,
        content: <p className="text-lg">請確認每個欄位是否都有填寫正確</p>,
      });
      return;
    }
    try {
      await authSignIn(
        signInInputData.signInEmail,
        signInInputData.signInPassword
      );
      await showMessageDialog();
      router.push("/accountingBook");
    } catch (error) {
      console.log("clickHandler", error);
      setAlertDialog({
        alertIsOpen: true,
        content: <p className="text-lg">登入失敗，請稍後再試一次</p>,
      });
    }
  }

  // --- function ---

  useEffect(() => {
    inputCheck("signInEmail", signInInputData.signInEmail);
  }, [signInInputData.signInEmail]);
  useEffect(() => {
    inputCheck("signInPassword", signInInputData.signInPassword);
  }, [signInInputData.signInPassword]);

  // --- template ---
  const loginSelectContent = (
    <>
      <ul>
        <li className="mb-3">
          <button
            type="button"
            className="w-full p-2 border rounded-lg cursor-pointer"
            onClick={() => {
              setSelectedItem("測試帳號一");
              setSignInInputData({
                signInEmail: "test@test.com",
                signInPassword: "testtest",
              });
              setLoginSelectIsOpen(false);
            }}
          >
            使用 <span className="font-bold">測試帳號一</span> 登入
          </button>
        </li>
        <li className="mb-3">
          <button
            type="button"
            className="w-full p-2 border rounded-lg cursor-pointer"
            onClick={() => {
              setSelectedItem("測試帳號二");
              setSignInInputData({
                signInEmail: "test2@test.com",
                signInPassword: "test1234",
              });
              setLoginSelectIsOpen(false);
            }}
          >
            使用 <span className="font-bold">測試帳號二</span> 登入
          </button>
        </li>
        <li>
          <button
            type="button"
            className="w-full p-2 border rounded-lg cursor-pointer"
            onClick={() => {
              setSelectedItem("已註冊帳號密碼");
              setSignInInputData({
                signInEmail: "",
                signInPassword: "",
              });
              setLoginSelectIsOpen(false);
            }}
          >
            使用 <span className="font-bold">已註冊帳密</span> 登入
          </button>
        </li>
      </ul>
    </>
  );
  // --- template ---

  return (
    <main className="flex justify-center h-[calc(100vh-80px)] bg-primary overflow-hidden relative z-1">
      <div className="container max-w-7xl px-4 py-15">
        <h2 className="text-center mb-10 text-3xl">登入</h2>
        <div className="flex justify-center mb-4">
          <div className="max-w-3/4">
            <div className="flex justify-center mb-3">
              <ModalDialog
                isOpen={loginSelectIsOpen}
                setIsOpen={setLoginSelectIsOpen}
                modalBtn={selectedItem}
                title="請選擇登入方式"
                full={true}
                btnStyle={`bg-white`}
                content={loginSelectContent}
              ></ModalDialog>
            </div>
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
      <ComfirmDialog
        comfirmIsOpen={comfirmDialog.comfirmIsOpen}
        title={comfirmDialog.title}
        confirmBtn={comfirmDialog.confirmBtn}
        confirmBtnHandler={comfirmDialog.confirmBtnHandler}
        dialogOnClose={() =>
          setComfirmDialog((prev) => ({
            ...prev,
            comfirmIsOpen: false,
          }))
        }
      >
        {comfirmDialog.content}
      </ComfirmDialog>
      <AlertMessageDialog
        dialogProps={alertDialog}
        dialogOnClose={() =>
          setAlertDialog((prev) => ({ ...prev, alertIsOpen: false }))
        }
      ></AlertMessageDialog>
    </main>
  );
}
