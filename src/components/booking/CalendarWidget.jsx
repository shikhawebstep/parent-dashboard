import React, { useState } from 'react';
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, startOfWeek, endOfWeek } from 'date-fns';

const CalendarWidget = ({ selectedDate, onSelectDate }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    const nextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1));
    };

    const prevMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1));
    };

    // Calculate days to display
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start on Monday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate
    });

    return (
        <div className="bg-white p-6 rounded-[20px] shadow-sm animate-fadeIn">
            <h3 className="text-[#282829] font-bold text-[24px] pb-5">Select trial date</h3>



            <div className="flex items-center justify-center gap-7 mb-10">
                <button
                    className="border rounded-full h-7 w-7 flex items-center justify-center"
                    onClick={prevMonth}
                >
                    <IoIosArrowBack />
                </button>

                <span className="font-semibold text-[20px]">
                    {format(currentMonth, "MMMM yyyy")}
                </span>

                <button
                    className="border rounded-full h-7 w-7 flex items-center justify-center"
                    onClick={nextMonth}
                >
                    <IoIosArrowForward />
                </button>
            </div>

            <div className="grid grid-cols-7 mb-4">
                {days.map((day) => (
                    <div key={day} className="text-center 2xl:text-[18px] text-[16px] font-semibold text-[#191919]">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-y-2">
                {calendarDays.map((day, idx) => {
                    const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                    // const isCurrentMonth = isSameMonth(day, currentMonth); // Optional: dim other months
                    // Using the mock image logic, they don't explicitly dim them too much but we can subtle text
                    const textColor = isSameMonth(day, currentMonth) ? 'text-[#191919]' : 'text-gray-300';
                    const fontWeight = isSelected ? 'font-bold' : 'font-medium';
                    const bgClass = isSelected ? 'bg-[#0496FF] text-white shadow-md' : 'hover:bg-gray-50';

                    return (
                        <div key={idx} className="flex justify-center">
                            <button
                                onClick={() => onSelectDate(day)}
                                className={`w-8 h-8 flex items-center justify-center rounded-full 2xl:text-[16px] text-[14px] transition-colors ${textColor} ${fontWeight} ${bgClass}`}
                            >
                                {format(day, 'd')}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarWidget;
