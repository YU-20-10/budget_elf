"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { userSignOut } from "@/lib/firebase/firebaseAuth";
import useAuth from "@/hooks/useAuth";
import AlertMessageDialog from "@/components/Dialogs/AlertMessageDialog";
import { AlertMessageDialogType } from "@/types/DialogType";

export default function IndexHeader() {
  const userData = useAuth();
  const router = useRouter();
  const [alertDialog, setAlertDialog] = useState<AlertMessageDialogType>({
    alertIsOpen: false,
    content: <></>,
  });

  async function signOutClickHandler() {
    try {
      await userSignOut();
      setAlertDialog({
        alertIsOpen: true,
        content: <p className="text-lg">登出成功</p>,
      });
      router.push("/");
    } catch (error) {
      console.log("signOutClickHandler", error);
      setAlertDialog({
        alertIsOpen: true,
        content: <p className="text-lg">登出失敗，請稍後再試一次</p>,
      });
    }
  }
  return (
    <header className="flex justify-center relative z-10 bg-[var(--color-background)]">
      <div className="container max-w-7xl py-3 px-4">
        <div className="flex justify-between items-center">
          <h1>
            <Link href="/" className="flex bg-white px-1 rounded-md">
              <Image
                src="/budget_elf_logo_withtext.svg"
                alt="Budget Elf logo"
                width="180"
                height="30"
              ></Image>
            </Link>
          </h1>
          {userData.user ? (
            <ul className="flex items-center">
              <li>
                <Link href="/accountingBook" className="block px-4 py-2 me-3">
                  帳簿
                </Link>
              </li>
              <li>
                <button
                  className="px-4 py-2 cursor-pointer"
                  onClick={signOutClickHandler}
                >
                  登出
                </button>
              </li>
            </ul>
          ) : (
            <ul className="flex items-center">
              <li>
                <Link
                  href="/signIn"
                  className="block px-4 py-2 me-3 rounded-xl hover:bg-primary hover:text-white hover:font-bold"
                >
                  登入
                </Link>
              </li>
              <li>
                <Link
                  href="/signUp"
                  className="block px-4 py-2 rounded-xl text-white bg-secondary hover:bg-primary hover:font-bold"
                >
                  註冊
                </Link>
              </li>
            </ul>
          )}
        </div>
      </div>
      <AlertMessageDialog
        dialogProps={alertDialog}
        dialogOnClose={() =>
          setAlertDialog((prev) => ({ ...prev, alertIsOpen: false }))
        }
      ></AlertMessageDialog>
    </header>
  );
}
