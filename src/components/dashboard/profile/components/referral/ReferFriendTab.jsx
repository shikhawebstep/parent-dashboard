import React from 'react';
import { Copy, Share2, Smartphone, Mail, Facebook, Instagram, Linkedin } from 'lucide-react';

const ReferFriendTab = () => {
    return (
        <div className="bg-white rounded-[30px] p-6 shadow-sm border border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Blue Card */}
                <div className="bg-[#042C89] rounded-[24px] p-8 text-white relative overflow-hidden flex flex-col items-center text-center justify-center min-h-[400px]">
                    <div className='w-full m-auto max-w-[200px]'>                    <img src="/assets/rewards.png" alt="" srcset="" />
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

                {/* Right Column: Form & Share */}
                <div className="flex flex-col justify-center py-4">
                    <div className="mb-8">
                        <h3 className="text-[#191919] font-bold text-lg mb-4">Share</h3>
                        <div className="flex gap-4">
                            <button className="w-10 h-10 rounded-full bg-[#0DD180] text-white flex items-center justify-center hover:bg-[#0bb56e] transition-colors">
                                <Smartphone size={20} />
                            </button>
                            <button className="w-10 h-10 rounded-full bg-[#0DD180] text-white flex items-center justify-center hover:bg-[#0bb56e] transition-colors">
                                <Mail size={20} />
                            </button>
                            <button className="w-10 h-10 rounded-full bg-[#0DD180] text-white flex items-center justify-center hover:bg-[#0bb56e] transition-colors">
                                <Facebook size={20} />
                            </button>
                            <button className="w-10 h-10 rounded-full bg-[#0DD180] text-white flex items-center justify-center hover:bg-[#0bb56e] transition-colors">
                                <Instagram size={20} />
                            </button>
                            <button className="w-10 h-10 rounded-full bg-[#0DD180] text-white flex items-center justify-center hover:bg-[#0bb56e] transition-colors">
                                <Linkedin size={20} />
                            </button>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-[#191919] font-bold text-lg mb-2">Or send us the referee details</h3>
                        <p className="text-[#717073] text-sm mb-6">
                            Prefer to send us their details? Use the form below and we'll contact directly your friend for you and if they sign up, we'll let you know.
                        </p>

                        <form className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-[#191919]">First name</label>
                                    <input
                                        type="text"
                                        placeholder="First name"
                                        className="w-full bg-[#F5F7FA] border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#042C89]"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-[#191919]">Last name</label>
                                    <input
                                        type="text"
                                        placeholder="Last name"
                                        className="w-full bg-[#F5F7FA] border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#042C89]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-[#191919]">Email</label>
                                    <input
                                        type="email"
                                        placeholder="If known"
                                        className="w-full bg-[#F5F7FA] border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#042C89]"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-[#191919]">Phone number</label>
                                    <div className="relative">
                                        {/* Placeholder for country code dropdown */}
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs flex items-center gap-1 cursor-pointer">
                                            <span>🇬🇧</span>
                                            <span>▼</span>
                                        </div>
                                        <input
                                            type="tel"
                                            className="w-full bg-[#F5F7FA] border-none rounded-lg pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-[#042C89]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="bg-[#042C89] text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-[#032066] transition-colors mt-2"
                            >
                                Submit
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Bottom Reward Info */}
            <div className="bg-white rounded-[30px] p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center mt-8">
                <div className="flex -space-x-2 mb-4">
                    {/* Icons representing people sharing/high-five - using Lucide or simple shapes */}
                    <div className="bg-[#00D285] p-2 rounded-full text-white z-10">
                        <Share2 size={24} />
                    </div>
                </div>
                <h3 className="text-[#042C89] font-bold font-serif text-2xl mb-2">What the reward is?</h3>
                <p className="text-[#717073]">
                    Get one free month for yourself and give your friend one free month as well.
                </p>
            </div>
        </div>
    );
};

export default ReferFriendTab;
