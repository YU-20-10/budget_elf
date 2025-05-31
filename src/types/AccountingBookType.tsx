import { Timestamp } from "firebase/firestore";

export type AccountingBookType = {
  id: string;
  bookName: string;
  bookDescription: string;
  bookOwnerUid: string;
  createTime: Date | undefined;
  displayNames: { [key: string]: string };
};

export type addAccountingBookInputType = {
  bookName: string;
  bookDescription: string;
  bookOwnerUid: string;
  displayNames: { [key: string]: string };
};

export type AccountingRecordType = {
  recorderUid: string;
  categoryType: string;
  mainCategory: string;
  subCategory: string;
  transactionDate: Date | Timestamp | null;
  amount: number;
  paymentRule: string | null;
  description: string | null;
};

export type AccountingRecordWithIdType = AccountingRecordType & { id: string };

export type AccountBookContextType = {
  allAccountBook: AccountingBookType[];
  selectedAccountingBook: AccountingBookType | undefined;
  setSelectedAccountingBook: React.Dispatch<
    React.SetStateAction<AccountingBookType | undefined>
  >;
  selectedBookRecord: AccountingRecordWithIdType[] | undefined;
  setSelectedBookRecord: React.Dispatch<
    React.SetStateAction<AccountingRecordWithIdType[] | undefined>
  >;
};

export type AccountBookRuleMemberType = {
  uid: string;
  role: string;
  sharePermission: boolean;
};

export type AccountBookRuleType = {
  accountingBookId: string;
  bookOwnerUid: string;
  bookMember: AccountBookRuleMemberType[];
};

export type UserAbleAccountBookType = {
  accountingBookId: "string";
};

export type accountBookInvitesType = {
  invitesId: string;
  fromUid: string;
  toUid: string;
  accountingBookId: string;
  accountingBookName: string;
  status: string;
  createTime: Timestamp;
};
