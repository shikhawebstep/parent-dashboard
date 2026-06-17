import React, { useState, useEffect } from "react";
import {
    ArrowLeft,
    Search,
    ChevronDown,
    Plus,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Bell,
    Image as ImageIcon,
    Flag,
} from "lucide-react";
import { useCommon } from "../../context/CommonContext";
import PhoneNumberInput from "../../commom/PhoneNumberInput";

import { useProfile } from "../../context/ProfileContext";

import axios from "axios";
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

/* ---------------------------------------------------------------- */
/* Reusable small elements                                           */
/* ---------------------------------------------------------------- */
function ErrorMessage({ message }) {
    if (!message) return null;
    return (
        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            {message}
        </p>
    );
}

function TextField({ id, label, required, error, wrapperClassName = "", ...props }) {
    return (
        <div className={wrapperClassName}>
            <label htmlFor={id} className="text-base font-semibold block mb-1">
                {label}
                {required && <span className="ml-0.5 text-red-500">*</span>}
            </label>
            <input
                id={id}
                aria-invalid={!!error}
                {...props}
                className={
                    "w-full border rounded-xl px-3 text-[16px] py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 " +
                    (error ? "border-red-400" : "border-gray-300") +
                    " " +
                    (props.disabled ? "bg-gray-50 text-gray-500 cursor-not-allowed" : "bg-white")
                }
            />
            <ErrorMessage message={error} />
        </div>
    );
}

