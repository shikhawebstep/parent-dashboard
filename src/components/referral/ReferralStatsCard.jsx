import React from 'react';

const ReferralStatsCard = ({ statusCount }) => {
    return (
        <div className="w-full lg:w-[320px] shrink-0">

            <div className="h-full md:p-10 p-5 rounded-[20px] bg-cover bg-center relative"
                style={{
                    backgroundImage: 'url("/assets/loyality.png")',
                }}
            >
                <div className="md:p-8 p-4 flex lg:flex-col lg:items-center justify-center h-full  text-center bg-white rounded-[22px]">

                    <div className="mb-4 w-full text-left  border-r-4 lg:border-none border-[#FFD700]">
                        <h1 className="text-[#00D285] md:text-[64px] text-[38px] font-bold mb-2 leading-tight gilory">{statusCount?.successful}</h1>
                        <p className="text-[#191919] font-bold md:text-[24px] text-base pb-7">Successful<br />referral</p>
                        <div className="w-full h-1 bg-[#FFD700] mx-auto mt-4 hidden lg:block"></div>
                    </div>

                    <div className="w-full text-left lg:ps-0 ps-7">
                        <h1 className="text-[#00D285] md:text-[64px] text-[38px] font-bold mb-2 leading-tight gilory">1</h1>
                        <p className="text-[#191919] font-bold md:text-[24px] text-base">Free month</p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ReferralStatsCard;
