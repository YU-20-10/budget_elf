import React from "react";

export type CategoryType = {
  name: string;
  icon: string;
};

export type SubCategoryType = {
  [key: string]: CategoryType[];
};

export type setCategoryDisplayType = React.Dispatch<
  React.SetStateAction<string>
>;

export type setSelectedMainCategoryType = React.Dispatch<
  React.SetStateAction<string | undefined>
>;

export type setSelectedSubCategoryType = React.Dispatch<
  React.SetStateAction<string | undefined>
>;

export type stateSetterType<T> = React.Dispatch<React.SetStateAction<T>>;
