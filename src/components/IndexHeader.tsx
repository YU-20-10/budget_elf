"use client";

import { useState, ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { userSignOut } from "@/lib/firebase/firebaseAuth";
import useAuth from "@/hooks/useAuth";
import MessageModalDialog from "@/components/Dialogs/MessageModalDialog";

export default function IndexHeader() {
  const userData = useAuth();
  const router = useRouter();
  const [alertMessageIsOpen, setAlertMessageIsOpen] = useState<boolean>(false);
  const [alertMessageContent, setAlertMessageContent] = useState<ReactNode>(
    <></>
  );
  async function signOutClickHandler() {
    try {
      await userSignOut();
      setAlertMessageContent(<p className="text-lg">登出成功</p>);
      setAlertMessageIsOpen(true);
      router.push("/");
    } catch (error) {
      setAlertMessageContent(<p className="text-lg">{`登出失敗,${error}`}</p>);
      setAlertMessageIsOpen(true);
    }
  }
  return (
    <header className="flex justify-center relative z-10 bg-[var(--color-background)]">
      <div className="container max-w-7xl py-3 px-4">
        <div className="flex justify-between items-center">
          <h1>
            <Link href="/" className="flex">
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
      <MessageModalDialog
        isOpen={alertMessageIsOpen}
        setIsOpen={setAlertMessageIsOpen}
        title=""
        content={
          <div className="min-h-25 flex justify-center items-center">
            {alertMessageContent}
          </div>
        }
        withConfirmBtn={true}
      ></MessageModalDialog>
    </header>
  );
}
