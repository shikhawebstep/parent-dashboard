import React from 'react';
import { Smartphone, Mail, Facebook, Instagram, Linkedin } from 'lucide-react';

const ReferralForm = () => {
    return (
        <div className="flex flex-col justify-center py-4">
            <div className="mb-8">
                <h3 className="text-[#191919] font-bold text-lg mb-4">Share</h3>
                <div className="flex gap-4">
                    {[Smartphone, Mail, Facebook, Instagram, Linkedin].map((Icon, index) => (
                        <button key={index} className="w-10 h-10 rounded-full bg-[#0DD180] text-white flex items-center justify-center hover:bg-[#0bb56e] transition-colors">
                            <Icon size={20} />
                        </button>
                    ))}
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
    );
};

export default ReferralForm;
