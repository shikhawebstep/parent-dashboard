import React, { useState } from 'react';
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    startOfWeek,
    endOfWeek,
} from 'date-fns';

const CalendarWidget = ({ selectedDate, onSelectDate, availableDates }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    // Build calendar grid (Monday-anchored)
    const monthStart = startOfMonth(currentMonth);
    const monthEnd   = endOfMonth(monthStart);
    const startDate  = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate    = endOfWeek(monthEnd,   { weekStartsOn: 1 });
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // If availableDates is null/undefined (no venue selected yet) → nothing is available.
    // If availableDates is a Set (venue selected) → check membership.
    const hasVenue = availableDates != null;

    return (
        <div className="animate-fadeIn">
            {/* Month navigation */}
            <div className="flex items-center justify-center gap-7 mb-6">
                <button
                    type="button"
                    className="border border-[#e7ebf1] rounded-full h-7 w-7 flex items-center justify-center hover:bg-[#f4f6f9] transition-colors"
                    onClick={prevMonth}
                >
                    <IoIosArrowBack />
                </button>

                <span className="font-semibold text-[16px] text-[#1f2733]">
                    {format(currentMonth, "MMMM yyyy")}
                </span>

                <button
                    type="button"
                    className="border border-[#e7ebf1] rounded-full h-7 w-7 flex items-center justify-center hover:bg-[#f4f6f9] transition-colors"
                    onClick={nextMonth}
                >
                    <IoIosArrowForward />
                </button>
            </div>

            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 mb-3">
                {days.map((day, i) => (
                    <div
                        key={i}
                        className="text-center text-[13px] font-semibold text-[#6b7685]"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* No venue selected — show a hint */}
            {!hasVenue && (
                <div className="text-center text-[13px] text-[#6b7685] py-3">
                    Select a venue to see available dates
                </div>
            )}

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-y-1.5">
                {calendarDays.map((day, idx) => {
                    const formattedDay = format(day, 'yyyy-MM-dd');

                    // A day is only available if a venue has been picked AND
                    // that date is in the venue's availableDates set.
                    const isAvailable = hasVenue && availableDates.has(formattedDay);

                    const cur = new Date(day);
                    cur.setHours(0, 0, 0, 0);
                    const isPast    = cur < today;
                    const isEnabled = isAvailable && !isPast;
                    const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                    const inMonth   = isSameMonth(day, currentMonth);

                    // Style logic
                    let btnClass = "";
                    if (!inMonth) {
                        // Days outside the current month — always very faint
                        btnClass = "text-[#d1d5db] cursor-default";
                    } else if (isSelected) {
                        btnClass = "bg-[#21b573] text-white font-bold shadow-md";
                    } else if (isEnabled) {
                        btnClass = "bg-[#3b7df6] text-white font-semibold hover:bg-[#2f6ae0] cursor-pointer";
                    } else if (isAvailable && isPast) {
                        // Available in DB but date has passed
                        btnClass = "text-[#d1d5db] cursor-not-allowed line-through";
                    } else {
                        // Not available / no venue
                        btnClass = "text-[#9CA3AF] cursor-default opacity-50";
                    }

                    return (
                        <div key={idx} className="flex justify-center">
                            <button
                                type="button"
                                disabled={!isEnabled}
                                onClick={() => isEnabled && onSelectDate(day)}
                                className={`w-8 h-8 flex items-center justify-center rounded-full text-[13px] transition-colors ${btnClass}`}
                            >
                                {format(day, 'd')}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            {hasVenue && (
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[#f4f6f9] flex-wrap">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#6b7685]">
                        <span className="w-3 h-3 rounded-full bg-[#3b7df6] inline-block" />
                        Available
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#6b7685]">
                        <span className="w-3 h-3 rounded-full bg-[#21b573] inline-block" />
                        Selected
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#6b7685]">
                        <span className="w-3 h-3 rounded-full bg-[#e5e7eb] inline-block" />
                        Unavailable
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarWidget;
