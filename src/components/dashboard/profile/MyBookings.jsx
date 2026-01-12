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
        <div className="p-8 space-y-8 animate-fadeIn min-h-screen bg-[#F9F9F9]">
            {/* Tabs */}
            <div className="flex items-center gap-8 border-b border-gray-200 pb-1">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`text-[16px] font-semibold pb-3 relative transition-colors ${activeTab === tab
                                ? 'text-[#042C89] border-b-2 border-[#042C89]'
                                : 'text-[#717073] hover:text-[#042C89]'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="space-y-6">
                {activeTab === 'Upcoming' && (
                    <div className="mb-4">
                        <span className="bg-[#0DD180] text-white text-[12px] font-bold px-3 py-1 rounded-full uppercase">
                            Coming Up
                        </span>
                    </div>
                )}

                {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking, index) => (
                        <div key={booking.id}>
                            {/* Month Header - logic to show only if different from previous or first item? 
                        The design shows "MAY" header before the 4th item (id 4). 
                        Let's hardcode it for the specific visual match or check logic.
                    */}
                            {index === 3 && ( // Hardcoded breakpoint for visual match to image
                                <div className="flex items-center gap-2 mb-4 mt-8 bg-[#E6F0FF] p-3 rounded-lg text-[#042C89] font-bold uppercase w-full">
                                    <span className="material-icons-outlined text-lg">calendar_today</span> {/* Using text or generic icon if font awesome not avail, or lucide */}
                                    MAY
                                </div>
                            )}

                            <div className="bg-white rounded-[20px] p-0 flex flex-col md:flex-row shadow-sm border border-gray-100 overflow-hidden mb-4">
                                {/* Date Column */}
                                <div className="bg-[#F9FAFB] md:w-[120px] p-6 flex flex-col items-center justify-center border-r border-gray-100">
                                    <span className="text-[#5B6572] font-semibold text-lg">{booking.day}</span>
                                    <span className="text-[#383A46] font-bold text-4xl">{booking.date}</span>
                                </div>

                                {/* Details */}
                                <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                                    <div>
                                        <p className="text-[#A1A0A3] text-xs mb-1">Venue</p>
                                        <p className="text-[#383A46] font-semibold">{booking.venue}</p>
                                    </div>
                                    <div>
                                        <p className="text-[#A1A0A3] text-xs mb-1">Hour</p>
                                        <p className="text-[#383A46] font-semibold">{booking.time}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="text-[#A1A0A3] text-xs mb-1">Address</p>
                                        <p className="text-[#383A46] font-semibold leading-tight">{booking.address}</p>
                                    </div>
                                    <div>
                                        <p className="text-[#A1A0A3] text-xs mb-1">Class</p>
                                        <p className="text-[#383A46] font-semibold">{booking.classType}</p>
                                    </div>
                                    <div>
                                        <p className="text-[#A1A0A3] text-xs mb-1">Coach</p>
                                        <p className="text-[#383A46] font-semibold">{booking.coach}</p>
                                    </div>

                                    {/* Action Button */}
                                    <div className="md:col-span-2 flex justify-end">
                                        {booking.status === 'upcoming' ? (
                                            <button className="bg-[#042C89] text-white px-8 py-3 rounded-lg font-semibold text-sm hover:bg-[#032066] transition-colors">
                                                Give Feedback
                                            </button>
                                        ) : (
                                            <button className="bg-[#FFA500] text-white px-8 py-3 rounded-lg font-semibold text-sm hover:bg-[#e69500] transition-colors w-[140px]">
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
