import { ReactNode } from "react";

export type ComfirmDialogType = {
  comfirmIsOpen: boolean;
  title: string;
  // content: ReactNode;
  confirmBtn?: string;
  confirmBtnHandler: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

export type AlertMessageDialogType = {
  alertIsOpen: boolean;
  content: ReactNode;
};
