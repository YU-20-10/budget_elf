"use client";

import Image from "next/image";
import { CategoryType, SubCategoryType } from "@/types/CategoryType";

type CategoryListProps = {
  mainCategory: CategoryType[];
  subCategory: SubCategoryType;
  categoryDisplay: string;
  selectedMainCategory: string | undefined;
  categoryClickHandler: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

export default function CategoryList({
  mainCategory,
  subCategory,
  categoryDisplay,
  selectedMainCategory,
  categoryClickHandler,
}: CategoryListProps) {
  const displayData =
    categoryDisplay === "mainCategory"
      ? mainCategory
      : selectedMainCategory && subCategory[selectedMainCategory]
      ? subCategory[selectedMainCategory]
      : [];
  return (
    <ul className="grid grid-cols-3 gap-2">
      {Array.isArray(displayData) &&
        displayData.map((category: CategoryType) => {
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
    </ul>
  );
}
