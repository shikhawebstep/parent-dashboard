import React, { useState } from 'react';
import { X, Info } from 'lucide-react';
import Select from 'react-select';
import { showError, showSuccess } from '../../../utils/swalHelper';

const cancellationReasonOptions = [
    { value: "Family emergency - cannot attend", label: "Family emergency - cannot attend" },
    { value: "Health issue", label: "Health issue" },
    { value: "Schedule conflict", label: "Schedule conflict" },
    { value: "Other reason", label: "Other reason" },
];

// Convert <input type="date"> value ("YYYY-MM-DD") to the API's expected "DD-MM-YYYY"
const toApiDate = (isoDate) => {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split("-");
    return `${day}-${month}-${year}`;
};

export default function CancelMembershipModal({ isOpen, onClose, booking }) {
    const [loading, setLoading] = useState(false);
    const [reason, setReason] = useState("");
    const [effectiveDate, setEffectiveDate] = useState("");
    const [cancellationReason, setCancellationReason] = useState(null);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [fieldErrors, setFieldErrors] = useState({});

    if (!isOpen) return null;

    const studentOptions = (booking?.students || []).map((s) => ({
        value: s.id,
        label: `${s.studentFirstName || ""} ${s.studentLastName || ""}`.trim(),
    }));

    const handleSubmit = async () => {
        // Basic validation for the required fields
        const errs = {};
        if (!effectiveDate) errs.effectiveDate = "Please select a cancellation effective date";
        if (!cancellationReason) errs.cancellationReason = "Please select a reason";
        if (studentOptions.length > 0 && selectedStudents.length === 0) {
            errs.selectedStudents = "Please select at least one student";
        }
        setFieldErrors(errs);
        if (Object.keys(errs).length > 0) return;

        try {
            setLoading(true);

            const token = localStorage.getItem("parentToken");
            const API_URL = import.meta.env.VITE_API_BASE_URL;

            if (!token) {
                throw new Error("Authentication token not found. Please login again.");
            }

            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
            myHeaders.append("Authorization", `Bearer ${token}`);

            const raw = JSON.stringify({
                bookingId: booking?.id,
                studentIds: selectedStudents.map((s) => s.value),
                cancelReason: cancellationReason?.value,
                additionalNote: reason,
                cancellationType: "scheduled",
                cancelDate: toApiDate(effectiveDate),
            });

            const response = await fetch(
                `${API_URL}api/parent/booking/request-to-cancel`,
                {
                    method: "POST",
                    headers: myHeaders,
                    body: raw,
                    redirect: "follow",
                }
            );

            // Safely parse JSON (handles empty / invalid JSON)
            let data = {};
            try {
                data = await response.json();
            } catch (err) {
                data = {};
            }

            // Handle both HTTP errors AND custom backend status errors
            if (!response.ok || data?.status === false) {
                const errorMessage =
                    data?.message ||
                    data?.error ||
                    (Array.isArray(data?.errors) ? data.errors[0] : null) ||
                    "Something went wrong";

                throw new Error(errorMessage);
            }

            // Success
            showSuccess(data?.message || "Cancellation request sent successfully!");

            // Close modal after short delay
            setTimeout(() => {
                onClose();
            }, 2000);

        } catch (err) {
            showError(err?.message || "Failed to send request");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[99] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl relative overflow-hidden max-h-[85vh] flex flex-col">
                {/* Header */}
                <div className="p-6 pb-2 shrink-0 border-b border-[#EBEBEB]">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="md:text-xl text-[16px] font-bold text-gray-900">Request to cancel membership</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="md:px-8  px-4 pb-8 space-y-6 mt-7 overflow-y-auto">
                    {/* Warning Card */}
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 text-red-500">
                                <Info size={20} className="fill-red-500 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">
                                    You currently have {booking?.paymentPlan?.duration ? Math.max(0, booking.paymentPlan.duration - 1) : 0} more months left on your membership
                                </h3>
                            </div>
                        </div>

                        <div className="">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>1 of {booking?.paymentPlan?.duration || "N/A"} Months</span>
                                <span className="font-semibold">{booking?.paymentPlan?.duration ? Math.round((1 / booking.paymentPlan.duration) * 100) : 0}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-500"
                                    style={{ width: `${booking?.paymentPlan?.duration ? (1 / booking.paymentPlan.duration) * 100 : 0}%` }}
                                />
                            </div>
                        </div>

                        <div className=" text-xs text-gray-500">
                            Cancellations are not permitted during the term of your membership.
                            <br />
                            <a href="#" className="underline">Please see full terms and conditions here.</a>
                        </div>
                    </div>

                    {/* Exceptional Circumstances */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-900">Exceptional Circumstances</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Cancellations with one months notices are permitted under exceptional circumstances.
                        </p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            If your reason is unexceptional, you still may cancel your membership however this would involve a payout of the remaining {booking?.paymentPlan?.duration ? Math.max(0, booking.paymentPlan.duration - 1) : 0} months of your membership.
                        </p>
                    </div>

                    {/* Cancellation Effective Date */}
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-900">Cancellation Effective Date</label>
                        <input
                            type="date"
                            value={effectiveDate}
                            min={new Date().toISOString().split("T")[0]}
                            onChange={(e) => {
                                setEffectiveDate(e.target.value);
                                if (fieldErrors.effectiveDate) {
                                    setFieldErrors((prev) => ({ ...prev, effectiveDate: null }));
                                }
                            }}
                            className={`w-full bg-[#F9FAFB] p-3 border ${fieldErrors.effectiveDate ? "border-[#F04438]" : "border-gray-200"} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm`}
                        />
                        {fieldErrors.effectiveDate && (
                            <p className="text-[#F04438] text-xs mt-1">{fieldErrors.effectiveDate}</p>
                        )}
                    </div>

                    {/* Reason for Cancellation (dropdown) */}
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-900">Reason for Cancellation</label>
                        <Select
                            options={cancellationReasonOptions}
                            value={cancellationReason}
                            onChange={(selected) => {
                                setCancellationReason(selected);
                                if (fieldErrors.cancellationReason) {
                                    setFieldErrors((prev) => ({ ...prev, cancellationReason: null }));
                                }
                            }}
                            placeholder="Select a reason"
                            classNamePrefix="react-select"
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    backgroundColor: "#F9FAFB",
                                    borderColor: fieldErrors.cancellationReason ? "#F04438" : base.borderColor,
                                    borderRadius: "0.75rem",
                                    padding: "2px",
                                    '&:hover': {
                                        borderColor: fieldErrors.cancellationReason ? "#F04438" : base.borderColor
                                    }
                                })
                            }}
                        />
                        {fieldErrors.cancellationReason && (
                            <p className="text-[#F04438] text-xs mt-1">{fieldErrors.cancellationReason}</p>
                        )}
                    </div>

                    {/* Select Students */}
                    {studentOptions.length > 0 && (
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-900">Select Students</label>
                            <Select
                                isMulti
                                options={studentOptions}
                                value={selectedStudents}
                                onChange={(selected) => {
                                    setSelectedStudents(selected || []);
                                    if (fieldErrors.selectedStudents) {
                                        setFieldErrors((prev) => ({ ...prev, selectedStudents: null }));
                                    }
                                }}
                                placeholder="Select student(s) to cancel"
                                classNamePrefix="react-select"
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        backgroundColor: "#F9FAFB",
                                        borderColor: fieldErrors.selectedStudents ? "#F04438" : base.borderColor,
                                        borderRadius: "0.75rem",
                                        padding: "2px",
                                        '&:hover': {
                                            borderColor: fieldErrors.selectedStudents ? "#F04438" : base.borderColor
                                        }
                                    })
                                }}
                            />
                            {fieldErrors.selectedStudents && (
                                <p className="text-[#F04438] text-xs mt-1">{fieldErrors.selectedStudents}</p>
                            )}
                        </div>
                    )}

                    {/* Form */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-[#1B1B1E]">Please provide details of your request</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full bg-[#F9FAFB] h-32 p-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder:text-gray-400"
                            placeholder="Enter a description..."
                        />
                    </div>

                    {/* Footer */}
                    <div className="md:flex justify-between items-center pt-2">
                        <p className="text-sm text-[#4B4B56] font-semibold">Our team will get in touch shortly.</p>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className={`bg-[#237FEA] mt-4 md:mt-0 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors
                                ${loading ? "opacity-60 cursor-not-allowed" : "hover:bg-blue-700"}
                            `}
                        >
                            {loading ? "Sending..." : "Send request"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}