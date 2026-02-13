import React, { useEffect, useState } from 'react';
import ReferralStatsCard from './ReferralStatsCard';
import Loader from '../Loader';
const YourReferralsTab = () => {
    // Static data for the table
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const token = localStorage.getItem("parentToken");
    const API_URL = import.meta.env.VITE_API_BASE_URL;
    const fetchReferrals = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}api/parent/referral/list`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            console.log(data);
            if (!response.ok) {
                throw new Error(data.message || "Something went wrong");
            }
            setReferrals(data.data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReferrals();
    }, []);
    if (loading) {
        return <Loader />
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6 items-start animate-fadeIn">
            {/* Table Section */}
            <div className="flex-1 md:bg-white md:p-5 w-full rounded-[20px] md:shadow-sm md:border border-gray-100 overflow-hidden">
                <div className="py-6">
                    <h3 className="font-bold text-[#191919] text-[28px]">Your referrals</h3>
                </div>
                <div className="overflow-auto rounded-2xl bg-white border border-[#DBDBDB] shadow-sm">
                    <table className="min-w-full text-sm">
                        <thead className="bg-[#F5F5F5] text-left ">
                            <tr className="font-semibold text-[#717073]">
                                <th className="text-left py-3 px-6 text-[14px] font-semibold text-[#717073]">Date</th>
                                <th className="text-left py-3 px-6 text-[14px] font-semibold text-[#717073]">Referral name</th>
                                <th className="text-left py-3 px-6 text-[14px] font-semibold text-[#717073]">Email</th>
                                <th className="text-left py-3 px-6 text-[14px] font-semibold text-[#717073]">Phone</th>
                                <th className="text-left py-3 px-6 text-[14px] font-semibold text-[#717073]"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(referrals?.referrals) && referrals?.referrals.map((item, index) => (
                                <tr key={index} className="border-t font-semibold text-[#282829] border-[#EFEEF2] hover:bg-gray-50">
                                    <td className="py-3 px-6 text-sm text-[#191919] font-medium">{new Date(item.createdAt).toLocaleDateString()}</td>
                                    <td className="py-3 px-6 text-sm text-[#191919] font-medium">{item.firstName + ' ' + item.lastName}</td>
                                    <td className="py-3 px-6 text-sm text-[#191919]">{item.email}</td>
                                    <td className="py-3 px-6 text-sm text-[#191919]">{item.phone}</td>
                                    <td className="py-3 px-6 text-right">
                                        <span className={`inline-block px-4 py-1.5 rounded-lg text-[14px] font-semibold min-w-[80px] text-center
                                            ${item.status === 'Success'
                                                ? 'bg-[#E5F9EF] text-[#00D285]'
                                                : 'bg-[#FDF6E5] text-[#EDA600]'
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
            <ReferralStatsCard  statusCount={referrals?.statusCounts} />
        </div>
    );
};

export default YourReferralsTab;
