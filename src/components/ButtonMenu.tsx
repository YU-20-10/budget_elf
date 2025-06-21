import Link from "next/link";
import Image from "next/image";

export default function BottonMenu() {
  return (
    <div className="fixed lg:sticky bottom-0 right-0 left-0 lg:right-auto lg:top-0 bg-primary z-3">
      <div className="lg:min-h-screen lg:h-full">
        <div className="flex lg:flex-col w-full h-full">
          {/* <h1 className="lg:p-6 flex items-center">
            <Link href="/" className="block">
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
                width={72}
                height={72}
              ></Image>
            </Link>
          </h1> */}
          <ul className="flex justify-around items-center lg:items-start lg:flex-col h-full w-full lg:p-6">
            <li>
              <h1 className=" flex items-center">
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
            <li>
              <Link
                href="/summary"
                className="flex flex-col lg:flex-row items-center p-3 lg:py-4"
              >
                <i className="bi bi-clipboard-data text-4xl lg:text-2xl lg:me-4"></i>
                <span className="text-xs lg:text-base py-1">收支總覽</span>
              </Link>
            </li>
            <li>
              <Link
                href="/accountingBook"
                className="flex flex-col lg:flex-row  items-center p-3 lg:py-4"
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
            <li className="lg:grow lg:flex lg:items-end">
              <Link
                href="/setting"
                className="flex flex-col lg:flex-row  items-center p-3"
              >
                <i className="bi bi-gear text-4xl lg:text-2xl lg:me-4"></i>
                <span className="text-xs lg:text-base py-1">設定</span>
              </Link>
            </li>
          </ul>
          {/* <div className="lg:grow lg:flex lg:items-end">
            <Link href="" className="flex items-center">
              <Image
                src="/userSetting_icon.svg"
                alt="analytics_icon"
                width={24}
                height={24}
              ></Image>
              <span>使用者設定</span>
            </Link>
          </div> */}
        </div>
      </div>
    </div>
  );
}
