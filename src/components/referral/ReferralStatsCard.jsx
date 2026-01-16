import React from 'react';

const ReferralStatsCard = () => {
    return (
        <div className="w-full lg:w-[320px] shrink-0">

            <div className="h-full p-10 rounded-[20px] bg-cover bg-center relative"
                style={{
                    backgroundImage: 'url("/assets/loyality.png")',
                }}
            >
                <div className="p-8 flex flex-col items-center justify-center h-full  text-center bg-white rounded-[22px]">

                    <div className="mb-4 w-full text-left">
                        <h1 className="text-[#00D285] text-[64px] font-bold mb-2 leading-tight gilory">1</h1>
                        <p className="text-[#191919] font-bold text-[24px] pb-7">Successful<br />referral</p>
                        <div className="w-full h-1 bg-[#FFD700] mx-auto mt-4"></div>
                    </div>

                    <div className="w-full text-left">
                        <h1 className="text-[#00D285] text-[64px] font-bold mb-2 leading-tight gilory">1</h1>
                        <p className="text-[#191919] font-bold text-[24px]">Free month</p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ReferralStatsCard;
