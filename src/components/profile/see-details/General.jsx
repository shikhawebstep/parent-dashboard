import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import CancelMembershipModal from "../CancelMembershipModal";
import { useLocation, useNavigate } from "react-router-dom";
import { showSuccess, showError, showConfirm } from "../../../../utils/swalHelper";
import CancelTrial from "../../modals/CancelTrial";

// ── helpers ────────────────────────────────────────────────────────────────

const safeValue = (value, fallback = "N/A") => {
    if (value === undefined || value === null || value === "") return fallback;
    return value;
};

const safeName = (first, last, fallback = "N/A") => {
    const parts = [first, last].filter(
        (p) => p !== undefined && p !== null && p !== ""
    );
    return parts.length > 0 ? parts.join(" ") : fallback;
};

const safeDate = (date, locale = "en-GB", fallback = "N/A") => {
    if (!date) return fallback;
    const d = new Date(date);
    return isNaN(d.getTime()) ? fallback : d.toLocaleDateString(locale);
};

const safeDateLocaleString = (date, locale = "en-GB", fallback = "N/A") => {
    if (!date) return fallback;
    const d = new Date(date);
    return isNaN(d.getTime()) ? fallback : d.toLocaleString(locale);
};

const safePrice = (price, fallback = "N/A") => {
    if (price === undefined || price === null) return fallback;
    return `£${price}`;
};

const safeTimeRange = (start, end, fallback = "N/A") => {
    if (!start || !end) return fallback;
    return `${start} - ${end}`;
};

// ── DetailRow ──────────────────────────────────────────────────────────────

function DetailRow({ label, value }) {
    return (
        <div className="border-b border-[#495362] pb-3">
            <p className="text-white 2xl:text-[20px] xl:text-[18px] lg:text-[16px] text-[14px] font-bold mb-0.5">
                {label}
            </p>
            <p className="font-semibold text-[#BDC0C3] lg:text-[16px] text-[14px]">
                {safeValue(value)}
            </p>
        </div>
    );
}

// ── ServiceDetails ─────────────────────────────────────────────────────────

export default function General({ booking: propBooking, details, loading: mainLoading }) {
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelModal, setCancelModal] = useState({ open: false, booking: null })
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const booking = details;

    if (mainLoading) {
        return (
            <div className="animate-fadeIn p-6 text-center bg-white rounded-[30px] shadow-sm flex flex-col justify-center items-center min-h-[200px] gap-3">
                <div className="w-8 h-8 border-4 border-[#237FEA] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[#3c3c3d] font-medium">Loading details...</p>
            </div>
        );
    }

    if (!booking && !details) {
        return (
            <div className="animate-fadeIn p-6 text-center bg-white rounded-[30px] shadow-sm">
                <p className="text-[#3c3c3d] font-medium">
                    No booking details available.
                </p>

            </div>
        );
    }

    const students = details?.students || booking?.students || [];
    const parents = details?.parents || booking?.parents || [];
    const emergency = details?.emergency || booking?.emergency;

    const serviceType = booking?.serviceType || details?.serviceType || "weekly class membership";

    let bookingStartDate = booking?.createdAt;
    let bookingVenueName = "N/A";
    let bookingClassName = "N/A";
    let bookingTime = "N/A";

    if (serviceType === "one to one") {
        bookingStartDate = booking?.date || booking?.createdAt;
        bookingVenueName = [booking?.location, booking?.address].filter(Boolean).join(" - ") || "N/A";
        bookingClassName = booking?.package?.packageName || "N/A";
        bookingTime = booking?.time || "N/A";
    } else if (serviceType === "birthday party") {
        bookingStartDate = booking?.leads?.partyDate || booking?.createdAt;
        bookingVenueName = booking?.venue?.name || "N/A";
        bookingClassName = booking?.package?.packageName || "N/A";
        bookingTime = booking?.package?.partyDuration ? `${booking.package.partyDuration} mins` : "N/A";
    } else if (serviceType === "holiday camp") {
        bookingStartDate = booking?.holidayCamp?.holidayCampDates?.[0]?.startDate || booking?.createdAt;
        bookingVenueName = booking?.holidayVenue?.name || students?.[0]?.holidayClassSchedules?.venue?.name || "N/A";
        bookingClassName = students?.[0]?.holidayClassSchedules?.className || booking?.holidayCamp?.name || "N/A";
        bookingTime = safeTimeRange(students?.[0]?.holidayClassSchedules?.startTime, students?.[0]?.holidayClassSchedules?.endTime);
    } else {
        const classSchedule = booking?.classSchedule || students?.[0]?.classSchedule;
        const venue = booking?.classSchedule?.venue || booking?.venue || details?.venue;

        bookingStartDate = booking?.startDate || booking?.createdAt;
        bookingVenueName = venue?.name || "N/A";
        bookingClassName = classSchedule?.className || "N/A";
        bookingTime = safeTimeRange(classSchedule?.startTime, classSchedule?.endTime);
    }

    const paymentPlan = booking?.paymentPlan || details?.paymentPlan;

    console.log('paymentPlan',paymentPlan)

    // Progress bar
    const progressTotal = booking?.progressBar?.totalBars || 0;
    const progressFilled = booking?.progressBar?.filledBars || 0;
    const progressPercent =
        progressTotal > 0 ? Math.round((progressFilled / progressTotal) * 100) : 0;

