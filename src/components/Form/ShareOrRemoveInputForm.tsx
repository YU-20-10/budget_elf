"use client";
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from "@headlessui/react";
import { useState } from "react";

type ShareOrRemoveInputType = {
  bookName: string;
  shareEmailInput: string;
  setShareEmailInput: React.Dispatch<React.SetStateAction<string>>;
  shareBtnClickHandler: () => void;
  removeEmailInput: string;
  setRemoveEmailInput: React.Dispatch<React.SetStateAction<string>>;
  removeBtnClickHandler: () => void;
};

export default function ShareOrRemoveInputForm({
  bookName,
  shareEmailInput,
  setShareEmailInput,
  shareBtnClickHandler,
  removeEmailInput,
  setRemoveEmailInput,
  removeBtnClickHandler,
}: ShareOrRemoveInputType) {
  const [tabInex, setTabIndex] = useState<number>(0);
  return (
    <>
      <h2 className="mb-4 text-lg text-black">帳簿名稱：{bookName}</h2>
      <div className="text-black">
        <TabGroup className="" onChange={(index) => setTabIndex(index)}>
          <TabList className="">
            <Tab
              className={`w-1/2 p-2 border-primary cursor-pointer ${
                tabInex === 0
                  ? "border-t border-x rounded-tl-xl rounded-tr-xl"
                  : "border-b"
              }`}
            >
              邀請共用
            </Tab>
            <Tab
              className={`w-1/2 p-2 border-primary cursor-pointer ${
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
                    value={shareEmailInput}
                    onChange={(e) => setShareEmailInput(e.target.value)}
                    className="block border border-primary rounded-xl p-2 grow"
                  />
                </div>
              </div>
              <div className="flex justify-center">
                <button
                  className="block bg-secondary text-white rounded-xl py-2 px-3 w-full cursor-pointer hover:bg-primary hover:text-black hover:font-bold hover:border-primary"
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
                  value={removeEmailInput}
                  onChange={(e) => setRemoveEmailInput(e.target.value)}
                  className="block border border-primary rounded-xl w-full p-2"
                />
              </div>
              <div className="flex justify-center">
                <button
                  className="block bg-secondary text-white rounded-xl py-2 px-3 w-full cursor-pointer hover:bg-primary hover:text-black hover:font-bold hover:border-primary"
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
}
