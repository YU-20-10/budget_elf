"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";


export default function PageHeader() {
  const path = usePathname();
  const [title, setTitle] = useState<string>("預設title");

  useEffect(() => {
    switch (path) {
      case "/summary":
        setTitle("收支總覽");
        break;
      case "/accountingBook":
        setTitle("帳簿管理");
        break;
      case "/record":
        setTitle("記帳");
        break;
      case "/setting":
        setTitle("設定");
    }
  }, [path]);

  return (
    <div className="sticky top-0 right-0 left-0 lg:static lg:left-auto flex justify-center pt-6 px-6 bg-white z-3">
      <div className="container max-w-7xl flex flex-col lg:flex-row lg:justify-end lg:items-center">
        <h2 className="grow text-center text-lg text-secondary font-bold text-xl">
          {title}
        </h2>
      </div>
    </div>
  );
}
