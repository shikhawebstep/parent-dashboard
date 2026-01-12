import React, { useState } from 'react';
import ReferFriendTab from './components/referral/ReferFriendTab';
import YourReferralsTab from './components/referral/YourReferralsTab';
import LoyaltyClubTab from './components/referral/LoyaltyClubTab';

const ReferFriend = () => {
    const [activeTab, setActiveTab] = useState('Refer a friend');

    const tabs = ['Refer a friend', 'Your referrals', 'Loyalty Club'];

    return (
        <div className="p-8 space-y-8 min-h-screen bg-[#F9F9F9] animate-fadeIn">
            {/* Tabs */}
            <div className="flex items-center bg-white gap-1 w-max p-3 rounded-[14px]">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 rounded-[14px] text-[18px] font-semibold transition-all ${activeTab === tab
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
                {activeTab === 'Loyalty Club' && <LoyaltyClubTab />}
            </div>
        </div>
    );
};

export default ReferFriend;
