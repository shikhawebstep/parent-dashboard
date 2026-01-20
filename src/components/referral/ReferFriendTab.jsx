import React from 'react';
import { Copy, Share2, Smartphone, Mail, Facebook, Instagram, Linkedin } from 'lucide-react';
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useState } from "react";

const ReferFriendTab = () => {
    const [dialCodes, setDialCodes] = useState("+1");
    return (
        <>
            <div className="bg-white rounded-[30px] md:p-6 p-2  md:border border-gray-100">
                <div className="md:flex md:items-center xl:items-start gap-12">
                    {/* Left Column: Blue Card */}
                    <div style={{ backgroundImage: 'url(/assets/Referr.png)' }} className="bg-cover bg-center rounded-[30px] md:w-[525px] md:p-8 p-6 md:py-14 py-6 text-white relative overflow-hidden flex flex-col items-center text-center justify-center min-h-[400px]">
                        <div className='w-full m-auto max-w-[110px]'>
                            <img src="/assets/rewards.png" alt="" srcset="" />
                        </div>

                        <h2 className="2xl:text-[36px] text-[26px] recline font-bold  md:leading-[35px] leading-[28px] mt-8 md:mb-2">Refer your friends<br />and get benefits!</h2>
                        <p className="text-[16px] font-normal 2xl:my-8 my-5">
                            Lorem ipsum dolor sit amet consectetur. <br className='2xl:block hidden'/> Pellentesque bibendum id duis <br className='2xl:block hidden'/> sit mi lobortis dictum consectetur venenatis.
                        </p>
                        <span className='text-[16px]'>Copy Link</span>
                        <div className="w-full relative mt-2 bg-[#175299] rounded-lg p-1 justify-between flex items-center border border-[#1e4bb5]">
                            <div className="flex-1 px-3 py-2 text-left text-sm text-gray-300 truncate">
                                sharelink.com/get/sft123fg
                            </div>
                            <button className="p-2 hover:text-white bg-[#042C89] rounded-full h-10 w-10 flex items-center justify-center text-gray-400">
                                <Copy size={16} className='text-white' />
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Form & Share */}
                    <div className="flex flex-col justify-center py-4">
                        <div className="mb-8">
                            <h3 className="text-[#191919] font-bold text-[24px] mb-4">Share</h3>
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
                            <h3 className="text-[#191919] font-bold text-[24px] mb-2">Or send us the referee details</h3>
                            <p className="text-[#717073] text-[18px] mb-6">
                                Prefer to send us their details? Use the form below and we'll contact directly your friend for you and if <br className='hidden md:block' /> they sign up, we'll let you know.
                            </p>

                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[16px] font-semibold text-[#191919]">First name</label>
                                        <input
                                            type="text"
                                            placeholder="First name"
                                            className="w-full bg-[#F0F5FF] border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#042C89]"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[16px] font-semibold text-[#191919]">Last name</label>
                                        <input
                                            type="text"
                                            placeholder="Last name"
                                            className="w-full bg-[#F0F5FF] border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#042C89]"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                    <div className="space-y-1">
                                        <label className="text-[16px] font-semibold text-[#191919]">Email</label>
                                        <input
                                            type="email"
                                            placeholder="If known"
                                            className="w-full bg-[#F0F5FF] border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#042C89]"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[16px] font-semibold text-[#191919]">Phone number</label>
                                        <div className={`w-full flex bg-[#F0F5FF] items-center rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#0496FF] outline-none`}>
                                            <div className="w-[13%]">
                                                <PhoneInput
                                                    country="us"
                                                    value={dialCodes}
                                                    disableDropdown={true}
                                                    disableCountryCode={true}
                                                    countryCodeEditable={false}
                                                    inputStyle={{
                                                        display: "none",

                                                    }}
                                                />
                                            </div>
                                            <input
                                                type="tel"
                                                name="phone"
                                                className={`poppins ps-3 text-[14px] border-l border-gray-300 outline-none w-full`}
                                            />
                                        </div>



                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="bg-[#042C89] text-white px-16 py-3 rounded-xl font-semibold text-[18px] hover:bg-[#032066] transition-colors mt-8"
                                >
                                    Submit
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Bottom Reward Info */}
            </div>
            <div className="bg-white rounded-[30px] md:p-10 p-6 flex flex-col shadowCss items-center text-center mt-8">
                <div className="flex space-x-2 mb-4">
                   <img src="/assets/reward.png" alt="" className='md:w-[100px] w-[80px]' />
                </div>
                <h3 className="text-[#042C89] font-bold recline md:text-[36px] text-[25px] mb-2">What the reward is?</h3>
                <p className="text-[#797A88] md:text-[24px] text-[16px]">
                    Get one free month for yourself and give your friend one free month as well.
                </p>
            </div>
        </>
    );
};

export default ReferFriendTab;
