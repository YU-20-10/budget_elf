"use client";

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { useEffect } from "react";

import { CategoryType, SubCategoryType } from "@/types/CategoryType";
import CategoryList from "@/components/CategoryList";

type CategoryTabProps = {
  categoryDisplay: string;
  selectedMainCategory: string | undefined;
  categoryClickHandler: (event: React.MouseEvent<HTMLButtonElement>) => void;
  selectedTabIndex: number;
  tabChangeHandler: (index: number) => void;
  expenseMainCategory: CategoryType[];
  expenseSubCategory: SubCategoryType;
  incomeMainCategory: CategoryType[];
  incomeSubCategory: SubCategoryType;
  otherMainCategory: CategoryType[];
  otherSubCategory: SubCategoryType;
};

export default function CategoryTab({
  categoryDisplay,
  selectedMainCategory,
  categoryClickHandler,
  selectedTabIndex,
  tabChangeHandler,
  expenseMainCategory,
  expenseSubCategory,
  incomeMainCategory,
  incomeSubCategory,
  otherMainCategory,
  otherSubCategory,
}: CategoryTabProps) {
  useEffect(() => {
    // console.log("categoryDisplay", categoryDisplay);
  }, [categoryDisplay]);

  return (
    <TabGroup selectedIndex={selectedTabIndex} onChange={tabChangeHandler}>
      <TabList className="bg-secondary text-white rounded-lg p-2 mb-3 flex justify-around">
        <Tab className="grow rounded-md data-selected:bg-primary data-selected:text-black">
          支出
        </Tab>
        <Tab className="grow rounded-md data-selected:bg-primary data-selected:text-black">
          收入
        </Tab>
        <Tab className="grow rounded-md data-selected:bg-primary data-selected:text-black">
          其他
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel className="py-3">
          {/* <ul className="grid grid-cols-3 gap-2">
            {(categoryDisplay === "mainCategory"
              ? mainCategory
              : selectedMainCategory && subCategory[selectedMainCategory]
              ? subCategory[selectedMainCategory]
              : []
            )?.map((category: CategoryType) => {
              return (
                <li
                  key={`category+${category.name}`}
                  className="flex justify-center"
                >
                  <button
                    className="flex flex-col items-center text-xs"
                    onClick={categoryClickHandler}
                    {...(categoryDisplay === "mainCategory"
                      ? { "data-main": category.name }
                      : { "data-sub": category.name })}
                  >
                    <Image
                      src={category.icon}
                      width={30}
                      height={30}
                      alt="category icon"
                    ></Image>
                    {category.name}
                  </button>
                </li>
              );
            })}
          </ul> */}
          <CategoryList
            mainCategory={expenseMainCategory}
            subCategory={expenseSubCategory}
            categoryDisplay={categoryDisplay}
            selectedMainCategory={selectedMainCategory}
            categoryClickHandler={categoryClickHandler}
          ></CategoryList>
        </TabPanel>
        <TabPanel>
          <CategoryList
            mainCategory={incomeMainCategory}
            subCategory={incomeSubCategory}
            categoryDisplay={categoryDisplay}
            selectedMainCategory={selectedMainCategory}
            categoryClickHandler={categoryClickHandler}
          ></CategoryList>
        </TabPanel>
        <TabPanel>
          <CategoryList
            mainCategory={otherMainCategory}
            subCategory={otherSubCategory}
            categoryDisplay={categoryDisplay}
            selectedMainCategory={selectedMainCategory}
            categoryClickHandler={categoryClickHandler}
          ></CategoryList>
        </TabPanel>
      </TabPanels>
    </TabGroup>
  );
}
