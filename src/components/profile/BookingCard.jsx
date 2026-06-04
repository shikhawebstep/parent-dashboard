import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical } from "lucide-react";
import PaymentModal from "./PaymentModal";
import AttendanceModal from "./AttendanceModal";
import CreditModal from "./CreditModal";

const BookingCard = ({ booking, onSeeDetails }) => {
    const navigate = useNavigate();
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);
    const [showCreditModal, setShowCreditModal] = useState(false);
    console.log('booking', booking)
    const renderImage = (type = "") => {
        const images = {
            "weekly class membership": "/assets/weekly.png",
            "weekly class trial": "/assets/weekly.png",
            "birthday party": "/assets/birthday.png",
            "one to one": "/assets/one-to-one.png",
            "holiday camp": "/assets/holiday.png",
            "merchandise": "/assets/merchandise.png",
        };
        return images[type?.toLowerCase()] || "/assets/crown.png";
    };

    const renderTitle = (type = "") => {
        const title = {
            "weekly class membership": "Weekly Class Membership",
            "weekly class trial": "Weekly Class Trial",
            "birthday party": "Birthday Party Booking",
            "one to one": "One to One Booking",
            "holiday camp": "Holiday Camp Booking",
            "merchandise": "Merchandise",
        };
        return title[type?.toLowerCase()] || "Weekly Class Membership";
    };

    // Returns "-" for any falsy value (null, undefined, "", 0 is preserved)
    const safeValue = (value, fallback = "-") => {
        if (value === undefined || value === null || value === "") return fallback;
        return value;
    };

    // Safely join two name parts, filtering out undefined/null/empty pieces
    const safeName = (first, last) => {
        const parts = [first, last].filter(
            (p) => p !== undefined && p !== null && p !== ""
        );
        return parts.length > 0 ? parts.join(" ") : "-";
    };

    const safeDate = (date) => {
        if (!date) return "-";
        const d = new Date(date);
        return isNaN(d.getTime()) ? "-" : d.toLocaleString("en-IN");
    };

    const formatDate = (date) => {
        if (!date) return "-";
        const d = new Date(date);
        if (isNaN(d.getTime())) return "-";
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    // Formats a price safely; skips if value is null/undefined
    const safePrice = (price) => {
        if (price === undefined || price === null) return "-";
        return `£${price}.00`;
    };

    // Formats amount with £ prefix; handles null/undefined
    const safeAmount = (amount) => {
        if (amount === undefined || amount === null) return "-";
        return `£${amount}`;
    };

    const renderField = (label, value) => (
        <div>
            <p className="text-[#717073] font-medium 2xl:text-sm text-xs">{label}</p>
            <p className="mt-1 text-[#282829] font-semibold text-xs 2xl:text-[16px] truncate">
                {safeValue(value)}
            </p>
        </div>
    );

    const statusColors = {
        active: "bg-green-500 text-white",
        paid: "bg-green-500 text-white",
        completed: "bg-green-500 text-white",
        expired: "bg-red-500 text-white",
        cancelled: "bg-red-500 text-white",
        pending: "bg-yellow-500 text-white",
    };

    // Derive booking source label safely
    const getBookingSource = (booking) => {
        if (booking?.source) return booking.source;
        if (booking?.marketingChannel) return booking.marketingChannel;
        if (booking?.leads?.source) return booking.leads.source;
        const adminName = safeName(
            booking?.bookedByAdmin?.firstName,
            booking?.bookedByAdmin?.lastName
        );
        return adminName !== "-" ? adminName : "-";
    };

    if (!booking) return null;

    return (
        <>
            {booking?.serviceType && (
                <div className="bg-white rounded-[30px] p-3 mb-6 relative">

                    {/* Header */}
                    <div className="flex justify-between items-center bg-[#383A46] md:rounded-[22px] rounded-[15px] md:p-4 p-2.5">
                        <div className="flex items-center gap-3">
                            <img
                                src={renderImage(booking?.serviceType)}
                                alt={safeValue(booking?.serviceType, "booking")}
                                className="md:w-6 w-5"
                            />
                            <h3 className="text-white lg:text-[20px] text-[16px] capitalize font-semibold">
                                {booking?.bookingType == "waiting list" ? "Weekly Waiting List" : renderTitle(booking?.serviceType)}
                            </h3>
                        </div>

                        <span
                            className={`px-3 py-2 sm:block hidden rounded-lg capitalize text-sm ${statusColors[booking?.status] || "bg-gray-400 text-white"
                                }`}
                        >
                            {safeValue(booking?.status)}
                        </span>
                    </div>

                    {/* Details */}
                    <div className="bg-[#FCF9F6] rounded-[22px] p-4 mt-4 relative">
                        <div
                            className={`grid grid-cols-2 serviceHistory sm:grid-cols-4 md:grid-cols-4 gap-4 mb-4 ${booking?.serviceType === "birthday party"
                                ? "lg:grid-cols-7"
                                : "lg:grid-cols-8"
                                }`}
                        >

                            {/* ── Weekly Class Membership ── */}
                            {booking?.serviceType === "weekly class membership" && (
                                <>
                                    {renderField("Membership Plan", booking?.paymentPlan?.title)}
                                    {renderField(
                                        "Students",
                                        Array.isArray(booking?.students)
                                            ? booking.students.length
                                            : null
                                    )}
                                    {renderField(
                                        "Venue",
                                        booking?.classSchedule?.venue?.name || booking?.venue?.name
                                    )}
                                    {renderField("KGo/Cardless ID", booking?.goCardlessSubscriptionId || '-')}
                                    {renderField("Monthly Price", safePrice(booking?.paymentPlan?.price))}
                                    {renderField("Date Of Booking", safeDate(booking?.createdAt))}
                                    {renderField(
                                        "Progress",
                                        (() => {
                                            const total = booking?.progressBar?.totalBars;
                                            const filled = booking?.progressBar?.filledBars;
                                            if (total === undefined || total === null) return null;
                                            return `${filled ?? 0} / ${total}`;
                                        })()
                                    )}
                                    {renderField("Booking Source", getBookingSource(booking))}
                                </>
                            )}
                            {(booking?.serviceType === "weekly class trial" && booking?.bookingType == "free") && (
                                <>
                                    {renderField("ID", booking?.bookingId)}
                                    {renderField(
                                        "Students",
                                        Array.isArray(booking?.students)
                                            ? booking.students.length
                                            : null
                                    )}
                                    {renderField(
                                        "Venue",
                                        booking?.classSchedule?.venue?.name || booking?.venue?.name
                                    )}
                                    {renderField("Trial Date", safeDate(booking?.trialDate))}
                                    {renderField("Address", safePrice(booking?.venue?.address))}
                                    {renderField("Date Of Booking", safeDate(booking?.createdAt))}
                                    {renderField(
                                        "Postal Code",
                                        safeValue(booking?.venue?.postal_code)
                                    )}
                                    {renderField("Booking Source", getBookingSource(booking))}
                                </>
                            )}
                            {(booking?.serviceType === "weekly class trial" && booking?.bookingType == "waiting list") && (
                                <>
                                    {renderField("Postal Code", booking?.venue?.postal_code)}
                                    {renderField(
                                        "Students",
                                        Array.isArray(booking?.students)
                                            ? booking.students.length
                                            : null
                                    )}
                                    {renderField(
                                        "Venue",
                                        booking?.classSchedule?.venue?.name || booking?.venue?.name
                                    )}
                                    {renderField("ID", booking?.bookingId || '-')}
                                    {renderField("Address", safePrice(booking?.venue?.address))}
                                    {renderField("Date Of Booking", safeDate(booking?.createdAt))}
                                    {renderField("Facility", safeValue(booking?.venue?.facility))}

                                    {renderField("Booking Source", getBookingSource(booking))}
                                </>
                            )}

                            {/* ── Birthday Party ── */}
                            {booking?.serviceType === "birthday party" && (
                                <>
                                    {renderField("Package", booking?.leads?.packageInterest)}
                                    {renderField("Price Paid", safeAmount(booking?.payment?.amount))}
                                    {renderField(
                                        "Stripe Transaction ID",
                                        booking?.payment?.stripePaymentIntentId
                                    )}
                                    {renderField("Date of Booking", formatDate(booking?.createdAt))}
                                    {renderField(
                                        "Date of Party",
                                        formatDate(booking?.leads?.partyDate || booking?.date)
                                    )}
                                    {renderField(
                                        "Coach",
                                        safeName(booking?.coach?.firstName, booking?.coach?.lastName)
                                    )}
                                    {renderField("Booking Source", getBookingSource(booking))}
                                </>
                            )}

                            {/* ── One to One ── */}
                            {booking?.serviceType === "one to one" && (
                                <>
                                    {renderField("Package", booking?.leads?.packageInterest)}
                                    {renderField(
                                        "Students",
                                        Array.isArray(booking?.students)
                                            ? booking.students.length
                                            : null
                                    )}
                                    {renderField("Price Paid", safeAmount(booking?.payment?.amount))}
                                    {renderField(
                                        "Stripe Transaction ID",
                                        booking?.payment?.stripePaymentIntentId
                                    )}
                                    {renderField(
                                        "Date of Party",
                                        formatDate(booking?.leads?.partyDate || booking?.date)
                                    )}
                                    {renderField("Venue", booking?.location)}
                                    {renderField(
                                        "Coach",
                                        safeName(booking?.coach?.firstName, booking?.coach?.lastName)
                                    )}
                                    {renderField("Booking Source", getBookingSource(booking))}
                                </>
                            )}

                            {/* ── Holiday Camp ── */}
                            {booking?.serviceType === "holiday camp" && (
                                <>
                                    {renderField("Camp", booking?.holidayCamp?.name)}
                                    {renderField(
                                        "Students",
                                        Array.isArray(booking?.students)
                                            ? booking.students.length
                                            : null
                                    )}
                                    {renderField("Price Paid", safeAmount(booking?.payments[0]?.amount))}
                                    {renderField(
                                        "Stripe Transaction ID",
                                        booking?.payments[0]?.stripe_payment_intent_id
                                    )}
                                    {renderField("Date of Booking", formatDate(booking?.createdAt))}
                                    {renderField(
                                        "Venue",
                                        booking?.classSchedule?.venue?.name ||
                                        booking?.venue?.name ||
                                        booking?.holidayVenue?.name
                                    )}
                                    {renderField("Discount", booking?.payments[0]?.discount_amount)}
                                    {renderField("Booking Source", getBookingSource(booking))}
                                </>
                            )}

                            {/* ── Merchandise ── */}
                            {booking?.serviceType?.toLowerCase() === "merchandise" && (
                                <>
                                    {renderField("Item", booking?.item)}
                                    {renderField("Quantity", booking?.quantity)}
                                    {renderField("Price Paid", safePrice(booking?.pricePaid))}
                                    {renderField("Transaction ID", booking?.transactionID)}
                                    {renderField("Date of Booking", formatDate(booking?.createdAt))}
                                    {renderField("Discount", booking?.discount)}
                                    {renderField("Fulfillment Status", booking?.fulfillment)}
                                    {renderField("Booking Source", getBookingSource(booking))}
                                </>
                            )}

                            <button className="absolute right-4 top-5.5 text-gray-500 hover:text-gray-800">
                                <MoreVertical size={18} />
                            </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap mt-5 gap-3">
                            {booking?.serviceType === "weekly class membership" && (
                                <button
                                    onClick={() => {
                                        if (onSeeDetails) {
                                            onSeeDetails(booking);
                                        } else {
                                            navigate(
                                                `/one-to-one/sales/account-information/see-details?id=${booking?.id}`
                                            );
                                        }
                                    }}
                                    className="md:px-4 md:py-2 px-2 py-1.5 border border-[#042C89] text-[#042C89] rounded-xl lg:text-[16px] text-[14px] font-semibold"
                                >
                                    See details
                                </button>
                            )}
                            {booking?.serviceType !== "weekly class trial" && (
                                <button
                                    onClick={() => setShowPaymentModal(true)}
                                    className="md:px-4 md:py-2 px-2 py-1.5 border border-[#042C89] text-[#042C89] rounded-xl lg:text-[16px] text-[14px] font-semibold"
                                >
                                    See payments
                                </button>
                            )}
                            {(booking?.serviceType !== "one to one" ||
                                booking?.serviceType === "birthday party") && (
                                    <button
                                        onClick={() => setShowAttendanceModal(true)}
                                        className="md:px-4 md:py-2 px-2 py-1.5 border border-[#042C89] text-[#042C89] rounded-xl lg:text-[16px] text-[14px] font-semibold"
                                    >
                                        Attendance
                                    </button>
                                )}

                            {booking?.serviceType === "weekly class membership" && (
                                <button
                                    onClick={() => setShowCreditModal(true)}
                                    className="md:px-4 md:py-2 px-2 py-1.5 border border-[#042C89] text-[#042C89] rounded-xl lg:text-[16px] text-[14px] font-semibold"
                                >
                                    Credits
                                </button>
                            )}
                        </div>

                        <span
                            className={`px-3 py-2 mt-3 sm:hidden w-full text-center block rounded-lg capitalize text-sm ${statusColors[booking?.status] || "bg-gray-400 text-white"
                                }`}
                        >
                            {safeValue(booking?.status)}
                        </span>
                    </div>
                </div>
            )}

            {/* Modals */}
            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                payments={booking?.payments}
                payment={booking?.payment}
            />
            <AttendanceModal
                isOpen={showAttendanceModal}
                onClose={() => setShowAttendanceModal(false)}
                students={booking?.students}
            />
            <CreditModal
                isOpen={showCreditModal}
                onClose={() => setShowCreditModal(false)}
            />
        </>
    );
};

export default BookingCard;