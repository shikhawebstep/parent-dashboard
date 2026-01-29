import { useState, useRef, useEffect } from "react";

import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BookingCard from "./BookingCard";
import Calendar from "./Calender";
import ServiceDetails from "./ServiceDetails";
import { useProfile } from "../../context/ProfileContext";

export default function ServiceHistory() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const ref = useRef(null);
  const { profile } = useProfile();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const bookings = profile?.combinedBookings





  if (selectedBooking) {
    return <ServiceDetails booking={selectedBooking} onBack={() => setSelectedBooking(null)} />;
  }

  return (
    <>
      <div className="text-right 2xl:absolute top-7 right-5 mb-6">

        <div className="flex gap-3 flex-wrap items-center p-3 md:p-0 items-center">
          <div className="bg-white shadow-[rgba(0,0,0,0.1)_0px_5px_7px_-5px,_rgba(0,0,0,0.04)_0px_3px_10px_-5px]  sm:w-max justify-between flex  gap-1 md:gap-3 items-center p-2 rounded-[15px]">
            <img src="/assets/points.png" className="w-9" alt="" />
            <h3 className="text-[#042C89] font-bold recline text-[14px] md:text-[16px">you collected 600 points</h3>
            <button
              className=" font-semibold lg:text-[16px] text-[14px] md:px-4 px-2 py-2 bg-[#0DD180] text-white rounded-[12px] hover:bg-green-700"
            >
              <span className="hidden md:block">See More Here</span>
              <span className="md:hidden block">See More</span>

            </button>
          </div>
          <div className="relative inline-block" ref={ref}>
            {/* Filter Button */}
            <button
              onClick={() => setOpen((prev) => !prev)}
              className="bg-white border border-[#E2E1E5] px-4 py-2.5 rounded-[12px]
                   text-[#717073] font-semibold flex items-center gap-2"
            >
              <img src="/assets/filter-vertical.png" className="w-5" alt="filter" />
              Filters
            </button>

            {/* Calendar Popup */}
            {open && (
              <div className="sm:absolute right-0 mt-3 z-50">
                <Calendar />
              </div>
            )}
          </div>
          <button
            onClick={() => navigate('/parent/booking')}
            className="inline-flex items-center gap-2 font-semibold lg:text-[18px] text-[16px] px-4 py-2 bg-[#0DD180] text-white rounded-[12px] hover:bg-green-700"
          >
            <Plus size={20} className="text-white font-bold" />
            Add Booking
          </button>
        </div>
      </div>
      <div className="py-6 md:pt-0 bg-gray-100 min-h-screen">
        {bookings.map((b) => (
          <BookingCard key={b.id} booking={b} onSeeDetails={setSelectedBooking} />
        ))}
      </div>


    </>
  );
}
