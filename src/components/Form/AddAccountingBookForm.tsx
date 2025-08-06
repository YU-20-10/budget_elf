"use client";
import { AddAccountingBookFormType } from "@/types/AccountingBookType";

type AddAccountingBookFormProps = {
  formInput: AddAccountingBookFormType;
  // setFormInput: React.Dispatch<React.SetStateAction<AddAccountingBookFormType>>;
  fromInputChangeHandler: (event: React.ChangeEvent<HTMLInputElement>) => void;
  textareaChangeHandler: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

export default function AddAccountingBookForm({
  formInput,
  fromInputChangeHandler,
  textareaChangeHandler,
}: AddAccountingBookFormProps) {
  const { addBookName, addBookDescription, addBookUsername } = formInput;
  return (
    <div className="text-black">
      <div className="mb-4">
        <label htmlFor="addBookName" className="block mb-2">
          新帳簿名稱
        </label>
        <input
          type="text"
          name="addBookName"
          id="addBookName"
          className="block border border-primary rounded-xl p-3 w-full"
          value={addBookName}
          onChange={fromInputChangeHandler}
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
          value={addBookUsername}
          onChange={fromInputChangeHandler}
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
          value={addBookDescription}
          onChange={textareaChangeHandler}
        ></textarea>
      </div>
    </div>
  );
}
