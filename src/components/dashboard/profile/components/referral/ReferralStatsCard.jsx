import React from 'react';

const ReferralStatsCard = () => {
    return (
        <div className="w-full lg:w-[320px] shrink-0">

            <div className="h-full p-10 rounded-[18px] bg-cover bg-center relative"
                style={{
                    backgroundImage: 'url("/assets/loyality.png")',
                }}
            >
                <div className="p-8 flex flex-col items-center justify-center h-full min-h-[400px] text-center bg-white rounded-[14px]">

                    <div className="mb-12 w-full text-center">
                        <h1 className="text-[#00D285] text-6xl font-bold mb-2 gilory">1</h1>
                        <p className="text-[#191919] font-bold text-lg">Successful<br />referral</p>
                        <div className="w-16 h-1 bg-[#FFD700] mx-auto mt-4"></div>
                    </div>

                    <div className="w-full text-center">
                        <h1 className="text-[#00D285] text-6xl font-bold mb-2 gilory">1</h1>
                        <p className="text-[#191919] font-bold text-lg">Free month</p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ReferralStatsCard;