const getBookingSource = (b) => {
    const source = b?.source || b?.marketingChannel || b?.lead?.source;
    const adminName = safeName(
        b?.bookedByAdmin?.firstName,
        b?.bookedByAdmin?.lastName,
        ""
    );
    if (adminName && source) return `${adminName} (${source})`;
    if (adminName) return adminName;
    if (source) return source;
    return "N/A";
};
    const handleCancelCamp = async (booking) => {
        const result = await showConfirm(
            "Cancel Camp",
            "Are you sure you want to cancel this holiday camp?",
            "Yes, cancel it!"
        );

        if (result.isConfirmed) {
            setLoading(true);
            try {
                const token = localStorage.getItem("parentToken");
                const API_URL = import.meta.env.VITE_API_BASE_URL;

                const response = await fetch(`${API_URL}api/parent/holiday/cancel/${booking.id}`, {
                    method: "PATCH",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                let data = {};
                try {
                    data = await response.json();
                } catch (e) {
                    // ignore
                }

                if (!response.ok) {
                    throw new Error(data?.message || "Failed to cancel holiday camp");
                }

                showSuccess(data?.message || "Camp Cancelled successfully");
            } catch (error) {
                showError(error?.message || "Something went wrong");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleCancelTrial = async ({ reason, notes, booking }) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("parentToken");
            const API_URL = import.meta.env.VITE_API_BASE_URL;

            const response = await fetch(`${API_URL}api/parent/booking-update/cancel-trial`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    bookingId: booking.id,
                    cancelReason: reason,
                    additionalNote: notes
                })
            });

            let data = {};
            try { data = await response.json(); } catch (e) { }

            if (!response.ok) throw new Error(data?.message || "Failed to cancel trial");

            showSuccess(data?.message || "Trial cancelled successfully");
            setCancelModal({ open: false, booking: null });
        } catch (error) {
            showError(error?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="animate-fadeIn">

            <div className="flex flex-col md:flex-row items-start gap-6">
                {/* ── Left Side: Forms ── */}
                <div className="flex-1 xl:w-[70%] md:w-[60%] w-full space-y-8 p-6 pb-10 rounded-[30px] bg-white">

                    {/* Parent Information */}
                    {parents.length > 0 && (
                        parents.map((parent, idx) => (
                            <section key={`parent-${idx}`} className={idx > 0 ? "pt-6 border-t border-gray-100" : ""}>
                                <h2 className="md:text-[24px] 2xl:text-[20px] xl:text-[18px] lg:text-[16px] text-[14px] font-bold text-[#383A46] mb-4">
                                    Parent information {parents.length > 1 ? `(${idx + 1})` : ""}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="space-y-1">
                                        <label className="lg:text-[16px] text-[14px] font-medium text-[#282829]">First name</label>
                                        <input type="text" value={safeValue(parent?.parentFirstName || parent?.firstName, "")} className="w-full lg:p-3 p-2 border border-[#E2E1E5] rounded-[12px] focus:outline-none text-[#383A46] font-medium bg-white" readOnly />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="lg:text-[16px] text-[14px] font-medium text-[#282829]">Last name</label>
                                        <input type="text" value={safeValue(parent?.parentLastName || parent?.lastName, "")} className="w-full lg:p-3 p-2 border border-[#E2E1E5] rounded-[12px] focus:outline-none text-[#383A46] font-medium bg-white" readOnly />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="space-y-1">
                                        <label className="lg:text-[16px] text-[14px] font-medium text-[#282829]">Email</label>
                                        <input type="text" value={safeValue(parent?.parentEmail || parent?.email, "")} className="w-full lg:p-3 p-2 border border-[#E2E1E5] rounded-[12px] focus:outline-none text-[#383A46] font-medium bg-white" readOnly />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="lg:text-[16px] text-[14px] font-medium text-[#282829]">Phone number</label>
                                        <input type="text" value={safeValue(parent?.parentPhoneNumber || parent?.phoneNumber, "")} className="w-full lg:p-3 p-2 border border-[#E2E1E5] rounded-[12px] focus:outline-none text-[#383A46] font-medium bg-white" readOnly />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="space-y-1">
                                        <label className="lg:text-[16px] text-[14px] font-medium text-[#282829]">Relation to child</label>
                                        <input type="text" value={safeValue(parent?.relationChild || parent?.relationToChild, "")} className="w-full lg:p-3 p-2 border border-[#E2E1E5] rounded-[12px] focus:outline-none text-[#383A46] font-medium bg-white" readOnly />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="lg:text-[16px] text-[14px] font-medium text-[#282829]">How did you hear about us?</label>
                                        <input type="text" value={safeValue(parent?.howDidHear || parent?.howDidYouHear, "")} className="w-full lg:p-3 p-2 border border-[#E2E1E5] rounded-[12px] focus:outline-none text-[#383A46] font-medium bg-white" readOnly />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="lg:text-[16px] text-[14px] font-medium text-[#282829]">What's the main reason you're interested in Samba Soccer Schools?</label>
                                        <input type="text" value={safeValue(parent?.interestReason, "")} className="w-full lg:p-3 p-2 border border-[#E2E1E5] rounded-[12px] focus:outline-none text-[#383A46] font-medium bg-white" readOnly />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="lg:text-[16px] text-[14px] font-medium text-[#282829]">Tell us a bit more (optional)</label>
                                        <input type="text" value={safeValue(parent?.interestReasonOther, "")} className="w-full lg:p-3 p-2 border border-[#E2E1E5] rounded-[12px] focus:outline-none text-[#383A46] font-medium bg-white" readOnly />
                                    </div>
                                </div>
                            </section>
                        ))
                    )}

                    {/* Student Information */}
                    {students.length > 0 ? (
                        students.map((student, idx) => (
                            <section key={`student-${idx}`} className={(idx > 0 || parents.length > 0) ? "pt-6 border-t border-gray-100" : ""}>
                                <h2 className="md:text-[24px] 2xl:text-[20px] xl:text-[18px] lg:text-[16px] text-[14px] font-bold text-[#383A46] mb-4">
                                    Student information {students.length > 1 ? `(${idx + 1})` : ""}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="space-y-1">
                                        <label className="lg:text-[16px] text-[14px] font-medium text-[#282829]">First name</label>
                                        <input type="text" value={safeValue(student?.studentFirstName || student?.firstName, "")} className="w-full lg:p-3 p-2 border border-[#E2E1E5] rounded-[12px] focus:outline-none text-[#383A46] font-medium bg-white" readOnly />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="lg:text-[16px] text-[14px] font-medium text-[#282829]">Last name</label>
                                        <input type="text" value={safeValue(student?.studentLastName || student?.lastName, "")} className="w-full lg:p-3 p-2 border border-[#E2E1E5] rounded-[12px] focus:outline-none text-[#383A46] font-medium bg-white" readOnly />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="space-y-1">
                                        <label className="lg:text-[16px] text-[14px] font-medium text-[#282829]">Date of birth</label>
                                        <input type="text" value={safeValue(student?.dateOfBirth, "")} className="w-full lg:p-3 p-2 border border-[#E2E1E5] rounded-[12px] focus:outline-none text-[#383A46] font-medium bg-white" readOnly />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="lg:text-[16px] text-[14px] font-medium text-[#282829]">Age</label>
                                        <input type="text" value={safeValue(student?.age, "")} className="w-full lg:p-3 p-2 border border-[#E2E1E5] rounded-[12px] focus:outline-none text-[#383A46] font-medium bg-white" readOnly />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="lg:text-[16px] text-[14px] font-medium text-[#282829]">Gender</label>
                                        <input type="text" value={safeValue(student?.gender, "")} className="w-full lg:p-3 p-2 border border-[#E2E1E5] rounded-[12px] focus:outline-none text-[#383A46] font-medium bg-white" readOnly />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="lg:text-[16px] text-[14px] font-medium text-[#282829]">Medical information</label>
                                        <input type="text" value={safeValue(student?.medicalInfo || student?.medicalInformation, "")} className="w-full lg:p-3 p-2 border border-[#E2E1E5] rounded-[12px] focus:outline-none text-[#383A46] font-medium bg-white" readOnly />
                                    </div>
                                </div>
                            </section>
                        ))
                    ) : (
                        <section className={parents.length > 0 ? "pt-6 border-t border-gray-100" : ""}>
                            <h2 className="md:text-[24px] 2xl:text-[20px] xl:text-[18px] lg:text-[16px] text-[14px] font-bold text-[#383A46] mb-4">
                                Student information
                            </h2>
                            <p className="text-[#717073]">No student information available.</p>
                        </section>
                    )}

                    {/* Emergency Contact Information */}
                    {emergency && (
                        <section className={(parents.length > 0 || students.length > 0) ? "pt-6 border-t border-gray-100" : ""}>
                            <h2 className="md:text-[24px] 2xl:text-[20px] xl:text-[18px] lg:text-[16px] text-[14px] font-bold text-[#383A46] mb-4">
                                Emergency contact details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="space-y-1">
                                    <label className="lg:text-[16px] text-[14px] font-medium text-[#282829]">First name</label>
                                    <input type="text" value={safeValue(emergency?.emergencyFirstName, "")} className="w-full lg:p-3 p-2 border border-[#E2E1E5] rounded-[12px] focus:outline-none text-[#383A46] font-medium bg-white" readOnly />
                                </div>
                                <div className="space-y-1">
                                    <label className="lg:text-[16px] text-[14px] font-medium text-[#282829]">Last name</label>
                                    <input type="text" value={safeValue(emergency?.emergencyLastName, "")} className="w-full lg:p-3 p-2 border border-[#E2E1E5] rounded-[12px] focus:outline-none text-[#383A46] font-medium bg-white" readOnly />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="lg:text-[16px] text-[14px] font-medium text-[#282829]">Phone number</label>
                                    <input type="text" value={safeValue(emergency?.emergencyPhoneNumber, "")} className="w-full lg:p-3 p-2 border border-[#E2E1E5] rounded-[12px] focus:outline-none text-[#383A46] font-medium bg-white" readOnly />
                                </div>
                                <div className="space-y-1">
                                    <label className="lg:text-[16px] text-[14px] font-medium text-[#282829]">Relation to child</label>
                                    <input type="text" value={safeValue(emergency?.emergencyRelation, "")} className="w-full lg:p-3 p-2 border border-[#E2E1E5] rounded-[12px] focus:outline-none text-[#383A46] font-medium bg-white" readOnly />
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Booking Information */}
                    <section className={(parents.length > 0 || students.length > 0 || emergency) ? "pt-6 border-t border-gray-100" : ""}>
                        <h2 className="md:text-[24px] 2xl:text-[20px] xl:text-[18px] lg:text-[16px] text-[14px] font-bold text-[#383A46] mb-4">
                            Booking information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="lg:text-[16px] text-[14px] font-medium text-[#282829]">
                                    Start Date
                                </label>
                                <input
                                    type="text"
                                    value={safeDate(bookingStartDate)}
                                    className="w-full lg:p-3 p-2 border border-[#E2E1E5] rounded-[12px] focus:outline-none text-[#383A46] font-medium bg-white"
                                    readOnly
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="lg:text-[16px] text-[14px] font-medium text-[#282829]">
                                    Venue
                                </label>
                                <input
                                    type="text"
                                    value={bookingVenueName}
                                    className="w-full lg:p-3 p-2 border border-[#E2E1E5] rounded-[12px] focus:outline-none text-[#383A46] font-medium bg-white"
                                    readOnly
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="lg:text-[16px] text-[14px] font-medium text-[#282829]">
                                    Class / Package
                                </label>
                                <input
                                    type="text"
                                    value={bookingClassName}
                                    className="w-full lg:p-3 p-2 border border-[#E2E1E5] rounded-[12px] focus:outline-none text-[#383A46] font-medium bg-white"
                                    readOnly
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="lg:text-[16px] text-[14px] font-medium text-[#282829]">
                                    Time
                                </label>
                                <input
                                    type="text"
                                    value={bookingTime}
                                    className="w-full lg:p-3 p-2 border border-[#E2E1E5] rounded-[12px] focus:outline-none text-[#383A46] font-medium bg-white"
                                    readOnly
                                />
                            </div>
                        </div>
                    </section>
                </div>

                {/* ── Right Side: Account Status Card ── */}
                <div className="xl:w-[30%] md:w-[40%] w-[90%] mx-auto">
                    <div className="bg-[#363E49] rounded-[30px] overflow-hidden text-white shadow-lg flex flex-col lg:p-7 p-3 h-fit">

                        {/* Header */}
                        <div
                            style={{ backgroundImage: "url('/assets/Frame.png')" }}
                            className="bg-cover bg-center px-6 rounded-[20px] md:py-4 py-2 flex justify-between items-center relative overflow-hidden"
                        >
                            <div className="flex flex-col">
                                <h3 className="text-black font-bold 2xl:text-[20px] xl:text-[18px] lg:text-[16px] text-[14px] leading-tight">
                                    Account Status
                                </h3>
                                <span className="text-black/80 lg:text-[16px] text-[14px] text-[#282829] font-semibold">
                                    {safeValue(booking?.status, "Active")}
                                </span>
                            </div>
                        </div>

                        <div className="py-6 pb-2 space-y-5">
                            {/* Profile */}
                            {parents.length > 0 ? (() => {
                                const parent = parents[0];
                                const parentDisplayName = safeName(
                                    parent?.parentFirstName || parent?.firstName,
                                    parent?.parentLastName || parent?.lastName
                                );
                                const profilePhoto = parent?.profile;
                                const parentRelation = parent?.relationChild
                                    ? ` / ${parent.relationChild}`
                                    : "";
                                return (
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={profilePhoto || "/assets/dummy-avatar.png"}
                                            alt="Avatar"
                                            className="w-20 h-20 rounded-full object-cover"
                                        />
                                        <div>
                                            <h4 className="md:text-[24px] 2xl:text-[20px] xl:text-[18px] lg:text-[16px] text-[14px] font-bold leading-tight">
                                                Account Holder
                                            </h4>
                                            <p className="lg:text-[16px] text-[14px] text-[#BDC0C3] font-medium">
                                                {parentDisplayName}
                                                {parentRelation}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })() : (
                                <div className="flex items-center gap-4">
                                    <img
                                        src={parent?.profile || "/assets/dummy-avatar.png"}
                                        alt="Avatar"
                                        className="w-20 h-20 rounded-full object-cover"
                                    />
                                    <div>
                                        <h4 className="md:text-[24px] 2xl:text-[20px] xl:text-[18px] lg:text-[16px] text-[14px] font-bold leading-tight">
                                            Account Holder
                                        </h4>
                                        <p className="lg:text-[16px] text-[14px] text-[#BDC0C3] font-medium">
                                            N/A
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Details List */}
                            <div className="space-y-4 lg:text-[16px] text-[14px]">
                                {serviceType === "weekly class membership" && (
                                    <>
                                        <div className="border-b border-[#495362] pb-2">
                                            <p className="text-white 2xl:text-[20px] xl:text-[18px] lg:text-[16px] text-[14px] font-medium mb-1">Venue</p>
                                            <span className="bg-[#3B82F6] text-white px-3 py-1 rounded text-xs font-semibold inline-block">{bookingVenueName}</span>
                                        </div>
                                        <DetailRow label="Membership Plan" value={paymentPlan?.title} />
                                        <DetailRow label="Students" value={Array.isArray(booking?.students) ? booking.students.length : null} />
                                        <DetailRow
                                            label={booking?.payments?.some((payment) => payment?.paymentType === "accesspaysuite") ? "Contract ID" : "KGo/Cardless ID"}
                                            value={booking?.payments?.some((payment) => payment?.paymentType === "accesspaysuite") ? booking?.payments?.find((payment) => payment?.paymentType === "accesspaysuite")?.gatewayResponse?.Contract || "N/A" : booking?.payments?.find((payment) => payment?.goCardlessMandateId)?.goCardlessMandateId || "N/A"}
                                        />
                                        <DetailRow label="Monthly Price" value={safePrice(booking?.paymentPlan?.price, "N/A")} />
                                        <DetailRow label="Date Of Booking" value={safeDateLocaleString(booking?.createdAt)} />

                                        {/* Progress */}
                                        <div className="border-b border-[#495362] pb-3">
                                            <div className="flex justify-between items-end mb-1">
                                                <p className="text-white 2xl:text-[20px] xl:text-[18px] lg:text-[16px] text-[14px] font-bold">Progress</p>
                                            </div>
                                            <p className="lg:text-[16px] text-[14px] font-semibold text-[#BDC0C3] mb-2">{progressFilled} of {progressTotal} Months</p>
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 bg-gray-600 rounded-full w-full overflow-hidden">
                                                    <div className="h-full bg-[#43BE4F]" style={{ width: `${progressPercent}%` }} />
                                                </div>
                                                <p className="text-xs font-bold text-gray-300 text-white">{progressPercent}%</p>
                                            </div>
                                        </div>

                                        <DetailRow label="Booking Source" value={getBookingSource(booking)} />
                                    </>
                                )}

                                {(serviceType === "weekly class trial" && booking?.bookingType === "free") && (
                                    <>
                                        <div className="border-b border-[#495362] pb-2">
                                            <p className="text-white 2xl:text-[20px] xl:text-[18px] lg:text-[16px] text-[14px] font-medium mb-1">Venue</p>
                                            <span className="bg-[#3B82F6] text-white px-3 py-1 rounded text-xs font-semibold inline-block">{bookingVenueName}</span>
                                        </div>
                                        <DetailRow label="Date Of Trial" value={safeDateLocaleString(booking?.trialDate)} />
                                        <DetailRow label="Students" value={Array.isArray(booking?.students) ? booking.students.length : null} />
                                        <DetailRow label="ID" value={booking?.bookingId || "N/A"} />
                                        <DetailRow label="Trial Attempt" value={booking?.attempt} />
                                        <DetailRow label="Date Of Booking" value={safeDateLocaleString(booking?.createdAt)} />
                                        <DetailRow label="Booking Source" value={getBookingSource(booking)} />
                                    </>
                                )}

                                {(serviceType === "weekly class trial" && booking?.bookingType === "waiting list") && (
                                    <>
                                        <div className="border-b border-[#495362] pb-2">
                                            <p className="text-white 2xl:text-[20px] xl:text-[18px] lg:text-[16px] text-[14px] font-medium mb-1">Venue</p>
                                            <span className="bg-[#3B82F6] text-white px-3 py-1 rounded text-xs font-semibold inline-block">{bookingVenueName}</span>
                                        </div>
                                        <DetailRow label="Students" value={Array.isArray(booking?.students) ? booking.students.length : null} />
                                        <DetailRow label="ID" value={booking?.bookingId || "N/A"} />
                                        <DetailRow label="Address" value={booking?.venue?.address} />
                                        <DetailRow label="Date Of Booking" value={safeDateLocaleString(booking?.createdAt)} />
                                        <DetailRow label="Booking Source" value={getBookingSource(booking)} />
                                    </>
                                )}

                                {serviceType === "birthday party" && (
                                    <>
                                        <DetailRow label="Package" value={booking?.package?.packageName} />
                                        <DetailRow label="Price Paid" value={safePrice(booking?.payment?.amount, "N/A")} />
                                        <DetailRow label="Stripe Transaction ID" value={booking?.payment?.stripePaymentIntentId} />
                                        <DetailRow label="Date of Booking" value={safeDateLocaleString(booking?.createdAt)} />
                                        <DetailRow label="Date of Party" value={safeDateLocaleString(booking?.leads?.partyDate || booking?.date)} />
                                        <DetailRow label="Coach" value={safeName(booking?.coach?.firstName, booking?.coach?.lastName, "N/A")} />
                                        <DetailRow label="Booking Source" value={getBookingSource(booking)} />
                                    </>
                                )}

                                {serviceType === "one to one" && (
                                    <>
                                        <div className="border-b border-[#495362] pb-2">
                                            <p className="text-white 2xl:text-[20px] xl:text-[18px] lg:text-[16px] text-[14px] font-medium mb-1">Venue</p>
                                            <span className="bg-[#3B82F6] text-white px-3 py-1 rounded text-xs font-semibold inline-block">{bookingVenueName}</span>
                                        </div>
                                        <DetailRow label="Package" value={booking?.package?.packageName} />
                                        <DetailRow label="Students" value={Array.isArray(booking?.students) ? booking.students.length : null} />
                                        <DetailRow label="Price Paid" value={safePrice(booking?.payment?.amount, "N/A")} />
                                        <DetailRow label="Stripe Transaction ID" value={booking?.payment?.stripePaymentIntentId} />
                                        <DetailRow label="Date of Party" value={safeDateLocaleString(booking?.leads?.partyDate || booking?.date)} />
                                        <DetailRow label="Coach" value={safeName(booking?.coach?.firstName, booking?.coach?.lastName, "N/A")} />
                                        <DetailRow label="Booking Source" value={getBookingSource(booking)} />
                                    </>
                                )}

                                {serviceType === "holiday camp" && (
                                    <>
                                        <DetailRow label="Camp" value={booking?.holidayCamp?.name} />
                                        <DetailRow label="Students" value={Array.isArray(booking?.students) ? booking.students.length : null} />
                                        <DetailRow label="Price Paid" value={safePrice(booking?.payments?.[0]?.amount, "N/A")} />
                                        <DetailRow label="Stripe Transaction ID" value={booking?.payments?.[0]?.stripe_payment_intent_id} />
                                        <DetailRow label="Date of Booking" value={safeDateLocaleString(booking?.createdAt)} />
                                        <div className="border-b border-[#495362] pb-2">
                                            <p className="text-white 2xl:text-[20px] xl:text-[18px] lg:text-[16px] text-[14px] font-medium mb-1">Venue</p>
                                            <span className="bg-[#3B82F6] text-white px-3 py-1 rounded text-xs font-semibold inline-block">{bookingVenueName}</span>
                                        </div>
                                        <DetailRow label="Discount" value={safePrice(booking?.payments?.[0]?.discount_amount, "N/A")} />
                                        <DetailRow label="Booking Source" value={getBookingSource(booking)} />
                                    </>
                                )}

                                {String(serviceType || "").toLowerCase() === "merchandise" && (
                                    <>
                                        <DetailRow label="Item" value={booking?.item} />
                                        <DetailRow label="Quantity" value={booking?.quantity} />
                                        <DetailRow label="Price Paid" value={safePrice(booking?.pricePaid, "N/A")} />
                                        <DetailRow label="Transaction ID" value={booking?.transactionID} />
                                        <DetailRow label="Date of Booking" value={safeDateLocaleString(booking?.createdAt)} />
                                        <DetailRow label="Discount" value={booking?.discount} />
                                        <DetailRow label="Fulfillment Status" value={booking?.fulfillment} />
                                        <DetailRow label="Booking Source" value={getBookingSource(booking)} />
                                    </>
                                )}
                            </div>
                            {
                                serviceType == "weekly class membership" && (

                                    <button
                                        onClick={() => setIsCancelModalOpen(true)}
                                        className="w-full py-3 bg-[#237FEA] rounded-[12px] font-semibold text-white lg:text-[18px] text-[14px] hover:bg-blue-600 transition-colors mt-2"
                                    >
                                        Request to cancel membership
                                    </button>
                                )
                            }
                            {(serviceType === "weekly class trial" && booking?.bookingType === "free") && (
                                <>

                                    <button onClick={() => setCancelModal({ open: true, booking })}
                                        className="bg-red-500 block text-white w-full 2xl:px-8 px-4 py-2.5 2xl:py-3 rounded-[12px] font-semibold 2xl:text-sm md:text-[12px] text-[14px] hover:bg-[#e69500] transition-colors ">
                                        Cancel Trial
                                    </button>
                                    <button onClick={() => navigate("/book-membership", { state: { booking } })} className="bg-[#042C89] text-white w-full  px-2 2xl:px-4 py-2.5 2xl:py-3 rounded-[12px] font-semibold 2xl:text-sm md:text-[12px] text-[14px] hover:bg-[#032066] transition-colors">
                                        Book Membership
                                    </button>
                                </>
                            )}
                            {serviceType === "holiday camp" && (

                                <button
                                    onClick={() => handleCancelCamp(booking)}
                                    className="bg-red-500 block text-white w-full 2xl:px-8 px-4 py-2.5 2xl:py-3 rounded-[12px] font-semibold 2xl:text-sm md:text-[12px] text-[14px] hover:bg-red-600 transition-colors"
                                >
                                    Cancel Camp
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <CancelMembershipModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                booking={booking}
            />

            <CancelTrial
                isOpen={cancelModal.open}
                onClose={() => setCancelModal({ open: false, booking: null })}
                onConfirm={handleCancelTrial}
                booking={cancelModal.booking}
            />
        </div>
    );
}