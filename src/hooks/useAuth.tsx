import { useContext } from "react";

import { AuthContext } from "@/context/AuthContext";

export default function useAuth() {
  // 取得userData
  const context = useContext(AuthContext);
  // console.log("useAuth", context);
  if (!context) {
    throw new Error("authCheck需要在AuthProvider內層執行");
  }
  return context;
}
