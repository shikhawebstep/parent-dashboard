import React, { useState, useMemo, useEffect } from 'react';
import { X } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import axios from 'axios';
import { showError, showSuccess } from '../../../utils/swalHelper';
import { useFeedback } from '../../context/FeedbackContext';

const AddFeedbackModal = ({ isOpen, onClose, serviceType }) => {
    const { profile } = useProfile();
    const { feedback, fetchFeedbackData } = useFeedback();

    const booking = profile?.combinedBookings 
        || (profile?.groupedBookings ? Object.values(profile.groupedBookings).flat() : [])
        || [];
    const holidayClasses = feedback?.holidayClasses;
    const currentServiceType = serviceType || "holiday camp";
    const holidayBooking = booking?.filter((booking) => booking?.serviceType == currentServiceType);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    
    // Attempt to extract classes from students inside bookings if holidayClasses from context is empty/missing
    let classes = holidayClasses?.map((booking) => {
        return {
            id: booking?.id,
            name: booking?.className
        }
    });

    if (!classes || classes.length === 0) {
        const extracted = [];
        holidayBooking?.forEach(b => {
            b.students?.forEach(s => {
                if (s.classSchedule) extracted.push({ id: s.classSchedule.id, name: s.classSchedule.className });
                if (s.holidayClassSchedules) extracted.push({ id: s.holidayClassSchedules.id, name: s.holidayClassSchedules.className });
            });
        });
        classes = extracted;
    }

    const uniqueClasses = classes?.filter((classSchedule, index) => classes?.findIndex((item) => item?.id === classSchedule?.id) === index);

    const [form, setForm] = useState({
        holidayClassScheduleId: "",
        holidayBookingId: "",
        feedbackType: "",
        category: "",
        notes: ""
    });

    const [categories, setCategories] = useState([
        { value: "Behavior", label: "Behavior" },
        { value: "Attendance", label: "Attendance" },
        { value: "Facilities", label: "Facilities" },
        { value: "Other", label: "Other" }
    ]);

    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "category" && value === "add_new") {
            setIsAddingCategory(true);
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
            if (errors[name]) {
                setErrors(prev => ({ ...prev, [name]: null }));
            }
        }
    };

    useEffect(() => {
        if (!isOpen) {
            setIsAddingCategory(false);
            setNewCategoryName("");
            setErrors({});
        }
    }, [isOpen]);

    const emptyForm = () => {
        setForm({
            holidayClassScheduleId: "",
            holidayBookingId: "",
            feedbackType: "",
            category: "",
            notes: ""
        });
        setErrors({});
    };

    const handleSubmit = async () => {
        const token = localStorage.getItem("parentToken");
        const API_URL = import.meta.env.VITE_API_BASE_URL;

        if (!token) return;

        const newErrors = {};
        if (!form.holidayBookingId) {
            newErrors.holidayBookingId = "Booking is required";
        }
        if (!form.feedbackType) {
            newErrors.feedbackType = "Feedback type is required";
        }
        if (!form.category) {
            newErrors.category = "Category is required";
        }
        if (!form.notes?.trim()) {
            newErrors.notes = "Notes are required";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const selectedBooking = holidayBooking?.find(b => b.id == form.holidayBookingId);
        const venueId = selectedBooking?.venueId || selectedBooking?.holidayVenueId || selectedBooking?.venue?.id || selectedBooking?.holidayVenue?.id || null;
        const parentData = JSON.parse(localStorage.getItem("parentData"));
        const parentAdminId = parentData?.id || null;

        setLoading(true);

        const isHoliday = currentServiceType === "holiday camp";

        try {
            await axios.post(
                `${API_URL}api/parent/holiday/feedback/create`,
                {
                    [isHoliday ? "holidayBookingId" : "bookingId"]: form.holidayBookingId ? Number(form.holidayBookingId) : null,
                    [isHoliday ? "holidayClassScheduleId" : "classScheduleId"]: form.holidayClassScheduleId ? Number(form.holidayClassScheduleId) : null,
                    [isHoliday ? "holidayVenueId" : "venueId"]: venueId ? Number(venueId) : null,
                    parentAdminId: parentAdminId ? Number(parentAdminId) : null,
                    serviceType: currentServiceType,
                    feedbackType: form.feedbackType,
                    category: form.category,
                    notes: form.notes,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            showSuccess("Success", "Feedback submitted successfully");

            fetchFeedbackData();
            onClose();
            emptyForm();
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                "Something went wrong. Please try again.";

            showError("Error", errorMessage);
            console.error("Feedback submit error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-[550px] max-h-[90vh] overflow-y-auto rounded-[20px] p-0 relative shadow-xl mx-4">
                {/* Header */}
                <div className="px-6 py-5 flex items-center justify-between relative border-b border-gray-100">
                    <button
                        onClick={() => {
                            onClose();
                            emptyForm();
                        }}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors absolute left-6"
                    >
                        <X size={20} className="text-[#333]" strokeWidth={1.5} />
                    </button>
                    <h2 className="text-[20px] font-bold text-[#191919] w-full text-center gilory">
                        Add Feedback
                    </h2>
                </div>

                {/* Body */}
                <div className="p-8 space-y-5">
                    {/* Class Selector */}
                    <div>
                        <label className="block text-[15px] font-medium text-[#191919] mb-2.5 gilory">
                            Please select the classes you wish to add feedback for
                        </label>
                        <div className="relative">
                            <select
                                name="holidayClassScheduleId"
                                value={form.holidayClassScheduleId}
                                onChange={handleChange}
                                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-gray-500 focus:outline-none focus:border-blue-500 bg-white appearance-none cursor-pointer text-sm font-medium gilory shadow-sm"
                            >
                                <option value="">Select</option>
                                {uniqueClasses?.map((classSchedule) => (
                                    <option key={classSchedule?.id} value={classSchedule?.id}>
                                        {classSchedule?.name}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Feedback Type */}
                    <div>
                        <label className="block text-[15px] font-medium text-[#191919] mb-2.5 gilory">
                            Did you have a positive or negative experience?
                        </label>
                        <div className="relative">
                            <select
                                name="feedbackType"
                                value={form.feedbackType}
                                onChange={handleChange}
                                className={`w-full px-4 py-3.5 rounded-xl border ${errors.feedbackType ? 'border-red-500' : 'border-gray-200'} text-gray-500 focus:outline-none focus:border-blue-500 bg-white appearance-none cursor-pointer text-sm font-medium gilory shadow-sm`}
                            >
                                <option value="">Select</option>
                                <option value="Positive">Positive</option>
                                <option value="Negative">Negative</option>
                            </select>
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                        {errors.feedbackType && (
                            <p className="text-red-500 text-xs mt-1 font-semibold">{errors.feedbackType}</p>
                        )}
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-[15px] font-medium text-[#191919] mb-2.5 gilory">
                            Please select a category your feedback falls into
                        </label>
                        {!isAddingCategory ? (
                            <div className="relative">
                                <select
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3.5 rounded-xl border ${errors.category ? 'border-red-500' : 'border-gray-200'} text-gray-500 focus:outline-none focus:border-blue-500 bg-white appearance-none cursor-pointer text-sm font-medium gilory shadow-sm`}
                                >
                                    <option value="">Select</option>
                                    {categories.map((cat, idx) => (
                                        <option key={idx} value={cat.value}>
                                            {cat.label}
                                        </option>
                                    ))}
                                    <option value="add_new">+ Add Category</option>
                                </select>
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    autoFocus
                                    className={`w-full border ${errors.category ? 'border-red-500' : 'border-gray-200'} rounded-xl p-2 px-3 text-sm h-[48px] focus:outline-none focus:border-blue-500`}
                                    placeholder="Enter category name"
                                    value={newCategoryName}
                                    onChange={(e) => {
                                        setNewCategoryName(e.target.value);
                                        if (errors.category) {
                                            setErrors(prev => ({ ...prev, category: null }));
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => {
                                        if (newCategoryName.trim()) {
                                            const newOpt = {
                                                value: newCategoryName,
                                                label: newCategoryName,
                                            };
                                            setCategories((prev) => [...prev, newOpt]);
                                            setForm((prev) => ({
                                                ...prev,
                                                category: newCategoryName,
                                            }));
                                            setNewCategoryName("");
                                            setIsAddingCategory(false);
                                        }
                                    }}
                                    className="bg-[#1B7AF9] text-white px-4 rounded-xl text-xs font-semibold hover:bg-blue-600 transition-colors"
                                >
                                    Add
                                </button>
                                <button
                                    onClick={() => {
                                        setIsAddingCategory(false);
                                        setNewCategoryName("");
                                    }}
                                    className="bg-gray-100 text-[#5B6572] px-4 rounded-xl text-xs font-semibold hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                        {errors.category && !isAddingCategory && (
                            <p className="text-red-500 text-xs mt-1 font-semibold">{errors.category}</p>
                        )}
                    </div>

                    {/* Booking Selection */}
                    <div>
                        <label className="block text-[15px] font-medium text-[#191919] mb-2.5 gilory">
                            Please select a Booking your feedback falls into
                        </label>
                        <div className="relative">
                            <select
                                name="holidayBookingId"
                                value={form.holidayBookingId}
                                onChange={handleChange}
                                className={`w-full px-4 py-3.5 rounded-xl border ${errors.holidayBookingId ? 'border-red-500' : 'border-gray-200'} text-gray-500 focus:outline-none focus:border-blue-500 bg-white appearance-none cursor-pointer text-sm font-medium gilory shadow-sm`}
                            >
                                <option value="">Select</option>
                                {holidayBooking?.map((booking) => (
                                    <option key={booking?.id} value={booking?.id}>
                                        {`${booking?.holidayVenue?.address || booking?.venue?.address || "Address N/A"} (${booking?.id})`}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                        {errors.holidayBookingId && (
                            <p className="text-red-500 text-xs mt-1 font-semibold">{errors.holidayBookingId}</p>
                        )}
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-[15px] font-medium text-[#191919] mb-2.5 gilory">
                            Notes
                        </label>
                        <textarea
                            name="notes"
                            value={form.notes}
                            onChange={(e) => {
                                setForm(prev => ({ ...prev, notes: e.target.value }));
                                if (errors.notes) {
                                    setErrors(prev => ({ ...prev, notes: null }));
                                }
                            }}
                            className={`w-full px-4 py-3 rounded-xl border ${errors.notes ? 'border-red-500' : 'border-gray-200'} text-[#333] focus:outline-none focus:border-blue-500 bg-[#F9FAFB] min-h-[120px] resize-none text-sm font-medium gilory shadow-sm`}
                            placeholder="Write your notes here..."
                        />
                        {errors.notes && (
                            <p className="text-red-500 text-xs mt-1 font-semibold">{errors.notes}</p>
                        )}
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={() => {
                                onClose();
                                emptyForm();
                            }}
                            className="flex-1 py-3.5 rounded-xl border border-gray-200 text-[#5B6572] font-semibold hover:bg-gray-50 transition-colors gilory"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-1 py-3.5 rounded-xl bg-[#1B7AF9] text-white font-semibold flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors shadow-blue-200 shadow-lg gilory disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading && <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                            {loading ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddFeedbackModal;
