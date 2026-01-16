import React from 'react';
import { Copy } from 'lucide-react';

const ReferralPromoCard = () => {
    return (
        <div className="bg-[#042C89] rounded-[24px] p-8 text-white relative overflow-hidden flex flex-col items-center text-center justify-center min-h-[400px]">
            {/* Illustration Placeholder */}
            <div className="mb-6 relative">
                {/* Simple CSS illustration of a gift box */}
                <div className="w-24 h-24 bg-[#00D285] rounded-lg relative mx-auto flex items-center justify-center">
                    <div className="absolute w-4 h-full bg-[#FFD700] left-1/2 -translate-x-1/2"></div>
                    <div className="absolute w-full h-4 bg-[#FFD700] top-1/2 -translate-y-1/2"></div>
                    <div className="absolute -top-4 w-12 h-12 border-4 border-[#FFD700] rounded-full left-1/2 -translate-x-1/2 border-b-transparent"></div>
                    {/* Particles */}
                    <div className="absolute -top-8 left-0 text-[#FFD700]">★</div>
                    <div className="absolute -top-4 right-[-10px] text-white">✦</div>
                </div>
                <div className="absolute right-[-20px] bottom-0 text-[#FFD700]">
                    <div className="w-8 h-8 rounded-full bg-[#FFD700] opacity-80"></div>
                    <div className="w-8 h-8 rounded-full bg-[#FFD700] opacity-80 absolute top-[-5px] right-[5px]"></div>
                </div>
            </div>

            <h2 className="text-3xl font-bold font-serif mb-2">Refer your friends<br />and get benefits!</h2>
            <p className="text-sm opacity-80 max-w-xs mb-8">
                Lorem ipsum dolor sit amet consectetur. Pellentesque bibendum id duis sit mi lobortis dictum consectetur venenatis.
            </p>

            <div className="w-full max-w-xs relative bg-[#0A389E] rounded-lg p-1 flex items-center border border-[#1e4bb5]">
                <div className="flex-1 px-3 py-2 text-sm text-gray-300 truncate">
                    sharelink.com/get/sft123fg
                </div>
                <button className="p-2 hover:text-white text-gray-400">
                    <Copy size={18} />
                </button>
            </div>
        </div>
    );
};

export default ReferralPromoCard;
