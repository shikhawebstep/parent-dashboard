import React, { useState } from 'react';

const MyBookings = () => {
    const [activeTab, setActiveTab] = useState('Upcoming');

    const tabs = ['Upcoming', 'Past', 'Cancelled'];

    // Static data matching the visual design
    const bookings = [
        {
            id: 1,
            day: 'Wed',
            date: '15',
            month: 'MAY',
            venue: 'Acton',
            time: '10:00 - 11:00',
            address: 'The King Fahad Academy, East Acton Lane, London W3 7HD',
            classType: '4-7 years',
            coach: 'Ethan',
            status: 'upcoming',
            isComingUp: true,
        },
        {
            id: 2,
            day: 'Wed',
            date: '22',
            month: 'MAY',
            venue: 'Acton',
            time: '10:00 - 11:00',
            address: 'The King Fahad Academy, East Acton Lane, London W3 7HD',
            classType: '4.7 years',
            coach: 'Ethan',
            status: 'upcoming',
            isComingUp: false,
        },
        {
            id: 3,
            day: 'Wed',
            date: '29',
            month: 'MAY',
            venue: 'Acton',
            time: '10:00 - 11:00',
            address: 'The King Fahad Academy, East Acton Lane, London W3 7HD',
            classType: '4.7 years',
            coach: 'Ethan',
            status: 'pending', // Yellow button state
            isComingUp: false,
        },
        {
            id: 4,
            day: 'Wed',
            date: '6',
            month: 'MAY', // Just following the visual pattern, though logic might group by month
            venue: 'Acton',
            time: '10:00 - 11:00',
            address: 'The King Fahad Academy, East Acton Lane, London W3 7HD',
            classType: '4.7 years',
            coach: 'Ethan',
            status: 'pending',
            isComingUp: false,
        },
        {
            id: 5,
            day: 'Wed',
            date: '13',
            month: 'MAY',
            venue: 'Acton',
            time: '10:00 - 11:00',
            address: 'The King Fahad Academy, East Acton Lane, London W3 7HD',
            classType: '4.7 years',
            coach: 'Ethan',
            status: 'pending',
            isComingUp: false,
        },
        {
            id: 6,
            day: 'Wed',
            date: '20',
            month: 'MAY',
            venue: 'Acton',
            time: '10:00 - 11:00',
            address: 'The King Fahad Academy, East Acton Lane, London W3 7HD',
            classType: '4.7 years',
            coach: 'Ethan',
            status: 'pending',
            isComingUp: false,
        },
    ];

    // Simple filter simulation (since data is static, mostly showing same list or filtering by logic if needed)
    // For now, I'll return the same list for 'Upcoming' and 'Past' but maybe empty for Cancellation to demonstrate tab switch.
    const filteredBookings = activeTab === 'Cancelled' ? [] : bookings;

    return (
        <div className="p-4 space-y-8 animate-fadeIn min-h-screen bg-[#fff] rounded-[30px] m-6">
            {/* Tabs */}
            <div className="flex items-center gap-8  pb-1">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`text-[18px] font-semibold px-5 py-2.5 rounded-[14px] relative transition-colors ${activeTab === tab
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
                {activeTab === 'Upcoming' && (
                    <div className="mb-4 absolute -top-4 left-4">
                        <span className="bg-[#0DD180] text-white text-[12px] font-bold px-3 py-1 rounded-[16px] uppercase">
                            Coming Up
                        </span>
                    </div>
                )}

                {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking, index) => (
                        <div key={booking.id} className=''>
                            {/* Month Header - logic to show only if different from previous or first item? 
                        The design shows "MAY" header before the 4th item (id 4). 
                        Let's hardcode it for the specific visual match or check logic.
                    */}
                            {index === 3 && ( // Hardcoded breakpoint for visual match to image
                                <div className="flex items-center gap-4 mb-4 mt-8 bg-[#EAF0FF] p-2 px-6 text-[24px] rounded-[15px] text-[#042C89] font-bold uppercase w-full">
                                    <span className="material-icons-outlined text-lg"><img src="/assets/calender.png" className='w-6' alt="" /></span> {/* Using text or generic icon if font awesome not avail, or lucide */}
                                    MAY
                                </div>
                            )}

                            <div className="bg-[#F8F8F8] p-6 rounded-[16px] flex flex-col md:flex-row  overflow-hidden mb-4">
                                {/* Date Column */}
                                <div className="bg-[#F9FAFB] md:w-[120px] flex flex-col items-center text-center 2xl:px-5 px-0  2xl:pe-10 pe-5 justify-center border-r border-[#E2E1E5]">
                                    <span className="text-[#5F5F6D] 2xl:text-[24px] text-[20px] font-bold block">{booking.day}</span>
                                    <span className="text-[#5F5F6D] font-bold 2xl:text-[42px] text-[36px]">{booking.date}</span>
                                </div>

                                {/* Details */}
                                <div className="flex-1 flex ps-7 gap-6 justify-between items-center">
                                    <div className='w-[8%]'>
                                        <p className="text-[#9E9FAA] 2xl:text-[16px] text-[14px] mb-1">Venue</p>
                                        <p className="text-[#5F5F6D] 2xl:text-[16px] text-[14px] font-semibold">{booking.venue}</p>
                                    </div>
                                    <div className='w-[10%]'>
                                        <p className="text-[#9E9FAA] 2xl:text-[16px] text-[14px] mb-1">Hour</p>
                                        <p className="text-[#5F5F6D] 2xl:text-[16px] text-[14px] font-semibold">{booking.time}</p>
                                    </div>
                                    <div className="w-[30%]">
                                        <p className="text-[#9E9FAA] 2xl:text-[16px] text-[14px] mb-1">Address</p>
                                        <p className="text-[#5F5F6D] 2xl:text-[16px] text-[14px] font-semibold leading-tight">{booking.address}</p>
                                    </div>
                                    <div className='w-[10%]'>
                                        <p className="text-[#9E9FAA] 2xl:text-[16px] text-[14px] mb-1">Class</p>
                                        <p className="text-[#5F5F6D] 2xl:text-[16px] text-[14px] font-semibold">{booking.classType}</p>
                                    </div>
                                    <div className='w-[10%]'>
                                        <p className="text-[#9E9FAA] 2xl:text-[16px] text-[14px] mb-1">Coach</p>
                                        <p className="text-[#5F5F6D] 2xl:text-[16px] text-[14px] font-semibold"> <div className="flex gap-2 items-center"><img src="/assets/Ethan-test1.png" className='w-8' alt="" />{booking.coach}</div></p>
                                    </div>

                                    {/* Action Button */}
                                    <div className=" w-[13%] flex justify-end">
                                        {booking.status === 'upcoming' ? (
                                            <button className="bg-[#042C89] text-white  px-2 2xl:px-4 py-2.5 2xl:py-3 rounded-[12px] font-semibold 2xl:text-sm text-[12px] hover:bg-[#032066] transition-colors">
                                                Give Feedback
                                            </button>
                                        ) : (
                                            <button className="bg-[#FFAB00] text-white 2xl:px-8 px-4 py-2.5 2xl:py-3 rounded-[12px] font-semibold 2xl:text-sm text-[12px] hover:bg-[#e69500] transition-colors ">
                                                Pending
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
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
