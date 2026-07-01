import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/Loader';
import EmptyState from '../../components/profile/EmptyState';
import CancelTrial from '../../components/modals/CancelTrial';
import RenewPackage from '../../components/modals/RenewPackage';
import ChangePlanModal from '../../components/modals/ChangePlanModal';
import TransferClassModal from '../../components/modals/TransferClassModal';
import FreezeMembershipModal from '../../components/modals/FreezeMembershipModal';
import { showError, showWarning, showConfirm, showSuccess } from '../../../utils/swalHelper'; // ✅ showWarning added
const pillButtonClasses = {
    red: "bg-[#FEF2F2] border border-[#FECACA] text-[#EF4444] hover:bg-[#FEE2E2]",
    blue: "bg-[#EFF6FF] border border-[#DBEAFE] text-[#3B82F6] hover:bg-[#DBEAFE]",
    green: "bg-[#F0FDF4] border border-[#DCFCE7] text-[#22C55E] hover:bg-[#DCFCE7]",
    yellow: "bg-[#FEF9C3] border border-[#FEF08A] text-[#EAB308] hover:bg-[#FEF08A]",
    gray: "bg-[#F3F4F6] border border-[#E5E7EB] text-[#6B7280] hover:bg-[#E5E7EB]"
};

function PillButton({ color = "blue", onClick, children, type = "button", disabled = false, className = "" }) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`w-full block text-center px-2 2xl:px-4 py-2.5 2xl:py-3 rounded-[12px] font-semibold 2xl:text-sm md:text-[12px] text-[14px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${pillButtonClasses[color]} ${className}`}
        >
            {children}
        </button>
    );
}

