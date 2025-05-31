import Link from "next/link";
import Image from "next/image";

import { useRouter } from "next/navigation";
// import { useRouter } from "next/router";

import useAuth from "@/hooks/useAuth";
import { userSignOut } from "@/lib/firebase/firebaseAuth";

export default function IndexHeader() {
  const userData = useAuth();
  const router = useRouter();
  async function signOutClickHandler() {
    try {
      await userSignOut();
      alert("登出成功");
      router.push("/");
    } catch (error) {
      alert(`登出失敗,${error}`);
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
                <Link href="/record" className="block px-4 py-2 me-3">
                  記帳
                </Link>
              </li>
              <li>
                <button className="px-4 py-2 cursor-pointer" onClick={signOutClickHandler}>
                  登出
                </button>
              </li>
            </ul>
          ) : (
            <ul className="flex items-center">
              <li>
                <Link
                  href="/signIn"
                  className="block px-4 py-2 me-3"
                >
                  登入
                </Link>
              </li>
              <li>
                <Link href="/signUp" className="block px-4 py-2 rounded-xl text-white bg-secondary">
                  註冊
                </Link>
              </li>
            </ul>
          )}
        </div>
      </div>
    </header>
  );
}
