
import { useNavigate } from "react-router-dom";
import { MoreVertical } from "lucide-react";
const BookingCard = ({ booking }) => {
    const navigate = useNavigate();
    const renderImage = (type) => {
        const images = {
            "Weekly Classes Membership": "/assets/weekly.png",
            "Birthday Party Booking": "/assets/birthday.png",
            "One to One Booking": "/assets/one-to-one.png",
            "Holiday Camp": "/assets/holiday.png",
            Merchandise: "/assets/merchandise.png",
        };
        return images[type] || "/assets/crown.png";
    };

    const renderField = (label, value) => (
        <div>
            <p className="text-[#717073] font-medium text-sm">{label}</p>
            <p className="mt-1 font-semibold truncate">{value || "-"}</p>
        </div>
    );

    const statusColors = {
        Active: "bg-green-500 text-white",
        Paid: "bg-green-500 text-white",
        Completed: "bg-green-500 text-white",
        Expired: "bg-red-500 text-white",
        cancelled: "bg-red-500 text-white",
        pending: "bg-yellow-500 text-white",
    };

    return (
        <div className="bg-white rounded-[30px]  p-3 mb-6 relative">
            {/* Header */}
            <div className="flex justify-between items-center bg-[#383A46] rounded-[22px] p-4">
                <div className="flex items-center gap-3">
                    <img
                        src={renderImage(booking.type)}
                        alt={booking.type}
                        className="w-6"
                    />
                    <h3 className="text-white text-[20px] font-semibold">{booking.type}</h3>
                </div>

                <span
                    className={`px-3 py-2 rounded-lg capitalize text-sm ${statusColors[booking.status] || "bg-gray-400 text-white"
                        }`}
                >
                    {booking.status}
                </span>
            </div>

            {/* Details */}
            <div className="bg-[#FCF9F6] rounded-[22px] p-4 mt-4 relative">
                <div className={`grid grid-cols-1 sm:grid-cols-2  gap-4 mb-4 ${booking.type === "Birthday Party Booking" ? 'lg:grid-cols-7' : 'lg:grid-cols-8'} `}>
                    {booking.type === "Weekly Classes Membership" && (
                        <>
                            {renderField("Membership Plan", booking.plan)}
                            {renderField("Students", booking.students)}
                            {renderField("Venue", booking.venue)}
                            {renderField("KGo/Cardless ID", booking.id)}
                            {renderField("Monthly Price", booking.price)}
                            {renderField(
                                "Date Of Booking",
                                new Date(booking.createdAt).toLocaleString("en-IN")
                            )}
                            {renderField("Progress", booking.progress)}
                            {renderField("Booking Source", booking.source)}
                        </>
                    )}

                    {booking.type === "Birthday Party Booking" && (
                        <>
                            {renderField("Package", booking.package)}
                            {renderField("Price Paid", `£${booking.pricePaid}.00`)}
                            {renderField("Stripe Transaction ID", booking.stripeID)}
                            {renderField(
                                "Date of Booking",
                                new Date(booking.createdAt).toLocaleString("en-IN")
                            )}
                            {renderField("Date of Party", booking.partyDate)}
                            {renderField("Coach", booking.coach)}
                            {renderField("Booking Source", booking.source)}
                        </>
                    )}

                    {booking.type === "One to One Booking" && (
                        <>
                            {renderField("Package", booking.packageInterest)}
                            {renderField("Students", booking.students?.length)}
                            {renderField("Price Paid", booking?.pricePaid)}
                            {renderField("Stripe Transaction ID", booking.stripeID)}
                            {renderField("Date of Party", booking.partyDate)}

                            {renderField("Venue", booking.location)}
                            {renderField(
                                "Coach",
                                `${booking.coach?.firstName || "-"} ${booking.coach?.lastName || ""
                                }`
                            )}
                            {renderField("Booking Source", booking.source)}

                            <button className="absolute right-4 top-4 text-gray-500 hover:text-gray-800">
                                <MoreVertical size={18} />
                            </button>
                        </>
                    )}

                    {booking.type === "Holiday Camp" && (
                        <>
                            {renderField("Camp", booking.camp)}
                            {renderField("Students", booking.students)}
                            {renderField("Price Paid", `£${booking.pricePaid}.00`)}
                            {renderField("Stripe Transaction ID", booking.stripeID)}
                            {renderField(
                                "Date of Booking",
                                new Date(booking.createdAt).toLocaleString("en-IN")
                            )}
                            {renderField("Venue", booking.venue)}
                            {renderField("Discount", booking.discount)}
                            {renderField("Booking Source", booking.source)}
                        </>
                    )}

                    {booking.type === "Merchandise" && (
                        <>
                            {renderField("Item", booking.item)}
                            {renderField("Quantity", booking.quantity)}
                            {renderField("Price Paid", `£${booking.pricePaid}.00`)}
                            {renderField("Transaction ID", booking.transactionID)}
                            {renderField(
                                "Date of Booking",
                                new Date(booking.createdAt).toLocaleString("en-IN")
                            )}
                            {renderField("Discount", booking.discount)}
                            {renderField("Fulfillment Status", booking.fulfillment)}
                            {renderField("Booking Source", booking.source)}
                        </>
                    )}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() =>
                            navigate(
                                `/one-to-one/sales/account-information/see-details?id=${booking.id}`
                            )
                        }
                        className="px-4 py-2 border border-[#042C89] text-[#042C89] rounded-xl text-[16px] font-semibold"
                    >
                        See details
                    </button>

                    <button className="px-4 py-2 border border-[#042C89] text-[#042C89] rounded-xl text-[16px] font-semibold">
                        See payments
                    </button>
                    <button className="px-4 py-2 border border-[#042C89] text-[#042C89] rounded-xl text-[16px] font-semibold">
                        Attendance
                    </button>
                    <button className="px-4 py-2 border border-[#042C89] text-[#042C89] rounded-xl text-[16px] font-semibold">
                        Credits
                    </button>
                </div>
            </div>
        </div>
    );
};
export default BookingCard;