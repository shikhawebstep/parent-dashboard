import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useCommon } from '../../context/CommonContext';
import { showError, showSuccess } from '../../../utils/swalHelper';
import { Loader2 } from 'lucide-react';

const TransferClassModal = ({ isOpen, onClose, booking, onSuccess }) => {
    const { venues, fetchVenues } = useCommon();
    const [transferData, setTransferData] = useState({
        studentIds: [],
        venueId: null,
        classScheduleId: null,
        transferReasonClass: ''
    });

    

    const [newClasses, setNewClasses] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTransferData(prev => ({
                ...prev,
                venueId: booking?.venue?.id || null
            }));

            if (!venues || (Array.isArray(venues) && venues.length === 0) || (venues.capacityVenues && venues.capacityVenues.length === 0)) {
                fetchVenues();
            }
        }
    }, [isOpen, venues, fetchVenues]);


    useEffect(() => {
        if (isOpen) {
           
            setTransferData(prev => ({
                ...prev,
                venueId: booking?.venue?.id || null
            }));


            if (!venues?.capacityVenues || (Array.isArray(venues) && venues.length === 0) || (venues.capacityVenues && venues.capacityVenues.length === 0)) {
                fetchVenues();
            } else {
            }
        }
    }, [isOpen, venues, fetchVenues]);

    useEffect(() => {
    
        if (transferData.venueId != null) {
            const venueList = Array.isArray(venues)
                ? venues
                : (Array.isArray(venues?.data) ? venues.data : (Array.isArray(venues?.capacityVenues) ? venues.capacityVenues : []));

        
            const selectedVenue = venueList.find(v => {
                const match = String(v.venueId ?? v.id) === String(transferData.venueId);
                return match;
            });

            if (selectedVenue && selectedVenue.classes) {
                const classOptions = [];
                Object.keys(selectedVenue.classes).forEach(day => {
                    const dayKey = day.toLowerCase();
                    selectedVenue.classes[day].forEach(cls => {
                        classOptions.push({
                            value: cls.classId,
                            label: `${dayKey.charAt(0).toUpperCase() + dayKey.slice(1)} ${cls.time} - ${cls.className}${cls.level ? ` (${cls.level})` : ''}`
                        });
                    });
                });
                setNewClasses(classOptions);
            } else {
                setNewClasses([]);
            }
        } else {
            setNewClasses([]);
        }
    }, [transferData.venueId, venues]);
    if (!isOpen) return null;

    const studentOptions = booking?.students?.map(s => ({
        value: s.id,
        label: `${s.studentFirstName} ${s.studentLastName}`
    })) || [];

    const venueList = Array.isArray(venues) ? venues : (Array.isArray(venues?.capacityVenues) ? venues.capacityVenues : []);
    const venueOptions = venueList.map(v => ({
        value: v.venueId || v.id,
        label: v.venueName || v.name
    }));

    const handleSelectChange = (selected, field, setter) => {
        if (field === 'studentIds') {
            setter(prev => ({ ...prev, [field]: selected ? selected.map(s => s.value) : [] }));
        } else {
            setter(prev => ({ ...prev, [field]: selected ? selected.value : null }));
        }
    };

    const handleInputChange = (e, setter) => {
        const { name, value } = e.target;
        setter(prev => ({ ...prev, [name]: value }));
    };

    const transferMembershipSubmit = async (data) => {
        if (!data.venueId || !data.classScheduleId || data.studentIds.length === 0 || !data.transferReasonClass) {
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

            const transfers = data.studentIds.map(studentId => ({
                studentId: studentId,
                classScheduleId: data.classScheduleId,
                transferReasonClass: data.transferReasonClass
            }));

            const raw = JSON.stringify({
                bookingId: booking?.id,
                venueId: data.venueId,
                transfers: transfers
            });

            const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/";

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: raw,
                redirect: "follow"
            };

            const response = await fetch(`${API_URL}api/parent/booking/transfer-class`, requestOptions);
            let result;
            try {
                result = await response.json();
            } catch (err) {
                result = { status: response.ok };
            }

            if (!response.ok || result?.status === false) {
                throw new Error(result?.message || "Failed to transfer class");
            }

            showSuccess("Class Transferred Successfully");
            if (onSuccess) onSuccess();
            onClose();

        } catch (error) {
            console.error(error);
            showError(error?.message || "Something went wrong while transferring class.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#00000066] flex justify-center items-center z-50">
            <div className="bg-white rounded-2xl w-[541px] max-h-[90%] overflow-y-auto relative scrollbar-hide">
                <button
                    className="absolute top-4 left-4 p-2 text-gray-500 hover:text-gray-700"
                    onClick={onClose}
                >
                    ✕
                </button>

                <div className="text-center py-6 border-b border-gray-300">
                    <h2 className="font-semibold text-[24px]">Transfer Class Form</h2>
                </div>

                <div className="space-y-4 px-6 pb-6 pt-4">
                    {/* Select Students */}
                    <div>
                        <label className="block text-[16px] font-semibold">
                            Select Student(s)
                        </label>
                        <Select
                            isMulti
                            value={studentOptions.filter(opt => transferData.studentIds.includes(opt.value))}
                            onChange={(selected) =>
                                handleSelectChange(selected, "studentIds", setTransferData)
                            }
                            options={studentOptions}
                            placeholder="Select Student(s)"
                            className="rounded-lg mt-2"
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    borderRadius: "0.7rem",
                                    boxShadow: "none",
                                    padding: "4px 8px",
                                    minHeight: "48px",
                                }),
                                placeholder: (base) => ({ ...base, fontWeight: 600 }),
                                dropdownIndicator: (base) => ({ ...base, color: "#9CA3AF" }),
                                indicatorSeparator: () => ({ display: "none" }),
                            }}
                        />
                    </div>

                    {/* Select Venue */}
                    <div>
                        <label className="block text-[16px] font-semibold">Select Venue</label>
                        <Select
                            value={venueOptions.find(opt => opt.value === transferData.venueId) || null}
                            onChange={(selected) => {
                                handleSelectChange(selected, "venueId", setTransferData);
                            }} options={venueOptions}
                            placeholder="Select Venue"
                            className="rounded-lg mt-2"
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    borderRadius: "0.7rem",
                                    boxShadow: "none",
                                    padding: "4px 8px",
                                    minHeight: "48px",
                                }),
                                placeholder: (base) => ({ ...base, fontWeight: 600 }),
                                dropdownIndicator: (base) => ({ ...base, color: "#9CA3AF" }),
                                indicatorSeparator: () => ({ display: "none" }),
                            }}
                        />
                    </div>
                    <div>
                        <label className="block text-[16px] font-semibold">Current Class / Level</label>
                        <input
                            type="text"
                            className="w-full mt-2 border border-gray-300 rounded-xl px-4 py-3 text-base bg-gray-50"
                            value={booking?.students?.[0]?.classSchedule?.className || "-"}
                            readOnly
                        />
                    </div>

                    {/* Select New Class / Level */}
                    <div>
                        <label className="block text-[16px] font-semibold">
                            Select New Class / Level
                        </label>
                        <Select
                            value={
                                transferData.classScheduleId
                                    ? newClasses.find((cls) => cls.value === transferData.classScheduleId) || null
                                    : null
                            }
                            onChange={(selected) =>
                                handleSelectChange(selected, "classScheduleId", setTransferData)
                            }
                            options={newClasses}
                            placeholder="Select Class"
                            className="rounded-lg mt-2"
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    borderRadius: "0.7rem",
                                    boxShadow: "none",
                                    padding: "4px 8px",
                                    minHeight: "48px",
                                }),
                                placeholder: (base) => ({ ...base, fontWeight: 600 }),
                                dropdownIndicator: (base) => ({ ...base, color: "#9CA3AF" }),
                                indicatorSeparator: () => ({ display: "none" }),
                            }}
                        />
                    </div>

                    {/* Additional Notes */}
                    <div>
                        <label className="block text-[16px] font-semibold">
                            Reason for Transfer
                        </label>
                        <textarea
                            name="transferReasonClass"
                            className="w-full mt-2 border border-gray-300 rounded-xl px-4 py-3 text-base"
                            rows={6}
                            value={transferData.transferReasonClass}
                            onChange={(e) => handleInputChange(e, setTransferData)}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4 pt-4 justify-end">
                        <button
                            className="w-1/2 bg-gray-200 text-gray-700 rounded-xl py-3 text-[18px] font-medium hover:bg-gray-300 transition-colors"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            className="w-1/2 bg-[#237FEA] text-white rounded-xl py-3 text-[18px] font-medium hover:shadow-md transition-shadow flex justify-center items-center gap-2 disabled:opacity-70"
                            onClick={() => transferMembershipSubmit(transferData)}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                "Submit Transfer"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransferClassModal;
