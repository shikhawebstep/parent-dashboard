import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import axios from 'axios';
import { showError, showSuccess } from '../../../utils/swalHelper';
import { useFeedback } from '../../context/FeedbackContext';

const SERVICE_TYPES = [
    { value: "weekly class membership", label: "Weekly Class Membership" },
    { value: "weekly class trial", label: "Weekly Class Trial" },
    { value: "one to one", label: "One to One" },
    { value: "birthday party", label: "Birthday Party" },
    { value: "holiday camp", label: "Holiday Camp" },
];

const AddFeedbackModal = ({ isOpen, onClose }) => {
    const { profile } = useProfile();
    const { fetchFeedbackData } = useFeedback();

    const booking = profile?.bookings
        ? (Array.isArray(profile.bookings) ? profile.bookings : Object.values(profile.bookings).flat())
        : [];

        

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        serviceType: "",
        holidayBookingId: "",
        holidayClassScheduleId: "",
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

    // Filter bookings by selected service type
    const filteredBookings = form.serviceType
        ? booking?.filter(b => b?.serviceType === form.serviceType) || []
        : [];

    // Get the currently selected booking object (from filtered list)
    const selectedBooking = filteredBookings?.find(b => String(b?.id) === String(form.holidayBookingId)) || null;

    // Determine if class selector should be shown based on selected serviceType
    const showClassSelector = form.serviceType
        ? !["one to one", "birthday party"].includes(form.serviceType)
        : false;

    // Build class options from the SELECTED booking's students only
    let uniqueClasses = [];
    if (selectedBooking && showClassSelector) {
        const extracted = [];
        const students = Array.isArray(selectedBooking?.students) ? selectedBooking.students : [];

        students.forEach(s => {
            const cs = s?.classSchedule;
            if (cs && cs?.id != null) {
                const levelName = cs?.level?.name || cs?.level || "";
                const cName = cs?.className || "Class";
                extracted.push({
                    id: cs.id,
                    name: levelName ? `${cName} (${levelName})` : cName
                });
            }

            const hcs = s?.holidayClassSchedules;
            if (hcs && hcs?.id != null) {
                const levelName = hcs?.level?.name || hcs?.level || "";
                const cName = hcs?.className || "Class";
                extracted.push({
                    id: hcs.id,
                    name: levelName ? `${cName} (${levelName})` : cName
                });
            }
        });

        uniqueClasses = extracted.filter(
            (item, index) => extracted.findIndex(x => x?.id === item?.id) === index
        );
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "category" && value === "add_new") {
            setIsAddingCategory(true);
            return;
        }

        setForm(prev => {
            const next = { ...prev, [name]: value };
            if (name === "serviceType") {
                // Reset dependent fields when service type changes
                next.holidayBookingId = "";
                next.holidayClassScheduleId = "";
            }
            if (name === "holidayBookingId") {
                next.holidayClassScheduleId = "";
            }
            return next;
        });

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
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
            serviceType: "",
            holidayBookingId: "",
            holidayClassScheduleId: "",
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
        if (!form.serviceType) {
            newErrors.serviceType = "Service type is required";
        }
        if (!form.holidayBookingId) {
            newErrors.holidayBookingId = "Booking is required";
        }
        if (showClassSelector && !form.holidayClassScheduleId) {
            newErrors.holidayClassScheduleId = "Class is required";
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

        const venueId = selectedBooking?.venueId
            || selectedBooking?.holidayVenue?.id
            || selectedBooking?.venue?.id
            || null;

        const parentDataRaw = localStorage.getItem("parentData");
        const parentData = parentDataRaw ? JSON.parse(parentDataRaw) : null;
        const parentAdminId = parentData?.id || null;

        const bookingServiceType = form.serviceType;

        // Map serviceType -> booking id field name expected by API
        const bookingIdFieldMap = {
            "birthday party": "birthdayPartyBookingId",
            "one to one": "oneToOneBookingId",
            "holiday camp": "holidayBookingId",
            "weekly class membership": "bookingId",
            "weekly class trial": "bookingId",
        };
        const bookingIdField = bookingIdFieldMap[bookingServiceType] || "bookingId";

        const payload = {
            [bookingIdField]: form.holidayBookingId ? Number(form.holidayBookingId) : null,
            parentAdminId: parentAdminId ? Number(parentAdminId) : null,
            serviceType: bookingServiceType,
            feedbackType: form.feedbackType,
            category: form.category,
            notes: form.notes,
        };

        // Only include class/venue fields when relevant
        if (showClassSelector) {
            const classFieldMap = {
                "holiday camp": "holidayClassScheduleId",
                "weekly class membership": "classScheduleId",
                "weekly class trial": "classScheduleId",
            };
            const classField = classFieldMap[bookingServiceType] || "classScheduleId";
            payload[classField] = form.holidayClassScheduleId ? Number(form.holidayClassScheduleId) : null;
        }

        if (venueId) {
            const venueField = bookingServiceType === "holiday camp" ? "holidayVenueId" : "venueId";
            payload[venueField] = Number(venueId);
        }

        setLoading(true);

        try {
            await axios.post(
                `${API_URL}api/parent/holiday/feedback/create`,
                payload,
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

    const getBookingLabel = (b) => {
        const address = b?.holidayVenue?.address || b?.venue?.address || b?.address || b?.location || "Address N/A";
        return `${address} (#${b?.id})`;
    };

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
                    {/* Service Type Selection - FIRST */}
                    <div>
                        <label className="block text-[15px] font-medium text-[#191919] mb-2.5 gilory">
                            Please select the service your feedback is about
                        </label>
                        <div className="relative">
                            <select
                                name="serviceType"
                                value={form.serviceType}
                                onChange={handleChange}
                                className={`w-full px-4 py-3.5 rounded-xl border ${errors.serviceType ? 'border-red-500' : 'border-gray-200'} text-gray-500 focus:outline-none focus:border-blue-500 bg-white appearance-none cursor-pointer text-sm font-medium gilory shadow-sm`}
                            >
                                <option value="">Select</option>
                                {SERVICE_TYPES.map((s) => (
                                    <option key={s.value} value={s.value}>
                                        {s.label}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                        {errors.serviceType && (
                            <p className="text-red-500 text-xs mt-1 font-semibold">{errors.serviceType}</p>
                        )}
                    </div>

                    {/* Booking Selection - SECOND, filtered by serviceType */}
                    {form.serviceType && (
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
                                    {filteredBookings?.map((b) => (
                                        <option key={b?.id} value={b?.id}>
                                            {getBookingLabel(b)}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                            {filteredBookings?.length === 0 && (
                                <p className="text-gray-400 text-xs mt-1 font-medium">No bookings found for this service.</p>
                            )}
                            {errors.holidayBookingId && (
                                <p className="text-red-500 text-xs mt-1 font-semibold">{errors.holidayBookingId}</p>
                            )}
                        </div>
                    )}

                    {/* Class Selector - only if NOT one to one / birthday party */}
                    {form.holidayBookingId && showClassSelector && (
                        <div>
                            <label className="block text-[15px] font-medium text-[#191919] mb-2.5 gilory">
                                Please select the classes you wish to add feedback for
                            </label>
                            <div className="relative">
                                <select
                                    name="holidayClassScheduleId"
                                    value={form.holidayClassScheduleId}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3.5 rounded-xl border ${errors.holidayClassScheduleId ? 'border-red-500' : 'border-gray-200'} text-gray-500 focus:outline-none focus:border-blue-500 bg-white appearance-none cursor-pointer text-sm font-medium gilory shadow-sm`}
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
                            {errors.holidayClassScheduleId && (
                                <p className="text-red-500 text-xs mt-1 font-semibold">{errors.holidayClassScheduleId}</p>
                            )}
                        </div>
                    )}

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