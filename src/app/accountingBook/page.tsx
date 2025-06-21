"use client";

import React, {
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
// import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  // Popover,
  // PopoverButton,
  // PopoverPanel,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";

import useAuth from "@/hooks/useAuth";
import useAccountBook from "@/hooks/useAccountBook";
import MessageModalDialog from "@/components/Dialogs/MessageModalDialog";
import {
  AccountingBookType,
  accountBookInvitesType,
  // accountBookRemovalType,
  AccountBookRuleType,
} from "@/types/AccountingBookType";
import {
  addAccountBookInvites,
  updateAccountBookRuleAddBookMember,
  updateAccountBookInvites,
  setUserAbleAccountBook,
  updateAccountBookDisplayName,
  addAccountBook,
  setAccountBookRule,
  getUserDataByEmail,
  delUserAbleAccountBook,
  updateAccountBookRuleRemoveMember,
  // watchAccountBookRemoval,
  updateAccountBookRemoval,
  addAccountBookRemoval,
  getAccountBookInvites,
  delAccountBookInvites,
  getAccountBookRule,
  delAccountBookRule,
  delAllAccountBook,
  delAllAccountingRecord,
  delAllAccountBookInvitesAndAddRemoveal,
  // setUserAbleAccountBookandUpdateThisName,
} from "@/lib/firebase/firestore";
import { emailCheck } from "@/lib/inputCheck";

export default function AccountingBook() {
  const router = useRouter();
  const { user, name, invitesData, removalDate } = useAuth();
  const { allAccountBook, selectedAccountingBook, setSelectedAccountingBook } =
    useAccountBook();

  //---useState---
  // 取得遠端資料後儲存用
  // const [removalDate, setRemovalData] = useState<accountBookRemovalType[]>([]);

  // 元件控制用
  const [editDialogIsOpen, setEditDialogIsOpen] = useState<boolean>(false);
  const [shareDialogIsOpen, setShareDialogIsOpen] = useState<boolean>(false);
  const [addBookOpen, setAddBookOpen] = useState<boolean>(false);
  const [shareBookInfoIsOpen, setShareBookInfoIsOpen] =
    useState<boolean>(false);
  const [settingThisNameIsOpen, setSettingThisNameIsOpen] =
    useState<boolean>(false);
  const [tabInex, setTabIndex] = useState<number>(0);
  const [alertMessageIsOpen, setAlertMessageIsOpen] = useState<boolean>(false);
  const [removeConfirmIsOpen, setRemoveConfirmIsOpen] =
    useState<boolean>(false);
  const [removeAllRecordIsOpen, setRemoveAllRecordIIsOpen] =
    useState<boolean>(false);
  // const [acceptInvitationIsOpen, setAcceptInvitationIsOpen] =
  //   useState<boolean>(false);

  // 資料顯示用
  const [accountBookList, setAccountBookList] = useState<ReactNode>(<></>);
  const [redirectLoading, setRedirectLoading] = useState<"hidden" | "block">(
    "hidden"
  );
  const [alertMessageContent, setAlertMessageContent] = useState<ReactNode>(
    <></>
  );

  // 取得使用者互動資料用
  // const [activeBook, setActiveBook] = useState<AccountingBookType | undefined>(
  //   undefined
  // );
  const [activeShareBook, setActiveShareBook] =
    useState<AccountingBookType | null>(null);
  const [activeEditBook, setActiveEditBook] =
    useState<AccountingBookType | null>(null);
  const [activeInvites, setActiveInvites] = useState<
    accountBookInvitesType | undefined
  >(undefined);

  // 表單輸入儲存用
  const [accountBookThisName, setAccountBookThisName] = useState<
    string | undefined
  >(name);
  const [shareEmailInput, setShareEmailInput] = useState<string | undefined>(
    undefined
  );
  const [removeEmailInput, setRemoveEmailInput] = useState<string | undefined>(
    undefined
  );
  const [usingUserName, setUsingUserName] = useState<string | undefined>(name);
  const [addBookNameInput, setAddBookNameInput] = useState<string | undefined>(
    ""
  );
  const [addBookUsernameInput, setAddBookUsernameInput] = useState<
    string | undefined
  >("");
  const [addBookDescriptionInput, setAddBookDescription] = useState<
    string | undefined
  >("");
  //---useState---

  //---function---
  const shareEmailCheck = useCallback(async () => {
    // setShareUid("");
    const userEmail = user?.email;
    if (!shareEmailInput || userEmail === shareEmailInput) {
      alert("請輸入要邀請共用的email");
      return;
    }
    const check = emailCheck(shareEmailInput);
    if (!check) {
      alert("email格式錯誤");
      return;
    } else {
      const otherUserData = await getUserDataByEmail(shareEmailInput);
      if (!otherUserData) {
        alert("使用者email有誤，查無資料");
        return;
      } else {
        return otherUserData.id;
      }
    }
  }, [user?.email, shareEmailInput]);

  const shareBtnClickHandler = useCallback(async () => {
    const otherUserId = await shareEmailCheck();
    const id = user?.uid;
    if (otherUserId && id && activeShareBook?.id) {
      const addInvitesResult = await addAccountBookInvites(
        id,
        otherUserId,
        activeShareBook?.id,
        activeShareBook?.bookName
      );
      const updareRuleResult = await updateAccountBookRuleAddBookMember(
        activeShareBook?.id,
        {
          uid: otherUserId,
          role: "editor",
          sharePermission: false,
        }
      );
      if (addInvitesResult && updareRuleResult) {
        setShareDialogIsOpen(false);
        setAlertMessageContent(<p>邀請成功</p>);
        setAlertMessageIsOpen(true);
      } else {
        alert("出了一點問題，邀請失敗了");
      }
    }
  }, [activeShareBook, user?.uid, shareEmailCheck]);

  const removeEamilCheckAndGetUid = useCallback(async () => {
    const userEmail = user?.email;
    if (!removeEmailInput || userEmail === removeEmailInput) {
      setAlertMessageContent(<p>請輸入要解除共用的email</p>);
      setAlertMessageIsOpen(true);
      return;
    }
    const check = emailCheck(removeEmailInput);
    if (!check) {
      setAlertMessageContent(<p>email格式錯誤</p>);
      setAlertMessageIsOpen(true);
      return;
    } else {
      const otherUserData = await getUserDataByEmail(removeEmailInput);
      // console.log("otherUserData", otherUserData);
      if (!otherUserData) {
        setAlertMessageContent(<p>使用者email有誤，查無資料</p>);
        setAlertMessageIsOpen(true);
        return;
      } else {
        return otherUserData;
      }
    }
  }, [removeEmailInput, user?.email]);

  const confirmTodelBtnClickHandler = useCallback(
    async (
      accountBookId: string,
      accountBookName: string,
      delMemberUid: string
    ) => {
      const uid = user?.uid;
      if (!uid) return;
      const invitesDataArr = await getAccountBookInvites(
        accountBookId,
        uid,
        delMemberUid
      );
      // console.log(invitesDataArr);
      if (invitesDataArr === false || invitesDataArr.length === 0) return;

      const rowDelInvitesResults = await Promise.allSettled(
        invitesDataArr.map(async (invite) => {
          await delAccountBookInvites(invite.invitesId);
          return invite;
        })
      );
      const delInvitesResults = rowDelInvitesResults.reduce(
        (acc, result) => {
          if (result.status === "fulfilled") {
            acc.success.push(result.value);
          } else {
            acc.failure.push(result.reason);
          }
          return acc;
        },
        {
          success: [] as accountBookInvitesType[],
          failure: [] as { invitesId: string; error: Error }[],
        }
      );

      const ruleRemoveMemberResult = await updateAccountBookRuleRemoveMember(
        accountBookId,
        delMemberUid
      );
      const addRemovalResult = await addAccountBookRemoval(
        uid,
        delMemberUid,
        accountBookId,
        accountBookName
      );
      // console.log("addRemovalResult", addRemovalResult);

      if (
        delInvitesResults["success"].length === invitesDataArr.length &&
        ruleRemoveMemberResult &&
        addRemovalResult
      ) {
        setAlertMessageContent(<p>已成功將共用者移除</p>);
        setShareDialogIsOpen(false);
        setAlertMessageIsOpen(true);
        return;
      } else {
        setAlertMessageContent(<p>出了一點小錯誤</p>);
        setAlertMessageIsOpen(true);
        return;
      }
    },
    [user?.uid]
  );

  const removeBtnClickHandler = useCallback(async () => {
    const otherUserData = await removeEamilCheckAndGetUid();
    if (!otherUserData || !activeShareBook) return;
    const bookRule: AccountBookRuleType | false = await getAccountBookRule(
      activeShareBook.id
    );
    if (bookRule === false) return;
    const isUserExist = bookRule.bookMember.find(
      (member) => member.uid === otherUserData.id
    );
    if (!isUserExist) {
      setAlertMessageContent(<p>該使用者並未共用此本帳簿</p>);
      setAlertMessageIsOpen(true);
    } else {
      setAlertMessageContent(
        <div>
          <p className="mb-6">
            是否確認將
            {activeShareBook.displayNames?.[otherUserData.id]
              ? activeShareBook.displayNames?.[otherUserData.id]
              : otherUserData.id}{" "}
            從 {activeShareBook.bookName} 當中移除?
          </p>
          <div className="flex justify-around">
            <button
              type="button"
              className="block w-1/3 border py-2 px-3 rounded-xl cursor-pointer hover:bg-primary hover:text-white hover:font-bold focus:bg-primary focus:font-bold"
              onClick={() => setAlertMessageIsOpen(false)}
            >
              取消
            </button>
            <button
              type="button"
              className="block w-1/3 bg-secondary py-2 px-3 rounded-xl text-white cursor-pointer hover:bg-primary hover:text-black hover:font-bold hover:border-primary focus:bg-primary focus:font-bold"
              onClick={() =>
                confirmTodelBtnClickHandler(
                  activeShareBook.id,
                  activeShareBook.bookName,
                  otherUserData.id
                )
              }
            >
              確認
            </button>
          </div>
        </div>
      );
      setAlertMessageIsOpen(true);
    }
  }, [activeShareBook, removeEamilCheckAndGetUid, confirmTodelBtnClickHandler]);

  async function editDialogClickHandler() {
    if (!accountBookThisName) {
      alert("尚未輸入帳簿中要使用的稱呼");
      return;
    }
    if (user?.uid && activeEditBook?.id) {
      const updateAccountBookDisplayNameResult =
        await updateAccountBookDisplayName(
          activeEditBook?.id,
          user?.uid,
          accountBookThisName ?? ""
        );

      if (updateAccountBookDisplayNameResult) {
        alert("已成功設定帳簿內的顯示名稱~");
        setSettingThisNameIsOpen(false);
      } else {
        alert("似乎出了一點錯誤....");
      }
    }
  }
  async function acceptInvitationClickHandler(
    event: React.MouseEvent<HTMLButtonElement>
  ) {
    const invitesId = event.currentTarget.dataset.inviteid;
    const accountingBookId = event.currentTarget.dataset.accountingbookid;
    const uid = user?.uid;
    if (invitesId && accountingBookId && uid) {
      await updateAccountBookInvites(invitesId, "accepted");
      const setUserAbleAccountBookResult = await setUserAbleAccountBook(
        accountingBookId,
        uid
      );

      if (setUserAbleAccountBookResult) {
        setAlertMessageContent(<p>已接受邀請</p>);
        setAlertMessageIsOpen(true);
        setSettingThisNameIsOpen(true);
      } else {
        alert("似乎出了一點錯誤....");
      }
    }
  }
  async function thisNameClickHandler() {
    if (!accountBookThisName) {
      setAlertMessageContent(<p>尚未輸入帳簿中要使用的稱呼</p>);
      setAlertMessageIsOpen(true);
      return;
    }
    if (activeInvites?.invitesId && user?.uid) {
      const updateAccountBookDisplayNameResult =
        await updateAccountBookDisplayName(
          activeInvites.accountingBookId,
          user?.uid,
          accountBookThisName ?? ""
        );

      if (updateAccountBookDisplayNameResult) {
        setAlertMessageContent(<p>已成功設定帳簿內的顯示名稱~</p>);
        setSettingThisNameIsOpen(false);
        setAlertMessageIsOpen(true);
      } else {
        alert("似乎出了一點錯誤....");
      }
    }
  }

  async function addBookClickHandler() {
    if (!addBookNameInput || !user?.uid) {
      setAlertMessageContent(<p>資料未填寫完整</p>);
      setAlertMessageIsOpen(true);
      return;
    }
    const addAccountingBookInput = {
      bookName: addBookNameInput,
      bookDescription: addBookDescriptionInput ?? "",
      bookOwnerUid: user?.uid,
      displayNames: {
        [user?.uid]: addBookUsernameInput
          ? addBookUsernameInput
          : usingUserName
          ? usingUserName
          : "",
      },
    };
    const doc = await addAccountBook(addAccountingBookInput);
    const setAccountBookRuleInput = {
      accountingBookId: doc.id,
      bookOwnerUid: user?.uid,
      bookMember: [
        {
          uid: user?.uid,
          role: "owner",
          sharePermission: true,
        },
      ],
    };
    setAccountBookRule(doc.id, setAccountBookRuleInput);
    setAddBookOpen(false);
    setAlertMessageContent(<p>新增成功</p>);
    setAlertMessageIsOpen(true);
  }

  // 一般：重新render重新建立
  // useCallback:只有依賴變更才會重新建立
  // 用於function當props傳遞、或放在useEffect的依賴中使用
  const autoRemoveSharedBook = useCallback(
    async function () {
      const uid = user?.uid;
      if (!uid) return;
      if (removalDate.length === 0) return;
      // 自動監聽remove
      try {
        const results = await Promise.allSettled(
          removalDate.map(async (removal) => {
            const result = await delUserAbleAccountBook(
              uid,
              removal.accountingBookId
            );
            return {
              result,
              removal,
            };
          })
        );
        for (const rowResult of results) {
          if (rowResult.status === "fulfilled") {
            const { result, removal } = rowResult.value;
            // console.log(result, removal);
            if (result) {
              await updateAccountBookRemoval(removal.removeId, "done");
            }
          } else {
            console.log("未能成功刪除", rowResult);
          }
        }
        const success = results.filter(
          (result) => result.status === "fulfilled"
        );
        // 需要修正，只有被刪除的顯示而非全部刪除才顯示
        if (results.length === success.length) {
          setAlertMessageContent(
            <div>
              <p>
                因為
                <span className="font-bold">帳簿被刪除</span>
                或是<span className="font-bold">帳簿擁有者移除了您的權限</span>
                ，以下帳簿已從您的可讀取帳簿中移除
              </p>
              <ul className="py-3">
                {removalDate.map((removal) => (
                  <li key={removal.removeId} className="mb-3">
                    <span className="font-bold">帳簿名稱：</span>
                    {removal.accountingBookName}
                  </li>
                ))}
              </ul>
            </div>
          );
          setAlertMessageIsOpen(true);
        }
      } catch (error) {
        console.log("autoRemoveSharedBook", error);
      }
    },
    [removalDate, user?.uid]
  );

  const comfirmDelAccountBook = useCallback(async () => {
    if (!selectedAccountingBook || !user?.uid) return;

    // 移除所有共用者權限
    const removerAllMemberResult = await delAllAccountBookInvitesAndAddRemoveal(
      selectedAccountingBook.id,
      user.uid
    );

    // 刪除所有帳簿record
    const delAllRecord = await delAllAccountingRecord(
      selectedAccountingBook.id
    );

    // 刪除帳簿規則
    const delAccountBookRuleResult = await delAccountBookRule(
      selectedAccountingBook.id
    );

    // 刪除帳簿
    const delAccountingBookResult = await delAllAccountBook(
      selectedAccountingBook.id
    );

    // 移除後要處理取消監聽這個帳簿
    if (
      removerAllMemberResult &&
      delAllRecord &&
      delAccountBookRuleResult &&
      delAccountingBookResult
    ) {
      setAlertMessageIsOpen(false);
      setAlertMessageContent(<p>刪除成功</p>);
      setAlertMessageIsOpen(true);
    } else {
      setAlertMessageIsOpen(false);
      setAlertMessageContent(<p>出了一點錯誤請稍後再試</p>);
      setAlertMessageIsOpen(true);
    }
  }, [selectedAccountingBook, user?.uid]);

  const clickDelAccountBookHandler = useCallback(async () => {
    // console.log(selectedAccountingBook);
    setAlertMessageContent(
      <div>
        <p className="mb-6">
          是否確認刪除
          <span className="font-bold">{selectedAccountingBook?.bookName}</span>?
        </p>
        <div className="flex justify-around">
          <button
            type="button"
            className="block border py-2 px-3 rounded-xl cursor-pointer hover:bg-primary hover:text-white hover:font-bold focus:bg-primary focus:font-bold"
            onClick={() => setAlertMessageIsOpen(false)}
          >
            取消
          </button>
          <button
            type="button"
            className="block bg-secondary py-2 px-3 rounded-xl text-white cursor-pointer hover:bg-primary hover:text-black hover:font-bold hover:border-primary focus:bg-primary focus:font-bold"
            onClick={() => comfirmDelAccountBook()}
          >
            確認
          </button>
        </div>
      </div>
    );
    setAlertMessageIsOpen(true);
  }, [comfirmDelAccountBook, selectedAccountingBook]);

  //---function---

  //---useEffect---
  useEffect(() => {
    if (user?.uid) {
      setAccountBookThisName(
        activeEditBook?.displayNames?.[user?.uid]
          ? activeEditBook?.displayNames?.[user?.uid]
          : name
      );
    }
  }, [name, user?.uid, activeEditBook]);

  useEffect(() => {
    setAccountBookList(
      <>
        {allAccountBook.map((book) => {
          return (
            <tr key={book.id}>
              <td
                scope="row"
                className="text-center border-b border-primary p-2"
              >
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
                    className="origin-top transition duration-200 ease-out data-closed:scale-95 data-closed:opacity-0 bg-white focus-visible:outline-none focus-visible:ring-0"
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
              <td
                scope="row"
                className="text-center border-b border-primary p-2"
              >
                {book.bookName}
              </td>
              {user?.uid === book.bookOwnerUid ? (
                <>
                  <td className="border-b border-primary p-2 text-center">
                    <div className="flex justify-center">
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
                      <button
                        className="flex justify-center w-full p-2 cursor-pointer text-center"
                        onClick={() => {
                          setActiveEditBook(book);
                          setEditDialogIsOpen(true);
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
                      <button
                        className="flex justify-center w-full p-2 cursor-pointer text-center"
                        onClick={() => {
                          setActiveEditBook(book);
                          setEditDialogIsOpen(true);
                        }}
                      >
                        <i className="bi bi-pencil-fill text-2xl text-secondary hover:text-black focus:text-black"></i>
                      </button>
                    </div>
                  </td>
                </>
              )}
              <td
                scope="row"
                className="text-center border-b border-primary p-2"
              >
                <div className="flex justify-center relative">
                  <button
                    className="flex justify-center items-center p-2 bg-secondary text-white rounded-xl md:px-3 md:py-2 cursor-pointer hover:bg-primary hover:text-black focus:bg-primary focus:text-black"
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
  }, [
    allAccountBook,
    user?.uid,
    router,
    setSelectedAccountingBook,
    selectedAccountingBook?.id,
    redirectLoading,
    clickDelAccountBookHandler,
  ]);
  useEffect(() => {
    if (removalDate.length === 0) return;
    autoRemoveSharedBook();
  }, [removalDate, autoRemoveSharedBook]);
  useEffect(() => {
    setUsingUserName(name);
  }, [name]);

  useEffect(() => {
    if (!shareDialogIsOpen) {
      setTabIndex(0);
    }
  }, [shareDialogIsOpen]);
  // useEffect(() => {
  //   console.log(redirectLoading);
  // }, [redirectLoading]);
  // useEffect(() => {
  //   const uid = user?.uid;
  //   let unsubscribe: () => void;
  //   if (uid) {
  //     unsubscribe = watchAccountBookRemoval(uid, (removals) => {
  //       setRemovalData(removals);
  //     });
  //   }
  //   return () => {
  //     if (unsubscribe) {
  //       unsubscribe();
  //     }
  //   };
  // }, [userData?.user?.uid]);
  //---useEffect---

  //---template---
  const editDialogContent = useMemo(() => {
    return (
      <>
        <ul>
          <li className="mb-3">
            <span className="block font-bold mb-2">帳簿名稱：</span>
            <p>{activeEditBook?.bookName}</p>
          </li>
          <li>
            <span className="block font-bold mb-2">在帳簿中使用的稱呼：</span>
            <input
              type="text"
              name="accountBookThisName"
              id="accountBookThisName"
              placeholder="在帳簿中會以此暱稱顯示記帳資料"
              className="block border border-primary p-2 rounded-xl w-full"
              value={accountBookThisName}
              onChange={(e) => setAccountBookThisName(e.target.value)}
            />
          </li>
        </ul>
      </>
    );
  }, [activeEditBook, accountBookThisName]);

  const shareDialogContent = useMemo(() => {
    return (
      <>
        <h2 className="mb-4 text-lg">帳簿名稱：{activeShareBook?.bookName}</h2>
        <div>
          <TabGroup className="" onChange={(index) => setTabIndex(index)}>
            <TabList className="">
              <Tab
                className={`w-1/2 p-2 border-primary ${
                  tabInex === 0
                    ? "border-t border-x rounded-tl-xl rounded-tr-xl"
                    : "border-b"
                }`}
              >
                邀請共用
              </Tab>
              <Tab
                className={`w-1/2 p-2 border-primary ${
                  tabInex === 1
                    ? "border-t border-x rounded-tl-xl rounded-tr-xl"
                    : "border-b"
                }`}
              >
                解除共用
              </Tab>
            </TabList>
            <TabPanels className="p-3 border border-primary rounded-br-xl rounded-bl-xl border-t-0">
              <TabPanel>
                <div className="mb-4">
                  <label
                    htmlFor="shareToOtherUser"
                    className="flex items-center mb-2"
                  >
                    與其他使用者共用帳簿
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      name="shareToOtherUser"
                      id="shareToOtherUser"
                      placeholder="其他使用者的email"
                      onChange={(e) => setShareEmailInput(e.target.value)}
                      className="block border border-primary rounded-xl p-2 grow"
                    />
                  </div>
                </div>
                <div className="flex justify-center">
                  <button
                    className="block bg-secondary text-white rounded-xl py-2 px-3 w-full cursor-pointer hover:bg-primary hover:text-black hover:font-bold hover:border-primary focus:bg-primary focus:font-bold"
                    onClick={shareBtnClickHandler}
                  >
                    加入共用
                  </button>
                </div>
              </TabPanel>
              <TabPanel>
                <div className="mb-4">
                  <label
                    htmlFor="shareToOtherUser"
                    className="flex items-center mb-2"
                  >
                    移除帳簿中的共用者
                  </label>
                  <input
                    type="text"
                    name="shareToOtherUser"
                    id="shareToOtherUser"
                    placeholder="其他使用者的email"
                    onChange={(e) => setRemoveEmailInput(e.target.value)}
                    className="block border border-primary rounded-xl w-full p-2"
                  />
                </div>
                <div className="flex justify-center">
                  <button
                    className="block bg-secondary text-white rounded-xl py-2 px-3 w-full cursor-pointer hover:bg-primary hover:text-black hover:font-bold hover:border-primary focus:bg-primary focus:font-bold"
                    onClick={removeBtnClickHandler}
                  >
                    解除共用
                  </button>
                </div>
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </div>
      </>
    );
  }, [activeShareBook, removeBtnClickHandler, shareBtnClickHandler, tabInex]);

  const shareBookInfoContent = (
    <>
      <ul className="py-3">
        <li>
          <span className="font-bold">帳簿名稱：</span>
          {activeInvites?.accountingBookName}
        </li>
        <li>
          <span className="font-bold">邀請人UID：</span>
          {activeInvites?.fromUid}
        </li>
      </ul>
    </>
  );

  const settingThisNameContent = (
    <>
      <ul className="mb-4">
        <li>
          <span className="block font-bold mb-2">在帳簿中使用的稱呼：</span>
          <input
            type="text"
            name="accountBookThisName"
            id="accountBookThisName"
            placeholder="在帳簿中會以此暱稱顯示記帳資料"
            className="block border border-primary p-2 rounded-xl w-full"
            value={accountBookThisName}
            onChange={(e) => setAccountBookThisName(e.target.value)}
          />
        </li>
      </ul>
      {/* <p className="text-secondary">
        提示：接受之後，此本帳簿會加入您的帳簿列表，您可以與其他人一起在這本帳簿記帳
      </p> */}
    </>
  );

  const addBookContent = (
    <div>
      <div className="mb-4">
        <label htmlFor="addBookName" className="block mb-2">
          新帳簿名稱
        </label>
        <input
          type="text"
          name="addBookName"
          id="addBookName"
          className="block border border-primary rounded-xl p-3 w-full"
          value={addBookNameInput}
          onChange={(e) => setAddBookNameInput(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label htmlFor="addBookUsername" className="block mb-2">
          在新帳簿內使用的暱稱
        </label>
        <input
          type="text"
          name="addBookUsername"
          id="addBookUsername"
          className="block border border-primary rounded-xl p-3 w-full"
          value={addBookUsernameInput}
          onChange={(e) => setAddBookUsernameInput(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label htmlFor="addBookDescription" className="block mb-2">
          新帳簿描述
        </label>
        <textarea
          name="addBookDescription"
          id="addBookDescription"
          className="border border-primary rounded-xl w-full p-2"
          rows={5}
          value={addBookDescriptionInput}
          onChange={(e) => setAddBookDescription(e.target.value)}
        ></textarea>
      </div>
      <div className="flex justify-end">
        <button
          onClick={() => setAddBookOpen(false)}
          className="block border py-3 px-5 rounded-xl me-3 cursor-pointer hover:bg-primary hover:text-white hover:font-bold focus:bg-primary focus:font-bold"
        >
          取消
        </button>
        <button
          className="block border py-3 px-5 rounded-xl bg-secondary text-white cursor-pointer hover:bg-primary hover:text-black hover:font-bold hover:border-primary focus:bg-primary focus:font-bold"
          onClick={addBookClickHandler}
        >
          新增
        </button>
      </div>
    </div>
  );

  const removeConfirmContent = <></>;

  const removeAllRecordContent = <></>;
  //---template---

  return (
    <main className="flex flex-col items-center p-6 lg:h-[calc(100vh-100px)] mb-25 lg:mb-0 overflow-hidden">
      <div className="container grow flex flex-col h-full">
        <div className="mb-3">
          <button
            type="button"
            onClick={() => setAddBookOpen(true)}
            className="block border border-primary rounded-xl p-3 overflow-hidden min-w-[120px] min-h-[58px] cursor-pointer hover:bg-primary hover:text-bold focus:bg-primary hover:text-bold"
          >
            新增帳簿
          </button>
        </div>
        <div className="max-h-2/3 min-h-35 md:min-h-28 overflow-auto flex justify-center rounded-xl bg-light mb-4">
          <table className="w-full lg:w-4/5 border-collapse rounded-xl">
            <colgroup>
              <col />
              <col className="" />
              <col className="" />
              <col className="" />
              <col />
            </colgroup>
            <thead>
              <tr>
                <th
                  scope="col"
                  className="border-b-3 border-primary p-3 text-lg"
                ></th>
                <th
                  scope="col"
                  className="border-b-3 border-primary p-3 text-lg"
                >
                  帳簿名稱
                </th>
                <th
                  scope="col"
                  className="border-b-3 border-primary p-3 text-lg"
                >
                  共用設定
                </th>
                <th
                  scope="col"
                  className="border-b-3 border-primary p-3 text-lg"
                >
                  帳簿編輯
                </th>
                <th
                  scope="col"
                  className="border-b-3 border-primary p-3 text-lg"
                >
                  前往記帳
                </th>
              </tr>
            </thead>
            <tbody>{accountBookList}</tbody>
          </table>
        </div>
        <div
          className={`max-h-1/4 min-h-35 md:min-h-28 overflow-auto flex justify-center rounded-xl bg-light`}
        >
          <table className="w-full lg:w-4/5 border-collapse rounded-xl">
            <colgroup>
              <col />
              <col className="w-15 md:w-40" />
              <col className="w-15 md:w-40" />
            </colgroup>
            <thead>
              <tr>
                <th
                  scope="col"
                  className="border-b-3 border-primary p-3 text-lg"
                >
                  邀情您共用的帳簿
                </th>
                <th
                  scope="col"
                  className="border-b-3 border-primary p-3 text-lg"
                >
                  帳簿資訊
                </th>
                <th
                  scope="col"
                  className="border-b-3 border-primary p-3 text-lg"
                >
                  接受邀請
                </th>
              </tr>
            </thead>
            <tbody>
              {invitesData.map((invites) => {
                return invites.status === "pending" ? (
                  <tr key={invites.accountingBookId}>
                    <td
                      scope="row"
                      className="text-center border-b border-primary p-2"
                    >
                      {invites.accountingBookName}
                    </td>
                    <td className="border-b border-primary p-2 text-center">
                      <button
                        className="p-2 border bg-secondary text-white rounded-xl cursor-pointer"
                        onClick={() => {
                          setActiveInvites(invites);
                          setShareBookInfoIsOpen(true);
                        }}
                      >
                        詳細資訊
                      </button>
                    </td>
                    <td className="border-b border-primary p-2 text-center">
                      <button
                        className="p-2 border bg-secondary text-white rounded-xl cursor-pointer"
                        data-inviteid={invites.invitesId}
                        data-accountingbookid={invites.accountingBookId}
                        onClick={(event) => {
                          setActiveInvites(invites);
                          acceptInvitationClickHandler(event);
                        }}
                      >
                        接受邀請
                      </button>
                    </td>
                  </tr>
                ) : (
                  <></>
                );
              })}
            </tbody>
          </table>
        </div>
        <MessageModalDialog
          isOpen={addBookOpen}
          setIsOpen={setAddBookOpen}
          // setParentIsOpen={setIsOpen}
          title="新增帳簿"
          content={addBookContent}
        ></MessageModalDialog>
        {}
        <MessageModalDialog
          isOpen={shareDialogIsOpen}
          setIsOpen={setShareDialogIsOpen}
          title="邀請 / 解除共用"
          content={shareDialogContent}
          onCloseHandler={() => {
            setShareDialogIsOpen(false);
            setActiveShareBook(null);
          }}
        ></MessageModalDialog>
        <MessageModalDialog
          isOpen={editDialogIsOpen}
          setIsOpen={setEditDialogIsOpen}
          title="編輯帳簿"
          content={editDialogContent}
          withConfirmBtn={true}
          confirmBtnHandler={editDialogClickHandler}
          onCloseHandler={() => {
            setEditDialogIsOpen(false);
            setActiveEditBook(null);
          }}
        ></MessageModalDialog>
        <MessageModalDialog
          isOpen={shareBookInfoIsOpen}
          setIsOpen={setShareBookInfoIsOpen}
          title="帳簿資訊"
          content={shareBookInfoContent}
        ></MessageModalDialog>
        <MessageModalDialog
          isOpen={removeConfirmIsOpen}
          setIsOpen={setRemoveConfirmIsOpen}
          title="移除帳簿共用者"
          content={removeConfirmContent}
        ></MessageModalDialog>
        <MessageModalDialog
          isOpen={removeAllRecordIsOpen}
          setIsOpen={setRemoveAllRecordIIsOpen}
          title="移除記帳紀錄"
          content={removeAllRecordContent}
        ></MessageModalDialog>
        <MessageModalDialog
          isOpen={settingThisNameIsOpen}
          setIsOpen={setSettingThisNameIsOpen}
          title="設定帳簿中使用名稱"
          content={settingThisNameContent}
          withConfirmBtn={true}
          withCancelBtn={true}
          confirmBtnHandler={thisNameClickHandler}
        ></MessageModalDialog>
        <MessageModalDialog
          isOpen={alertMessageIsOpen}
          setIsOpen={setAlertMessageIsOpen}
          title=""
          content={
            <div className="min-h-25 flex justify-center items-center">
              {alertMessageContent}
            </div>
          }
        ></MessageModalDialog>
      </div>
    </main>
  );
}
