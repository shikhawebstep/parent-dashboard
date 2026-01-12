import React from 'react';
import ReferralStatsCard from './ReferralStatsCard';

const YourReferralsTab = () => {
    // Static data for the table
    const referrals = [
        { id: 1, date: '01/06/2023', name: 'Steve Jones', email: 'tom.jones@gmail.com', phone: '123456789', status: 'Pending' },
        { id: 2, date: '01/06/2023', name: 'Steve Jones', email: 'tom.jones@gmail.com', phone: '123456789', status: 'Pending' },
        { id: 3, date: '01/06/2023', name: 'Steve Jones', email: 'tom.jones@gmail.com', phone: '123456789', status: 'Pending' },
        { id: 4, date: '01/06/2023', name: 'Steve Jones', email: 'tom.jones@gmail.com', phone: '123456789', status: 'Pending' },
        { id: 5, date: '01/06/2023', name: 'Steve Jones', email: 'tom.jones@gmail.com', phone: '123456789', status: 'Pending' },
        { id: 6, date: '01/06/2023', name: 'Steve Jones', email: 'tom.jones@gmail.com', phone: '123456789', status: 'Pending' },
        { id: 7, date: '01/06/2023', name: 'Steve Jones', email: 'tom.jones@gmail.com', phone: '123456789', status: 'Pending' },
        { id: 8, date: '01/06/2023', name: 'Steve Jones', email: 'tom.jones@gmail.com', phone: '123456789', status: 'Pending' },
        { id: 9, date: '01/06/2023', name: 'Steve Jones', email: 'tom.jones@gmail.com', phone: '123456789', status: 'Pending' },
        { id: 10, date: '01/06/2023', name: 'Steve Jones', email: 'tom.jones@gmail.com', phone: '123456789', status: 'Pending' },
        { id: 11, date: '01/06/2023', name: 'Steve Jones', email: 'tom.jones@gmail.com', phone: '123456789', status: 'Success' },
    ];

    return (
        <div className="flex flex-col lg:flex-row gap-6 items-start animate-fadeIn">
            {/* Table Section */}
            <div className="flex-1 bg-white p-5 rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 pb-2">
                    <h3 className="text-[20px] font-bold text-[#191919]">Your referrals</h3>
                </div>
                <div className="overflow-auto rounded-2xl bg-white shadow-sm">
                    <table className="min-w-full text-sm">
                        <thead className="bg-[#F5F5F5] text-left border border-[#EFEEF2]">
                            <tr className="font-semibold text-[#717073]">
                                <th className="text-left py-4 px-6 text-xs font-semibold text-[#717073]">Date</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-[#717073]">Referral name</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-[#717073]">Email</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-[#717073]">Phone</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-[#717073]"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {referrals.map((item, index) => (
                                <tr key={index} className="border-t font-semibold text-[#282829] border-[#EFEEF2] hover:bg-gray-50">
                                    <td className="py-4 px-6 text-sm text-[#191919] font-medium">{item.date}</td>
                                    <td className="py-4 px-6 text-sm text-[#191919] font-medium">{item.name}</td>
                                    <td className="py-4 px-6 text-sm text-[#191919]">{item.email}</td>
                                    <td className="py-4 px-6 text-sm text-[#191919]">{item.phone}</td>
                                    <td className="py-4 px-6 text-right">
                                        <span className={`inline-block px-4 py-1.5 rounded-lg text-xs font-semibold min-w-[80px] text-center
                                            ${item.status === 'Success'
                                                ? 'bg-[#E5F9EF] text-[#00D285]'
                                                : 'bg-[#FFF8E6] text-[#FFA500]'
                                            }`}
                                        >
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Stats Card Section */}
            <ReferralStatsCard />
        </div>
    );
};

export default YourReferralsTab;
