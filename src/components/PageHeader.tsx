"use client";

import { useState, useEffect, ReactNode } from "react";
import { usePathname } from "next/navigation";

// import ModalDialog from "@/components/Dialogs/ModalDialog";
import useAccountBook from "@/hooks/useAccountBook";
// import useAuth from "@/hooks/useAuth";
import MessageModalDialog from "@/components/Dialogs/MessageModalDialog";
// import { addAccountBook, setAccountBookRule } from "@/lib/firebase/firestore";

export default function PageHeader() {
  const path = usePathname();
  const { allAccountBook, selectedAccountingBook, setSelectedAccountingBook } =
    useAccountBook();
  // const userData = useAuth();
  const [title, setTitle] = useState<string>("預設title");
  // const [modalContent, setModalContent] = useState<ReactNode>(null);
  // const [isOpen, setIsOpen] = useState<boolean>(false);
  // const [addBookOpen, setAddBookOpen] = useState<boolean>(false); 
  // const [usingUserName, setUsingUserName] = useState<string | undefined>(
  //   userData.name
  // ); 
  // const [addBookNameInput, setAddBookNameInput] = useState<string | undefined>(
  //   ""
  // ); 
  // const [addBookUsernameInput, setAddBookUsernameInput] = useState<
  //   string | undefined
  // >(""); 
  // const [addBookDescriptionInput, setAddBookDescription] = useState<
  //   string | undefined
  // >(""); 
  const [alertMessageIsOpen, setAlertMessageIsOpen] = useState<boolean>(false);
  const [alertMessageTitle, setAlertMessageTitle] = useState<string>("");
  const [alertMessageContent, setAlertMessageContent] = useState<
    ReactNode | undefined
  >(undefined);

  // async function addBookClickHandler() {
  //   if (!addBookNameInput || !userData?.user?.uid) {
  //     alert("資料未填寫完整");
  //     return;
  //   }
  //   console.log(
  //     addBookNameInput,
  //     addBookUsernameInput,
  //     addBookDescriptionInput
  //   );
  //   const addAccountingBookInput = {
  //     bookName: addBookNameInput,
  //     bookDescription: addBookDescriptionInput ?? "",
  //     bookOwnerUid: userData?.user?.uid,
  //     displayNames: {
  //       [userData?.user?.uid]: addBookUsernameInput
  //         ? addBookUsernameInput
  //         : usingUserName
  //         ? usingUserName
  //         : "",
  //     },
  //   };
  //   const doc = await addAccountBook(addAccountingBookInput);
  //   const setAccountBookRuleInput = {
  //     accountingBookId: doc.id,
  //     bookOwnerUid: userData?.user?.uid,
  //     bookMember: [
  //       {
  //         uid: userData?.user?.uid,
  //         role: "owner",
  //         sharePermission: true,
  //       },
  //     ],
  //   };
  //   setAccountBookRule(doc.id, setAccountBookRuleInput);
  //   setAddBookOpen(false);
  //   setIsOpen(false);
  //   alert("新增成功");
  // } 

  // const addBookContent = (
  //   <div>
  //     <div className="mb-4">
  //       <label htmlFor="addBookName" className="block mb-2">
  //         新帳簿名稱
  //       </label>
  //       <input
  //         type="text"
  //         name="addBookName"
  //         id="addBookName"
  //         className="block border border-primary rounded-xl p-3 w-full"
  //         value={addBookNameInput}
  //         onChange={(e) => setAddBookNameInput(e.target.value)}
  //       />
  //     </div>
  //     <div className="mb-4">
  //       <label htmlFor="addBookUsername" className="block mb-2">
  //         在新帳簿內使用的暱稱
  //       </label>
  //       <input
  //         type="text"
  //         name="addBookUsername"
  //         id="addBookUsername"
  //         className="block border border-primary rounded-xl p-3 w-full"
  //         value={addBookUsernameInput}
  //         onChange={(e) => setAddBookUsernameInput(e.target.value)}
  //       />
  //     </div>
  //     <div className="mb-4">
  //       <label htmlFor="addBookDescription" className="block mb-2">
  //         新帳簿描述
  //       </label>
  //       <textarea
  //         name="addBookDescription"
  //         id="addBookDescription"
  //         className="border border-primary rounded-xl w-full p-2"
  //         rows={5}
  //         value={addBookDescriptionInput}
  //         onChange={(e) => setAddBookDescription(e.target.value)}
  //       ></textarea>
  //     </div>
  //     <div className="flex justify-end">
  //       <button
  //         onClick={() => setAddBookOpen(false)}
  //         className="block border py-3 px-5 rounded-xl me-3"
  //       >
  //         取消
  //       </button>
  //       <button
  //         className="block border py-3 px-5 rounded-xl bg-secondary text-white"
  //         onClick={addBookClickHandler}
  //       >
  //         新增
  //       </button>
  //     </div>
  //   </div>
  // ); 

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

  // useEffect(() => {
  //   setUsingUserName(userData.name);
  // }, [userData]);

  // useEffect(() => {
  //   console.log(addBookUsernameInput);
  // }, [addBookUsernameInput]);

  // useEffect(() => {
  //   console.log("設定初始選擇帳簿",allAccountBook)
  //   if (allAccountBook.length > 0) {
  //     console.log("設定初始選擇帳簿")
  //     setSelectedAccountingBook(allAccountBook[0]);
  //   }
  // }, []);
  useEffect(()=>{
    if (selectedAccountingBook === undefined) {
        // setSelectedAccountingBook(allAccountBook[0]);
        // setAlertMessageTitle("尚未選擇任何帳簿");
        // setAlertMessageContent(<>從右上角進行  新增帳簿  或是  選擇帳簿  開始記帳~</>)
        // setAlertMessageIsOpen(true);
      }
  },[selectedAccountingBook])

  // useEffect(() => {
  //   if (allAccountBook.length > 0) {
  //     // if (selectedAccountingBook === undefined) {
  //     //   // setSelectedAccountingBook(allAccountBook[0]);
  //     //   setAlertMessageTitle("尚未選擇任何帳簿");
  //     //   setAlertMessageContent(<>從右上角進行  新增帳簿  或是  選擇帳簿  開始記帳~</>)
  //     //   setAlertMessageIsOpen(true);
  //     // }
  //     console.log(allAccountBook);
  //     setModalContent(
  //       <div>
  //         <ul className="mb-10">
  //           {allAccountBook.map((book) => (
  //             <li className="border rounded-xl mb-2" key={book.id}>
  //               <button
  //                 type="button"
  //                 className={`block w-full p-3 rounded-xl ${
  //                   selectedAccountingBook?.id === book.id
  //                     ? `bg-primary text-white`
  //                     : `bg-white`
  //                 }`}
  //                 onClick={() => {
  //                   setSelectedAccountingBook(book);
  //                   setIsOpen(false);
  //                 }}
  //               >
  //                 {book.bookName}
  //               </button>
  //             </li>
  //           ))}
  //         </ul>
  //         <div>
  //           <button
  //             type="button"
  //             onClick={() => setAddBookOpen(true)}
  //             className="border w-full p-3 rounded-xl bg-secondary text-white"
  //           >
  //             新增帳簿
  //           </button>
  //         </div>
  //       </div>
  //     );
  //   } else {
  //     setModalContent(
  //       <div>
  //         <div>
  //           <button
  //             type="button"
  //             onClick={() => setAddBookOpen(true)}
  //             className="border w-full p-3 rounded-xl bg-secondary text-white"
  //           >
  //             新增帳簿
  //           </button>
  //         </div>
  //       </div>
  //     );
  //   }
  // }, [
  //   allAccountBook,
  //   selectedAccountingBook,
  //   setSelectedAccountingBook,
  //   addBookOpen,
  // ]);

  return (
    <div className="sticky top-0 right-0 left-0 lg:static lg:left-auto flex justify-center pt-6 px-6 bg-white z-3">
      <div className="container max-w-7xl flex flex-col lg:flex-row lg:justify-end lg:items-center">
        <h2 className="grow text-center text-lg text-secondary font-bold text-xl">
          {title}
        </h2>
        <div className="flex justify-end">
          {/* <ModalDialog
            modalBtn={selectedAccountingBook?.bookName ?? "新增帳簿"}
            title="帳簿"
            decription="請選擇要使用的帳簿"
            content={modalContent}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            minWidth={true}
          ></ModalDialog> */}
          {/* <MessageModalDialog
            isOpen={addBookOpen}
            setIsOpen={setAddBookOpen}
            setParentIsOpen={setIsOpen}
            title="新增帳簿"
            content={addBookContent}
          ></MessageModalDialog> */}
          <MessageModalDialog
            isOpen={alertMessageIsOpen}
            setIsOpen={setAlertMessageIsOpen}
            title={alertMessageTitle}
            content={alertMessageContent}
          ></MessageModalDialog>
        </div>
      </div>
    </div>
  );
}
