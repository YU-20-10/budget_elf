import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function BottonMenu() {
  const path = usePathname();
  return (
    <div className="fixed lg:sticky bottom-0 right-0 left-0 lg:right-auto lg:top-0 bg-primary z-3">
      <div className="lg:min-h-screen lg:h-full">
        <div className="flex lg:flex-col w-full h-full">
          <ul className="flex justify-around items-center lg:items-start lg:flex-col h-full w-full">
            <li className="lg:px-6">
              <h1 className="flex items-center">
                <Link
                  href="/"
                  className="p-3 lg:px-0 lg:py-6 flex flex-col items-center"
                >
                  <Image
                    src="/budget_elf_logo_withtext.svg"
                    alt="budget_elf_logo"
                    className="hidden lg:block"
                    width={180}
                    height={30}
                  ></Image>
                  <Image
                    src="/budget_elf_logo_5.svg"
                    alt="budget_elf_logo_sm"
                    className="lg:hidden"
                    width={48}
                    height={48}
                  ></Image>
                  <span className="text-xs lg:hidden py-1">首頁</span>
                </Link>
              </h1>
            </li>
            <li
              className={`lg:px-6 lg:w-full ${
                path === "/summary"
                  ? "bg-secondary text-white border-y-5 lg:border-y-0 lg:border-s-10 border-white"
                  : ""
              }`}
            >
              <Link
                href="/summary"
                className="flex flex-col lg:flex-row items-center p-3 lg:py-4 cursor-pointer"
              >
                <i className="bi bi-clipboard-data text-4xl lg:text-2xl lg:me-4"></i>
                <span className="text-xs lg:text-base py-1">收支總覽</span>
              </Link>
            </li>
            <li
              className={`lg:px-6 lg:w-full ${
                path === "/accountingBook" || path === "/record"
                  ? "bg-secondary text-white border-y-5 lg:border-y-0 lg:border-s-10 border-white"
                  : ""
              }`}
            >
              <Link
                href="/accountingBook"
                className="flex flex-col lg:flex-row  items-center p-3 lg:py-4 cursor-pointer"
              >
                <i className="bi bi-journals text-4xl lg:text-2xl lg:me-4"></i>

                <span className="text-xs lg:text-base py-1">帳簿管理</span>
              </Link>
            </li>
            {/* <li>
              <Link
                href="/record"
                className="flex flex-col lg:flex-row  items-center p-3 lg:py-4"
              >
                <i className="bi bi-coin text-5xl lg:text-2xl lg:me-4"></i>
                <span className="text-xs lg:text-base py-1">記帳</span>
              </Link>
            </li> */}
            <li className={`lg:w-full lg:grow lg:flex lg:items-end lg:mb-6`}>
              <div
                className={`w-full lg:px-6 ${
                  path === "/setting"
                    ? "bg-secondary text-white border-y-5 lg:border-y-0 lg:border-s-10 border-white"
                    : ""
                }`}
              >
                <Link
                  href="/setting"
                  className="flex flex-col lg:flex-row items-center p-3 lg:py-4 cursor-pointer"
                >
                  <i className="bi bi-gear text-4xl lg:text-2xl lg:me-4"></i>
                  <span className="text-xs lg:text-base py-1 text-center min-w-12">設定</span>
                </Link>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
