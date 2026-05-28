import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight, Check } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useProfile } from "../../context/ProfileContext";

const genderOptions = [
    { value: "", label: "Select Gender" },
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
];

const relationOptions = [
    { value: "", label: "Select Relation" },
    { value: "Father", label: "Father" },
    { value: "Mother", label: "Mother" },
    { value: "Guardian", label: "Guardian" },
];

const hearAboutOptions = [
    { value: "", label: "Select" },
    { value: "Google", label: "Google" },
    { value: "Facebook", label: "Facebook" },
    { value: "Instagram", label: "Instagram" },
    { value: "Friend", label: "Friend" },
    { value: "Flyer", label: "Flyer" },
];

const convertToYYYYMMDD = (dateStr) => {
    if (!dateStr) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const match = dateStr.match(/^(\d{2})[/\-](\d{2})[/\-](\d{4})$/);
    if (match) return `${match[3]}-${match[2]}-${match[1]}`;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${d.getFullYear()}-${month}-${day}`;
};

const isValidDate = (dateStr) => {
    if (!dateStr) return false;
    const match = dateStr.match(/^(\d{2})[/\-](\d{2})[/\-](\d{4})$/);
    if (!match) return false;
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < 1900 || year > new Date().getFullYear()) return false;
    const date = new Date(year, month - 1, day);
    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
};

// FIX 3: Corrected auto-slash logic — only append slash when exactly 2 or 4
// digits are present after a new character is typed (not while deleting)
const handleDobChange = (value, prevValue = "") => {
    const isDeleting = value.length < prevValue.length;
    if (isDeleting) return value;

    const clean = value.replace(/\D/g, "").substring(0, 8);
    let formatted = clean.substring(0, 2);
    if (clean.length >= 3) formatted += "/" + clean.substring(2, 4);
    if (clean.length >= 5) formatted += "/" + clean.substring(4, 8);
    return formatted;
};

const handleCardNumberChange = (value) => {
    const clean = (value || "").replace(/\D/g, "").substring(0, 19);
    const parts = [];
    for (let i = 0; i < clean.length; i += 4) {
        parts.push(clean.substring(i, i + 4));
    }
    return parts.join(" ");
};

const validateCardNumber = (value) => {
    const clean = value.replace(/\s+/g, "");
    return /^\d{13,19}$/.test(clean);
}

// FIX 3 (expiry): Same corrected slash-append logic
const handleExpiryDateChange = (value, prevValue = "") => {
    const isDeleting = value.length < prevValue.length;
    if (isDeleting) return value;

    const clean = value.replace(/\D/g, "").substring(0, 4);
    let formatted = clean.substring(0, 2);
    if (clean.length >= 3) formatted += "/" + clean.substring(2, 4);
    return formatted;
};

const validateExpiryDate = (value) => {
    if (!value) return false;
    const match = value.match(/^(\d{2})\/(\d{2})$/);
    if (!match) return false;
    const month = parseInt(match[1], 10);
    const year = parseInt("20" + match[2], 10);
    if (month < 1 || month > 12) return false;
    const today = new Date();
    if (year < today.getFullYear()) return false;
    if (year === today.getFullYear() && month < today.getMonth() + 1) return false;
    return true;
};

const handleCvvChange = (value) => value.replace(/\D/g, "").substring(0, 4);

const validateCvv = (value) => /^\d{3,4}$/.test(value);

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");

// FIX 8: Helper to ensure phone always has a "+" prefix without hardcoding +44
const ensurePlusPrefix = (phone) => {
    if (!phone) return phone;
    return phone.startsWith("+") ? phone : `+${phone}`;
};

const STEPS = [
    { id: 1, label: "Student" },
    { id: 2, label: "Parent" },
    { id: 3, label: "Emergency" },
    { id: 4, label: "Payment" },
];

const AddStudentModal = ({ isOpen, onClose, selectedBooking, activeServiceType }) => {
    const { updateProfile } = useProfile();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const [studentData, setStudentData] = useState({
        studentFirstName: "",
        studentLastName: "",
        dateOfBirth: "",
        gender: "",
        medicalInformation: "N/A",
    });

    const [parentData, setParentData] = useState({
        parentFirstName: "",
        parentLastName: "",
        parentEmail: "",
        parentPhoneNumber: "",
        relationChild: "",
        howDidHear: "",
    });

    const [emergencyData, setEmergencyData] = useState({
        emergencyFirstName: "",
        emergencyLastName: "",
        emergencyPhoneNumber: "",
        emergencyRelation: "",
    });

    const [paymentData, setPaymentData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        billingAddress: "",
        cardNumber: "",
        expiryDate: "",
        securityCode: "",
    });

    const [sameAsParent, setSameAsParent] = useState(false);

    React.useEffect(() => {
        if (!isOpen) return;

        const firstParent = selectedBooking?.parents?.[0];
        setParentData({
            parentFirstName: firstParent?.parentFirstName || "",
            parentLastName: firstParent?.parentLastName || "",
            parentEmail: firstParent?.parentEmail || "",
            parentPhoneNumber: firstParent?.parentPhoneNumber || "",
            relationChild: firstParent?.relationChild || firstParent?.relationToChild || "",
            howDidHear: firstParent?.howDidHear || firstParent?.howDidYouHear || "",
        });

        const emergency = selectedBooking?.emergency;
        setEmergencyData({
            emergencyFirstName: emergency?.emergencyFirstName || "",
            emergencyLastName: emergency?.emergencyLastName || "",
            emergencyPhoneNumber: emergency?.emergencyPhoneNumber || "",
            emergencyRelation: emergency?.emergencyRelation || "",
        });

        setStudentData({
            studentFirstName: "",
            studentLastName: "",
            dateOfBirth: "",
            gender: "",
            medicalInformation: "N/A",
        });

        setPaymentData({
            firstName: "",
            lastName: "",
            email: "",
            billingAddress: "",
            cardNumber: "",
            expiryDate: "",
            securityCode: "",
        });

        setCurrentStep(1);
        setErrors({});
        setSameAsParent(false);
    }, [isOpen, selectedBooking]);

    if (!isOpen) return null;

    const existingStudents = selectedBooking?.students || [];
    const defaultClassScheduleId =
        existingStudents.length > 0 ? existingStudents[0].classScheduleId : null;

    // FIX 2: Use UTC date parsing to avoid timezone offset shifting the date
    const calculateAge = (dob) => {
        if (!dob) return "";
        const yyyymmdd = convertToYYYYMMDD(dob);
        const [year, month, day] = yyyymmdd.split("-").map(Number);
        if (!year || !month || !day) return "";
        const today = new Date();
        let age = today.getFullYear() - year;
        const m = today.getMonth() + 1 - month;
        if (m < 0 || (m === 0 && today.getDate() < day)) age--;
        return age;
    };

    // FIX 1 & 7: Clean validateStep — single return, email validated for parent too
    const validateStep = (step) => {
        const newErrors = {};

        if (step === 1) {
            if (!studentData.studentFirstName.trim())
                newErrors.studentFirstName = "First name is required";
            if (!studentData.studentLastName.trim())
                newErrors.studentLastName = "Last name is required";
            if (!studentData.dateOfBirth) {
                newErrors.dateOfBirth = "Date of birth is required";
            } else if (!isValidDate(studentData.dateOfBirth)) {
                newErrors.dateOfBirth = "Invalid date of birth (use DD/MM/YYYY)";
            }
            if (!studentData.gender) newErrors.gender = "Gender is required";
        } else if (step === 2) {
            if (!parentData.parentFirstName.trim())
                newErrors.parentFirstName = "First name is required";
            if (!parentData.parentLastName.trim())
                newErrors.parentLastName = "Last name is required";
            if (!parentData.parentEmail.trim()) {
                newErrors.parentEmail = "Email is required";
            } else if (!validateEmail(parentData.parentEmail)) {
                // FIX 7: was missing email format validation for parent
                newErrors.parentEmail = "Enter a valid email";
            }
            if (!parentData.parentPhoneNumber)
                newErrors.parentPhoneNumber = "Phone number is required";
            if (!parentData.relationChild)
                newErrors.relationChild = "Relation is required";
        } else if (step === 3) {
            if (!emergencyData.emergencyFirstName.trim())
                newErrors.emergencyFirstName = "First name is required";
            if (!emergencyData.emergencyLastName.trim())
                newErrors.emergencyLastName = "Last name is required";
            if (!emergencyData.emergencyPhoneNumber)
                newErrors.emergencyPhoneNumber = "Phone number is required";
            if (!emergencyData.emergencyRelation)
                newErrors.emergencyRelation = "Relation is required";
        } else if (step === 4) {
            if (!paymentData.firstName.trim())
                newErrors.firstName = "First name is required";
            if (!paymentData.lastName.trim())
                newErrors.lastName = "Last name is required";
            if (!paymentData.email.trim()) {
                newErrors.email = "Email is required";
            } else if (!validateEmail(paymentData.email)) {
                newErrors.email = "Enter a valid email";
            }
            if (!paymentData.billingAddress.trim())
                newErrors.billingAddress = "Billing address is required";
            if (!paymentData.cardNumber.trim()) {
                newErrors.cardNumber = "Card number is required";
            } else if (!validateCardNumber(paymentData.cardNumber)) {
                newErrors.cardNumber = "Invalid card number";
            }
            if (!paymentData.expiryDate.trim()) {
                newErrors.expiryDate = "Expiry date is required";
            } else if (!validateExpiryDate(paymentData.expiryDate)) {
                newErrors.expiryDate = "Invalid or expired card";
            }
            if (!paymentData.securityCode.trim()) {
                newErrors.securityCode = "CVV is required";
            } else if (!validateCvv(paymentData.securityCode)) {
                newErrors.securityCode = "Invalid CVV";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep))
            setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    };

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
        setErrors({});
    };

    // FIX 5: Re-sync emergency data if parent fields changed after checkbox was set
    const handleParentChange = (field, value) => {
        const updated = { ...parentData, [field]: value };
        setParentData(updated);
        if (errors[field]) setErrors({ ...errors, [field]: "" });

        if (sameAsParent) {
            setEmergencyData({
                emergencyFirstName: updated.parentFirstName,
                emergencyLastName: updated.parentLastName,
                emergencyPhoneNumber: updated.parentPhoneNumber,
                emergencyRelation: updated.relationChild,
            });
        }
    };

    const handleSameAsParentToggle = (e) => {
        const checked = e.target.checked;
        setSameAsParent(checked);
        if (checked) {
            setEmergencyData({
                emergencyFirstName: parentData.parentFirstName,
                emergencyLastName: parentData.parentLastName,
                emergencyPhoneNumber: parentData.parentPhoneNumber,
                emergencyRelation: parentData.relationChild,
            });
            setErrors({});
        } else {
            setEmergencyData({
                emergencyFirstName: "",
                emergencyLastName: "",
                emergencyPhoneNumber: "",
                emergencyRelation: "",
            });
        }
    };

    const handleSubmit = async () => {
        if (!validateStep(4)) return;
        setLoading(true);
        try {
            const existingParents = selectedBooking?.parents || [];

            const newStudent = {
                bookingId: selectedBooking?.id,
                classScheduleId: defaultClassScheduleId,
                studentFirstName: studentData.studentFirstName,
                studentLastName: studentData.studentLastName,
                dateOfBirth: convertToYYYYMMDD(studentData.dateOfBirth),
                age: calculateAge(studentData.dateOfBirth),
                gender: studentData.gender,
                medicalInformation: studentData.medicalInformation,
            };

            const allStudents = [
                ...existingStudents.map((s) => ({
                    id: s.id,
                    bookingId: s.bookingId || selectedBooking?.id,
                    classScheduleId: s.classScheduleId,
                    studentFirstName: s.studentFirstName,
                    studentLastName: s.studentLastName,
                    dateOfBirth: convertToYYYYMMDD(s.dateOfBirth),
                    age: s.age,
                    gender: s.gender,
                    medicalInformation: s.medicalInformation,
                })),
                newStudent,
            ];

         

            const allParents = [
                ...existingParents.map((p) => ({
                    id: p.id,
                    studentId: p.studentId,
                    parentFirstName: p.parentFirstName,
                    parentLastName: p.parentLastName,
                    parentEmail: p.parentEmail,
                    parentPhoneNumber: p.parentPhoneNumber,
                    relationChild: p.relationChild || p.relationToChild,
                    howDidHear: p.howDidHear || p.howDidYouHear,
                })),
            ];

            const payload = {
                bookingId: selectedBooking?.id,
                serviceType: "holiday camp",
                paymentPlanId:
                    selectedBooking?.paymentPlan?.id || selectedBooking?.paymentPlanId,
                holidayCampId:
                    selectedBooking?.holidayCamp?.id || selectedBooking?.holidayCampId,
                students: allStudents,
                parents: allParents,
                emergency: {
                    id: selectedBooking?.emergency?.id,
                    studentId: selectedBooking?.emergency?.studentId,
                    emergencyFirstName: emergencyData.emergencyFirstName,
                    emergencyLastName: emergencyData.emergencyLastName,
                    // FIX 8: Same fix for emergency phone
                    emergencyPhoneNumber: ensurePlusPrefix(emergencyData.emergencyPhoneNumber),
                    emergencyRelation: emergencyData.emergencyRelation,
                },
                payment: paymentData
                    ? {
                          ...paymentData,
                          cardNumber: paymentData.cardNumber.replace(/\s/g, ""),
                      }
                    : null,
            };

            await updateProfile(payload);
            onClose();
        } catch (error) {
            console.error("Submission error:", error);
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (label, value, field, dataObj, setDataObj) => (
        <div className="mb-4">
            <label className="block text-[14px] text-[#282829] font-medium mb-1">
                {label}
            </label>
            <input
                type="text"
                value={value}
                onChange={(e) => {
                    setDataObj({ ...dataObj, [field]: e.target.value });
                    if (errors[field]) setErrors({ ...errors, [field]: "" });
                }}
                className={`w-full p-3 rounded-lg border outline-none ${
                    errors[field]
                        ? "border-red-500"
                        : "border-gray-300 focus:border-[#0496FF]"
                }`}
                placeholder={`Enter ${label.toLowerCase()}`}
            />
            {errors[field] && (
                <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-[20px] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold text-[#282829]">Add New Student</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-black">
                        <X size={24} />
                    </button>
                </div>

                {/* Stepper */}
                <div className="p-6 bg-gray-50 border-b">
                    <ol className="flex items-center w-full justify-between">
                        {STEPS.map((step, index) => {
                            const isActive = currentStep === step.id;
                            const isCompleted = currentStep > step.id;
                            return (
                                <li key={step.id} className="flex items-center w-full relative">
                                    <div className="flex flex-col items-center">
                                        <span
                                            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold z-10 
                                            ${
                                                isCompleted
                                                    ? "bg-green-500 text-white"
                                                    : isActive
                                                    ? "bg-[#0496FF] text-white"
                                                    : "bg-gray-200 text-gray-500"
                                            }`}
                                        >
                                            {isCompleted ? <Check size={16} /> : step.id}
                                        </span>
                                        <span
                                            className={`text-xs mt-2 absolute top-8 font-medium whitespace-nowrap
                                            ${isActive || isCompleted ? "text-black" : "text-gray-500"}`}
                                        >
                                            {step.label}
                                        </span>
                                    </div>
                                    {index !== STEPS.length - 1 && (
                                        <div
                                            className={`flex-1 h-1 mx-2 ${
                                                isCompleted ? "bg-green-500" : "bg-gray-200"
                                            }`}
                                        />
                                    )}
                                </li>
                            );
                        })}
                    </ol>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 mt-4">

                    {/* STEP 1: Student */}
                    {currentStep === 1 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {renderInput("First Name", studentData.studentFirstName, "studentFirstName", studentData, setStudentData)}
                            {renderInput("Last Name", studentData.studentLastName, "studentLastName", studentData, setStudentData)}

                            <div className="mb-4">
                                <label className="block text-[14px] text-[#282829] font-medium mb-1">
                                    Date of Birth
                                </label>
                                <input
                                    type="text"
                                    placeholder="DD/MM/YYYY"
                                    value={studentData.dateOfBirth}
                                    onChange={(e) => {
                                        const formatted = handleDobChange(
                                            e.target.value,
                                            studentData.dateOfBirth
                                        );
                                        setStudentData({ ...studentData, dateOfBirth: formatted });
                                        if (errors.dateOfBirth)
                                            setErrors({ ...errors, dateOfBirth: "" });
                                    }}
                                    className={`w-full p-3 rounded-lg border outline-none ${
                                        errors.dateOfBirth
                                            ? "border-red-500"
                                            : "border-gray-300 focus:border-[#0496FF]"
                                    }`}
                                />
                                {errors.dateOfBirth && (
                                    <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="block text-[14px] text-[#282829] font-medium mb-1">
                                    Gender
                                </label>
                                <select
                                    value={studentData.gender}
                                    onChange={(e) => {
                                        setStudentData({ ...studentData, gender: e.target.value });
                                        if (errors.gender) setErrors({ ...errors, gender: "" });
                                    }}
                                    className={`w-full p-3 rounded-lg border outline-none bg-white ${
                                        errors.gender
                                            ? "border-red-500"
                                            : "border-gray-300 focus:border-[#0496FF]"
                                    }`}
                                >
                                    {genderOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.gender && (
                                    <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
                                )}
                            </div>

                            <div className="col-span-1 sm:col-span-2">
                                {renderInput("Medical Information", studentData.medicalInformation, "medicalInformation", studentData, setStudentData)}
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Parent */}
                    {/* FIX 5: Parent inputs now use handleParentChange to keep sameAsParent in sync */}
                    {currentStep === 2 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="mb-4">
                                <label className="block text-[14px] text-[#282829] font-medium mb-1">First Name</label>
                                <input type="text" value={parentData.parentFirstName}
                                    onChange={(e) => handleParentChange("parentFirstName", e.target.value)}
                                    className={`w-full p-3 rounded-lg border outline-none ${errors.parentFirstName ? "border-red-500" : "border-gray-300 focus:border-[#0496FF]"}`}
                                    placeholder="Enter first name" />
                                {errors.parentFirstName && <p className="text-red-500 text-sm mt-1">{errors.parentFirstName}</p>}
                            </div>

                            <div className="mb-4">
                                <label className="block text-[14px] text-[#282829] font-medium mb-1">Last Name</label>
                                <input type="text" value={parentData.parentLastName}
                                    onChange={(e) => handleParentChange("parentLastName", e.target.value)}
                                    className={`w-full p-3 rounded-lg border outline-none ${errors.parentLastName ? "border-red-500" : "border-gray-300 focus:border-[#0496FF]"}`}
                                    placeholder="Enter last name" />
                                {errors.parentLastName && <p className="text-red-500 text-sm mt-1">{errors.parentLastName}</p>}
                            </div>

                            <div className="mb-4">
                                <label className="block text-[14px] text-[#282829] font-medium mb-1">Email</label>
                                <input type="text" value={parentData.parentEmail}
                                    onChange={(e) => handleParentChange("parentEmail", e.target.value)}
                                    className={`w-full p-3 rounded-lg border outline-none ${errors.parentEmail ? "border-red-500" : "border-gray-300 focus:border-[#0496FF]"}`}
                                    placeholder="Enter email" />
                                {errors.parentEmail && <p className="text-red-500 text-sm mt-1">{errors.parentEmail}</p>}
                            </div>

                            <div className="mb-4">
                                <label className="block text-[14px] text-[#282829] font-medium mb-1">Phone Number</label>
                                <PhoneInput
                                    country="gb"
                                    value={parentData.parentPhoneNumber}
                                    onChange={(val) => handleParentChange("parentPhoneNumber", val)}
                                    containerClass="w-full"
                                    inputStyle={{ width: "100%", height: "48px", borderRadius: "8px", borderColor: errors.parentPhoneNumber ? "#ef4444" : "#d1d5db" }}
                                />
                                {errors.parentPhoneNumber && <p className="text-red-500 text-sm mt-1">{errors.parentPhoneNumber}</p>}
                            </div>

                            <div className="mb-4">
                                <label className="block text-[14px] text-[#282829] font-medium mb-1">Relation to Child</label>
                                <select value={parentData.relationChild}
                                    onChange={(e) => handleParentChange("relationChild", e.target.value)}
                                    className={`w-full p-3 rounded-lg border outline-none bg-white ${errors.relationChild ? "border-red-500" : "border-gray-300 focus:border-[#0496FF]"}`}>
                                    {relationOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                {errors.relationChild && <p className="text-red-500 text-sm mt-1">{errors.relationChild}</p>}
                            </div>

                            <div className="mb-4">
                                <label className="block text-[14px] text-[#282829] font-medium mb-1">How did you hear about us?</label>
                                <select value={parentData.howDidHear}
                                    onChange={(e) => handleParentChange("howDidHear", e.target.value)}
                                    className="w-full p-3 rounded-lg border border-gray-300 outline-none bg-white focus:border-[#0496FF]">
                                    {hearAboutOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Emergency */}
                    {currentStep === 3 && (
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold mb-4 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={sameAsParent}
                                    onChange={handleSameAsParentToggle}
                                />
                                Fill same as parent
                            </label>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {renderInput("First Name", emergencyData.emergencyFirstName, "emergencyFirstName", emergencyData, setEmergencyData)}
                                {renderInput("Last Name", emergencyData.emergencyLastName, "emergencyLastName", emergencyData, setEmergencyData)}

                                <div className="mb-4">
                                    <label className="block text-[14px] text-[#282829] font-medium mb-1">Phone Number</label>
                                    <PhoneInput
                                        country="gb"
                                        value={emergencyData.emergencyPhoneNumber}
                                        onChange={(val) => {
                                            setEmergencyData({ ...emergencyData, emergencyPhoneNumber: val });
                                            if (errors.emergencyPhoneNumber)
                                                setErrors({ ...errors, emergencyPhoneNumber: "" });
                                        }}
                                        containerClass="w-full"
                                        inputStyle={{ width: "100%", height: "48px", borderRadius: "8px", borderColor: errors.emergencyPhoneNumber ? "#ef4444" : "#d1d5db" }}
                                    />
                                    {errors.emergencyPhoneNumber && (
                                        <p className="text-red-500 text-sm mt-1">{errors.emergencyPhoneNumber}</p>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label className="block text-[14px] text-[#282829] font-medium mb-1">Relation to Child</label>
                                    <select
                                        value={emergencyData.emergencyRelation}
                                        onChange={(e) => {
                                            setEmergencyData({ ...emergencyData, emergencyRelation: e.target.value });
                                            if (errors.emergencyRelation)
                                                setErrors({ ...errors, emergencyRelation: "" });
                                        }}
                                        className={`w-full p-3 rounded-lg border outline-none bg-white ${
                                            errors.emergencyRelation
                                                ? "border-red-500"
                                                : "border-gray-300 focus:border-[#0496FF]"
                                        }`}
                                    >
                                        {relationOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                    {errors.emergencyRelation && (
                                        <p className="text-red-500 text-sm mt-1">{errors.emergencyRelation}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: Payment */}
                    {currentStep === 4 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {renderInput("First Name", paymentData.firstName, "firstName", paymentData, setPaymentData)}
                            {renderInput("Last Name", paymentData.lastName, "lastName", paymentData, setPaymentData)}
                            <div className="col-span-1 sm:col-span-2">
                                {renderInput("Email", paymentData.email, "email", paymentData, setPaymentData)}
                            </div>
                            <div className="col-span-1 sm:col-span-2">
                                {renderInput("Billing Address", paymentData.billingAddress, "billingAddress", paymentData, setPaymentData)}
                            </div>
                            <div className="col-span-1 sm:col-span-2">
                                <div className="mb-4">
                                    <label className="block text-[14px] text-[#282829] font-medium mb-1">Card Number</label>
                                    <input
                                        type="text"
                                        value={paymentData.cardNumber}
                                        onChange={(e) => {
                                            const formatted = handleCardNumberChange(e.target.value);
                                            setPaymentData({ ...paymentData, cardNumber: formatted });
                                            if (errors.cardNumber) setErrors({ ...errors, cardNumber: "" });
                                        }}
                                        className={`w-full p-3 rounded-lg border outline-none ${
                                            errors.cardNumber ? "border-red-500" : "border-gray-300 focus:border-[#0496FF]"
                                        }`}
                                        placeholder="Enter card number"
                                        maxLength={23}
                                    />
                                    {errors.cardNumber && (
                                        <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
                                    )}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-[14px] text-[#282829] font-medium mb-1">Expiry Date (MM/YY)</label>
                                <input
                                    type="text"
                                    value={paymentData.expiryDate}
                                    onChange={(e) => {
                                        const formatted = handleExpiryDateChange(e.target.value, paymentData.expiryDate);
                                        setPaymentData({ ...paymentData, expiryDate: formatted });
                                        if (errors.expiryDate) setErrors({ ...errors, expiryDate: "" });
                                    }}
                                    className={`w-full p-3 rounded-lg border outline-none ${
                                        errors.expiryDate ? "border-red-500" : "border-gray-300 focus:border-[#0496FF]"
                                    }`}
                                    placeholder="MM/YY"
                                />
                                {errors.expiryDate && (
                                    <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="block text-[14px] text-[#282829] font-medium mb-1">CVV</label>
                                <input
                                    type="text"
                                    value={paymentData.securityCode}
                                    onChange={(e) => {
                                        const formatted = handleCvvChange(e.target.value);
                                        setPaymentData({ ...paymentData, securityCode: formatted });
                                        if (errors.securityCode) setErrors({ ...errors, securityCode: "" });
                                    }}
                                    className={`w-full p-3 rounded-lg border outline-none ${
                                        errors.securityCode ? "border-red-500" : "border-gray-300 focus:border-[#0496FF]"
                                    }`}
                                    placeholder="CVV"
                                />
                                {errors.securityCode && (
                                    <p className="text-red-500 text-sm mt-1">{errors.securityCode}</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t flex justify-between">
                    {currentStep > 1 ? (
                        <button
                            onClick={handleBack}
                            className="px-6 py-2.5 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                            <ChevronLeft size={18} /> Back
                        </button>
                    ) : (
                        <div />
                    )}

                    {currentStep < STEPS.length ? (
                        <button
                            onClick={handleNext}
                            className="px-6 py-2.5 rounded-lg font-medium bg-[#0496FF] text-white hover:bg-blue-600 flex items-center gap-2"
                        >
                            Next <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-6 py-2.5 rounded-lg font-medium bg-green-500 text-white hover:bg-green-600 flex items-center gap-2"
                        >
                            {loading ? "Submitting..." : "Submit"} <Check size={18} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddStudentModal;