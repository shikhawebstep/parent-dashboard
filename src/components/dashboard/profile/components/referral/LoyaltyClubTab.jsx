import React, { useState } from 'react';
import { Check, Info, Lock, X, Gift, Star, PartyPopper, Calendar } from 'lucide-react';

const LoyaltyClubTab = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedReward, setSelectedReward] = useState(null);

    const points = 150;
    const targetPoints = 100;

    const collectionMethods = [
        { id: 1, title: 'Reserve Your Membership Every Month', points: 100 },
        { id: 2, title: 'Book Holiday Camps', points: 100 },
        { id: 3, title: 'Book A Birthday Party', points: 100 },
        { id: 4, title: 'Book Weekly Classes', points: 100 },
        { id: 5, title: 'Book One-To-One Training', points: 100 },
        { id: 6, title: 'Reserve Your Membership Every Month', points: 100 },
    ];

    const rewards = [
        { id: 1, title: 'Kids Winter Hat', points: 100, image: '/assets/point.png' },
        { id: 2, title: 'Kids Winter Hat', points: 120, image: '/assets/point2.png' },
        { id: 3, title: 'Kids Winter Hat', points: 120, image: '/assets/point3.png' },
        { id: 4, title: 'Kids Winter Hat', points: 120, image: '/assets/point4.png' },
        { id: 5, title: 'Kids Winter Hat', points: 120, image: '/assets/point4.png' },
        { id: 6, title: 'Kids Winter Hat', points: 200, image: '/assets/point.png' },
        { id: 7, title: 'Kids Winter Hat', points: 200, image: '/assets/point2.png' },
        { id: 8, title: 'Kids Winter Hat', points: 200, image: '/assets/point3.png' },
        { id: 9, title: 'Kids Winter Hat', points: 200, image: '/assets/point4.png' },
        { id: 10, title: 'Kids Winter Hat', points: 200, image: '/assets/point5.png' },
    ];

    const handleRedeem = (reward) => {
        setSelectedReward(reward);
        setShowModal(true);
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Banner Section */}
            <div className="relative rounded-[30px] overflow-hidden min-h-[250px]">
                <img src="/assets/loyalitybanner.png" alt="" srcset="" />
            </div>

            {/* How Can You Collect Points */}
            <div className="bg-white rounded-[30px] p-8 shadow-sm border border-gray-100">
                <h3 className="text-[#191919] font-bold text-[32px] mb-6">How Can You Collect Your Points?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {collectionMethods.map((method, idx) => (
                        <div key={idx} className="flex items-center justify-between py-4 border-[#E1E2E6] border-b transition-colors">
                            <span className="text-[20px] font-medium text-gray-700">{method.title}</span>
                            <div className="flex items-center gap-1 bg-[#FFF8D0] text-[#EEA02C] px-3 py-1 rounded-[30px] text-[18px]">
                                <img src="/assets/star.png" alt="" className='w-6' />
                                <span>{method.points} Points</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Ways To Collect (Rewards) */}
            <div className="bg-white rounded-[30px] p-8 shadow-sm border border-gray-100">
                <h3 className="text-[#191919] font-bold text-xl mb-8">Ways To Collect Your Points</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
                    {rewards.map((reward) => (
                        <div key={reward.id} className="flex flex-col items-center text-center group">
                            <div className="w-full aspect-square rounded-2xl mb-4 flex items-center justify-center relative transition-all">
                                {/* Placeholder for reward image */}
                                <img src={reward.image} alt="" srcset="" />                            </div>
                            <h4 className="font-bold text-[#191919] text-[20px] ">{reward.title}</h4>
                            <p className="text-[16px] font-bold text-[#191919] mb-4">{reward.points} Points</p>

                            {points >= reward.points ? (
                                <button
                                    onClick={() => handleRedeem(reward)}
                                    className="bg-[#00D285] text-white px-6 py-2 rounded-lg  font-bold hover:bg-[#00b572] transition-colors shadow-sm hover:shadow-md"
                                >
                                    Redeem Reward
                                </button>
                            ) : (
                                <div className="flex flex-col items-center gap-1">
                                    <div className="w-8 h-8 rounded-lg bg-[#E68A5C] text-white flex items-center justify-center">
                                        <Lock size={16} />
                                    </div>
                                    <p className="text-[16px] text-[#F38B4D] mt-2 leading-tight">
                                        You need {reward.points - points} more points to <br /> reach this reward
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-[30px] p-8 max-w-sm w-full relative flex flex-col items-center text-center shadow-2xl animate-scaleIn">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={24} />
                        </button>

                        <div className="mb-6 relative">
                            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                <Gift size={48} className="text-[#0496FF]" />
                            </div>
                            <div className="absolute -top-2 -right-2 text-yellow-400">
                                <Star size={24} className="fill-current animate-spin-slow" />
                            </div>
                            <div className="absolute bottom-0 -left-2 text-green-400">
                                <PartyPopper size={24} />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-[#191919] mb-2">Congratulations John!</h2>
                        <p className="text-sm font-semibold text-gray-800 mb-2">You redeemed the reward successfully!</p>
                        <p className="text-xs text-gray-500 mb-8 max-w-[200px]">
                            Our team will be in touch with details on how you can claim that way.
                        </p>

                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-xs font-bold hover:bg-gray-50 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-2.5 rounded-lg bg-[#0496FF] text-white text-xs font-bold hover:bg-[#037ecc] transition-colors shadow-md"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoyaltyClubTab;
