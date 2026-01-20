import React, { useState } from 'react';
import ReferFriendTab from '../../components/referral/ReferFriendTab';
import YourReferralsTab from '../../components/referral/YourReferralsTab';
import LoyaltyClubTab from '../../components/referral/LoyaltyClubTab';

const ReferFriend = () => {
    const [activeTab, setActiveTab] = useState('Refer a friend');

    const tabs = ['Refer a friend', 'Your referrals', 'Your Loyalty Points'];

    return (
        <div className="2xl:p-8 p-4 space-y-8 min-h-screen xl:bg-[#F9F9F9] animate-fadeIn">
            {/* Tabs */}
            <div className="flex items-center overflow-auto bg-white gap-1 md:w-max w-full p-3 rounded-[14px]">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`sm:px-6 px-3 py-2 rounded-[14px] whitespace-nowrap md:text-[18px] text-[16px] font-semibold transition-all ${activeTab === tab
                            ? 'bg-[#042C89] text-white shadow-md'
                            : 'text-[#717073] hover:text-[#042C89] hover:bg-gray-50'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div>
                {activeTab === 'Refer a friend' && <ReferFriendTab />}
                {activeTab === 'Your referrals' && <YourReferralsTab />}
                {activeTab === 'Your Loyalty Points' && <LoyaltyClubTab />}
            </div>
        </div>
    );
};

export default ReferFriend;
