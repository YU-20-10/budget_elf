"use client";

import React, {
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useRouter } from "next/navigation";

import useAuth from "@/hooks/useAuth";
import useAccountBook from "@/hooks/useAccountBook";
import MessageModalDialog from "@/components/Dialogs/MessageModalDialog";
import ComfirmDialog from "@/components/Dialogs/ComfirmDialog";
import AlertMessageDialog from "@/components/Dialogs/AlertMessageDialog";
import AddAccountingBookForm from "@/components/Form/AddAccountingBookForm";
import ShareOrRemoveInputForm from "@/components/Form/ShareOrRemoveInputForm";
import AccountingBookList from "@/components/AccountingBookList";
import {
  AccountingBookType,
  accountBookInvitesType,
  AccountBookRuleType,
  AddAccountingBookFormType,
} from "@/types/AccountingBookType";
import { AlertMessageDialogType, ComfirmDialogType } from "@/types/DialogType";
import {
  addAccountBook,
  delAllAccountBook,
  updateAccountBookDisplayName,
  delAllAccountingRecord,
} from "@/lib/firebase/repository/accountingBooksRepository";
import {
  setAccountBookRule,
  getAccountBookRule,
  updateAccountBookRuleAddBookMember,
  updateAccountBookRuleRemoveMember,
  delAccountBookRule,
} from "@/lib/firebase/repository/accountBookRuleRepository";
import {
  addAccountBookInvites,
  updateAccountBookInvites,
  getAccountBookInvites,
  delAccountBookInvites,
} from "@/lib/firebase/repository/accountBookInvitesRepository";
import {
  setUserAbleAccountBook,
  delUserAbleAccountBook,
} from "@/lib/firebase/repository/userAbleAccountBooksRepository";
import {
  updateAccountBookRemoval,
  addAccountBookRemoval,
} from "@/lib/firebase/repository/accountBookRemovalsRepository";
import { delAllAccountBookInvitesAndAddRemoveal } from "@/lib/firebase/service/accountingBookRemovalService";
import userSearchAndValidate from "@/lib/userSearchAndValidate";

