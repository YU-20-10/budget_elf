"useState";
import { Select } from "@headlessui/react";

type YearAndMonthOrDayPickerPropsType = {
  year: number;
  setYear: React.Dispatch<React.SetStateAction<number>>;
  month: number;
  setMonth: React.Dispatch<React.SetStateAction<number>>;
  haveDay?: boolean;
  day?: number;
  setDay?: React.Dispatch<React.SetStateAction<number>>;
  onChange?: (date: Date) => void;
  yearRange?: { start: number; end: number };
};

export default function YearAndMonthOrDayPicker({
  year,
  setYear,
  month,
  setMonth,
  haveDay = false,
  day = 0,
  setDay,
  onChange,
  yearRange = {
    start: new Date().getFullYear() - 5,
    end: new Date().getFullYear() + 5,
  },
}: YearAndMonthOrDayPickerPropsType) {
  const days = Array.from(
    { length: new Date(year, month + 1, 0).getDate() },
    (value, index) => index
  );
  const years = Array.from(
    { length: yearRange.end - yearRange?.start + 1 },
    (value, index) => yearRange.start + index
  );
  const months = Array.from({ length: 12 }, (value, index) => index);
  const changeHandler = (
    selectYear: number,
    selectMonth: number,
    selectDay?: number
  ) => {
    setYear(selectYear);
    setMonth(selectMonth);
    if (selectDay) {
      setDay?.(selectDay ?? 0);
      onChange?.(new Date(selectYear, selectMonth, selectDay));
    } else {
      onChange?.(new Date(selectYear, selectMonth));
    }
  };
  return (
    <div className="flex">
      <Select
        name="selectYear"
        aria-label="selectYear"
        value={year}
        onChange={(e) => changeHandler(parseInt(e.target.value), month, day)}
        className="border border-primary rounded-xl p-1 md:p-3"
      >
        {years.map((year, index) => (
          <option key={`year${year}${index}`} value={year}>
            {year}年
          </option>
        ))}
      </Select>
      <Select
        name="selectMonth"
        aria-label="selectMonth"
        value={month}
        onChange={(e) => changeHandler(year, parseInt(e.target.value), day)}
        className="border border-primary rounded-xl px-1 py-3 md:p-3 ms-1 md:ms-2"
      >
        {months.map((month, index) => (
          <option key={`month${month}${index}`} value={month}>
            {month + 1}月
          </option>
        ))}
      </Select>
      {haveDay ? (
        <Select
          name="selectDay"
          aria-label="selectDay"
          value={day}
          onChange={(e) => changeHandler(year, month, parseInt(e.target.value))}
          className="border border-primary rounded-xl px-1 py-3 md:p-3 ms-1 md:ms-2"
        >
          {days.map((day, index) => (
            <option key={`day${day}${index}`} value={day + 1}>
              {day + 1}日
            </option>
          ))}
        </Select>
      ) : (
        // <select
        //   name="selectDay"
        //   id="selectDay"
        //   value={day}
        //   onChange={(e) => changeHandler(year, month, parseInt(e.target.value))}
        // >
        // {days.map((day, index) => (
        //   <option key={`day${day}${index}`} value={day + 1}>
        //     {day + 1}日
        //   </option>
        // ))}
        // </select>
        <></>
      )}
    </div>
  );
}
