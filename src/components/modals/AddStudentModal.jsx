import React, { useState } from "react";
import { X, Check } from "lucide-react";
import { useProfile } from "../../context/ProfileContext";
import { showSuccess, showError } from "../../../utils/swalHelper";

// ── helpers ───────────────────────────────────────────────────────────────────

const convertToYYYYMMDD = (dateStr) => {
    if (!dateStr) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const match = dateStr.match(/^(\d{2})[/\-](\d{2})[/\-](\d{4})$/);
    if (match) return `${match[3]}-${match[2]}-${match[1]}`;
    return "";
};

const isValidDate = (dateStr) => {
    if (!dateStr) return false;
    const match = dateStr.match(/^(\d{2})[/\-](\d{2})[/\-](\d{4})$/);
    if (!match) return false;
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    if (month < 1 || month > 12 || day < 1 || day > 31) return false;
    if (year < 1900 || year > new Date().getFullYear()) return false;
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

const handleDobChange = (value, prevValue = "") => {
    const isDeleting = value.length < prevValue.length;
    if (isDeleting) return value;
    const clean = value.replace(/\D/g, "").substring(0, 8);
    let formatted = clean.substring(0, 2);
    if (clean.length >= 3) formatted += "/" + clean.substring(2, 4);
    if (clean.length >= 5) formatted += "/" + clean.substring(4, 8);
    return formatted;
};

const calculateAge = (dob) => {
    if (!dob) return "";
    const iso = convertToYYYYMMDD(dob);
    const [year, month, day] = iso.split("-").map(Number);
    if (!year || !month || !day) return "";
    const today = new Date();
    let age = today.getFullYear() - year;
    const m = today.getMonth() + 1 - month;
    if (m < 0 || (m === 0 && today.getDate() < day)) age--;
    return age < 0 ? "" : age;
};

// ── style helpers (same as StudentProfile) ───────────────────────────────────

const inputClass = (hasError) =>
    `w-full lg:p-3 p-2 border ${hasError ? "border-red-500" : "border-[#E2E1E5]"} rounded-[12px] focus:outline-none focus:border-[#042C89] text-[#383A46] outline-none transition-colors bg-white`;

const labelClass = "text-[16px] font-semibold text-[#282829] mb-1.5 block";

const Field = ({ label, error, children }) => (
    <div>
        <p className={labelClass}>{label}</p>
        {children}
        {error && <p className="text-red-500 text-[12px] mt-1">{error}</p>}
    </div>
);

// ── genders ───────────────────────────────────────────────────────────────────

const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
];

// ── component ─────────────────────────────────────────────────────────────────

const AddStudentModal = ({ isOpen, onClose, selectedBooking }) => {
    const { fetchProfileData } = useProfile();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const [studentData, setStudentData] = useState({
        studentFirstName: "",
        studentLastName: "",
        dateOfBirth: "",
        gender: "",
        medicalInformation: "",
    });

    React.useEffect(() => {
        if (!isOpen) return;
        setStudentData({ studentFirstName: "", studentLastName: "", dateOfBirth: "", gender: "", medicalInformation: "" });
        setErrors({});
    }, [isOpen]);

    if (!isOpen) return null;

    const existingStudents = selectedBooking?.students || [];
    const defaultClassScheduleId = existingStudents[0]?.classScheduleId ?? null;

    const setField = (field, value) => {
        setStudentData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    };

    const validate = () => {
        const e = {};
        if (!studentData.studentFirstName.trim()) e.studentFirstName = "First name is required";
        if (!studentData.studentLastName.trim()) e.studentLastName = "Last name is required";
        if (!studentData.dateOfBirth) {
            e.dateOfBirth = "Date of birth is required";
        } else if (!isValidDate(studentData.dateOfBirth)) {
            e.dateOfBirth = "Invalid date (use DD/MM/YYYY)";
        }
        if (!studentData.gender) e.gender = "Gender is required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);

    const token = localStorage.getItem("parentToken");

    const payload = {
        studentFirstName: studentData.studentFirstName,
        studentLastName: studentData.studentLastName,
        dateOfBirth: convertToYYYYMMDD(studentData.dateOfBirth),
        age: calculateAge(studentData.dateOfBirth),
        gender: studentData.gender,
        medicalInformation: studentData.medicalInformation || "N/A",
    };

    try {
        const API_URL = import.meta.env.VITE_API_BASE_URL;
        const res = await fetch(
            `${API_URL}api/parent/booking-update/add-student`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Failed to add student");

        showSuccess("Success", data?.message || "Student added successfully");
        await fetchProfileData();
        onClose();
    } catch (err) {
        console.error(err);
        showError("Error", err.message || "Something went wrong");
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-[20px] w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold text-[#282829]">Add New Student</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-black">
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <div className="p-6 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                        <Field label="First name" error={errors.studentFirstName}>
                            <input
                                className={inputClass(!!errors.studentFirstName)}
                                placeholder="Enter first name"
                                value={studentData.studentFirstName}
                                onChange={(e) => setField("studentFirstName", e.target.value)}
                            />
                        </Field>

                        <Field label="Last name" error={errors.studentLastName}>
                            <input
                                className={inputClass(!!errors.studentLastName)}
                                placeholder="Enter last name"
                                value={studentData.studentLastName}
                                onChange={(e) => setField("studentLastName", e.target.value)}
                            />
                        </Field>

                        <Field label="Date of birth" error={errors.dateOfBirth}>
                            <input
                                className={inputClass(!!errors.dateOfBirth)}
                                placeholder="DD/MM/YYYY"
                                maxLength={10}
                                value={studentData.dateOfBirth}
                                onChange={(e) => setField("dateOfBirth", handleDobChange(e.target.value, studentData.dateOfBirth))}
                            />
                        </Field>

                        <Field label="Age">
                            <input
                                className={`${inputClass(false)} bg-gray-50 cursor-not-allowed`}
                                placeholder="Auto calculated"
                                value={calculateAge(studentData.dateOfBirth)}
                                disabled
                            />
                        </Field>

                        <Field label="Gender" error={errors.gender}>
                            <div className="relative">
                                <select
                                    className={`${inputClass(!!errors.gender)} appearance-none`}
                                    value={studentData.gender}
                                    onChange={(e) => setField("gender", e.target.value)}
                                >
                                    <option value="">Select gender</option>
                                    {genderOptions.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                                {/* chevron */}
                                <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </Field>

                        <Field label="Medical information">
                            <input
                                className={inputClass(false)}
                                placeholder="e.g. Asthma, None"
                                value={studentData.medicalInformation}
                                onChange={(e) => setField("medicalInformation", e.target.value)}
                            />
                        </Field>

                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t flex justify-end gap-3">
                    <button onClick={onClose}
                        className="px-6 py-2.5 rounded-[12px] border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={loading}
                        className="px-6 py-2.5 rounded-[12px] bg-[#0496FF] hover:bg-[#037ecc] disabled:opacity-60 text-white font-semibold flex items-center gap-2 transition">
                        {loading
                            ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Adding...</>
                            : <><Check size={16} /> Add Student</>
                        }
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AddStudentModal;