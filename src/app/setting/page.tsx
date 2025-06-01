"use client";

import useAuth from "@/hooks/useAuth";

export default function Setting() {
  const userData = useAuth();
  return (
    <main className="flex flex-col items-center p-6 lg:h-[calc(100vh-100px)] mb-25 lg:mb-0 overflow-hidden">
      <div className="container grow flex flex-col">
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-3">使用者資料</h2>
          <div>
            <p className="font-bold mb-2">使用者UID：</p>
            <p className="text-secondary">{userData?.user?.uid}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
