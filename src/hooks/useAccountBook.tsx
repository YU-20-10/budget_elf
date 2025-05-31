import { AccountBookContext } from "@/context/AccountBookContext";
import { useContext } from "react";

export default function useAccountBook() {
  const data = useContext(AccountBookContext);
  if (!data) {
    throw new Error("需要在Provider內層執行");
  }
  return data;
}
