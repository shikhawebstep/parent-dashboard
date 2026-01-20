
import React, { useState } from "react";
import { ArrowLeft, User, CreditCard } from "lucide-react";
import CancelMembershipModal from "./CancelMembershipModal";

export default function ServiceDetails({ booking, onBack }) {
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    // Mock data or extracted from booking if available
    const studentInfo = {
        firstName: "John", // Placeholder
        lastName: "Doe",  // Placeholder
    };

    return (
        <div className="animate-fadeIn">
            {/* Back Button */}
            <button
                onClick={onBack}
                className="mb-6 mt-5 px-5 lg:p-0 sm:mt-0 flex items-center gap-2 text-[#042C89] font-semibold hover:text-blue-800 transition-colors"
            >
                <ArrowLeft size={20} />
                Back to History
            </button>

            <div className="flex flex-col md:flex-row items-start gap-6">
                {/* Left Side: Forms */}
                <div className="flex-1 xl:w-[70%] md:w-[60%] w-full space-y-8 p-6 pb-10 rounded-[30px] bg-white">

                    {/* Student Information */}
                    <section>
                        <h2 className="md:text-[24px] 2xl:text-[20px] xl:text-[18px] lg:text-[16px] text-[14px] font-bold text-[#383A46] mb-4">Student information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="lg:text-[16px] text-[14px] font-medium text-[#282829] font-medium">First name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Enter first name"
                                        defaultValue={studentInfo.firstName}
                                        className="w-full lg:p-3 p-2 border border-[#E2E1E5] rounded-[12px] focus:outline-none focus:border-[#042C89] text-[#383A46] font-medium"
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="lg:text-[16px] text-[14px] font-medium text-[#282829] font-medium">Last name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Enter last name"
                                        defaultValue={studentInfo.lastName}
                                        className="w-full lg:p-3 p-2 border border-[#E2E1E5] rounded-[12px] focus:outline-none focus:border-[#042C89] text-[#383A46] font-medium"
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Booking Information */}
                    <section>
                        <h2 className="md:text-[24px] 2xl:text-[20px] xl:text-[18px] lg:text-[16px] text-[14px] font-bold text-[#383A46] mb-4">Booking information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="lg:text-[16px] text-[14px] font-medium text-[#282829] font-medium">Start Date</label>
                                <select className="w-full lg:p-3 p-2 border border-[#E2E1E5] rounded-[12px] focus:outline-none focus:border-[#042C89] bg-white text-[#383A46] font-medium appearance-none">
                                    <option>4-7 years</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="lg:text-[16px] text-[14px] font-medium text-[#282829] font-medium">Venue</label>
                                <div className="relative">
                                    <select className="w-full lg:p-3 p-2 border border-[#E2E1E5] rounded-[12px] focus:outline-none focus:border-[#042C89] bg-white text-[#383A46] font-medium appearance-none">
                                        <option>Automatic entry</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 1.5L6 6.5L11 1.5" stroke="#717073" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="lg:text-[16px] text-[14px] font-medium text-[#282829] font-medium">Class</label>
                                <div className="relative">
                                    <select className="w-full lg:p-3 p-2 border border-[#E2E1E5] rounded-[12px] focus:outline-none focus:border-[#042C89] bg-white text-[#383A46] font-medium appearance-none">
                                        <option>4-7 years</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 1.5L6 6.5L11 1.5" stroke="#717073" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="lg:text-[16px] text-[14px] font-medium text-[#282829] font-medium">Time</label>
                                <div className="relative">
                                    <select className="w-full lg:p-3 p-2 border border-[#E2E1E5] rounded-[12px] focus:outline-none focus:border-[#042C89] bg-white text-[#383A46] font-medium appearance-none">
                                        <option>Automatic entry</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 1.5L6 6.5L11 1.5" stroke="#717073" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>

                {/* Right Side: Account Status Card */}
                <div className="xl:w-[30%] md:w-[40%] w-[90%] m-auto">
                    <div className="bg-[#363E49] rounded-[30px] overflow-hidden text-white shadow-lg flex flex-col lg:p-7 p-3 h-fit">
                        {/* Header */}
                        <div
                            style={{ backgroundImage: "url('/assets/Frame.png')" }}
                            className="bg-cover bg-center px-6 rounded-[20px] md:py-4 py-2 flex justify-between items-center relative overflow-hidden"
                        >
                            {/* Decorative curve (optional, simple SVG or CSS) */}

                            <div className="flex flex-col">
                                <h3 className="text-black font-bold 2xl:text-[20px] xl:text-[18px] lg:text-[16px] text-[14px] leading-tight">Account Status</h3>
                                <span className="text-black/80 lg:text-[16px] text-[14px] text-[#282829] font-semibold">Active</span>
                            </div>
                        </div>

                        <div className="py-6 pb-2 space-y-5">
                            {/* Profile */}
                            <div className="flex items-center gap-4">
                                <img src="/assets/Ethan-test.png" alt="Avatar" className="w-20 h-full object-cover" />

                                <div>
                                    <h4 className="md:text-[24px] 2xl:text-[20px] xl:text-[18px] lg:text-[16px] text-[14px] font-bold leading-tight">Account Holder</h4>
                                    <p className=" lg:text-[16px] text-[14px] text-[#BDC0C3] font-medium">John Doe / Father</p>
                                </div>
                            </div>

                            {/* Details List */}
                            <div className="space-y-4 lg:text-[16px] text-[14px]">
                                {/* Venue - Special Styling */}
                                <div className="border-b border-[#495362] pb-2">
                                    <p className="text-white 2xl:text-[20px] xl:text-[18px] lg:text-[16px] text-[14px] font-medium mb-1">Venue</p>
                                    <span className="bg-[#3B82F6] text-white px-3 py-1 rounded text-xs font-semibold inline-block">
                                        {booking.venue || "Acton"}
                                    </span>
                                </div>

                                <DetailRow label="Membership Plan" value={booking.plan || "12 Month Plan"} />
                                <DetailRow label="Students" value={booking.students || "1"} />
                                <DetailRow label="Monthly Price" value={booking.price || "£3999"} />
                                <DetailRow label="GoCardless ID" value={booking.id || "XHDJDHLS314"} />
                                <DetailRow
                                    label="Date of Booking"
                                    value={booking.createdAt ? new Date(booking.createdAt).toLocaleString("en-IN") : "Nov 18 2021, 17:00"}
                                />

                                <div className="border-b border-[#495362] pb-3">
                                    <div className="flex justify-between items-end mb-1">
                                        <p className="text-white 2xl:text-[20px] xl:text-[18px] lg:text-[16px] text-[14px]  font-bold">Progress</p>
                                    </div>
                                    <p className="lg:text-[16px] text-[14px] font-semibold text-[#BDC0C3] mb-2">6 of 12 Months</p>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 bg-gray-600 rounded-full w-full overflow-hidden">
                                            <div className="h-full bg-[#43BE4F] w-[78%]" />
                                        </div>
                                        <p className="text-xs font-bold text-gray-300 text-white">78%</p>
                                    </div>
                                </div>

                                <DetailRow label="Booking Source" value={booking.source || "Ben Marcus"} />
                            </div>

                            <button
                                onClick={() => setIsCancelModalOpen(true)}
                                className="w-full py-3 bg-[#237FEA] rounded-[12px] font-semibold text-white lg:text-[18px] lg:text-[16px] text-[14px] hover:bg-blue-600 transition-colors mt-2"
                            >
                                Request to cancel membership
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <CancelMembershipModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
            />
        </div>
    );
}

function DetailRow({ label, value }) {
    return (
        <div className="border-b border-[#495362] pb-3">
            <p className="text-white 2xl:text-[20px] xl:text-[18px] lg:text-[16px] text-[14px] font-bold mb-0.5">{label}</p>
            <p className="font-semibold text-[#BDC0C3] lg:text-[16px] text-[14px]">{value}</p>
        </div>
    );
}