export default function AccountingBook() {
  const router = useRouter();
  const { user, name, invitesData, removalDate } = useAuth();
  const { allAccountBook, selectedAccountingBook, setSelectedAccountingBook } =
    useAccountBook();
  const accountBookThisNameRef = useRef<string | undefined>("");
  const accountBookInputRef = useRef<AddAccountingBookFormType>({
    addBookName: "",
    addBookDescription: "",
    addBookUsername: "",
  });

  //---useState---

  // 元件控制用
  const [shareDialogIsOpen, setShareDialogIsOpen] = useState<boolean>(false);
  const [alertDialog, setAlertDialog] = useState<AlertMessageDialogType>({
    alertIsOpen: false,
    content: <></>,
  });
  const [parentComfirmDialog, setParentComfirmDialog] =
    useState<ComfirmDialogType>({
      comfirmIsOpen: false,
      title: "",
      confirmBtnHandler: () => {},
    });
  const [childComfirmDialog, setChildComfirmDialog] = useState<
    ComfirmDialogType & { content: ReactNode }
  >({
    comfirmIsOpen: false,
    title: "",
    content: <></>,
    confirmBtnHandler: () => {},
  });

  // 資料顯示用
  const [accountBookList, setAccountBookList] = useState<ReactNode>(<></>);
  const [redirectLoading, setRedirectLoading] = useState<"hidden" | "block">(
    "hidden"
  );
  const [otherUserId, setOtherUserId] = useState<string | undefined>(undefined);
  const [dialogType, setDialogType] = useState<
    "add" | "edit" | "remove" | "accepted" | "info" | "delete" | "none"
  >("none");

  // 取得使用者互動資料用
  const [activeShareBook, setActiveShareBook] =
    useState<AccountingBookType | null>(null);
  const [activeEditBook, setActiveEditBook] =
    useState<AccountingBookType | null>(null);
  const [activeInvites, setActiveInvites] = useState<
    accountBookInvitesType | undefined
  >(undefined);

  // 表單輸入儲存用
  const [addBookFormInput, setAddBookFormInput] =
    useState<AddAccountingBookFormType>({
      addBookName: "",
      addBookDescription: "",
      addBookUsername: "",
    });
  const [shareEmailInput, setShareEmailInput] = useState<string>("");
  const [removeEmailInput, setRemoveEmailInput] = useState<string>("");
  const [accountBookThisName, setAccountBookThisName] = useState<
    string | undefined
  >(name);
  const [usingUserName, setUsingUserName] = useState<string | undefined>(name);

  //---useState---

  //---function---
  
  function getParentDialogContet() {
    if (dialogType === "add") {
      return (
        <AddAccountingBookForm
          formInput={addBookFormInput}
          fromInputChangeHandler={(
            event: React.ChangeEvent<HTMLInputElement>
          ) => {
            const { name, value } = event.target;
            const key = name as keyof AddAccountingBookFormType;
            if (key in accountBookInputRef.current) {
              accountBookInputRef.current = {
                ...accountBookInputRef.current,
                [key]: value,
              };
            }
            setAddBookFormInput((prev) => ({
              ...prev,
              [key]: value,
            }));
          }}
          textareaChangeHandler={(
            event: React.ChangeEvent<HTMLTextAreaElement>
          ) => {
            accountBookInputRef.current = {
              ...accountBookInputRef.current,
              addBookDescription: event.target.value,
            };
            setAddBookFormInput((prev) => ({
              ...prev,
              addBookDescription: event.target.value,
            }));
          }}
        ></AddAccountingBookForm>
      );
    } else if (dialogType === "remove") {
      if (activeShareBook?.id && otherUserId) {
        return (
          <div>
            <p className="mb-6 text-lg">
              是否確認將
              {activeShareBook?.displayNames?.[otherUserId]
                ? activeShareBook.displayNames?.[otherUserId]
                : otherUserId}{" "}
              從 {activeShareBook?.bookName} 當中移除?
            </p>
          </div>
        );
      }
    } else if (dialogType === "edit") {
      return (
        <>
          <ul>
            <li className="mb-3 text-black">
              <span className="block font-bold mb-2">帳簿名稱：</span>
              <p>{activeEditBook?.bookName}</p>
            </li>
            <li className="text-black">
              <span className="block font-bold mb-2">在帳簿中使用的稱呼：</span>
              <input
                type="text"
                name="accountBookThisName"
                id="accountBookThisName"
                placeholder="在帳簿中會以此暱稱顯示記帳資料"
                className="block border border-primary p-2 rounded-xl w-full"
                value={accountBookThisName}
                onChange={(e) => {
                  setAccountBookThisName(e.target.value);
                  accountBookThisNameRef.current = e.target.value;
                }}
              />
            </li>
          </ul>
        </>
      );
    } else if (dialogType === "accepted") {
      return (
        <>
          <ul className="mb-4 ">
            <li>
              <span className="block font-bold mb-2">在帳簿中使用的稱呼：</span>
              <input
                type="text"
                name="accountBookThisName"
                id="accountBookThisName"
                placeholder="在帳簿中會以此暱稱顯示記帳資料"
                className="block border border-primary p-2 rounded-xl w-full"
                value={accountBookThisName}
                onChange={(e) => {
                  setAccountBookThisName(e.target.value);
                  accountBookThisNameRef.current = e.target.value;
                }}
              />
            </li>
          </ul>
        </>
      );
    } else if (dialogType === "info") {
      return (
        <>
          <ul className="py-3 text-black">
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
    } else if (dialogType === "delete") {
      return (
        <div>
          <p className="mb-6 text-lg">
            是否確認刪除
            <span className="font-bold">
              {selectedAccountingBook?.bookName}
            </span>
            ?
          </p>
        </div>
      );
    } else {
      return <></>;
    }
  }

  function addBookBtnClickHandler() {
    setDialogType("add");
    setParentComfirmDialog({
      comfirmIsOpen: true,
      title: "新增帳簿",
      confirmBtn: "新增",
      confirmBtnHandler: addBookClickHandler,
    });
  }

  const addBookClickHandler = useCallback(async () => {
    const { addBookName, addBookUsername, addBookDescription } =
      accountBookInputRef.current;
    if (!addBookName || !user?.uid) {
      setAlertDialog({
        alertIsOpen: true,
        content: <p className="text-lg">資料未填寫完整</p>,
      });
      return;
    }
    const addAccountingBookInput = {
      bookName: addBookName,
      bookDescription: addBookDescription,
      bookOwnerUid: user?.uid,
      displayNames: {
        [user?.uid]: addBookUsername
          ? addBookUsername
          : usingUserName
          ? usingUserName
          : "",
      },
    };
    try {
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
      await setAccountBookRule(doc.id, setAccountBookRuleInput);
      setChildComfirmDialog({
        comfirmIsOpen: true,
        title: "",
        content: <p className="text-lg">新增成功</p>,
        confirmBtnHandler: () => {
          setChildComfirmDialog((prev) => ({ ...prev, comfirmIsOpen: false }));
          setParentComfirmDialog((prev) => ({ ...prev, comfirmIsOpen: false }));
          setDialogType("none");
          setAddBookFormInput({
            addBookName: "",
            addBookDescription: "",
            addBookUsername: "",
          });
          accountBookInputRef.current = {
            addBookName: "",
            addBookDescription: "",
            addBookUsername: "",
          };
        },
      });
    } catch (error) {
      console.log("addBookClickHandler", error);
      setAlertDialog((prev) => ({
        ...prev,
        alertIsOpen: true,
        content: <p className="text-lg">似乎出了一點錯誤，請稍候再試一次</p>,
      }));
    }
  }, [user?.uid, usingUserName]);

  const shareEmailCheck = useCallback(async () => {
    const userEmail = user?.email;
    try {
      const searchOtherUserId = await userSearchAndValidate(
        "share",
        userEmail,
        shareEmailInput
      );
      if (searchOtherUserId.ok === false) {
        setAlertDialog((prev) => ({
          ...prev,
          alertIsOpen: true,
          content: <p className="text-lg">{searchOtherUserId.message}</p>,
        }));
        return;
      } else {
        return searchOtherUserId.id;
      }
    } catch (error) {
      console.log("shareEmailCheck", error);
      setAlertDialog((prev) => ({
        ...prev,
        alertIsOpen: true,
        content: <p className="text-lg">似乎出了一點錯誤，請稍候再試一次</p>,
      }));
    }
  }, [user?.email, shareEmailInput]);

  const shareBtnClickHandler = useCallback(async () => {
    try {
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
          setAlertDialog((prev) => ({
            ...prev,
            alertIsOpen: true,
            content: <p className="text-lg">邀請成功</p>,
          }));
        } else {
          setAlertDialog((prev) => ({
            ...prev,
            alertIsOpen: true,
            content: (
              <p className="text-lg">出了一點問題，邀請失敗，請稍後再試</p>
            ),
          }));
        }
      }
    } catch (error) {
      console.log("shareBtnClickHandler", error);
      setAlertDialog((prev) => ({
        ...prev,
        alertIsOpen: true,
        content: <p className="text-lg">出了一點問題，邀請失敗，請稍後再試</p>,
      }));
    }
  }, [activeShareBook, user?.uid, shareEmailCheck]);

  const removeEamilCheck = useCallback(async () => {
    const userEmail = user?.email;
    try {
      const searchOtherUserId = await userSearchAndValidate(
        "remove",
        userEmail,
        removeEmailInput
      );
      if (searchOtherUserId.ok === false) {
        setAlertDialog((prev) => ({
          ...prev,
          alertIsOpen: true,
          content: <p className="text-lg">{searchOtherUserId.message}</p>,
        }));
        return;
      } else {
        return searchOtherUserId.id;
      }
    } catch (error) {
      console.log("removeEamilCheck", error);
      setAlertDialog((prev) => ({
        ...prev,
        alertIsOpen: true,
        content: <p className="text-lg">似乎出了一點錯誤，請稍候再試一次</p>,
      }));
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
      try {
        const invitesDataArr = await getAccountBookInvites(
          accountBookId,
          uid,
          delMemberUid
        );
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

        if (
          delInvitesResults["success"].length === invitesDataArr.length &&
          ruleRemoveMemberResult &&
          addRemovalResult
        ) {
          setChildComfirmDialog({
            comfirmIsOpen: true,
            title: "",
            content: <p className="text-lg">已成功將共用者移除</p>,
            confirmBtnHandler: () => {
              setParentComfirmDialog((prev) => ({
                ...prev,
                comfirmIsOpen: false,
              }));
              setChildComfirmDialog((prev) => ({
                ...prev,
                comfirmIsOpen: false,
              }));
              setDialogType("none");
            },
          });
          setShareDialogIsOpen(false);
          return;
        } else {
          setAlertDialog((prev) => ({
            ...prev,
            alertIsOpen: true,
            content: <p className="text-lg">出了一點小錯誤</p>,
          }));
          return;
        }
      } catch (error) {
        console.log("confirmTodelBtnClickHandler", error);
        setAlertDialog((prev) => ({
          ...prev,
          alertIsOpen: true,
          content: <p className="text-lg">出了一點小錯誤</p>,
        }));
      }
    },
    [user?.uid]
  );

  const removeBtnClickHandler = useCallback(async () => {
    const otherUserId = await removeEamilCheck();
    if (!otherUserId || !activeShareBook) return;
    const bookRule: AccountBookRuleType | false = await getAccountBookRule(
      activeShareBook.id
    );
    if (bookRule === false) return;
    const isUserExist = bookRule.bookMember.find(
      (member) => member.uid === otherUserId
    );
    if (!isUserExist) {
      setAlertDialog((prev) => ({
        ...prev,
        alertIsOpen: true,
        content: <p className="text-lg">該使用者並未共用此本帳簿</p>,
      }));
      return;
    } else {
      setOtherUserId(otherUserId);
      setDialogType("remove");
      setParentComfirmDialog({
        comfirmIsOpen: true,
        title: "解除共用確認",
        confirmBtnHandler: () =>
          confirmTodelBtnClickHandler(
            activeShareBook.id,
            activeShareBook.bookName,
            otherUserId
          ),
      });
    }
  }, [activeShareBook, removeEamilCheck, confirmTodelBtnClickHandler]);

  const editDialogClickHandler = useCallback(
    async (book: AccountingBookType) => {
      const thisName = accountBookThisNameRef.current;
      if (!thisName) {
        setAlertDialog((prev) => ({
          ...prev,
          alertIsOpen: true,
          content: <p className="text-lg">尚未輸入帳簿中要使用的稱呼</p>,
        }));
        return;
      }
      try {
        if (user?.uid && book?.id) {
          const updateAccountBookDisplayNameResult =
            await updateAccountBookDisplayName(
              book?.id,
              user?.uid,
              thisName ?? ""
            );

          if (updateAccountBookDisplayNameResult) {
            setChildComfirmDialog({
              comfirmIsOpen: true,
              title: "",
              content: <p className="text-lg">已成功設定帳簿內的顯示名稱</p>,
              confirmBtnHandler: () => {
                setParentComfirmDialog((prev) => ({
                  ...prev,
                  comfirmIsOpen: false,
                }));
                setChildComfirmDialog((prev) => ({
                  ...prev,
                  comfirmIsOpen: false,
                }));
                setDialogType("none");
              },
            });
            accountBookThisNameRef.current = undefined;
          } else {
            setAlertDialog((prev) => ({
              ...prev,
              alertIsOpen: true,
              content: (
                <p className="text-lg">似乎出了一點錯誤，請稍候再試一次</p>
              ),
            }));
          }
        }
      } catch (error) {
        console.log("editDialogClickHandler", error);
        setAlertDialog((prev) => ({
          ...prev,
          alertIsOpen: true,
          content: <p className="text-lg">似乎出了一點錯誤，請稍候再試一次</p>,
        }));
      }
    },
    [user?.uid, accountBookThisNameRef]
  );

  const editBookBtnClickHandler = useCallback(
    (book: AccountingBookType) => {
      setActiveEditBook(book);
      setDialogType("edit");
      setParentComfirmDialog({
        comfirmIsOpen: true,
        title: "編輯帳簿",
        confirmBtnHandler: () => editDialogClickHandler(book),
      });
    },
    [editDialogClickHandler]
  );

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
        setAlertDialog((prev) => ({
          ...prev,
          alertIsOpen: true,
          content: <p className="text-lg">已接受邀請</p>,
        }));
        setDialogType("accepted");
        setParentComfirmDialog({
          comfirmIsOpen: true,
          title: "設定帳簿中使用名稱",
          confirmBtnHandler: () => thisNameClickHandler(accountingBookId),
        });
      } else {
        setAlertDialog((prev) => ({
          ...prev,
          alertIsOpen: true,
          content: <p className="text-lg">似乎出了一點錯誤，請稍候再試一次</p>,
        }));
      }
    }
  }

  async function thisNameClickHandler(accountingBookId: string) {
    const thisName = accountBookThisNameRef.current;
    if (!thisName) {
      setAlertDialog((prev) => ({
        ...prev,
        alertIsOpen: true,
        content: <p className="text-lg">尚未輸入帳簿中要使用的稱呼</p>,
      }));
      return;
    }
    try {
      if (accountingBookId && user?.uid) {
        const updateAccountBookDisplayNameResult =
          await updateAccountBookDisplayName(
            accountingBookId,
            user?.uid,
            thisName ?? ""
          );
        if (updateAccountBookDisplayNameResult) {
          setChildComfirmDialog({
            comfirmIsOpen: true,
            title: "",
            content: <p className="text-lg">已成功設定帳簿內的顯示名稱~</p>,
            confirmBtnHandler: () => {
              setParentComfirmDialog((prev) => ({
                ...prev,
                comfirmIsOpen: false,
              }));
              setChildComfirmDialog((prev) => ({
                ...prev,
                comfirmIsOpen: false,
              }));
            },
          });
          accountBookThisNameRef.current = undefined;
          setDialogType("none");
        } else {
          setAlertDialog((prev) => ({
            ...prev,
            alertIsOpen: true,
            content: (
              <p className="text-lg">似乎出了一點錯誤，請稍候再試一次</p>
            ),
          }));
        }
      }
    } catch (error) {
      console.log("thisNameClickHandler", error);
      setAlertDialog((prev) => ({
        ...prev,
        alertIsOpen: true,
        content: <p className="text-lg">似乎出了一點錯誤，請稍候再試一次</p>,
      }));
    }
  }

  const autoRemoveSharedBook = useCallback(
    async function () {
      const uid = user?.uid;
      if (!uid) return;
      if (removalDate.length === 0) return;
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
        if (results.length === success.length) {
          setAlertDialog((prev) => ({
            ...prev,
            alertIsOpen: true,
            content: (
              <div>
                <p>
                  因為
                  <span className="font-bold">帳簿被刪除</span>
                  或是
                  <span className="font-bold">帳簿擁有者移除了您的權限</span>
                  ，以下帳簿已從您的可讀取帳簿中移除
                </p>
                <ul className="py-3">
                  {removalDate.map((removal) => {
                    return (
                      <li key={removal.removeId} className="mb-3">
                        <span className="font-bold">帳簿名稱：</span>
                        {removal.accountingBookName}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ),
          }));
        }
      } catch (error) {
        console.log("autoRemoveSharedBook", error);
      }
    },
    [removalDate, user?.uid]
  );

  const comfirmDelAccountBook = useCallback(async () => {
    if (!selectedAccountingBook || !user?.uid) return;

    const removerAllMemberResult = await delAllAccountBookInvitesAndAddRemoveal(
      selectedAccountingBook.id,
      selectedAccountingBook.bookName,
      user.uid
    );
    const delAllRecord = await delAllAccountingRecord(
      selectedAccountingBook.id
    );
    const delAccountBookRuleResult = await delAccountBookRule(
      selectedAccountingBook.id
    );
    const delAccountingBookResult = await delAllAccountBook(
      selectedAccountingBook.id
    );

    if (
      removerAllMemberResult &&
      delAllRecord &&
      delAccountBookRuleResult &&
      delAccountingBookResult
    ) {
      setChildComfirmDialog({
        comfirmIsOpen: true,
        title: "",
        content: <p className="text-lg">刪除成功</p>,
        confirmBtnHandler: () => {
          setParentComfirmDialog((prev) => ({ ...prev, comfirmIsOpen: false }));
          setChildComfirmDialog((prev) => ({ ...prev, comfirmIsOpen: false }));
          setDialogType("none");
        },
      });
    } else {
      setAlertDialog((prev) => ({
        ...prev,
        alertIsOpen: true,
        content: <p className="text-lg">出了一點錯誤請稍後再試</p>,
      }));
    }
  }, [selectedAccountingBook, user?.uid]);

  const clickDelAccountBookHandler = useCallback(async () => {
    setDialogType("delete");
    setParentComfirmDialog({
      comfirmIsOpen: true,
      title: "刪除帳簿",
      confirmBtnHandler: comfirmDelAccountBook,
    });
  }, [comfirmDelAccountBook]);

  //---function---

  //---useEffect---
  useEffect(() => {
    if (user?.uid) {
      setAccountBookThisName(
        activeEditBook?.displayNames?.[user?.uid]
          ? activeEditBook?.displayNames?.[user?.uid]
          : name
      );
      accountBookThisNameRef.current = activeEditBook?.displayNames?.[user?.uid]
        ? activeEditBook?.displayNames?.[user?.uid]
        : name;
    }
  }, [name, user?.uid, activeEditBook]);

  useEffect(() => {
    setAccountBookList(
      <AccountingBookList
        setActiveShareBook={setActiveShareBook}
        setShareDialogIsOpen={setShareDialogIsOpen}
        clickDelAccountBookHandler={clickDelAccountBookHandler}
        editBookBtnClickHandler={editBookBtnClickHandler}
        redirectLoading={redirectLoading}
        setRedirectLoading={setRedirectLoading}
      ></AccountingBookList>
    );
  }, [
    allAccountBook,
    user?.uid,
    router,
    setSelectedAccountingBook,
    selectedAccountingBook?.id,
    redirectLoading,
    clickDelAccountBookHandler,
    editBookBtnClickHandler,
  ]);
  useEffect(() => {
    if (removalDate.length === 0) return;
    autoRemoveSharedBook();
  }, [removalDate, autoRemoveSharedBook]);
  useEffect(() => {
    setUsingUserName(name);
  }, [name]);

  //---useEffect---

  //---template---

  const shareDialogContent = useMemo(() => {
    return (
      <ShareOrRemoveInputForm
        bookName={activeShareBook?.bookName ? activeShareBook?.bookName : ""}
        shareEmailInput={shareEmailInput}
        setShareEmailInput={setShareEmailInput}
        shareBtnClickHandler={shareBtnClickHandler}
        removeEmailInput={removeEmailInput}
        setRemoveEmailInput={setRemoveEmailInput}
        removeBtnClickHandler={removeBtnClickHandler}
      ></ShareOrRemoveInputForm>
    );
  }, [
    activeShareBook,
    shareEmailInput,
    shareBtnClickHandler,
    removeEmailInput,
    removeBtnClickHandler,
  ]);

  //---template---

  return (
    <main className="flex flex-col items-center p-6 lg:h-[calc(100vh-100px)] mb-25 lg:mb-0 overflow-hidden text-black">
      <div className="container grow flex flex-col h-full">
        <div className="mb-3">
          <button
            type="button"
            onClick={addBookBtnClickHandler}
            className="block border border-primary rounded-xl p-3 overflow-hidden min-w-[120px] min-h-[58px] cursor-pointer bg-white text-black hover:bg-primary hover:text-bold"
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
                          setDialogType("info");
                          setParentComfirmDialog({
                            comfirmIsOpen: true,
                            title: "帳簿資訊",
                            confirmBtnHandler: () => {
                              setParentComfirmDialog((prev) => ({
                                ...prev,
                                comfirmIsOpen: false,
                              }));
                              setDialogType("none");
                            },
                          });
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
          isOpen={shareDialogIsOpen}
          setIsOpen={setShareDialogIsOpen}
          title="邀請 / 解除共用"
          content={shareDialogContent}
          onCloseHandler={() => {
            setShareDialogIsOpen(false);
            setActiveShareBook(null);
          }}
        ></MessageModalDialog>
        <ComfirmDialog
          comfirmIsOpen={parentComfirmDialog.comfirmIsOpen}
          title={parentComfirmDialog.title}
          confirmBtn={parentComfirmDialog.confirmBtn}
          confirmBtnHandler={parentComfirmDialog.confirmBtnHandler}
          dialogOnClose={() => {
            setParentComfirmDialog((prev) => ({
              ...prev,
              comfirmIsOpen: false,
            }));
            if (dialogType === "edit") {
              setActiveEditBook(null);
            }
          }}
        >
          {getParentDialogContet()}
        </ComfirmDialog>
        <ComfirmDialog
          comfirmIsOpen={childComfirmDialog.comfirmIsOpen}
          title={childComfirmDialog.title}
          confirmBtn={childComfirmDialog.confirmBtn}
          confirmBtnHandler={childComfirmDialog.confirmBtnHandler}
          dialogOnClose={() =>
            setChildComfirmDialog((prev) => ({ ...prev, comfirmIsOpen: false }))
          }
        >
          {childComfirmDialog.content}
        </ComfirmDialog>
        <AlertMessageDialog
          dialogProps={alertDialog}
          dialogOnClose={() =>
            setAlertDialog((prev) => ({ ...prev, alertIsOpen: false }))
          }
        ></AlertMessageDialog>
      </div>
    </main>
  );
}