const MyBookings = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Upcoming');
    const [cancelModal, setCancelModal] = useState({ open: false, booking: null })
    const [renewModal, setRenewModal] = useState({ open: false, booking: null });
    const [changePlanModal, setChangePlanModal] = useState({ open: false, booking: null });
    const [transferModal, setTransferModal] = useState({ open: false, booking: null });
    const [freezeModal, setFreezeModal] = useState({ open: false, booking: null });

    const tabs = ['Upcoming', 'Past', 'Cancelled'];
    const [bookings, setBookings] = useState({
        upcoming: [],
        past: [],
        cancelled: []
    });
    const [loading, setLoading] = useState(false);
    const handleBirthdayPartyCancel = () => {
        showWarning(
            "Contact Support to Cancel",
            "Birthday Party bookings can't be cancelled here, and refunds aren't processed automatically. Please contact our support/admin team for assistance."
        );
    };
    const fetchBooking = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("parentToken");
            const parentData = JSON.parse(localStorage.getItem("parentData"));
            const parentId = parentData?.id;
            const API_URL = import.meta.env.VITE_API_BASE_URL;

            if (!token) {
                throw new Error("Authentication token not found. Please login again.");
            }

            const response = await fetch(
                `${API_URL}api/parent/account-profile/my-bookings/${parentId}`,
                {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            let data = {};
            try {
                data = await response.json();
            } catch (err) {
                data = {};
            }

            if (!response.ok || data?.status === false) {
                throw new Error(data?.message || "Failed to fetch bookings");
            }

            const finalData = data?.data;

            setBookings({
                upcoming: finalData?.upcomingBookings || [],
                past: finalData?.pastBookings || [],
                cancelled: finalData?.cancelledBookings || []
            });

        } catch (error) {
            showError(error?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooking();
    }, []);



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
                fetchBooking();
            } catch (error) {
                showError(error?.message || "Something went wrong");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleCancelTrial = async ({ reason, notes, booking, studentIds }) => {
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
                    additionalNote: notes,
                    studentIds: studentIds || []
                })
            });

            let data = {};
            try { data = await response.json(); } catch (e) { }

            if (!response.ok) throw new Error(data?.message || "Failed to cancel trial");

            showSuccess(data?.message || "Trial cancelled successfully");
            setCancelModal({ open: false, booking: null });
            fetchBooking();
        } catch (error) {
            showError(error?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };


    // Simple filter simulation (since data is static, mostly showing same list or filtering by logic if needed)
    // For now, I'll return the same list for 'Upcoming' and 'Past' but maybe empty for Cancellation to demonstrate tab switch.
    let filteredBookings = [];

    if (activeTab === "Upcoming") {
        filteredBookings = bookings.upcoming;
    } else if (activeTab === "Past") {
        filteredBookings = bookings.past;
    } else if (activeTab === "Cancelled") {
        filteredBookings = bookings.cancelled;
    }


    const formatBooking = (booking) => {
        const sType = booking?.serviceType?.toLowerCase();


        let dateObj = booking?.createdAt ? new Date(booking.createdAt) : null;
        let venue = "-";
        let time = "-";
        let address = "-";
        let classType = booking?.serviceType || "-";
        let coachName = "";

        if (booking?.coach?.firstName) {
            coachName = `${booking.coach.firstName} ${booking.coach.lastName || ''}`.trim();
        }

        const student = booking?.students?.find(s => s?.classSchedule || s?.holidayClassSchedules) || booking?.students?.[0];
        if (sType === "holiday camp") {
            venue = booking?.holidayVenue?.name || "-";
            address = booking?.holidayVenue?.address || "-";

            const schedule = student?.holidayClassSchedules;
            const levelName = schedule?.level?.name || schedule?.level || "";
            const cName = schedule?.className || "Holiday Camp";
            classType = levelName ? `${cName} (${levelName})` : cName;

            const campDate = booking?.holidayCamp?.holidayCampDates?.[0];
            if (campDate?.startDate) {
                dateObj = new Date(campDate.startDate);
            }

            if (schedule?.startTime && schedule?.endTime) {
                time = `${schedule.startTime} - ${schedule.endTime}`;
            } else if (campDate?.startDate && campDate?.endDate) {
                time = `${campDate.startDate} - ${campDate.endDate}`;
            }

        } else if (sType === "weekly class membership" || sType === "weekly class trial") {
            venue = booking?.venue?.name || "-";
            address = booking?.venue?.address || "-";

            const schedule = student?.classSchedule || student?.holidayClassSchedules;
            if (schedule) {
                const levelName = schedule?.level?.name || schedule?.level || "";
                const cName = schedule?.className || (sType === "weekly class trial" ? "Weekly Class Trial" : "Weekly Class");
                classType = levelName ? `${cName} (${levelName})` : cName;

                if (schedule.startTime && schedule.endTime) {
                    time = `${schedule.startTime} - ${schedule.endTime}`;
                }

                if (schedule.day && booking?.createdAt) {
                    // Use createdAt as fallback; real impl might compute next session day
                    dateObj = new Date(booking.createdAt);
                }
            }

        } else if (sType === "one to one") {
            venue = booking?.location || "-";
            address = booking?.address || "-";
            if (booking?.date) {
                dateObj = new Date(booking.date);
            }
            if (booking?.time) {
                time = booking.time;
            }
            classType = "One to One";

        } else if (sType === "birthday party") {
            if (booking?.leads?.partyDate) {
                dateObj = new Date(booking.leads.partyDate);
            }
            classType = "Birthday Party";
            // birthday party has no location/venue field — use address directly
            venue = booking?.address || "-";
            time = booking?.time || "-";
            address = booking?.address || "-";

        } else {
            venue = booking?.venue?.name || "-";
            address = booking?.venue?.address || "-";
            classType = student?.classSchedule?.className || "-";
            const startTime = student?.classSchedule?.startTime;
            const endTime = student?.classSchedule?.endTime;
            time = startTime && endTime ? `${startTime} - ${endTime}` : "-";
            if (booking?.createdAt) {
                dateObj = new Date(booking.createdAt);
            }
        }

        return {
            id: booking?.id ?? Math.random(),
            day: dateObj ? dateObj.toLocaleDateString("en-US", { weekday: "short" }) : "-",
            date: dateObj ? dateObj.getDate() : "-",
            month: dateObj ? dateObj.toLocaleDateString("en-US", { month: "short" }) : "-",
            fullMonth: dateObj ? dateObj.toLocaleDateString("en-US", { month: "long" }) : "-",
            year: dateObj ? dateObj.getFullYear() : "-",
            venue,
            time,
            address,
            classType,
            coach: coachName,
            coachProfile: booking.coach?.profile,
            status: booking?.status ?? "-",
            bookingType: booking?.bookingType ?? "-",
            serviceType: sType, // ✅ added
            paymentPlan: booking?.paymentPlan,
            payments: booking?.payments,
            venueData: booking?.venuePlans,
            freezeBooking: booking?.freezeBooking
        };
    };



    if (loading) {
        return <Loader />;
    }

    return (
        <div className="md:p-4 p-2 md:space-y-8 animate-fadeIn min-h-screen bg-[#fff] rounded-[30px] md:m-6 m-4">
            {/* Tabs */}
            <div className="flex items-center md:gap-8 gap-2 mb-7 md:mb-0  pb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`md:text-[18px] text-[16px] font-semibold md:px-5 px-2 py-2.5 rounded-[14px] relative transition-colors ${activeTab === tab
                            ? 'bg-[#042C89] text-white'
                            : 'text-[#282829] hover:text-[#282829]'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="space-y-6 relative">
                {(activeTab === 'Upcoming' && filteredBookings.length > 0) && (
                    <div className="mb-4 absolute -top-5 left-4">
                        <span className="bg-[#0DD180] text-white text-[12px] font-bold px-3 py-1 rounded-[16px] uppercase">
                            Coming Up
                        </span>
                    </div>
                )}
                {filteredBookings.length > 0 ? (() => {
                    const seenMonths = new Set();
                    return filteredBookings.map((booking, index) => {
                        const formatted = formatBooking(booking);
                        const monthKey = `${formatted.fullMonth}-${formatted.year}`;

                        let showMonthHeader = false;
                        if (formatted.fullMonth !== "-" && !seenMonths.has(monthKey)) {
                            showMonthHeader = true;
                            seenMonths.add(monthKey);
                        }

                        const isCurrentMonth =
                            formatted.fullMonth === new Date().toLocaleDateString("en-US", { month: "long" }) &&
                            formatted.year === new Date().getFullYear();
                        console.log('formatted', formatted)
                        return (
                            <div key={formatted.id || index}>

                                {showMonthHeader && !isCurrentMonth && (
                                    <div className="flex items-center gap-4 mb-4 mt-8 bg-[#EAF0FF] p-2 px-11 md:text-[24px] text-[20px] rounded-[15px] text-[#042C89] font-bold uppercase w-full">
                                        <img src="/assets/calender.png" className='w-6' alt="" />
                                        {formatted.fullMonth} {formatted.year}
                                    </div>
                                )}
                                <div className="bg-[#F8F8F8] p-6 py-2 rounded-[16px] flex flex-col md:flex-row  overflow-hidden mb-4">
                                    {/* Date Column */}

                                    <div className="md:w-[120px] text-left flex flex-col md:items-center md:text-center 2xl:px-5 px-0  2xl:pe-10 md:pe-5 md:justify-center md:border-r border-b md:border-b-0 border-[#E2E1E5]">
                                        <span className="text-[#5F5F6D] 2xl:text-[24px] text-[20px] font-bold block">{formatted.day}</span>
                                        <span className="text-[#5F5F6D] font-bold 2xl:text-[42px] text-[36px]">{formatted.date}</span>
                                    </div>


                                    {/* Details */}
                                    <div className="flex-1 xl:flex grid grid-cols-1 sm:grid-cols-2 mt-4 md:mt-0 md:grid-cols-3 md:ps-7 lg:gap-6 gap-3 justify-between items-center">
                                        <div className='self-start xl:w-[16%]'>
                                            <p className="text-[#9E9FAA] 2xl:text-[16px] text-[14px] mb-1">Venue</p>
                                            <p className="text-[#5F5F6D] 2xl:text-[16px] text-[14px] font-semibold">{formatted.venue}</p>
                                        </div>
                                        <div className='self-start xl:w-[10%]'>
                                            <p className="text-[#9E9FAA] 2xl:text-[16px] text-[14px] mb-1">Hour</p>
                                            <p className="text-[#5F5F6D] 2xl:text-[16px] text-[14px] font-semibold">{formatted.time}</p>
                                        </div>
                                        <div className="self-start xl:w-[30%]">
                                            <p className="text-[#9E9FAA] 2xl:text-[16px] text-[14px] mb-1">Address</p>
                                            <p className="text-[#5F5F6D] 2xl:text-[16px] text-[14px] font-semibold leading-tight">{formatted.address}</p>
                                        </div>
                                        <div className='self-start xl:w-[10%]'>
                                            <p className="text-[#9E9FAA] 2xl:text-[16px] text-[14px] mb-1">Class</p>
                                            <p className="text-[#5F5F6D] 2xl:text-[16px] text-[14px] font-semibold">{formatted.classType}</p>
                                        </div>


                                        {/* Action Button */}
                                        <div className="self-start xl:w-[13%] w-full flex flex-wrap md:gap-4 gap-2 justify-end">
                                            {formatted.status === 'completed' && (
                                                <PillButton color="green" onClick={() => setRenewModal({ open: true, booking })}>
                                                    Renew Package
                                                </PillButton>
                                            )}
                                            {formatted.bookingType === "free" && (
                                                <>
                                                    <PillButton color="red" onClick={() => setCancelModal({ open: true, booking })}>
                                                        Cancel Trial
                                                    </PillButton>
                                                    {/* {formatted.status ==="attended" && (
                                                    )} */}
                                                    <PillButton color="green" onClick={() => navigate("/book-membership?bookingId=" + booking.id, { state: { booking ,bookingsource: "trials" } })}>
                                                        Book Membership
                                                    </PillButton>
                                                    {formatted.status === "not attended" && (
                                                        <PillButton color="blue" onClick={() => navigate("/book-free-trial?bookingId=" + booking.id, { state: { booking } })}>
                                                            Rebook Trial
                                                        </PillButton>
                                                    )}

                                                </>
                                            )}

                                            {/* <PillButton
                                                className="capitalize cursor-default"
                                                color={
                                                    formatted.status === "pending" ? "yellow" :
                                                        formatted.status === "active" ? "green" :
                                                            formatted.status === "cancelled" ? "red" :
                                                                formatted.status === "completed" ? "blue" : "gray"
                                                }
                                            >
                                                {formatted.status}
                                            </PillButton> */}

                                            {formatted.serviceType === "weekly class membership" && (
                                                <>
                                                    <PillButton color="blue" onClick={() => setChangePlanModal({ open: true, booking })}>
                                                        Change Plan
                                                    </PillButton>
                                                    <PillButton color="blue" onClick={() => setTransferModal({ open: true, booking })}>
                                                        Transfer Class
                                                    </PillButton>
                                                    {!formatted?.freezeBooking &&
                                                        (formatted?.status === "active" || formatted?.status === "request_to_cancel") &&
                                                        !(formatted?.paymentPlan?.duration === 1 && formatted?.paymentPlan?.interval === "Month") &&
                                                        (() => {
                                                            const payments = formatted?.payments || [];
                                                            const hasBankOrAccess = payments.some(
                                                                (p) => p.paymentType === "bank" || p.paymentType === "accesspaysuite"
                                                            );

                                                            if (hasBankOrAccess) {
                                                                return payments.some(
                                                                    (p) =>
                                                                        (p.paymentType === "bank" || p.paymentType === "accesspaysuite") &&
                                                                        (p.paymentStatus === "paid")
                                                                );
                                                            }

                                                            return payments.some((p) => p.paymentStatus === "paid");
                                                        })() && (
                                                            <PillButton color="green" onClick={() => setFreezeModal({ open: true, booking })}>
                                                                Freeze Membership
                                                            </PillButton>
                                                        )}
                                                </>
                                            )}
                                            {formatted.serviceType === "birthday party" && (
                                                <PillButton color="red" onClick={handleBirthdayPartyCancel}>
                                                    Cancel
                                                </PillButton>
                                            )}
                                            {formatted.serviceType === "holiday camp" && formatted.status !== "cancelled" && (
                                                <PillButton color="red" onClick={() => handleCancelCamp(booking)}>
                                                    Cancel Camp
                                                </PillButton>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    });
                })() : (
                    <EmptyState />
                )}

                <ChangePlanModal
                    isOpen={changePlanModal.open}
                    onClose={() => setChangePlanModal({ open: false, booking: null })}
                    booking={changePlanModal.booking}
                    onSuccess={fetchBooking}
                />
                <CancelTrial
                    isOpen={cancelModal.open}
                    onClose={() => setCancelModal({ open: false, booking: null })}
                    onConfirm={handleCancelTrial}
                    booking={cancelModal.booking}
                />
                <RenewPackage
                    isOpen={renewModal.open}
                    onClose={() => setRenewModal({ open: false, booking: null })}
                    booking={renewModal.booking}
                    onSuccess={fetchBooking}
                />
                <TransferClassModal
                    isOpen={transferModal.open}
                    onClose={() => setTransferModal({ open: false, booking: null })}
                    booking={transferModal.booking}
                    onSuccess={fetchBooking}
                />
                <FreezeMembershipModal
                    isOpen={freezeModal.open}
                    onClose={() => setFreezeModal({ open: false, booking: null })}
                    booking={freezeModal.booking}
                    onSuccess={fetchBooking}
                />
            </div>
        </div>
    );
};

export default MyBookings;
