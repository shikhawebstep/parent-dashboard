import { useState } from "react";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  getDay,
  isSameDay,
  isWithinInterval,
  isAfter,
} from "date-fns";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { Check } from "lucide-react";

const options = [
  "All time",
  "One to One",
  "All purchases",
  "Weekly Classes",
  "Merchandise",
  "Birthday",
];

export default function Calendar() {
  const [selected, setSelected] = useState(["All time"]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const toggleOption = (item) => {
    setSelected((prev) =>
      prev.includes(item)
        ? prev.filter((i) => i !== item)
        : [...prev, item]
    );
  };

  const onDateClick = (day) => {
    if (!startDate || endDate) {
      setStartDate(day);
      setEndDate(null);
    } else if (isAfter(day, startDate)) {
      setEndDate(day);
    } else {
      setStartDate(day);
      setEndDate(null);
    }
  };

  const isInRange =
    startDate && endDate
      ? (day) => isWithinInterval(day, { start: startDate, end: endDate })
      : () => false;

  return (
    <div className="w-[380px] bg-white rounded-2xl shadow-lg p-5">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-[24px] ">Filter</h2>
        <button className="bg-[#0DD180] text-white flex  gap-2 items-center px-3 py-2.5 w-max rounded-[12px] text-[16px] font-semibold">
         <img src="/assets/filter-vertical-white.png" className="w-5" alt="" /> Apply Filter
        </button>
      </div>

      {/* Checkbox Section */}
      <div className="bg-[#FAFAFA] rounded-xl p-4 mb-8">
        <p className="text-[18px] text-left font-semibold text-[#282829] mb-3">
          Choose type
        </p>
        <div className="grid grid-cols-2 gap-3">
          {options.map((item) => (
            <label
              key={item}
              className="flex items-center gap-3 font-semibold text-[16px] text-[#282829] cursor-pointer"
            >
              {/* Hidden checkbox (logic only) */}
              <input
                type="checkbox"
                checked={selected.includes(item)}
                onChange={() => toggleOption(item)}
                className="hidden"
              />

              {/* Custom checkbox */}
              <div
                className={`w-[18px] h-[18px] rounded-[5px] flex items-center justify-center transition
      ${selected.includes(item)
                    ? "bg-[#0DD180]"
                    : "border border-[#717073] bg-white"
                  }`}
              >
                {selected.includes(item) && (
                 <Check size={16} className="text-white"/>
                )}
              </div>

              {/* Label text */}
              <span className="text-[16px] font-semibold">{item}</span>
            </label>

          ))}
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-center gap-4 mb-10">
        <button
          className="border rounded-full h-7 w-7 flex items-center justify-center"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <IoIosArrowBack />
        </button>

        <span className="font-semibold text-[20px]">
          {format(currentMonth, "MMMM yyyy")}
        </span>

        <button
          className="border rounded-full h-7 w-7 flex items-center justify-center"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <IoIosArrowForward />
        </button>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 mb-2">
        {["M", "T", "W", "T", "F", "S", "S"].map((d) => (
          <div
            key={d}
            className="text-[18px] font-semibold text-center"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="grid grid-cols-7 text-center select-none">
        {Array((getDay(startOfMonth(currentMonth)) + 6) % 7)
          .fill(null)
          .map((_, i) => (
            <div key={i} />
          ))}

        {days.map((day) => {
          const isStart = startDate && isSameDay(day, startDate);
          const isEnd = endDate && isSameDay(day, endDate);
          const inRange = isInRange(day);

          return (
            <div
              key={day}
              onClick={() => onDateClick(day)}
              className="relative h-11 text-[18px] cursor-pointer"
            >
              {/* RANGE BACKGROUND */}
              {inRange && !isStart && !isEnd && (
                <div className="absolute inset-0 bg-[#E9FBF3] z-0" />
              )}

              {/* START */}
              {isStart && (
                <>
                  <div className="absolute inset-y-0 right-0 w-1/2 bg-[#E9FBF3] z-0" />
                  <div className="relative z-10 flex items-center justify-center h-full">
                    <div className="w-10 h-10 text-[18px] bg-[#0DD180] text-white rounded-full flex items-center justify-center font-semibold">
                      {format(day, "d")}
                    </div>
                  </div>
                </>
              )}

              {/* END */}
              {isEnd && (
                <>
                  <div className="absolute inset-y-0 left-0 w-1/2 bg-[#E9FBF3] z-0" />
                  <div className="relative z-10 flex items-center justify-center h-full">
                    <div className="w-10 h-10 text-[18px] bg-[#0DD180] text-white rounded-full flex items-center justify-center font-semibold">
                      {format(day, "d")}
                    </div>
                  </div>
                </>
              )}

              {/* NORMAL DAY */}
              {!isStart && !isEnd && (
                <div className="relative z-10 flex items-center justify-center h-full">
                  <span className="font-medium text-black">
                    {format(day, "d")}
                  </span>
                </div>
              )}
            </div>

          );
        })}
      </div>
    </div>
  );
}
