import React, { useState, useEffect } from 'react';
import CalendarWidget from './CalendarWidget';
import { Search, ChevronDown, ChevronRight, FileText, Send, ArrowLeft, Trash2 } from 'lucide-react';
import { useCommon } from "../../context/CommonContext";
import PhoneNumberInput from "../../commom/PhoneNumberInput";
import axios from "axios";
import Select from "react-select";
import { useProfile } from "../../context/ProfileContext";

import { showSuccess, showError } from "../../../utils/swalHelper";
// ── Dropdown Options ──────────────────────────────────────
const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
];

const relationOptions = [
    { value: "Mother", label: "Mother" },
    { value: "Father", label: "Father" },
    { value: "Guardian", label: "Guardian" },
];

const interestReasonOptions = [
    { value: "To build my child's confidence", label: "To build my child's confidence" },
    { value: "To improve their technical football skills", label: "To improve their technical football skills" },
    { value: "Because my child loves football", label: "Because my child loves football" },
    { value: "To help my child make friends and build social skills", label: "To help my child make friends and build social skills" },
    { value: "To keep my child active and healthy", label: "To keep my child active and healthy" },
    { value: "High-quality coaching in a fun, positive environment", label: "High-quality coaching in a fun, positive environment" },
    { value: "Other", label: "Other" },
];

const hearOptions = [
    { value: "Google", label: "Google" },
    { value: "Facebook", label: "Facebook" },
    { value: "Instagram", label: "Instagram" },
    { value: "Friend", label: "Friend" },
    { value: "Flyer", label: "Flyer" },
];

// ── Inits ─────────────────────────────────────────────────
const createStudent = () => ({
    studentFirstName: "",
    studentLastName: "",
    dob: "",
    age: "",
    gender: "",
    medicalInfo: "",
    selectedClassId: "",
    selectedClassData: null,
});

const createParent = () => ({
    id: Date.now() + Math.random(),
    parentFirstName: "",
    parentLastName: "",
    parentEmail: "",
    parentPhoneNumber: "",
    interestReason: "",
    interestReasonOther: "",
    relationToChild: "",
    howDidYouHear: "",
    isCustomReason: false,
});

const initialEmergency = {
    sameAsAbove: false,
    emergencyFirstName: "",
    emergencyLastName: "",
    emergencyPhoneNumber: "",
    emergencyRelation: "",
};

