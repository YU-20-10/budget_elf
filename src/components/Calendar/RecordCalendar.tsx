"use client";

import { DayPicker, getDefaultClassNames } from "react-day-picker";

import styles from "@/components/Calendar/RecordCalendar.module.css";
import { getLocalTime } from "@/lib/time";

type CalendarProps = {
  selected: Date;
  setSelected?: React.Dispatch<React.SetStateAction<Date>>;
  dayClickHandler?: (
    date: Date,
    modifiers: Record<string, boolean>,
    e: React.MouseEvent
  ) => void;
  recordedDate: Set<string>;
};

export default function RecordCalendar({
  selected,
  setSelected,
  recordedDate,
  dayClickHandler,
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();
  const modifiers = {
    hasRecord: (date: Date) => recordedDate.has(getLocalTime(date)),
  };
  const modifiersClassNames = {
    hasRecord:
      "relative after:content-[''] after:w-2 after:h-2 after:bg-primary after:rounded-full after:absolute after:bottom-[1px] after:left-1/2 after:-translate-x-1/2",
    selected: "!text-mark",
  };
  return (
    <DayPicker
      animate
      mode="single"
      required={true}
      selected={selected}
      onSelect={setSelected}
      onDayClick={dayClickHandler}
      navLayout="around"
      fixedWeeks
      classNames={{
        // today: `text-secondary`,
        // selected: `!text-red-300`,
        root: `${defaultClassNames.root} ${styles.recordCalendar} p-3`,
        // nav: "flex justify-center",
        months: "flex w-full justify-center",
        month: "w-full",
        month_grid: "w-full",
        day_button: "mx-auto",
        caption_label: "align-top",
      }}
      modifiers={modifiers}
      modifiersClassNames={modifiersClassNames}
    />
  );
}