/* ---------------------------------------------------------------- */
/* Main Component                                                   */
/* ---------------------------------------------------------------- */
export default function AddToWaitingList() {
    const { fetchVenues, venues } = useCommon();

    const [selectedVenue, setSelectedVenue] = useState(null);
    const [numberOfStudents, setNumberOfStudents] = useState("1");
    const [students, setStudents] = useState([createStudent()]);
    const [parents, setParents] = useState([createParent()]);
    const [emergency, setEmergency] = useState(initialEmergency);
    const [levelOfInterest, setLevelOfInterest] = useState("Low");
    const [keyInfo, setKeyInfo] = useState("");
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
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

    // Load venues
    useEffect(() => {
        fetchVenues();
        fetchProfileData();
    }, [fetchVenues]);

    const venueData = selectedVenue || null;

    // Flatten classes of selected venue
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

    const clearError = (key) => {
        setErrors((prev) => {
            if (!(key in prev)) return prev;
            const next = { ...prev };
            delete next[key];
            return next;
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

    const handleVenueChange = (e) => {
        const venueId = e.target.value;
        const found = venues?.find((v) => String(v.venueId) === String(venueId)) || null;
        setSelectedVenue(found);
        setStudents((prev) => prev.map((s) => ({ ...s, selectedClassId: "", selectedClassData: null })));
        clearError("venue");
    };

    const handleNumStudentsChange = (e) => {
        const val = e.target.value;
        setNumberOfStudents(val);
        const count = Number(val) || 1;
        setStudents((prev) => {
            if (count > prev.length) {
                return [...prev, ...Array.from({ length: count - prev.length }, createStudent)];
            }
            return prev.slice(0, count);
        });
        clearError("numberOfStudents");
    };

    const handleStudentChange = (index, field, value) => {
        setStudents((prev) =>
            prev.map((s, i) => {
                if (i !== index) return s;
                const updated = { ...s, [field]: value };
                if (field === "selectedClassId") {
                    const foundClass = allClasses.find((c) => String(c.id) === String(value)) || null;
                    updated.selectedClassData = foundClass;
                }
                return updated;
            })
        );
        clearError(`s${index}_${field}`);
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
                        dobDate.getDate() === d &&
                        dobDate.getMonth() === m - 1 &&
                        dobDate.getFullYear() === y;
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
        clearError(`s${index}_dob`);
    };

    const handleParentChange = (index, field, value) => {
        setParents((prev) =>
            prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
        );
        clearError(`p${index}_${field}`);
    };

    const addParent = () => {
        if (parents.length < 3) {
            setParents((prev) => [...prev, createParent()]);
        }
    };

    const removeParent = (id) => {
        if (parents.length > 1) {
            setParents((prev) => prev.filter((p) => p.id !== id));
        }
    };

    const handleRemoveStudent = (index) => {
        setStudents((prev) => {
            const next = prev.filter((_, i) => i !== index);
            return next.length ? next : [createStudent()];
        });
        setNumberOfStudents((prev) => String(Math.max(Number(prev) - 1, 1)));
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
        clearError("e_firstName");
        clearError("e_lastName");
        clearError("e_phone");
        clearError("e_relation");
    };

    const handleEmergencyChange = (field, value) => {
        setEmergency((prev) => ({ ...prev, [field]: value }));
        clearError(`e_${field.replace("emergency", "").toLowerCase()}`);
    };

    // Keep emergency info synced with the first parent if checkbox is active
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
        if (value.includes("/")) {
            const [d, m, y] = value.split("/").map(Number);
            if (!d || !m || !y) return "";
            return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        }
        return value;
    };


    const formatDOBForDisplay = (isoDate) => {
        if (!isoDate) return "";
        const [y, m, d] = isoDate.split("-");
        if (!y || !m || !d) return "";
        return `${d}/${m}/${y}`;
    };

    const validate = () => {
        const errs = {};
        if (!selectedVenue) errs.venue = "Please select a venue.";

        if (!String(numberOfStudents).trim()) {
            errs.numberOfStudents = "Please enter the number of students.";
        } else if (isNaN(numberOfStudents) || Number(numberOfStudents) < 1) {
            errs.numberOfStudents = "Enter a whole number greater than 0.";
        }

        students.forEach((s, i) => {
            if (!s.studentFirstName?.trim()) errs[`s${i}_studentFirstName`] = "First name is required.";
            if (!s.studentLastName?.trim()) errs[`s${i}_studentLastName`] = "Last name is required.";
            if (!s.dob) {
                errs[`s${i}_dob`] = "Date of birth is required.";
            } else if (s.dob.length !== 10) {
                errs[`s${i}_dob`] = "Enter a valid date (DD/MM/YYYY).";
            } else {
                const [d, m, y] = s.dob.split("/").map(Number);
                const dobDate = new Date(y, m - 1, d);
                const isValid =
                    dobDate.getDate() === d &&
                    dobDate.getMonth() === m - 1 &&
                    dobDate.getFullYear() === y;
                if (!isValid) {
                    errs[`s${i}_dob`] = "Enter a valid date (DD/MM/YYYY).";
                } else if (dobDate > new Date()) {
                    errs[`s${i}_dob`] = "Date of birth cannot be in the future.";
                }
            }
            if (!s.gender) errs[`s${i}_gender`] = "Gender is required.";
            if (!s.medicalInfo?.trim()) errs[`s${i}_medicalInfo`] = "Medical information is required.";
            if (!s.selectedClassId) errs[`s${i}_selectedClassId`] = "Please select a class.";
        });

        parents.forEach((p, i) => {
            if (!p.parentFirstName?.trim()) errs[`p${i}_parentFirstName`] = "First name is required.";
            if (!p.parentLastName?.trim()) errs[`p${i}_parentLastName`] = "Last name is required.";
            if (!p.parentEmail?.trim()) {
                errs[`p${i}_parentEmail`] = "Email is required.";
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.parentEmail)) {
                errs[`p${i}_parentEmail`] = "Enter a valid email address.";
            }
            if (!p.parentPhoneNumber?.trim()) {
                errs[`p${i}_parentPhoneNumber`] = "Phone number is required.";
            }
            if (!p.relationToChild) errs[`p${i}_relationToChild`] = "Relation is required.";
            if (!p.interestReason) errs[`p${i}_interestReason`] = "Reason is required.";
            if (!p.howDidYouHear) errs[`p${i}_howDidYouHear`] = "Please select how you heard.";
        });

        if (!emergency.emergencyFirstName?.trim()) errs.e_firstName = "First name is required.";
        if (!emergency.emergencyLastName?.trim()) errs.e_lastName = "Last name is required.";
        if (!emergency.emergencyPhoneNumber?.trim()) errs.e_phone = "Phone number is required.";
        if (!emergency.emergencyRelation) errs.e_relation = "Relation is required.";

        setErrors(errs);
        return errs;
    };

    const handleCancel = () => {
        setSelectedVenue(null);
        setNumberOfStudents("1");
        setStudents([createStudent()]);
        setParents([createParent()]);
        setEmergency(initialEmergency);
        setLevelOfInterest("Low");
        setKeyInfo("");
        setErrors({});
        setSuccessMessage("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage("");

        const parentData = JSON.parse(localStorage.getItem("parentData"));
        const parentId = parentData?.id;

        const validationErrors = validate();

        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        setSubmitting(true);

        try {
            const token = localStorage.getItem("parentToken");
            const API_URL = import.meta.env.VITE_API_BASE_URL;

            const payload = {
                interest: levelOfInterest,
                venueId: selectedVenue?.venueId,
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

            const response = await axios.post(
                `${API_URL}api/parent/booking/waiting-list/create/${parentId}`,
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("Waiting List Success:", response.data);

            setSuccessMessage(
                response?.data?.message || "Successfully added to waiting list."
            );

            // Optional
            // handleCancel();

        } catch (err) {
            console.error("Waiting List Error:", err);

            const errorMessage =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "Something went wrong while submitting.";

            setErrors((prev) => ({
                ...prev,
                form: errorMessage,
            }));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 booking-page py-6 sm:px-6 lg:px-10">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <ArrowLeft className="h-5 w-5" />
                    <span className="text-lg font-semibold text-gray-900">Add to Waiting List</span>
                </div>
                <div className="flex items-center gap-2">
                    <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white">
                        <Flag className="h-4 w-4" />
                    </button>
                    <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white">
                        <ImageIcon className="h-4 w-4" />
                    </button>
                    <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white">
                        <Bell className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {successMessage && (
                <div className="mb-6 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800 animate-fadeIn">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{successMessage}</span>
                </div>
            )}

            {errors.form && (
                <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 animate-fadeIn">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{errors.form}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
                <div className="mb-6 grid md:grid-cols-3 justify-between items-start gap-6">
                    {/* Left Column: Venue and Number of Students */}
                    <div className="col-span-1 border space-y-4 bg-white p-6 rounded-3xl shadow-sm lg:col-span-1">
                        <h2 className="mb-4 text-[20px] font-semibold text-gray-900">Enter Information</h2>

                        <div>
                            <label htmlFor="venue" className="text-base font-semibold block mb-1 text-gray-900">
                                Venue<span className="ml-0.5 text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-8 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <select
                                    id="venue"
                                    value={selectedVenue ? String(selectedVenue.venueId) : ""}
                                    onChange={handleVenueChange}
                                    className={
                                        "w-full border rounded-xl px-3 ps-[40px] text-[16px] py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white " +
                                        (errors.venue ? "border-red-400" : "border-gray-300")
                                    }
                                >
                                    <option value="">Select venue</option>
                                    {venues?.map((v) => (
                                        <option key={String(v.venueId)} value={String(v.venueId)}>
                                            {v.venueName}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            </div>
                            <ErrorMessage message={errors.venue} />
                        </div>

                        <TextField
                            id="numberOfStudents"
                            label="Number of students"
                            required
                            type="number"
                            min="1"
                            max="4"
                            step="1"
                            placeholder="Choose number of students"
                            value={numberOfStudents}
                            onChange={handleNumStudentsChange}
                            error={errors.numberOfStudents}
                        />
                    </div>

                    {/* Right Column: Student, Parent & Emergency Details */}
                    <div className="col-span-2 space-y-6">
                        {/* Students list */}
                        {students.map((student, index) => (
                            <div key={index} className="space-y-4 relative bg-white p-6 rounded-3xl shadow-sm border border-gray-100">

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
                                <h2 className="text-[20px] font-semibold text-gray-900">
                                    Student {students.length > 1 ? index + 1 + " " : ""}information
                                </h2>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <TextField
                                        id={`s${index}_studentFirstName`}
                                        label="First name"
                                        required
                                        placeholder="Enter first name"
                                        value={student.studentFirstName}
                                        onChange={(e) => handleStudentChange(index, "studentFirstName", e.target.value)}
                                        error={errors[`s${index}_studentFirstName`]}
                                    />
                                    <TextField
                                        id={`s${index}_studentLastName`}
                                        label="Last name"
                                        required
                                        placeholder="Enter last name"
                                        value={student.studentLastName}
                                        onChange={(e) => handleStudentChange(index, "studentLastName", e.target.value)}
                                        error={errors[`s${index}_studentLastName`]}
                                    />
                                    <TextField
                                        id={`s${index}_dob`}
                                        label="Date of birth"
                                        required
                                        type="text"
                                        placeholder="DD/MM/YYYY"
                                        maxLength={10}
                                        value={student.dob}
                                        onChange={(e) => handleDOBChange(index, e.target.value)}
                                        error={errors[`s${index}_dob`]}
                                    />
                                    <TextField
                                        id={`s${index}_age`}
                                        label="Age"
                                        type="text"
                                        value={student.age}
                                        placeholder="Automatic entry"
                                        disabled
                                        readOnly
                                    />
                                    <div>
                                        <label className="text-base font-semibold block mb-1 text-gray-900">
                                            Gender<span className="ml-0.5 text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                id={`s${index}_gender`}
                                                className={
                                                    "w-full border rounded-xl px-3 text-[16px] py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white " +
                                                    (errors[`s${index}_gender`] ? "border-red-400" : "border-gray-300")
                                                }
                                                value={student.gender}
                                                onChange={(e) => handleStudentChange(index, "gender", e.target.value)}
                                            >
                                                <option value="">Select gender</option>
                                                {genderOptions.map((o) => (
                                                    <option key={o.value} value={o.value}>{o.label}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                        </div>
                                        <ErrorMessage message={errors[`s${index}_gender`]} />
                                    </div>
                                    <TextField
                                        id={`s${index}_medicalInfo`}
                                        label="Medical information"
                                        required
                                        placeholder="Enter medical info (or 'None')"
                                        value={student.medicalInfo}
                                        onChange={(e) => handleStudentChange(index, "medicalInfo", e.target.value)}
                                        error={errors[`s${index}_medicalInfo`]}
                                    />
                                    <div>
                                        <label className="text-base font-semibold block mb-1 text-gray-900">
                                            Class<span className="ml-0.5 text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                id={`s${index}_selectedClassId`}
                                                disabled={!selectedVenue}
                                                className={
                                                    "w-full border rounded-xl px-3 text-[16px] py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white " +
                                                    (errors[`s${index}_selectedClassId`] ? "border-red-400" : "border-gray-300")
                                                }
                                                value={student.selectedClassId ? String(student.selectedClassId) : ""}
                                                onChange={(e) => handleStudentChange(index, "selectedClassId", e.target.value)}
                                            >
                                                <option value="">{selectedVenue ? "Select Class" : "Select a venue first"}</option>
                                                {allClasses.map((c) => (
                                                    <option key={String(c.id)} value={String(c.id)}>
                                                        {c.className} {c.level ? `(${c.level})` : ""} - {c.dayOfWeek}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                        </div>
                                        <ErrorMessage message={errors[`s${index}_selectedClassId`]} />
                                    </div>
                                    <div>
                                        <label className="text-base font-semibold block mb-1 text-gray-900">Time</label>
                                        <input
                                            disabled
                                            readOnly
                                            className="w-full border border-gray-300 bg-gray-50 rounded-xl px-3 text-[16px] py-3 focus:outline-none cursor-not-allowed"
                                            value={student.selectedClassData ? student.selectedClassData.time : ""}
                                            placeholder="Automatic entry"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Parents Section */}
                        <div className="space-y-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-[20px] font-semibold text-gray-900">Parent information</h2>
                                <button
                                    type="button"
                                    onClick={addParent}
                                    disabled={parents.length >= 3}
                                    className="text-white flex gap-1 items-center text-[14px] px-4 py-2 bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Add Parent
                                </button>
                            </div>

                            {parents.map((parent, idx) => (
                                <div key={parent.id} className={idx > 0 ? "mt-6 border-t border-gray-100 pt-6 relative" : "relative"}>
                                    {idx > 0 && (
                                        <div className="mb-3 flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-500">Parent / Guardian {idx + 1}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeParent(parent.id)}
                                                className="flex items-center gap-1 text-xs font-medium text-red-500 transition hover:text-red-600"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                Remove
                                            </button>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <TextField
                                            id={`p${idx}_parentFirstName`}
                                            label="First name"
                                            required
                                            placeholder="Enter first name"
                                            value={parent.parentFirstName}
                                            onChange={(e) => handleParentChange(idx, "parentFirstName", e.target.value.replace(/[^A-Za-z\s]/g, ""))}
                                            error={errors[`p${idx}_parentFirstName`]}
                                        />
                                        <TextField
                                            id={`p${idx}_parentLastName`}
                                            label="Last name"
                                            required
                                            placeholder="Enter last name"
                                            value={parent.parentLastName}
                                            onChange={(e) => handleParentChange(idx, "parentLastName", e.target.value.replace(/[^A-Za-z\s]/g, ""))}
                                            error={errors[`p${idx}_parentLastName`]}
                                        />
                                        <TextField
                                            id={`p${idx}_parentEmail`}
                                            label="Email"
                                            required
                                            type="email"
                                            placeholder="Enter email address"
                                            value={parent.parentEmail}
                                            onChange={(e) => handleParentChange(idx, "parentEmail", e.target.value)}
                                            error={errors[`p${idx}_parentEmail`]}
                                        />
                                        <div>
                                            <label className="text-base font-semibold block mb-1 text-gray-900">
                                                Phone number<span className="ml-0.5 text-red-500">*</span>
                                            </label>
                                            <PhoneNumberInput
                                                value={parent.parentPhoneNumber}
                                                onChange={(v) => handleParentChange(idx, "parentPhoneNumber", v)}
                                                placeholder="Enter phone number"
                                                className={errors[`p${idx}_parentPhoneNumber`] ? "border-red-500 bg-red-50" : ""}
                                            />
                                            <ErrorMessage message={errors[`p${idx}_parentPhoneNumber`]} />
                                        </div>

                                        <div>
                                            <label className="text-base font-semibold block mb-1 text-gray-900">
                                                Relation to child<span className="ml-0.5 text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <select
                                                    id={`p${idx}_relationToChild`}
                                                    className={
                                                        "w-full border rounded-xl px-3 text-[16px] py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white " +
                                                        (errors[`p${idx}_relationToChild`] ? "border-red-400" : "border-gray-300")
                                                    }
                                                    value={parent.relationToChild}
                                                    onChange={(e) => handleParentChange(idx, "relationToChild", e.target.value)}
                                                >
                                                    <option value="">Select relation</option>
                                                    {relationOptions.map((o) => (
                                                        <option key={o.value} value={o.value}>{o.label}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                            </div>
                                            <ErrorMessage message={errors[`p${idx}_relationToChild`]} />
                                        </div>

                                        <div>
                                            <label className="text-base font-semibold block mb-1 text-gray-900">
                                                How did you hear about us?<span className="ml-0.5 text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <select
                                                    id={`p${idx}_howDidYouHear`}
                                                    className={
                                                        "w-full border rounded-xl px-3 text-[16px] py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white " +
                                                        (errors[`p${idx}_howDidYouHear`] ? "border-red-400" : "border-gray-300")
                                                    }
                                                    value={parent.howDidYouHear}
                                                    onChange={(e) => handleParentChange(idx, "howDidYouHear", e.target.value)}
                                                >
                                                    <option value="">Select</option>
                                                    {hearOptions.map((o) => (
                                                        <option key={o.value} value={o.value}>{o.label}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                            </div>
                                            <ErrorMessage message={errors[`p${idx}_howDidYouHear`]} />
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="text-base font-semibold block mb-1 text-gray-900">
                                                Main reason for joining<span className="ml-0.5 text-red-500">*</span>
                                            </label>
                                            {parent.isCustomReason ? (
                                                <div className="relative">
                                                    <input
                                                        placeholder="Please specify custom reason"
                                                        className={
                                                            "w-full border rounded-xl px-3 text-[16px] py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white " +
                                                            (errors[`p${idx}_interestReason`] ? "border-red-400" : "border-gray-300")
                                                        }
                                                        value={parent.interestReason}
                                                        onChange={(e) => handleParentChange(idx, "interestReason", e.target.value)}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            handleParentChange(idx, "interestReason", "");
                                                            handleParentChange(idx, "isCustomReason", false);
                                                        }}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-600 font-semibold"
                                                    >
                                                        ← Back
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="relative">
                                                    <select
                                                        className={
                                                            "w-full border rounded-xl px-3 text-[16px] py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white " +
                                                            (errors[`p${idx}_interestReason`] ? "border-red-400" : "border-gray-300")
                                                        }
                                                        value={parent.interestReason}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val === "Other") {
                                                                handleParentChange(idx, "interestReason", "");
                                                                handleParentChange(idx, "isCustomReason", true);
                                                            } else {
                                                                handleParentChange(idx, "interestReason", val);
                                                                handleParentChange(idx, "isCustomReason", false);
                                                            }
                                                        }}
                                                    >
                                                        <option value="">Select a reason</option>
                                                        {interestReasonOptions.map((o) => (
                                                            <option key={o.value} value={o.value}>{o.label}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                                </div>
                                            )}
                                            <ErrorMessage message={errors[`p${idx}_interestReason`]} />
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="text-base font-semibold block mb-1 text-gray-900">
                                                Tell us a bit more (optional)
                                            </label>
                                            <textarea
                                                placeholder="Anything else you'd like to share?"
                                                className="w-full border border-gray-300 rounded-xl px-3 text-[16px] py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-24"
                                                value={parent.interestReasonOther}
                                                onChange={(e) => handleParentChange(idx, "interestReasonOther", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Emergency Contact */}
                        <div className="space-y-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h2 className="text-[20px] font-semibold text-gray-900 mb-1">Emergency contact details</h2>
                            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={emergency.sameAsAbove}
                                    onChange={handleSameAsAboveChange}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                Fill same as above
                            </label>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <TextField
                                    id="e_firstName"
                                    label="First name"
                                    required
                                    placeholder="Enter first name"
                                    value={emergency.emergencyFirstName}
                                    onChange={(e) => handleEmergencyChange("emergencyFirstName", e.target.value)}
                                    error={errors.e_firstName}
                                    disabled={emergency.sameAsAbove}
                                />
                                <TextField
                                    id="e_lastName"
                                    label="Last name"
                                    required
                                    placeholder="Enter last name"
                                    value={emergency.emergencyLastName}
                                    onChange={(e) => handleEmergencyChange("emergencyLastName", e.target.value)}
                                    error={errors.e_lastName}
                                    disabled={emergency.sameAsAbove}
                                />
                                <div>
                                    <label className="text-base font-semibold block mb-1 text-gray-900">
                                        Phone number<span className="ml-0.5 text-red-500">*</span>
                                    </label>
                                    <PhoneNumberInput
                                        value={emergency.emergencyPhoneNumber}
                                        readOnly={emergency.sameAsAbove}
                                        onChange={(v) => handleEmergencyChange("emergencyPhoneNumber", v)}
                                        placeholder="Enter phone number"
                                        className={errors.e_phone ? "border-red-500 bg-red-50" : ""}
                                    />
                                    <ErrorMessage message={errors.e_phone} />
                                </div>
                                <div>
                                    <label className="text-base font-semibold block mb-1 text-gray-900">
                                        Relation to child<span className="ml-0.5 text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="e_relation"
                                            className={
                                                "w-full border rounded-xl px-3 text-[16px] py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white " +
                                                (errors.e_relation ? "border-red-400" : "border-gray-300")
                                            }
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
                                    <ErrorMessage message={errors.e_relation} />
                                </div>
                            </div>
                        </div>

                        {/* Level of interest */}
                        <div className="flex flex-wrap items-center justify-between gap-4 space-y-3 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h2 className="text-[20px] font-semibold text-gray-900">Level of interest</h2>
                            <div className="flex items-center gap-6">
                                {["Low", "Medium", "High"].map((level) => (
                                    <label key={level} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="levelOfInterest"
                                            value={level}
                                            checked={levelOfInterest === level}
                                            onChange={() => setLevelOfInterest(level)}
                                            className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        {level}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex items-center justify-center gap-1 border border-[#717073] text-[#717073] px-12 text-[18px] py-3 rounded-lg font-semibold bg-none hover:bg-gray-100 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-[#237FEA] border-[#237FEA] hover:bg-[#1f6dc9] cursor-pointer text-white text-[18px] font-semibold border px-6 py-3 rounded-lg transition disabled:opacity-50"
                            >
                                {submitting ? "Adding..." : "Add to Waiting List"}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}