import React, { useEffect, useState } from 'react';
import { showError } from '../../../utils/swalHelper';

const MyBookings = () => {
    const [activeTab, setActiveTab] = useState('Upcoming');

    const tabs = ['Upcoming', 'Past', 'Cancelled'];
    const [bookings, setBookings] = useState({
        upcoming: [],
        past: [],
        cancelled: []
    });

    const fetchBooking = async () => {
        try {
            const token = localStorage.getItem("parentToken");
            const parentData = JSON.parse(localStorage.getItem("parentData"));
            const parentId = parentData?.id;
            const API_URL = import.meta.env.VITE_API_BASE_URL;

            if (!token) {
                throw new Error("Authentication token not found. Please login again.");
            }

            const response = await fetch(
                `${API_URL}/api/parent/account-profile/my-bookings/${parentId}`,
                {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            let data = {};
            try {
                data = await response.json();
            } catch (err) {
                data = {};
            }

            if (!response.ok || data?.status === false) {
                throw new Error(data?.message || "Failed to fetch bookings");
            }

            console.log("API DATA:", data);
            const finalData = data?.data;

            setBookings({
                upcoming: finalData?.upcomingBookings || [],
                past: finalData?.pastBookings || [],
                cancelled: finalData?.cancelledBookings || []
            });

        } catch (error) {
            showError(error?.message || "Something went wrong");
        }
    };

    useEffect(() => {
        fetchBooking();
    }, []);




    // Simple filter simulation (since data is static, mostly showing same list or filtering by logic if needed)
    // For now, I'll return the same list for 'Upcoming' and 'Past' but maybe empty for Cancellation to demonstrate tab switch.
    let filteredBookings = [];

    if (activeTab === "Upcoming") {
        filteredBookings = bookings.upcoming;
    } else if (activeTab === "Past") {
        filteredBookings = bookings.past;
    } else if (activeTab === "Cancelled") {
        filteredBookings = bookings.cancelled;
    }

    console.log('filteredBookings', filteredBookings)
    console.log('bookings', bookings)
    const formatBooking = (booking) => {
        const dateObj = new Date(booking.createdAt);

        return {
            id: booking.id,
            day: dateObj.toLocaleDateString("en-US", { weekday: "short" }),
            date: dateObj.getDate(),
            month: dateObj.toLocaleDateString("en-US", { month: "short" }),
            venue: booking.venue?.name,
            time: `${booking.students?.[0]?.classSchedule?.startTime} - ${booking.students?.[0]?.classSchedule?.endTime}`,
            address: booking.venue?.address,
            classType: booking.students?.[0]?.classSchedule?.className,
            coach: "-", // not in API
            status: booking.status
        };
    };
    return (
        <div className="p-4 md:space-y-8 animate-fadeIn min-h-screen bg-[#fff] rounded-[30px] md:m-6 m-4">
            {/* Tabs */}
            <div className="flex items-center md:gap-8 gap-2 mb-12 md:mb-0  pb-1">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`md:text-[18px] text-[16px] font-semibold md:px-5 px-2 py-2.5 rounded-[14px] relative transition-colors ${activeTab === tab
                            ? 'bg-[#042C89] text-white'
                            : 'text-[#282829] hover:text-[#282829]'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="space-y-6 relative">
                {(activeTab === 'Upcoming' && filteredBookings.length > 0) && (
                    <div className="mb-4 absolute -top-4 left-4">
                        <span className="bg-[#0DD180] text-white text-[12px] font-bold px-3 py-1 rounded-[16px] uppercase">
                            Coming Up
                        </span>
                    </div>
                )}
                {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking, index) => {
                        const formatted = formatBooking(booking);

                        return (
                            <div key={formatted.id || index}>

                                {index === 3 && (
                                    <div className="flex items-center gap-4 mb-4 mt-8 bg-[#EAF0FF] p-2 px-6 md:text-[24px] text-[20px] rounded-[15px] text-[#042C89] font-bold uppercase w-full">
                                        <img src="/assets/calender.png" className='w-6' alt="" />
                                        MAY
                                    </div>
                                )}
                                <div className="bg-[#F8F8F8] p-6 rounded-[16px] flex flex-col md:flex-row  overflow-hidden mb-4">
                                    {/* Date Column */}
                                    <div className="bg-[#F9FAFB] md:w-[120px] text-left flex flex-col md:items-center md:text-center 2xl:px-5 px-0  2xl:pe-10 md:pe-5 md:justify-center md:border-r border-b md:border-b-0 border-[#E2E1E5]">
                                        <span className="text-[#5F5F6D] 2xl:text-[24px] text-[20px] font-bold block">{formatted.day}</span>
                                        <span className="text-[#5F5F6D] font-bold 2xl:text-[42px] text-[36px]">{formatted.date}</span>
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 xl:flex grid grid-cols-1 sm:grid-cols-2 mt-4 md:mt-0 md:grid-cols-3 md:ps-7 lg:gap-6 gap-3 justify-between items-center">
                                        <div className='xl:w-[8%]'>
                                            <p className="text-[#9E9FAA] 2xl:text-[16px] text-[14px] mb-1">Venue</p>
                                            <p className="text-[#5F5F6D] 2xl:text-[16px] text-[14px] font-semibold">{formatted.venue}</p>
                                        </div>
                                        <div className='xl:w-[10%]'>
                                            <p className="text-[#9E9FAA] 2xl:text-[16px] text-[14px] mb-1">Hour</p>
                                            <p className="text-[#5F5F6D] 2xl:text-[16px] text-[14px] font-semibold">{formatted.time}</p>
                                        </div>
                                        <div className="xl:w-[30%]">
                                            <p className="text-[#9E9FAA] 2xl:text-[16px] text-[14px] mb-1">Address</p>
                                            <p className="text-[#5F5F6D] 2xl:text-[16px] text-[14px] font-semibold leading-tight">{formatted.address}</p>
                                        </div>
                                        <div className='xl:w-[10%]'>
                                            <p className="text-[#9E9FAA] 2xl:text-[16px] text-[14px] mb-1">Class</p>
                                            <p className="text-[#5F5F6D] 2xl:text-[16px] text-[14px] font-semibold">{formatted.classType}</p>
                                        </div>
                                        <div className='xl:w-[10%]'>
                                            <p className="text-[#9E9FAA] 2xl:text-[16px] text-[14px] mb-1">Coach</p>
                                            <p className="text-[#5F5F6D] 2xl:text-[16px] text-[14px] font-semibold"> <div className="flex gap-2 items-center"><img src="/assets/Ethan-test1.png" className='w-8' alt="" />{formatted.coach}</div></p>
                                        </div>

                                        {/* Action Button */}
                                        <div className="xl:w-[13%] w-full flex justify-end">
                                            {formatted.status === 'upcoming' ? (
                                                <button className="bg-[#042C89] text-white w-full  px-2 2xl:px-4 py-2.5 2xl:py-3 rounded-[12px] font-semibold 2xl:text-sm md:text-[12px] text-[14px] hover:bg-[#032066] transition-colors">
                                                    Give Feedback
                                                </button>
                                            ) : (
                                                <button className="bg-[#FFAB00] text-white w-full 2xl:px-8 px-4 py-2.5 2xl:py-3 rounded-[12px] font-semibold 2xl:text-sm md:text-[12px] text-[14px] hover:bg-[#e69500] transition-colors ">
                                                    Pending
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="text-center py-10 text-gray-500">
                        No bookings found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyBookings;