const BookFreeTrial = () => {
    const { fetchVenues, venues } = useCommon();

    const [selectedVenue, setSelectedVenue] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [numStudents, setNumStudents] = useState("1");
    const [students, setStudents] = useState([createStudent()]);
    const [parents, setParents] = useState([createParent()]);
    const [emergency, setEmergency] = useState(initialEmergency);
    const [errors, setErrors] = useState({});

    const { profile, fetchProfileData } = useProfile();

    useEffect(() => {
        if (!profile) {
            setParents([createParent()]);
            setStudents([createStudent()]);
            setEmergency(initialEmergency);
            return;
        }

        const rawParents = profile?.adminMeta?.parents || [];
        const rawStudents = profile?.adminMeta?.students || [];

        const normalizedParents = rawParents.map((p) => ({
            id: p.id ?? Date.now() + Math.random(),
            parentFirstName: p.parentFirstName || "",
            parentLastName: p.parentLastName || "",
            parentEmail: p.parentEmail || "",
            parentPhoneNumber: p.parentPhoneNumber || p.phoneNumber || "",
            interestReason: p.interestReason || "",
            interestReasonOther: p.interestReasonOther || "",
            relationToChild: p.relationToChild || "",
            howDidYouHear: p.howDidYouHear || "",
            isCustomReason: p.isCustomReason || false,
        }));

        const normalizedStudents = rawStudents.map((s) => ({
            studentFirstName: s.studentFirstName || "",
            studentLastName: s.studentLastName || "",
            dob: s.dob || formatDOBForDisplay(s.dateOfBirth),
            age: s.age ?? "",
            gender: s.gender || "",
            medicalInfo: s.medicalInfo || s.medicalInformation || "",
            selectedClassId: s.selectedClassId || "",
            selectedClassData: s.selectedClassData || null,
        }));

        setParents(normalizedParents.length ? normalizedParents : [createParent()]);
        setStudents(normalizedStudents.length ? normalizedStudents : [createStudent()]);
        setNumStudents(String(normalizedStudents.length || 1));

        const emergencyContact = profile?.adminMeta?.emergency;
        if (emergencyContact) {
            const activeParent = normalizedParents[0];
            const isSame =
                !!activeParent &&
                activeParent.parentFirstName?.trim() === emergencyContact.emergencyFirstName?.trim() &&
                activeParent.parentLastName?.trim() === emergencyContact.emergencyLastName?.trim() &&
                activeParent.parentPhoneNumber?.trim() === emergencyContact.emergencyPhoneNumber?.trim();

            setEmergency({
                sameAsAbove: isSame,
                emergencyFirstName: emergencyContact.emergencyFirstName || "",
                emergencyLastName: emergencyContact.emergencyLastName || "",
                emergencyPhoneNumber: emergencyContact.emergencyPhoneNumber || "",
                emergencyRelation: emergencyContact.emergencyRelation || "",
            });
        } else {
            setEmergency(initialEmergency);
        }
    }, [profile]);

    // Fetch venues on load
    useEffect(() => {
        fetchVenues();
        fetchProfileData();
    }, [fetchVenues]);



    const selectStyles = {
        control: (base, state) => ({
            ...base,
            minHeight: "52px",
            borderRadius: "12px",
            borderColor: state.isFocused ? "#0496FF" : "#E2E1E5",
            boxShadow: "none",
            "&:hover": {
                borderColor: "#0496FF",
            },
        }),
        placeholder: (base) => ({
            ...base,
            color: "#9CA3AF",
        }),
        menu: (base) => ({
            ...base,
            zIndex: 9999,
        }),
    };

    // Parse Venue's classes and terms
    const venueData = selectedVenue || null;

    // Session dates from venue's terms
    const sessionDates = venueData?.terms?.flatMap((t) =>
        t.sessionsMap.map((s) => s.sessionDate)
    ) || [];
    const availableDatesSet = new Set(sessionDates);

    // Auto-select first future session date on venue change
    useEffect(() => {
        if (!sessionDates.length) {
            setSelectedDate(null);
            return;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const future = sessionDates
            .map((d) => new Date(d))
            .filter((d) => {
                const x = new Date(d);
                x.setHours(0, 0, 0, 0);
                return x >= today;
            })
            .sort((a, b) => a - b);

        if (future.length) {
            setSelectedDate(future[0]);
        } else {
            setSelectedDate(new Date(sessionDates[0]));
        }
    }, [selectedVenue]);

    // Flatten all classes of the selected venue
    const allClasses = venueData
        ? Object.entries(venueData.classes || {}).flatMap(([day, classes]) =>
            classes.map((c) => ({
                id: c.classId,
                className: c.className,
                dayOfWeek: day,
                startTime: c.time?.split(" - ")[0] || "",
                endTime: c.time?.split(" - ")[1] || "",
                capacity: c.capacity,
                level: c.level,
                time: c.time,
            }))
        )
        : [];

    // Selected day of the week (e.g. "Monday")
    const selectedDayOfWeek = selectedDate
        ? selectedDate.toLocaleDateString("en-US", { weekday: "long" })
        : "";

    // Filter classes to only show the ones on the selected date's day of week
    const availableClasses = selectedDayOfWeek
        ? allClasses.filter((c) => c.dayOfWeek.toLowerCase() === selectedDayOfWeek.toLowerCase())
        : [];

    const formatDOBForDisplay = (isoDate) => {
        if (!isoDate) return "";
        const [y, m, d] = isoDate.split("-");
        if (!y || !m || !d) return "";
        return `${d}/${m}/${y}`;
    };



    const handleDOBChange = (index, value) => {
        let formatted = value.replace(/[^\d]/g, "");
        if (formatted.length > 2 && formatted.length <= 4) {
            formatted = `${formatted.slice(0, 2)}/${formatted.slice(2)}`;
        } else if (formatted.length > 4) {
            formatted = `${formatted.slice(0, 2)}/${formatted.slice(2, 4)}/${formatted.slice(4, 8)}`;
        }

        setStudents((prev) =>
            prev.map((s, i) => {
                if (i !== index) return s;
                let age = "";
                if (formatted.length === 10) {
                    const [d, m, y] = formatted.split("/").map(Number);
                    const dobDate = new Date(y, m - 1, d);
                    const isValid =
                        dobDate.getDate() === d && dobDate.getMonth() === m - 1 && dobDate.getFullYear() === y;
                    if (isValid) {
                        const today = new Date();
                        let calcAge = today.getFullYear() - y;
                        const monthDiff = today.getMonth() - (m - 1);
                        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d)) calcAge--;
                        age = calcAge >= 3 && calcAge <= 100 ? calcAge : "";
                    }
                }
                return { ...s, dob: formatted, age };
            })
        );
        clearErr(`s${index}_dob`);
    };

    const handleVenueChange = (e) => {
        const venueId = e.target.value;
        const found = venues?.find((v) => String(v.venueId) === String(venueId)) || null;
        setSelectedVenue(found);
        setStudents((prev) => prev.map((s) => ({ ...s, selectedClassId: "", selectedClassData: null })));
        clearErr("venue");
    };

    const handleNumStudentsChange = (e) => {
        const val = e.target.value;
        setNumStudents(val);
        const count = Number(val) || 1;
        setStudents((prev) => {
            if (count > prev.length) {
                return [...prev, ...Array.from({ length: count - prev.length }, createStudent)];
            }
            return prev.slice(0, count);
        });
    };

    // Calculate age automatically
    const computeAge = (dobValue) => {
        if (!dobValue) return "";
        const dobObj = new Date(dobValue);
        if (isNaN(dobObj.getTime())) return "";
        const today = new Date();
        let years = today.getFullYear() - dobObj.getFullYear();
        const monthDiff = today.getMonth() - dobObj.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobObj.getDate())) {
            years--;
        }
        return years >= 0 ? years : "";
    };

    const handleStudentChange = (index, field, value) => {
        let classError = null;
        setStudents((prev) =>
            prev.map((s, i) => {
                if (i !== index) return s;
                const updated = { ...s, [field]: value };
                if (field === "selectedClassId") {
                    const foundClass = availableClasses.find((c) => String(c.id) === String(value)) || null;
                    
                    const alreadySelectedCount = prev.filter((st, idx) => idx !== index && String(st.selectedClassId) === String(value)).length;
                    const remainingCapacity = (foundClass?.capacity || 0) - alreadySelectedCount;
                    
                    if (foundClass?.capacity === 0) {
                        updated.error = "This class has no capacity. Please select another.";
                        classError = updated.error;
                    } else if (remainingCapacity <= 0) {
                        updated.error = "Not enough space in this class for another student. Please select another.";
                        classError = updated.error;
                    } else {
                        updated.error = null;
                    }
                    
                    updated.selectedClassData = foundClass;
                }
                return updated;
            })
        );
        clearErr(`s${index}_${field}`);
        if (classError) {
             setErrors(prev => ({ ...prev, [`s${index}_selectedClassId`]: classError }));
        }
    };

    const handleRemoveStudent = (index) => {
        setStudents((prev) => {
            const next = prev.filter((_, i) => i !== index);
            return next.length ? next : [createStudent()];
        });
        setNumStudents((prev) => String(Math.max(Number(prev) - 1, 1)));
    };

    const handleParentChange = (index, field, value) => {
        setParents((prev) =>
            prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
        );
        clearErr(`p${index}_${field}`);
    };

    const handleAddParent = () => {
        if (parents.length < 3) {
            setParents((prev) => [...prev, createParent()]);
        }
    };

    const handleRemoveParent = (id) => {
        if (parents.length > 1) {
            setParents((prev) => prev.filter((p) => p.id !== id));
        }
    };

    const handleSameAsAboveChange = (e) => {
        const checked = e.target.checked;
        const p = parents[0];
        setEmergency((prev) => ({
            ...prev,
            sameAsAbove: checked,
            emergencyFirstName: checked ? p.parentFirstName || "" : "",
            emergencyLastName: checked ? p.parentLastName || "" : "",
            emergencyPhoneNumber: checked ? p.parentPhoneNumber || "" : "",
            emergencyRelation: checked ? p.relationToChild || "" : "",
        }));
        clearErr("e_firstName");
        clearErr("e_lastName");
        clearErr("e_phone");
        clearErr("e_relation");
    };

    const handleEmergencyChange = (field, value) => {
        setEmergency((prev) => ({ ...prev, [field]: value }));
        clearErr(`e_${field.replace("emergency", "").toLowerCase()}`);
    };

    // Synchronize emergency details when parent data changes
    useEffect(() => {
        if (emergency.sameAsAbove && parents[0]) {
            const p = parents[0];
            setEmergency((prev) => ({
                ...prev,
                emergencyFirstName: p.parentFirstName || "",
                emergencyLastName: p.parentLastName || "",
                emergencyPhoneNumber: p.parentPhoneNumber || "",
                emergencyRelation: p.relationToChild || "",
            }));
        }
    }, [emergency.sameAsAbove, parents]);

    const toDateOnly = (value) => {
        if (!value) return "";
        if (typeof value === "string") {
            if (value.includes("/")) {
                const [d, m, y] = value.split("/").map(Number);
                if (!d || !m || !y) return "";
                return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            }
            const parsed = new Date(value);
            if (isNaN(parsed.getTime())) return "";
            value = parsed;
        }
        const y = value.getFullYear();
        const m = String(value.getMonth() + 1).padStart(2, "0");
        const d = String(value.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    };
    const clearErr = (k) => setErrors((p) => {
        const n = { ...p };
        delete n[k];
        return n;
    });

    const validate = () => {
        const errs = {};
        if (!selectedVenue) errs.venue = "Required";
        if (!selectedDate) errs.selectedDate = "Required";

        const classSelections = {};
        students.forEach((s, i) => {
            if (!s.studentFirstName?.trim()) errs[`s${i}_studentFirstName`] = "Required";
            if (!s.studentLastName?.trim()) errs[`s${i}_studentLastName`] = "Required";
            if (!s.dob) {
                errs[`s${i}_dob`] = "Required";
            } else if (s.dob.length !== 10) {
                errs[`s${i}_dob`] = "Enter a valid date (DD/MM/YYYY)";
            } else {
                const [d, m, y] = s.dob.split("/").map(Number);
                const dobDate = new Date(y, m - 1, d);
                const isValid = dobDate.getDate() === d && dobDate.getMonth() === m - 1 && dobDate.getFullYear() === y;
                if (!isValid) {
                    errs[`s${i}_dob`] = "Enter a valid date (DD/MM/YYYY)";
                } else if (dobDate > new Date()) {
                    errs[`s${i}_dob`] = "Date of birth cannot be in the future";
                }
            } if (!s.gender) errs[`s${i}_gender`] = "Required";
            if (!s.medicalInfo?.trim()) errs[`s${i}_medicalInfo`] = "Required (write 'None')";
            
            if (!s.selectedClassId) {
                errs[`s${i}_selectedClassId`] = "Required";
            } else {
                const clsId = s.selectedClassId;
                classSelections[clsId] = (classSelections[clsId] || 0) + 1;
                if (s.selectedClassData && classSelections[clsId] > s.selectedClassData.capacity) {
                    errs[`s${i}_selectedClassId`] = "Not enough space in this class for all selected students.";
                } else if (s.selectedClassData?.capacity === 0) {
                    errs[`s${i}_selectedClassId`] = "This class has no capacity";
                } else if (s.error) {
                    errs[`s${i}_selectedClassId`] = s.error;
                }
            }
        });

        parents.forEach((p, i) => {
            if (!p.parentFirstName?.trim()) errs[`p${i}_parentFirstName`] = "Required";
            if (!p.parentLastName?.trim()) errs[`p${i}_parentLastName`] = "Required";
            if (!p.parentEmail?.trim()) errs[`p${i}_parentEmail`] = "Required";
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.parentEmail)) errs[`p${i}_parentEmail`] = "Invalid email";
            if (!p.parentPhoneNumber?.trim()) errs[`p${i}_parentPhoneNumber`] = "Required";
            if (!p.relationToChild) errs[`p${i}_relationToChild`] = "Required";
            if (!p.interestReason) errs[`p${i}_interestReason`] = "Required";
            if (!p.howDidYouHear) errs[`p${i}_howDidYouHear`] = "Required";
        });

        if (!emergency.emergencyFirstName?.trim()) errs.e_firstName = "Required";
        if (!emergency.emergencyLastName?.trim()) errs.e_lastName = "Required";
        if (!emergency.emergencyPhoneNumber?.trim()) errs.e_phone = "Required";
        if (!emergency.emergencyRelation) errs.e_relation = "Required";



        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) {
            alert("Please check the form for errors.");
            return;
        }
        const parentData = JSON.parse(localStorage.getItem("parentData"));
        const parentId = parentData?.id;
        const token = localStorage.getItem("parentToken");

        const payload = {
            venueId: selectedVenue?.venueId,
            trialDate: toDateOnly(selectedDate),
            totalStudents: students.length,
            students: students.map((s) => ({
                studentFirstName: s.studentFirstName,
                studentLastName: s.studentLastName,
                dateOfBirth: toDateOnly(s.dob),
                age: Number(s.age),
                gender: s.gender,
                medicalInformation: s.medicalInfo,
                classScheduleId: Number(s.selectedClassId),
            })),
            parents: parents.map((p) => ({
                parentFirstName: p.parentFirstName,
                parentLastName: p.parentLastName,
                parentEmail: p.parentEmail,
                parentPhoneNumber: p.parentPhoneNumber,
                relationToChild: p.relationToChild,
                interestReason: p.interestReason,
                interestReasonOther: p.interestReasonOther || "NA",
                howDidYouHear: p.howDidYouHear,
                isCustomReason: p.isCustomReason,
            })),
            emergency: {
                sameAsAbove: emergency.sameAsAbove,
                emergencyFirstName: emergency.emergencyFirstName,
                emergencyLastName: emergency.emergencyLastName,
                emergencyPhoneNumber: emergency.emergencyPhoneNumber,
                emergencyRelation: emergency.emergencyRelation,
            },
        };

        try {
            const API_URL = import.meta.env.VITE_API_BASE_URL;

            const response = await axios.post(
                `${API_URL}api/parent/booking/free-trial/create/${parentId}`,
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("Booking Success:", response.data);

            showSuccess(
                "Success",
                response?.data?.message || "Free Trial Booked Successfully"
            );

            // Optional reset
            resetForm();

        } catch (err) {
            console.error("Booking Error:", err);

            const errorMessage =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "Something went wrong while booking the trial.";

            // showError("Error", errorMessage);
        }
    };

    const inputClass = (error) => `w-full bg-white border ${error ? 'border-red-500' : 'border-[#E2E1E5]'} rounded-[12px] px-4 py-3 text-[16px] focus:ring-2 focus:ring-[#0496FF] focus:border-transparent outline-none transition-all placeholder-gray-400`;
    const labelClass = "text-[16px] font-medium text-[#282829] mb-1 block";

    return (
        <div className='p-8 booking-page'>
            <div className="bg-[#3D444F] rounded-[20px] p-3 flex items-center justify-between text-white">
                <div className="flex items-center gap-1">
                    <button className="hover:bg-white/10 p-1 rounded-full"><ArrowLeft size={24} /></button>
                    <h1 className="font-bold text-[26px]">Book a Free Trial</h1>
                </div>
                <div className="flex gap-4">
                    <button className="w-8 h-8"><img src="/assets/pound.png" className='w-full' alt="" /></button>
                    <button className="w-8 h-8"><img src="/assets/calendar-circle.png" className='w-full' alt="" /></button>
                    <button className="w-8 h-8"><img src="/assets/files.png" className='w-full' alt="" /></button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 py-6 min-h-screen animate-fadeIn">
                {/* Left Column */}
                <div className="w-full 2xl:w-[25%] lg:w-[30%] flex-shrink-0 space-y-6">
                    {/* Enter Information */}
                    <div className="bg-white p-6 rounded-[20px] shadow-sm">
                        <h3 className="text-[#282829] font-bold text-[24px] mb-4">Enter Information</h3>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className={labelClass}>Venue</label>
                                <div className="relative">
                                    <Select
                                        styles={selectStyles}
                                        placeholder="Choose Venue"
                                        options={
                                            venues?.capacityVenues?.map((v) => ({
                                                value: v.venueId,
                                                label: v.venueName,
                                            })) || []
                                        }
                                        value={
                                            selectedVenue
                                                ? {
                                                    value: selectedVenue.venueId,
                                                    label: selectedVenue.venueName,
                                                }
                                                : null
                                        }
                                        onChange={(option) => {
                                            const found =
                                                venues?.capacityVenues?.find(
                                                    (v) => String(v.venueId) === String(option?.value)
                                                ) || null;

                                            setSelectedVenue(found);

                                            setStudents((prev) =>
                                                prev.map((s) => ({
                                                    ...s,
                                                    selectedClassId: "",
                                                    selectedClassData: null,
                                                }))
                                            );

                                            clearErr("venue");
                                        }}
                                    />
                                </div>
                                {errors.venue && <span className="text-red-500 text-sm">{errors.venue}</span>}
                            </div>

                            <div className="space-y-1">
                                <label className={labelClass}>Number of students</label>
                                <div className="relative">
                                    <select
                                        name="numStudents"
                                        className="w-full bg-white border border-[#E2E1E5] rounded-[12px] px-4 py-3 text-[16px] focus:ring-2 focus:ring-[#0496FF] outline-none appearance-none text-gray-500"
                                        value={numStudents}
                                        onChange={handleNumStudentsChange}
                                    >
                                        <option value="1">1 Student</option>
                                        <option value="2">2 Students</option>
                                        <option value="3">3 Students</option>
                                        <option value="4">4 Students</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Select Trial Date */}
                    <div>
                        <CalendarWidget
                            selectedDate={selectedDate}
                            onSelectDate={setSelectedDate}
                            availableDates={selectedVenue ? availableDatesSet : null}
                        />
                        {errors.selectedDate && <span className="text-red-500 text-sm mt-1 block">{errors.selectedDate}</span>}
                    </div>
                </div>

                {/* Right Column - Main Form */}
                <div className="flex-1 2xl:w-[75%] lg:w-[70%] space-y-6">
                    {/* Student Info */}
                    {students.map((student, index) => (
                        <div key={index} className="bg-white relative rounded-[30px] p-8 shadow-sm">

                            {students.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => handleRemoveStudent(index)}
                                    className="absolute top-4 right-4 flex items-center gap-1 text-xs font-medium text-red-500 transition hover:text-red-600"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Remove
                                </button>
                            )}
                            <h3 className="text-[#282829] font-bold text-[24px] mb-6">
                                Student {students.length > 1 ? index + 1 + " " : ""}Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClass}>First name</label>
                                    <input
                                        placeholder="Enter first name"
                                        className={inputClass(errors[`s${index}_studentFirstName`])}
                                        value={student.studentFirstName}
                                        onChange={(e) => handleStudentChange(index, "studentFirstName", e.target.value)}
                                    />
                                    {errors[`s${index}_studentFirstName`] && (
                                        <span className="text-red-500 text-sm">{errors[`s${index}_studentFirstName`]}</span>
                                    )}
                                </div>
                                <div>
                                    <label className={labelClass}>Last name</label>
                                    <input
                                        placeholder="Enter last name"
                                        className={inputClass(errors[`s${index}_studentLastName`])}
                                        value={student.studentLastName}
                                        onChange={(e) => handleStudentChange(index, "studentLastName", e.target.value)}
                                    />
                                    {errors[`s${index}_studentLastName`] && (
                                        <span className="text-red-500 text-sm">{errors[`s${index}_studentLastName`]}</span>
                                    )}
                                </div>

                                <div>
                                    <label className={labelClass}>Date of birth</label>
                                    <input
                                        type="text"
                                        placeholder="DD/MM/YYYY"
                                        maxLength={10}
                                        className={inputClass(errors[`s${index}_dob`])}
                                        value={student.dob}
                                        onChange={(e) => handleDOBChange(index, e.target.value)}
                                    />
                                    {errors[`s${index}_dob`] && <span className="text-red-500 text-sm">{errors[`s${index}_dob`]}</span>}
                                </div>
                                <div>
                                    <label className={labelClass}>Age</label>
                                    <input
                                        disabled
                                        placeholder="Automatic entry"
                                        className={`${inputClass()} bg-gray-50`}
                                        value={student.age}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Gender</label>
                                    <div className="relative">
                                        <Select
                                            styles={selectStyles}
                                            placeholder="Select gender"
                                            options={genderOptions.map((g) => ({
                                                value: g.value,
                                                label: g.label,
                                            }))}
                                            value={
                                                student.gender
                                                    ? {
                                                        value: student.gender,
                                                        label:
                                                            genderOptions.find(
                                                                (g) => g.value === student.gender
                                                            )?.label || "",
                                                    }
                                                    : null
                                            }
                                            onChange={(option) =>
                                                handleStudentChange(index, "gender", option?.value || "")
                                            }
                                        />
                                    </div>
                                    {errors[`s${index}_gender`] && (
                                        <span className="text-red-500 text-sm">{errors[`s${index}_gender`]}</span>
                                    )}
                                </div>
                                <div>
                                    <label className={labelClass}>Medical information</label>
                                    <input
                                        placeholder="Enter medical info (e.g. Asthma, none)"
                                        className={inputClass(errors[`s${index}_medicalInfo`])}
                                        value={student.medicalInfo}
                                        onChange={(e) => handleStudentChange(index, "medicalInfo", e.target.value)}
                                    />
                                    {errors[`s${index}_medicalInfo`] && (
                                        <span className="text-red-500 text-sm">{errors[`s${index}_medicalInfo`]}</span>
                                    )}
                                </div>

                                <div>
                                    <label className={labelClass}>Class / Level</label>
                                    <div className="relative">
                                        <Select
                                            styles={selectStyles}
                                            isDisabled={!selectedVenue}
                                            placeholder={
                                                selectedVenue
                                                    ? "Select Class"
                                                    : "Select a Venue first"
                                            }
                                            options={availableClasses.map((c) => ({
                                                value: c.id,
                                                label: `${c.className}${c.level ? ` (${c.level})` : ""
                                                    } - ${c.dayOfWeek}`,
                                            }))}
                                            value={
                                                student.selectedClassId
                                                    ? {
                                                        value: student.selectedClassId,
                                                        label:
                                                            availableClasses.find(
                                                                (c) =>
                                                                    String(c.id) ===
                                                                    String(student.selectedClassId)
                                                            )?.className || "",
                                                    }
                                                    : null
                                            }
                                            onChange={(option) =>
                                                handleStudentChange(
                                                    index,
                                                    "selectedClassId",
                                                    option?.value || ""
                                                )
                                            }
                                        />
                                    </div>
                                    {errors[`s${index}_selectedClassId`] && (
                                        <span className="text-red-500 text-sm">{errors[`s${index}_selectedClassId`]}</span>
                                    )}
                                </div>
                                <div>
                                    <label className={labelClass}>Time</label>
                                    <input
                                        disabled
                                        placeholder="Automatic entry"
                                        className={`${inputClass()} bg-gray-50`}
                                        value={student.selectedClassData ? student.selectedClassData.time : ""}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Parent Info Section */}
                    <div className="bg-white rounded-[30px] p-8 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-[#282829] font-bold text-[24px]">Parent information</h3>
                            <button
                                disabled={parents.length >= 3}
                                onClick={handleAddParent}
                                className={`bg-[#237FEA] text-white px-4 py-2 rounded-[12px] text-[14px] font-semibold shadow-sm hover:bg-[#037ecc] ${parents.length >= 3 ? "cursor-not-allowed opacity-50" : ""}`}
                            >
                                Add Parent
                            </button>
                        </div>

                        {parents.map((parent, index) => (
                            <div key={parent.id} className={`mb-8 relative ${index > 0 ? "pt-8  border-gray-200" : ""}`}>
                                {index > 0 && (
                                    <button
                                        onClick={() => handleRemoveParent(parent.id)}
                                        className="absolute right-0 top-6 text-red-500 hover:text-red-700 flex items-center gap-1 text-sm font-medium"
                                    >
                                        <Trash2 size={16} /> Remove
                                    </button>
                                )}

                                <span className="text-sm font-medium text-gray-500 block mb-3">Parent / Guardian {index + 1}</span>


                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={labelClass}>First name</label>
                                        <input
                                            placeholder="Enter first name"
                                            className={inputClass(errors[`p${index}_parentFirstName`])}
                                            value={parent.parentFirstName}
                                            onChange={(e) => handleParentChange(index, "parentFirstName", e.target.value.replace(/[^A-Za-z\s]/g, ""))}
                                        />
                                        {errors[`p${index}_parentFirstName`] && (
                                            <span className="text-red-500 text-sm">{errors[`p${index}_parentFirstName`]}</span>
                                        )}
                                    </div>
                                    <div>
                                        <label className={labelClass}>Last name</label>
                                        <input
                                            placeholder="Enter last name"
                                            className={inputClass(errors[`p${index}_parentLastName`])}
                                            value={parent.parentLastName}
                                            onChange={(e) => handleParentChange(index, "parentLastName", e.target.value.replace(/[^A-Za-z\s]/g, ""))}
                                        />
                                        {errors[`p${index}_parentLastName`] && (
                                            <span className="text-red-500 text-sm">{errors[`p${index}_parentLastName`]}</span>
                                        )}
                                    </div>

                                    <div>
                                        <label className={labelClass}>Email</label>
                                        <input
                                            type="email"
                                            placeholder="Enter email address"
                                            className={inputClass(errors[`p${index}_parentEmail`])}
                                            value={parent.parentEmail}
                                            onChange={(e) => handleParentChange(index, "parentEmail", e.target.value)}
                                        />
                                        {errors[`p${index}_parentEmail`] && (
                                            <span className="text-red-500 text-sm">{errors[`p${index}_parentEmail`]}</span>
                                        )}
                                    </div>
                                    <div>
                                        <label className={labelClass}>Phone number</label>
                                        <PhoneNumberInput
                                            value={parent.parentPhoneNumber}
                                            onChange={(v) => handleParentChange(index, "parentPhoneNumber", v)}
                                            placeholder="Enter phone number"
                                            className={errors[`p${index}_parentPhoneNumber`] ? "border-red-500 bg-red-50" : ""}
                                        />
                                        {errors[`p${index}_parentPhoneNumber`] && (
                                            <span className="text-red-500 text-sm">{errors[`p${index}_parentPhoneNumber`]}</span>
                                        )}
                                    </div>

                                    <div>
                                        <label className={labelClass}>Relation to child</label>
                                        <div className="relative">
                                            <Select
                                                styles={selectStyles}
                                                placeholder="Select relation"
                                                options={relationOptions.map((r) => ({
                                                    value: r.value,
                                                    label: r.label,
                                                }))}
                                                value={
                                                    parent.relationToChild
                                                        ? {
                                                            value: parent.relationToChild,
                                                            label: parent.relationToChild,
                                                        }
                                                        : null
                                                }
                                                onChange={(option) =>
                                                    handleParentChange(
                                                        index,
                                                        "relationToChild",
                                                        option?.value || ""
                                                    )
                                                }
                                            />
                                        </div>
                                        {errors[`p${index}_relationToChild`] && (
                                            <span className="text-red-500 text-sm">{errors[`p${index}_relationToChild`]}</span>
                                        )}
                                    </div>
                                    <div>
                                        <label className={labelClass}>How did you hear about us?</label>
                                        <div className="relative">
                                            <Select
                                                styles={selectStyles}
                                                placeholder="Select how you heard"
                                                options={hearOptions.map((o) => ({
                                                    value: o.value,
                                                    label: o.label,
                                                }))}
                                                value={
                                                    parent.howDidYouHear
                                                        ? {
                                                            value: parent.howDidYouHear,
                                                            label: parent.howDidYouHear,
                                                        }
                                                        : null
                                                }
                                                onChange={(option) =>
                                                    handleParentChange(
                                                        index,
                                                        "howDidYouHear",
                                                        option?.value || ""
                                                    )
                                                }
                                            />
                                        </div>
                                        {errors[`p${index}_howDidYouHear`] && (
                                            <span className="text-red-500 text-sm">{errors[`p${index}_howDidYouHear`]}</span>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className={labelClass}>What's the main reason you're interested in Samba Soccer Schools?</label>
                                        {parent.isCustomReason ? (
                                            <div className="relative">
                                                <input
                                                    placeholder="Please specify custom reason"
                                                    className={inputClass(errors[`p${index}_interestReason`])}
                                                    value={parent.interestReason}
                                                    onChange={(e) => handleParentChange(index, "interestReason", e.target.value)}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        handleParentChange(index, "interestReason", "");
                                                        handleParentChange(index, "isCustomReason", false);
                                                    }}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-600 font-semibold"
                                                >
                                                    ← Back to List
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <Select
                                                    styles={selectStyles}
                                                    placeholder="What's the main reason you're interested in Samba Soccer Schools?"
                                                    options={interestReasonOptions.map((o) => ({
                                                        value: o.value,
                                                        label: o.label,
                                                    }))}
                                                    onChange={(option) => {
                                                        const val = option?.value;

                                                        if (val === "Other") {
                                                            handleParentChange(index, "interestReason", "");
                                                            handleParentChange(index, "isCustomReason", true);
                                                        } else {
                                                            handleParentChange(index, "interestReason", val);
                                                            handleParentChange(index, "isCustomReason", false);
                                                        }
                                                    }}
                                                    value={
                                                        parent.interestReason
                                                            ? {
                                                                value: parent.interestReason,
                                                                label: parent.interestReason,
                                                            }
                                                            : null
                                                    }
                                                />
                                            </div>
                                        )}
                                        {errors[`p${index}_interestReason`] && (
                                            <span className="text-red-500 text-sm">{errors[`p${index}_interestReason`]}</span>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className={labelClass}>Tell us a bit more (optional)</label>
                                        <textarea
                                            placeholder="Anything else you'd like to share?"
                                            className={`${inputClass()} h-24 resize-none`}
                                            value={parent.interestReasonOther}
                                            onChange={(e) => handleParentChange(index, "interestReasonOther", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Emergency Contact */}
                    <div className="bg-white rounded-[30px] p-8 shadow-sm">
                        <div className="mb-6 flex flex-col">
                            <h3 className="text-[#282829] font-bold text-[24px] mb-1">Emergency contact details</h3>
                            <label className="flex items-center gap-2 cursor-pointer mt-1">
                                <input
                                    type="checkbox"
                                    checked={emergency.sameAsAbove}
                                    onChange={handleSameAsAboveChange}
                                    className="rounded border-gray-300 text-[#0496FF] focus:ring-[#0496FF]"
                                />
                                <span className="text-[16px] text-[#717073] font-medium">Fill same as above</span>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>First name</label>
                                <input
                                    placeholder="Enter first name"
                                    className={inputClass(errors.e_firstName)}
                                    value={emergency.emergencyFirstName}
                                    disabled={emergency.sameAsAbove}
                                    onChange={(e) => handleEmergencyChange("emergencyFirstName", e.target.value)}
                                />
                                {errors.e_firstName && <span className="text-red-500 text-sm">{errors.e_firstName}</span>}
                            </div>
                            <div>
                                <label className={labelClass}>Last name</label>
                                <input
                                    placeholder="Enter last name"
                                    className={inputClass(errors.e_lastName)}
                                    value={emergency.emergencyLastName}
                                    disabled={emergency.sameAsAbove}
                                    onChange={(e) => handleEmergencyChange("emergencyLastName", e.target.value)}
                                />
                                {errors.e_lastName && <span className="text-red-500 text-sm">{errors.e_lastName}</span>}
                            </div>

                            <div>
                                <label className={labelClass}>Phone number</label>
                                <PhoneNumberInput
                                    value={emergency.emergencyPhoneNumber}
                                    readOnly={emergency.sameAsAbove}
                                    onChange={(v) => handleEmergencyChange("emergencyPhoneNumber", v)}
                                    placeholder="Enter phone number"
                                    className={errors.e_phone ? "border-red-500 bg-red-50" : ""}
                                />
                                {errors.e_phone && <span className="text-red-500 text-sm">{errors.e_phone}</span>}
                            </div>
                            <div>
                                <label className={labelClass}>Relation to child</label>
                                <div className="relative">
                                    <select
                                        className={`${inputClass(errors.e_relation)} appearance-none`}
                                        value={emergency.emergencyRelation}
                                        disabled={emergency.sameAsAbove}
                                        onChange={(e) => handleEmergencyChange("emergencyRelation", e.target.value)}
                                    >
                                        <option value="">Select relation</option>
                                        {relationOptions.map((o) => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>
                                {errors.e_relation && <span className="text-red-500 text-sm">{errors.e_relation}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-4">
                        <button className="px-8 py-3 rounded-[12px] border text-[#717073] border-[#717073] text-[18px] font-semibold hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="bg-[#0496FF] text-white px-8 py-3 rounded-[12px] text-[18px] font-semibold hover:bg-[#037ecc] transition-colors"
                        >
                            Book FREE Trial
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookFreeTrial;
