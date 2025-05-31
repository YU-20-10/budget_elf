"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react";

import useAuth from "@/hooks/useAuth";
import useAccountBook from "@/hooks/useAccountBook";
import MessageModalDialog from "@/components/Dialogs/MessageModalDialog";
import {
  AccountingBookType,
  accountBookInvitesType,
} from "@/types/AccountingBookType";
import {
  addAccountBookInvites,
  updateAccountBookRuleAddBookMember,
  updateAccountBookInvites,
  setUserAbleAccountBook,
  updateAccountBookDisplayName,
  // setUserAbleAccountBookandUpdateThisName,
} from "@/lib/firebase/firestore";

export default function AccountingBook() {
  const userData = useAuth();
  const { allAccountBook } = useAccountBook();
  const [editDialogIsOpen, setEditDialogIsOpen] = useState<boolean>(false);
  const [shareDialogIsOpen, setSharDialogIsOpen] = useState<boolean>(false);
  const [activeBook, setActiveBook] = useState<AccountingBookType | undefined>(
    undefined
  );
  const [uidInput, setUidInput] = useState<string | undefined>(undefined);
  const [shareBookInfoIsOpen, setShareBookInfoIsOpen] =
    useState<boolean>(false);
  // const [acceptInvitationIsOpen, setAcceptInvitationIsOpen] =
  //   useState<boolean>(false);
  const [activeInvites, setActiveInvites] = useState<
    accountBookInvitesType | undefined
  >(undefined);
  const [accountBookThisName, setAccountBookThisName] = useState<
    string | undefined
  >(userData?.name);
  const [settingThisNameIsOpen, setSettingThisNameIsOpen] =
    useState<boolean>(false);

  async function shareBtnClickHandler() {
    console.log(uidInput);
    const uidRegex = /^[a-zA-Z0-9]{28}$/;
    const id = userData?.user?.uid;
    if (uidInput && id && activeBook?.id) {
      const check = uidRegex.test(uidInput);
      if (!check) {
        alert("uid格式錯誤");
        return;
      }
      if (uidInput === id) {
        alert("邀請共用需要輸入對方的uid");
        return;
      }

      const addInvitesResult = await addAccountBookInvites(
        id,
        uidInput,
        activeBook?.id,
        activeBook?.bookName
      );
      const updareRuleResult = await updateAccountBookRuleAddBookMember(
        activeBook?.id,
        {
          uid: uidInput,
          role: "editor",
          sharePermission: false,
        }
      );
      if (addInvitesResult && updareRuleResult) {
        alert("邀請成功");
        setSharDialogIsOpen(false);
      } else {
        alert("出了一點問題，邀請失敗了");
      }
    }
  }
  useEffect(() => {
    if (userData?.user?.uid) {
      setAccountBookThisName(
        activeBook?.displayNames?.[userData?.user?.uid]
          ? activeBook?.displayNames?.[userData?.user?.uid]
          : userData?.name
      );
    }
  }, [userData?.name, userData?.user?.uid, activeBook]);
  async function editDialogClickHandler() {
    console.log(1);
    if (!accountBookThisName) {
      alert("尚未輸入帳簿中要使用的稱呼");
      return;
    }
    if (userData?.user?.uid && activeBook?.id) {
      const updateAccountBookDisplayNameResult =
        await updateAccountBookDisplayName(
          activeBook?.id,
          userData?.user?.uid,
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
  async function acceptInvitationClickHandler() {
    console.log(activeInvites?.invitesId);
    console.log(userData?.user?.uid);
    if (activeInvites?.invitesId && userData?.user?.uid) {
      await updateAccountBookInvites(activeInvites?.invitesId, "accepted");
      const setUserAbleAccountBookResult = await setUserAbleAccountBook(
        activeInvites.accountingBookId,
        userData?.user?.uid
      );

      if (setUserAbleAccountBookResult) {
        alert("已接受邀請~");
        setSettingThisNameIsOpen(true);
      } else {
        alert("似乎出了一點錯誤....");
      }
    }
  }
  async function thisNameClickHandler() {
    if (!accountBookThisName) {
      alert("尚未輸入帳簿中要使用的稱呼");
      return;
    }
    if (activeInvites?.invitesId && userData?.user?.uid) {
      const updateAccountBookDisplayNameResult =
        await updateAccountBookDisplayName(
          activeInvites.accountingBookId,
          userData?.user?.uid,
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

  const editDialogContent = (
    <>
      <ul>
        <li className="mb-3">
          <span className="block font-bold mb-2">帳簿名稱：</span>
          <p>{activeBook?.bookName}</p>
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

  const shareDialogContent = (
    <>
      <h2 className="mb-4 text-lg">帳簿名稱：{activeBook?.bookName}</h2>
      <div>
        <TabGroup className="border border-primary rounded-xl">
          <TabList className="border-b divide-x p-2 border-primary divide-primary">
            <Tab className="w-1/2">邀請共用</Tab>
            <Tab className="w-1/2">解除共用</Tab>
          </TabList>
          <TabPanels className="p-3">
            <TabPanel>
              <div className="mb-4">
                <label
                  htmlFor="shareToOtherUser"
                  className="flex items-center mb-2"
                >
                  與其他使用者共用帳簿
                  <Popover className="ms-1 flex">
                    <PopoverButton>
                      <Image
                        src="/icon/info_dark_icon.svg"
                        alt="info icon"
                        width={16}
                        height={16}
                      ></Image>
                    </PopoverButton>
                    <PopoverPanel
                      anchor={{ to: "right", gap: 4 }}
                      transition
                      className="inline-block origin-top flex-col transition duration-200 ease-out data-closed:scale-95 data-closed:opacity-0 bg-white border border-primary rounded-lg p-3"
                    >
                      <p className="text-sm">{`可以在設定>使用者設定中找到自己的UID`}</p>
                    </PopoverPanel>
                  </Popover>
                </label>
                <input
                  type="text"
                  name="shareToOtherUser"
                  id="shareToOtherUser"
                  placeholder="其他使用者的UID"
                  onChange={(e) => setUidInput(e.target.value)}
                  className="block border border-primary rounded-xl w-full p-2"
                />
              </div>
              <div className="flex justify-center">
                <button
                  className="block bg-secondary text-white rounded-xl py-2 px-3 w-full"
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
                  刪除帳簿中的其他共用者
                </label>
                <input
                  type="text"
                  name="shareToOtherUser"
                  id="shareToOtherUser"
                  placeholder="其他使用者的UID"
                  className="block border border-primary rounded-xl w-full p-2"
                />
              </div>
              <div className="flex justify-center">
                <button className="block bg-secondary text-white rounded-xl py-2 px-3 w-full">
                  解除共用
                </button>
              </div>
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </>
  );

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

  return (
    <main className="flex flex-col items-center p-6 lg:h-[calc(100vh-100px)] mb-25 lg:mb-0 overflow-hidden">
      <div className="container grow flex flex-col">
        <div className="max-h-1/2 min-h-35 md:min-h-28 lg:max-h-2/3 overflow-auto flex justify-center rounded-xl bg-light mb-4">
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
                  帳簿名稱
                </th>
                <th
                  scope="col"
                  className="border-b-3 border-primary p-3 text-lg"
                >
                  邀請共用
                </th>
                <th
                  scope="col"
                  className="border-b-3 border-primary p-3 text-lg"
                >
                  帳簿編輯
                </th>
              </tr>
            </thead>
            <tbody>
              {allAccountBook.map((book) => {
                return (
                  <tr key={book.id}>
                    <td
                      scope="row"
                      className="text-center border-b border-primary p-2"
                    >
                      {book.bookName}
                    </td>
                    {userData.user?.uid === book.bookOwnerUid ? (
                      <>
                        <td className="border-b border-primary p-2 text-center">
                          <button
                            className="p-2 cursor-pointer"
                            onClick={() => {
                              setActiveBook(book);
                              setSharDialogIsOpen(true);
                            }}
                          >
                            <Image
                              src="/icon/person_add_dark_icon.svg"
                              alt="edit icon"
                              width={24}
                              height={24}
                            ></Image>
                          </button>
                        </td>
                        <td className="border-b border-primary p-2 text-center">
                          <button
                            className="p-2 cursor-pointer"
                            onClick={() => {
                              setActiveBook(book);
                              setEditDialogIsOpen(true);
                            }}
                          >
                            <Image
                              src="/icon/edit_dark_icon.svg"
                              alt="edit icon"
                              width={24}
                              height={24}
                            ></Image>
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="border-b border-primary p-2 text-center">
                          <button className="p-2" disabled>
                            <Image
                              src="/icon/person_add_disabled_dark_icon.svg"
                              alt="edit icon"
                              width={24}
                              height={24}
                            ></Image>
                          </button>
                        </td>
                        <td className="border-b border-primary p-2 text-center">
                          <button
                            className="p-2 cursor-pointer"
                            onClick={() => {
                              setActiveBook(book);
                              setEditDialogIsOpen(true);
                            }}
                          >
                            <Image
                              src="/icon/edit_dark_icon.svg"
                              alt="edit icon"
                              width={24}
                              height={24}
                            ></Image>
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="max-h-1/4 min-h-35 md:min-h-28 overflow-auto flex justify-center rounded-xl bg-light">
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
              {userData?.invitesData.map((invites) => {
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
                        className="p-2 border bg-secondary text-white rounded-xl"
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
                        className="p-2 border bg-secondary text-white rounded-xl"
                        onClick={() => {
                          setActiveInvites(invites);
                          acceptInvitationClickHandler();
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
          setIsOpen={setSharDialogIsOpen}
          title="共用帳簿"
          content={shareDialogContent}
        ></MessageModalDialog>
        <MessageModalDialog
          isOpen={editDialogIsOpen}
          setIsOpen={setEditDialogIsOpen}
          title="編輯帳簿"
          content={editDialogContent}
          withConfirmBtn={true}
          confirmBtnHandler={editDialogClickHandler}
        ></MessageModalDialog>
        <MessageModalDialog
          isOpen={shareBookInfoIsOpen}
          setIsOpen={setShareBookInfoIsOpen}
          title="帳簿資訊"
          content={shareBookInfoContent}
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
      </div>
    </main>
  );
}
