"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
// import { useRouter } from "next/router";

import IndexHeader from "@/components/IndexHeader";
import PageHeader from "@/components/PageHeader";
import ButtonMenu from "@/components/ButtonMenu";

import useAuth from "@/hooks/useAuth";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = usePathname();
  const userData = useAuth();
  const router = useRouter();
  useEffect(() => {
    const publicRouter = ["/", "/signIn", "/signUp"];

    console.log("MainLayout", userData);
    // console.log(userData.loading);
    // userData.loading須為false才驗證身分，Firebase 的 onAuthStateChanged() 是 非同步
    if (
      !userData.user &&
      !publicRouter.includes(path) &&
      userData.loading === false
    ) {
      // 未完成
      // alert("還沒登入或是登入驗證已過期");
      // router.push("/");
    }
  }, [userData, path, router]);

  return (
    <>
      {path === "/" || path === "/signIn" || path === "/signUp" ? (
        <>
          <IndexHeader></IndexHeader>
          {children}
        </>
      ) : (
        <div className="flex flex-col lg:flex-row-reverse">
          <div className="grow">
            <PageHeader></PageHeader>
            {children}
          </div>
          <ButtonMenu></ButtonMenu>
        </div>
      )}
    </>
  );
}
