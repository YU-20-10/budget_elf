"use client";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import useAccountBook from "@/hooks/useAccountBook";
import { AccountingBookType } from "@/types/AccountingBookType";

type AccountingBookListType = {
  setActiveShareBook: React.Dispatch<
    React.SetStateAction<AccountingBookType | null>
  >;
  setShareDialogIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  clickDelAccountBookHandler: () => void;
  editBookBtnClickHandler: (book: AccountingBookType) => void;
  redirectLoading: "hidden" | "block";
  setRedirectLoading: React.Dispatch<React.SetStateAction<"hidden" | "block">>;
};

export default function AccountingBookList({
  setActiveShareBook,
  setShareDialogIsOpen,
  clickDelAccountBookHandler,
  editBookBtnClickHandler,
  redirectLoading,
  setRedirectLoading,
}: AccountingBookListType) {
  const router = useRouter();
  const { user } = useAuth();
  const { allAccountBook, selectedAccountingBook, setSelectedAccountingBook } =
    useAccountBook();
  return (
    <>
      {allAccountBook.map((book) => {
        return (
          <tr key={book.id}>
            <td scope="row" className="text-center border-b border-primary p-2">
              <Menu>
                <MenuButton
                  className="focus-visible:outline-none focus-visible:ring-0 cursor-pointer hover:outline"
                  data-accountingbookid={book.id}
                  onClick={() => setSelectedAccountingBook(book)}
                >
                  <i className="bi bi-three-dots-vertical"></i>
                </MenuButton>
                <MenuItems
                  transition
                  anchor={{ to: "top", offset: 24 }}
                  className="origin-top transition duration-200 ease-out data-closed:scale-95 data-closed:opacity-0 bg-white focus-visible:outline-none focus-visible:ring-0 text-black"
                >
                  <MenuItem
                    as="div"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <button
                      className={`block px-3 py-2 ${
                        user?.uid !== book.bookOwnerUid
                          ? "text-gray-300 cursor-not-allowed"
                          : "cursor-pointer hover:bg-primary hover:font-bold hover:text-white"
                      }`}
                      disabled={user?.uid !== book.bookOwnerUid}
                      onClick={clickDelAccountBookHandler}
                    >
                      刪除帳簿
                    </button>
                  </MenuItem>
                </MenuItems>
              </Menu>
            </td>
            <td scope="row" className="text-center border-b border-primary p-2">
              {book.bookName}
            </td>
            {user?.uid === book.bookOwnerUid ? (
              <>
                <td className="border-b border-primary p-2 text-center">
                  <div className="flex justify-center">
                    {/* Add or remove other user */}
                    <button
                      className="flex justify-center w-full p-2 cursor-pointer text-center"
                      onClick={() => {
                        setActiveShareBook(book);
                        setShareDialogIsOpen(true);
                      }}
                    >
                      <i className="bi bi-person-plus-fill text-2xl text-secondary hover:text-black focus:text-black"></i>
                    </button>
                  </div>
                </td>
                <td className="border-b border-primary p-2 text-center">
                  <div className="flex justify-center">
                    {/* Edit accounting book */}
                    <button
                      className="flex justify-center w-full p-2 cursor-pointer text-center"
                      onClick={() => {
                        // setActiveEditBook(book);
                        editBookBtnClickHandler(book);
                      }}
                    >
                      <i className="bi bi-pencil-fill text-2xl text-secondary hover:text-black focus:text-black"></i>
                    </button>
                  </div>
                </td>
              </>
            ) : (
              <>
                <td className="border-b border-primary p-2 text-center">
                  <div className="flex justify-center">
                    {/* Cannot add or remove other user  */}
                    <button
                      className="flex justify-center w-full p-2 text-center"
                      disabled
                    >
                      <i className="bi bi-x-circle text-2xl text-secondary"></i>
                    </button>
                  </div>
                </td>
                <td className="border-b border-primary p-2 text-center">
                  <div className="flex justify-center">
                    {/* Edit accounting book */}
                    <button
                      className="flex justify-center w-full p-2 cursor-pointer text-center"
                      onClick={() => {
                        // setActiveEditBook(book);
                        editBookBtnClickHandler(book);
                      }}
                    >
                      <i className="bi bi-pencil-fill text-2xl text-secondary hover:text-black focus:text-black"></i>
                    </button>
                  </div>
                </td>
              </>
            )}
            <td scope="row" className="text-center border-b border-primary p-2">
              <div className="flex justify-center relative">
                <button
                  className="flex justify-center items-center p-2 bg-secondary text-white rounded-xl md:px-3 md:py-2 cursor-pointer hover:bg-primary hover:text-black"
                  onClick={() => {
                    setSelectedAccountingBook(book);
                    setRedirectLoading("block");
                    router.push("/record");
                  }}
                >
                  <span className="hidden md:inline-block">記帳</span>

                  <i className="bi bi-arrow-right-circle-fill text-2xl md:ms-2"></i>
                </button>
                <div
                  className={`${
                    selectedAccountingBook?.id === book.id
                      ? redirectLoading
                      : "hidden"
                  } absolute right-0 top-1/3`}
                >
                  <div className="animate-spin w-4 h-4 border-t-2 border-s-2 border-b-2 rounded-xl"></div>
                </div>
              </div>
            </td>
          </tr>
        );
      })}
    </>
  );
}
