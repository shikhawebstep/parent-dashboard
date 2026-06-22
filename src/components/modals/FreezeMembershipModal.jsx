import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { showError, showSuccess } from '../../../utils/swalHelper';


const FreezeMembershipModal = ({ isOpen, onClose, booking, onSuccess }) => {
    const [formData, setFormData] = useState({
        freezeStartDate: '',
        freezeDurationMonths: 1,
        reasonForFreezing: ''
    });
    const [reactivateOn, setReactivateOn] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (formData.freezeStartDate && formData.freezeDurationMonths) {
            const date = new Date(formData.freezeStartDate);
            date.setMonth(date.getMonth() + Number(formData.freezeDurationMonths));
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            setReactivateOn(`${y}-${m}-${d}`);
        } else {
            setReactivateOn('');
        }
    }, [formData.freezeStartDate, formData.freezeDurationMonths]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.freezeStartDate || !formData.reasonForFreezing) {
            showError("Please fill out all required fields.");
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem("parentToken");
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
            if (token) {
                myHeaders.append("Authorization", `Bearer ${token}`);
            }

            const raw = JSON.stringify({
                "bookingId": booking?.id,
                "freezeStartDate": formData.freezeStartDate,
                "freezeDurationMonths": Number(formData.freezeDurationMonths),
                "reactivateOn": reactivateOn,
                "reasonForFreezing": formData.reasonForFreezing
            });

            const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/";

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: raw,
                redirect: "follow"
            };

            const response = await fetch(`${API_URL}api/parent/booking/freeze`, requestOptions);
            let result;
            try {
                result = await response.json();
            } catch (err) {
                result = { status: response.ok };
            }

            if (!response.ok || result?.status === false) {
                throw new Error(result?.message || "Failed to freeze membership");
            }

            showSuccess("Membership Frozen Successfully");
            if (onSuccess) onSuccess();
            onClose();

        } catch (error) {
            console.error(error);
            showError(error?.message || "Something went wrong while freezing membership.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#00000066] flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 relative shadow-xl">
                <button
                    className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 transition-colors"
                    onClick={onClose}
                >
                    ✕
                </button>

                <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Freeze Membership</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Freeze Start Date</label>
                        <input
                            type="date"
                            name="freezeStartDate"
                            value={formData.freezeStartDate}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#042C89] focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Duration (Months)</label>
                        <select
                            name="freezeDurationMonths"
                            value={formData.freezeDurationMonths}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#042C89] focus:outline-none"
                        >
                            <option value={1}>1 Month</option>
                            <option value={2}>2 Months</option>
                            <option value={3}>3 Months</option>
                            <option value={4}>4 Months</option>
                            <option value={5}>5 Months</option>
                            <option value={6}>6 Months</option>
                        </select>
                    </div>

                    {reactivateOn && (
                        <div className="bg-blue-50 text-[#042C89] px-4 py-3 rounded-lg border border-blue-100 text-sm font-medium">
                            Membership will automatically reactivate on <span className="font-bold">{reactivateOn}</span>.
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Reason for Freezing</label>
                        <textarea
                            name="reasonForFreezing"
                            value={formData.reasonForFreezing}
                            onChange={handleChange}
                            rows={4}
                            placeholder="e.g. Student traveling abroad"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#042C89] focus:outline-none"
                        />
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex-1 bg-[#042C89] text-white font-bold py-3 rounded-xl hover:bg-[#032066] transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Freezing...
                                </>
                            ) : (
                                "Freeze Membership"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FreezeMembershipModal;
