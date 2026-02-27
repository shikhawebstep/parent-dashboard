
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

    const renderImage = (type = "") => {
        const images = {
            "weekly class membership": "/assets/weekly.png",
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
            "birthday party": "Birthday Party Booking",
            "one to one": "One to One Booking",
            "holiday camp": "Holiday Camp Booking",
            "merchandise": "Merchandise",
        };
        return title[type?.toLowerCase()] || "Weekly Class Membership";

    };

    function formatDate(date) {
        const d = new Date(date);

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }


    const renderField = (label, value) => (
        <div>
            <p className="text-[#717073] font-medium 2xl:text-sm text-xs">{label}</p>
            <p className="mt-1 font-semibold text-xs 2xl:text-[16px] truncate">
                {safeValue(value)}
            </p>
        </div>
    );

    const safeValue = (value, fallback = "-") =>
        value === undefined || value === null || value === "" ? fallback : value;

    const safeDate = (date) =>
        date ? new Date(date).toLocaleString("en-IN") : "-";

    const safePrice = (price) =>
        price !== undefined && price !== null ? `£${price}.00` : "-";


    const statusColors = {
        active: "bg-green-500 text-white",
        paid: "bg-green-500 text-white",
        completed: "bg-green-500 text-white",
        expired: "bg-red-500 text-white",
        cancelled: "bg-red-500 text-white",
        pending: "bg-yellow-500 text-white",
    };

    return (
        <>

            {booking?.serviceType !== "weekly class trial" && (
                <div className="bg-white rounded-[30px]  p-3 mb-6 relative">

                    <div className="flex justify-between items-center bg-[#383A46] md:rounded-[22px] rounded-[15px] md:p-4 p-2.5">
                        <div className="flex items-center gap-3">
                            <img
                                src={renderImage(booking?.serviceType)}
                                alt={booking?.serviceType}
                                className="md:w-6 w-5"
                            />
                            <h3 className="text-white lg:text-[20px] text-[16px] capitalize font-semibold">{renderTitle(booking?.serviceType)}</h3>
                        </div>

                        <span
                            className={`px-3 py-2 sm:block hidden rounded-lg capitalize text-sm ${statusColors[booking?.status] || "bg-gray-400 text-white"
                                }`}
                        >
                            {booking?.status}
                        </span>
                    </div>

                    {/* Details */}
                    <div className="bg-[#FCF9F6] rounded-[22px] p-4 mt-4 relative">
                        <div className={`grid grid-cols-2 serviceHistory sm:grid-cols-4 md:grid-cols-4  gap-4 mb-4 ${booking?.serviceType === "birthday party" ? 'lg:grid-cols-7' : 'lg:grid-cols-8'} `}>
                            {booking?.serviceType === "weekly class membership" && (
                                <>
                                    {renderField("Membership Plan", safeValue(booking?.paymentPlan?.title))}
                                    {renderField(
                                        "Students",
                                        Array.isArray(booking?.students) ? booking.students.length : "-"
                                    )}


                                    {renderField("Venue", safeValue(booking?.classSchedule?.venue?.name || booking?.venue?.name))}
                                    {renderField("KGo/Cardless ID", safeValue(booking?.id))}
                                    {renderField("Monthly Price", safePrice(booking?.paymentPlan?.price))}
                                    {renderField("Date Of Booking", safeDate(booking?.createdAt))}
                                    {renderField("Progress", safeValue(booking?.progress))}
                                    {renderField("Booking Source", safeValue(booking?.marketingChannel || booking?.bookedByAdmin?.firstName + ' ' + booking?.bookedByAdmin?.lastName))}

                                </>
                            )}

                            {booking?.serviceType === "birthday party" && (
                                <>
                                    {renderField("Package", booking?.leads?.packageInterest)}
                                    {renderField("Price Paid", `£${booking?.payment?.amount}`)}
                                    {renderField("Stripe Transaction ID", booking?.payment?.stripePaymentIntentId)}
                                    {renderField(
                                        "Date of Booking",
                                        formatDate(booking?.createdAt)
                                    )}
                                    {renderField("Date of Party", formatDate(booking?.leads?.partyDate || booking?.date))}
                                    {renderField(
                                        "Coach",
                                        booking?.coach
                                            ? `${safeValue(booking.coach.firstName)} ${safeValue(booking.coach.lastName)}`
                                            : "-"
                                    )}

                                    {renderField("Booking Source", booking?.leads?.source || booking?.bookedByAdmin?.firstName + ' ' + booking?.bookedByAdmin?.lastName)}
                                </>
                            )}

                            {booking?.serviceType === "one to one" && (
                                <>
                                    {renderField("Package", booking?.leads?.packageInterest)}
                                    {renderField("Students", Array.isArray(booking?.students) ? booking.students.length : "-")}
                                    {renderField("Price Paid", booking?.payment?.amount)}
                                    {renderField("Stripe Transaction ID", booking?.payment?.stripePaymentIntentId)}
                                    {renderField("Date of Party", formatDate(booking?.leads?.partyDate || booking?.date))}

                                    {renderField("Venue", booking?.location)}
                                    {renderField(
                                        "Coach",
                                        `${booking?.coach?.firstName || "-"} ${booking?.coach?.lastName || ""
                                        }`
                                    )}
                                    {renderField("Booking Source", booking?.leads?.source || booking?.bookedByAdmin?.firstName + ' ' + booking?.bookedByAdmin?.lastName)}


                                </>
                            )}

                            {booking?.serviceType === "holiday camp" && (
                                <>
                                    {renderField("Camp", booking?.holidayCamp?.name)}
                                    {renderField("Students", Array.isArray(booking?.students) ? booking.students.length : "-")}
                                    {renderField("Price Paid", `£${booking?.payment?.amount}`)}
                                    {renderField("Stripe Transaction ID", booking?.payment?.gatewayResponse?.id)}
                                    {renderField(
                                        "Date of Booking",
                                        formatDate(booking?.createdAt)
                                    )}
                                    {renderField("Venue", booking?.classSchedule?.venue?.name || booking?.venue?.name)}
                                    {renderField("Discount", booking?.payment?.discount_amount)}
                                    {renderField("Booking Source", booking?.marketingChannel || booking?.bookedByAdmin?.firstName + ' ' + booking?.bookedByAdmin?.lastName)}
                                </>
                            )}

                            {booking?.serviceType === "Merchandise" && (
                                <>
                                    {renderField("Item", booking?.item)}
                                    {renderField("Quantity", booking?.quantity)}
                                    {renderField("Price Paid", `£${booking?.pricePaid}.00`)}
                                    {renderField("Transaction ID", booking?.transactionID)}
                                    {renderField(
                                        "Date of Booking",
                                        formatDate(booking?.createdAt)
                                    )}
                                    {renderField("Discount", booking?.discount)}
                                    {renderField("Fulfillment Status", booking?.fulfillment)}
                                    {renderField("Booking Source", booking?.marketingChannel || booking?.bookedByAdmin?.firstName + ' ' + booking?.bookedByAdmin?.lastName)}
                                </>
                            )}
                            <button className="absolute right-4 top-5.5 text-gray-500 hover:text-gray-800">
                                <MoreVertical size={18} />
                            </button>
                        </div>
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

                            <button
                                onClick={() => setShowPaymentModal(true)}
                                className="md:px-4 md:py-2 px-2 py-1.5 border border-[#042C89] text-[#042C89] rounded-xl lg:text-[16px] text-[14px] font-semibold">
                                See payments
                            </button>
                            {(booking?.serviceType === "weekly class membership" || booking?.serviceType === "holiday camp") && (
                                <button
                                    onClick={() => setShowAttendanceModal(true)}
                                    className="md:px-4 md:py-2 px-2 py-1.5 border border-[#042C89] text-[#042C89] rounded-xl lg:text-[16px] text-[14px] font-semibold">
                                    Attendance
                                </button>

                            )}
                            {booking?.serviceType === "weekly class membership" && (
                                <button
                                    onClick={() => setShowCreditModal(true)}
                                    className="md:px-4 md:py-2 px-2 py-1.5 border border-[#042C89] text-[#042C89] rounded-xl lg:text-[16px] text-[14px] font-semibold">
                                    Credits
                                </button>

                            )}
                        </div>
                        <span
                            className={`px-3 py-2 mt-3 sm:hidden w-full text-center block rounded-lg capitalize text-sm ${statusColors[booking?.status] || "bg-gray-400 text-white"
                                }`}
                        >
                            {booking?.status}
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