"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { bg } from "date-fns/locale";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import {
  DayButton,
  type MonthCaptionProps,
  useDayPicker,
} from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SlotDay = {
  date: string;
  availableTimes: string[];
};

type Props = {
  days: SlotDay[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  className?: string;
};

function parseDateKey(value: string) {
  return new Date(`${value}T12:00:00`);
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getInitialMonth(days: SlotDay[], selectedDate: string) {
  if (selectedDate) return parseDateKey(selectedDate);
  const firstAvailable = days.find((day) => day.availableTimes.length > 0);
  return firstAvailable ? parseDateKey(firstAvailable.date) : new Date();
}

function SlotCalendarMonthCaption({
  calendarMonth,
  className,
  ...props
}: MonthCaptionProps) {
  const {
    previousMonth,
    nextMonth,
    goToMonth,
    labels: { labelPrevious, labelNext },
  } = useDayPicker();

  const monthLabel = calendarMonth.date.toLocaleDateString("bg-BG", {
    month: "long",
  });
  const yearLabel = calendarMonth.date.getFullYear();

  return (
    <div
      className={cn(
        "mb-4 grid w-full grid-cols-[2.25rem_1fr_2.25rem] items-center gap-3 px-0 text-base font-semibold text-foreground",
        className,
      )}
      {...props}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-9 justify-self-start rounded-full text-foreground hover:bg-muted"
        onClick={() => previousMonth && goToMonth(previousMonth)}
        disabled={!previousMonth}
        aria-label={labelPrevious(previousMonth)}
      >
        <ChevronLeftIcon className="size-4" />
      </Button>
      <span className="text-center capitalize">{monthLabel} {yearLabel}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-9 justify-self-end rounded-full text-foreground hover:bg-muted"
        onClick={() => nextMonth && goToMonth(nextMonth)}
        disabled={!nextMonth}
        aria-label={labelNext(nextMonth)}
      >
        <ChevronRightIcon className="size-4" />
      </Button>
    </div>
  );
}

function SlotCalendarDayButton({
  availableDates,
  day,
  modifiers,
  className,
  ...props
}: React.ComponentProps<typeof DayButton> & { availableDates: Set<string> }) {
  const isSelected = modifiers.selected;
  const isToday = modifiers.today;
  const isDisabled = modifiers.disabled;
  const isAvailable = availableDates.has(toDateKey(day.date));
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <button
      ref={ref}
      type="button"
      disabled={isDisabled}
      className={cn(
        "relative flex aspect-square w-full max-w-11 flex-col items-center justify-center rounded-full text-sm font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        isDisabled && "cursor-default text-muted-foreground/35",
        !isDisabled &&
          !isSelected &&
          isAvailable &&
          "bg-accent/80 text-accent-foreground hover:scale-110 hover:bg-accent hover:shadow-[0_8px_20px_-10px] hover:shadow-accent/50 active:scale-95",
        !isDisabled && !isAvailable && "text-muted-foreground/35",
        isSelected &&
          "bg-primary text-primary-foreground shadow-[0_8px_20px_-10px] shadow-primary/40 hover:scale-105 hover:bg-primary/90 hover:shadow-[0_10px_24px_-10px] hover:shadow-primary/50 active:scale-95",
        className,
      )}
      {...props}
    >
      <span>{day.date.getDate()}</span>
      {isToday && !isSelected ? (
        <span
          className="absolute bottom-1.5 size-1 rounded-full bg-primary"
          aria-hidden
        />
      ) : null}
    </button>
  );
}

export function ConsultationSlotCalendar({
  days,
  selectedDate,
  onSelectDate,
  className,
}: Props) {
  const availableDates = useMemo(
    () =>
      new Set(
        days
          .filter((day) => day.availableTimes.length > 0)
          .map((day) => day.date),
      ),
    [days],
  );

  const [month, setMonth] = useState(() => getInitialMonth(days, selectedDate));

  useEffect(() => {
    if (selectedDate) {
      setMonth(parseDateKey(selectedDate));
    }
  }, [selectedDate]);

  useEffect(() => {
    if (!selectedDate && days.length > 0) {
      setMonth(getInitialMonth(days, selectedDate));
    }
  }, [days, selectedDate]);

  const selected = selectedDate ? parseDateKey(selectedDate) : undefined;

  return (
    <div className={cn("w-full space-y-6", className)}>
      <h3 className="font-heading text-2xl font-bold tracking-tight text-foreground">
        Изберете ден и час
      </h3>
      <Calendar
        mode="single"
        locale={bg}
        weekStartsOn={1}
        month={month}
        onMonthChange={setMonth}
        selected={selected}
        onSelect={(date) => {
          if (!date) return;
          const key = toDateKey(date);
          if (availableDates.has(key)) onSelectDate(key);
        }}
        disabled={(date) => !availableDates.has(toDateKey(date))}
        hideNavigation
        showOutsideDays={false}
        className="w-full! bg-transparent p-0 [--cell-size:3rem]"
        classNames={{
          root: "w-full!",
          months: "relative w-full!",
          month: "w-full! gap-6",
          month_caption: "w-full",
          month_grid:
            "w-full! block border-collapse [&_tbody]:block [&_tbody]:w-full [&_thead]:block [&_thead]:w-full",
          caption_label: "text-base font-semibold capitalize text-foreground",
          weekdays: "mb-4 flex w-full gap-2",
          weekday:
            "flex flex-1 basis-0 text-center text-xs font-medium text-muted-foreground",
          weeks: "block w-full",
          week: "mt-3 flex w-full gap-2 first:mt-0",
          day: "flex flex-1 basis-0 items-center justify-center p-0.5",
          today: "bg-transparent",
          disabled: "opacity-100",
          outside: "invisible",
        }}
        formatters={{
          formatCaption: (date) =>
            date.toLocaleDateString("bg-BG", {
              month: "long",
              year: "numeric",
            }),
          formatWeekdayName: (date) => {
            const label = date
              .toLocaleDateString("bg-BG", { weekday: "short" })
              .replace(".", "");
            return label.charAt(0).toUpperCase() + label.slice(1);
          },
        }}
        components={{
          MonthCaption: (props) => <SlotCalendarMonthCaption {...props} />,
          DayButton: (props) => (
            <SlotCalendarDayButton availableDates={availableDates} {...props} />
          ),
        }}
      />
    </div>
  );
}
