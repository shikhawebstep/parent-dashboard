
import React, { useState } from "react";
import { ArrowLeft, User, CreditCard } from "lucide-react";
import CancelMembershipModal from "./CancelMembershipModal";

export default function ServiceDetails({ booking, onBack }) {
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);



    const student = booking?.students?.[0];
    const parent = booking?.isParent ? booking?.parents?.find(p => p.id === booking.bookedByAdmin.id) : booking?.parents?.[0];
    // Fallback logic for parent: check if booking is done by parent, find matching parent, else take first. 
    // But simplistic approach:
    const activeParent = booking?.parents?.[0];
    const classSchedule = booking?.classSchedule;
    const venue = classSchedule?.venue || booking?.venue;
    const payment = booking?.payments?.[0];
    const paymentPlan = booking?.paymentPlan;

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
                                        value={student?.studentFirstName || ""}
                                        className="w-full lg:p-3 p-2 border border-[#E2E1E5] rounded-[12px] focus:outline-none focus:border-[#042C89] text-[#383A46] font-medium"
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="lg:text-[16px] text-[14px] font-medium text-[#282829]">Last name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Enter last name"
                                        value={student?.studentLastName || ""}
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
                                <label className="lg:text-[16px] text-[14px] font-medium text-[#282829]">Start Date</label>
                                <input
                                    type="text"
                                    value={booking?.createdAt ? new Date(booking.createdAt).toLocaleDateString("en-GB") : "N/A"}
                                    className="w-full lg:p-3 p-2 border border-[#E2E1E5] rounded-[12px] focus:outline-none text-[#383A46] font-medium bg-white"
                                    readOnly
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="lg:text-[16px] text-[14px] font-medium text-[#282829]">Venue</label>
                                <input
                                    type="text"
                                    value={venue?.name || "N/A"}
                                    className="w-full lg:p-3 p-2 border border-[#E2E1E5] rounded-[12px] focus:outline-none text-[#383A46] font-medium bg-white"
                                    readOnly
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="lg:text-[16px] text-[14px] font-medium text-[#282829]">Class</label>
                                <input
                                    type="text"
                                    value={student?.classSchedule?.className || "N/A"}
                                    className="w-full lg:p-3 p-2 border border-[#E2E1E5] rounded-[12px] focus:outline-none text-[#383A46] font-medium bg-white"
                                    readOnly
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="lg:text-[16px] text-[14px] font-medium text-[#282829]">Time</label>
                                <input
                                    type="text"
                                    value={student?.classSchedule?.startTime && student?.classSchedule?.endTime ? `${student?.classSchedule.startTime} - ${student?.classSchedule.endTime}` : "N/A"}
                                    className="w-full lg:p-3 p-2 border border-[#E2E1E5] rounded-[12px] focus:outline-none text-[#383A46] font-medium bg-white"
                                    readOnly
                                />
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
                                <span className="text-black/80 lg:text-[16px] text-[14px] text-[#282829] font-semibold">{booking?.status || "Active"}</span>
                            </div>
                        </div>

                        <div className="py-6 pb-2 space-y-5">
                            {/* Profile */}
                            <div className="flex items-center gap-4">
                                <img src="/assets/Ethan-test.png" alt="Avatar" className="w-20 h-full object-cover" />

                                <div>
                                    <h4 className="md:text-[24px] 2xl:text-[20px] xl:text-[18px] lg:text-[16px] text-[14px] font-bold leading-tight">Account Holder</h4>
                                    <p className=" lg:text-[16px] text-[14px] text-[#BDC0C3] font-medium">
                                        {activeParent ? `${activeParent.parentFirstName} ${activeParent.parentLastName}` : "N/A"}
                                        {activeParent?.relationChild ? ` / ${activeParent.relationChild}` : ""}
                                    </p>
                                </div>
                            </div>

                            {/* Details List */}
                            <div className="space-y-4 lg:text-[16px] text-[14px]">
                                {/* Venue - Special Styling */}
                                <div className="border-b border-[#495362] pb-2">
                                    <p className="text-white 2xl:text-[20px] xl:text-[18px] lg:text-[16px] text-[14px] font-medium mb-1">Venue</p>
                                    <span className="bg-[#3B82F6] text-white px-3 py-1 rounded text-xs font-semibold inline-block">
                                        {venue?.address || venue?.name || "N/A"}
                                    </span>
                                </div>

                                <DetailRow label="Membership Plan" value={paymentPlan?.title || "N/A"} />
                                <DetailRow label="Students" value={booking?.students?.length || 0} />
                                <DetailRow label="Monthly Price" value={paymentPlan?.price ? `£${paymentPlan.price}` : "0"} />
                                <DetailRow label="GoCardless ID" value={booking?.id || "N/A"} />
                                <DetailRow
                                    label="Date of Booking"
                                    value={
                                        booking?.createdAt
                                            ? new Date(booking.createdAt).toLocaleString("en-GB")
                                            : "N/A"
                                    }
                                />

                                <div className="border-b border-[#495362] pb-3">
                                    <div className="flex justify-between items-end mb-1">
                                        <p className="text-white 2xl:text-[20px] xl:text-[18px] lg:text-[16px] text-[14px]  font-bold">Progress</p>
                                    </div>
                                    <p className="lg:text-[16px] text-[14px] font-semibold text-[#BDC0C3] mb-2">1 of {paymentPlan?.duration || 12} Months</p>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 bg-gray-600 rounded-full w-full overflow-hidden">
                                            <div className="h-full bg-[#43BE4F] w-[8%]" />
                                        </div>
                                        <p className="text-xs font-bold text-gray-300 text-white">8%</p>
                                    </div>
                                </div>
                                <div className=" pb-2">
                                    <p className="text-white 2xl:text-[20px] xl:text-[18px] lg:text-[16px] text-[14px] font-medium mb-1">Booking Source</p>
                                    <span className="font-semibold text-[#BDC0C3] lg:text-[16px] text-[14px]">
                                        {booking?.source || (typeof parent?.howDidHear === 'string' ? parent.howDidHear : "N/A")}
                                    </span>
                                </div>

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
                booking={booking}
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
