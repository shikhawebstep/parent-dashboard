import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Check, MapPin, X } from "lucide-react";
import Select from "react-select";
import PhoneNumberInput from "../../commom/PhoneNumberInput";
import { useCommon } from "../../context/CommonContext";
import { useProfile } from "../../context/ProfileContext";
import { showSuccess, showError } from "../../../utils/swalHelper";

// ── react-select shared styles (ported from BookMembership) ───────────────
const rsStyles = (hasError) => ({
    control: (base, state) => ({
        ...base,
        minHeight: 46,
        borderRadius: 10,
        borderColor: hasError ? "#e53e3e" : state.isFocused ? "#3b7df6" : "#e7ebf1",
        boxShadow: state.isFocused ? `0 0 0 2px ${hasError ? "rgba(229,62,62,0.3)" : "rgba(59,125,246,0.3)"}` : "none",
        backgroundColor: hasError ? "#fff5f5" : "#fff",
        "&:hover": { borderColor: hasError ? "#e53e3e" : "#3b7df6" },
        fontSize: 14,
        fontFamily: "inherit",
    }),
    valueContainer: (base) => ({ ...base, padding: "2px 14px" }),
    placeholder: (base) => ({ ...base, color: "#6b7685" }),
    menu: (base) => ({ ...base, borderRadius: 10, overflow: "hidden", zIndex: 50 }),
    option: (base, state) => ({
        ...base,
        fontSize: 14,
        backgroundColor: state.isSelected ? "#3b7df6" : state.isFocused ? "#eaf1fe" : "#fff",
        color: state.isSelected ? "#fff" : "#1f2733",
        cursor: "pointer",
    }),
    singleValue: (base) => ({ ...base, color: "#1f2733" }),
    indicatorSeparator: () => ({ display: "none" }),
});

const inputClass = (hasErr) =>
    `w-full font-inherit text-[14px] border rounded-[10px] px-3.5 py-3 focus:outline-none focus:ring-2 transition-colors ${hasErr ? "border-[#e53e3e] focus:ring-[#e53e3e]/30 bg-[#fff5f5]" : "border-[#e7ebf1] focus:ring-[#3b7df6]"
    }`;

const labelClass = "block text-[13px] font-semibold mb-1.5 text-[#1f2733]";

const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
];

const relationOptions = [
    { value: "Mother", label: "Mother" },
    { value: "Father", label: "Father" },
    { value: "Guardian", label: "Guardian" },
];

const hearOptions = [
    { value: "Google", label: "Google" },
    { value: "Facebook", label: "Facebook" },
    { value: "Instagram", label: "Instagram" },
    { value: "Friend", label: "Friend" },
    { value: "Flyer", label: "Flyer" },
];

// ── Inits ───────────────────────────────────────────────────────────────
const createStudent = () => ({
    _tmpId: Date.now() + Math.random(),
    studentFirstName: "",
    studentLastName: "",
    dob: "",
    age: "",
    gender: "",
    medicalInfo: "",
    selectedClassId: "",
    selectedClassData: null,
    time: "",
});

const createParent = () => ({
    id: Date.now() + Math.random(),
    parentFirstName: "",
    parentLastName: "",
    parentEmail: "",
    parentPhoneNumber: "",
    relationToChild: "",
    howDidYouHear: "",
    interestReason: "",
    interestReasonOther: "",
});

const INIT_EMERGENCY = {
    sameAsAbove: false,
    emergencyFirstName: "",
    emergencyLastName: "",
    emergencyPhoneNumber: "",
    emergencyRelation: "",
};

// ── DOB helpers ─────────────────────────────────────────────────────────
const formatDOBInput = (raw = "") => {
    let digits = raw.replace(/\D/g, "").slice(0, 8);
    if (digits.length > 2 && digits.length <= 4) digits = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    else if (digits.length > 4) digits = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    return digits;
};

const calcAge = (dob) => {
    if (!dob || dob.length !== 10) return "";
    const [d, m, y] = dob.split("/").map(Number);
    const dobDate = new Date(y, m - 1, d);
    const isValid = dobDate.getDate() === d && dobDate.getMonth() === m - 1 && dobDate.getFullYear() === y;
    if (!isValid) return "";
    const today = new Date();
    let age = today.getFullYear() - y;
    const md = today.getMonth() - (m - 1);
    if (md < 0 || (md === 0 && today.getDate() < d)) age--;
    return age >= 0 && age <= 100 ? age : "";
};

const toDateOnly = (dob) => {
    if (!dob || dob.length !== 10) return "";
    const [d, m, y] = dob.split("/").map(Number);
    if (!d || !m || !y) return "";
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
};

// ── Component ───────────────────────────────────────────────────────────
const HolidayWaitingList = () => {
    const navigate = useNavigate();
    const { fetchHolidayVenues, holidayVenues } = useCommon();
    const { profile, fetchProfileData } = useProfile();
    const [selectedCamps, setSelectedCamps] = useState([]);
    // Wizard state — mirrors BookMembership exactly
    const [flowStep, setFlowStep] = useState("B");
    const [demoMode, setDemoMode] = useState("single");
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);
    const [isChangingVenue, setIsChangingVenue] = useState(false);

    // Form data
    const [selectedVenue, setSelectedVenue] = useState(null);
    const [students, setStudents] = useState([createStudent()]);
    const [parents, setParents] = useState([createParent()]);
    const [emergency, setEmergency] = useState(INIT_EMERGENCY);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Add-child modal
    const [isAddChildOpen, setIsAddChildOpen] = useState(false);
    const [newChildForm, setNewChildForm] = useState({ studentFirstName: "", studentLastName: "", dob: "", gender: "", medicalInfo: "" });
    const [newChildErrors, setNewChildErrors] = useState({});

    useEffect(() => {
        fetchHolidayVenues?.();
        fetchProfileData?.();
    }, [fetchHolidayVenues]);

    // Prefill from profile
    useEffect(() => {
        if (!profile) return;
        const rawParents = profile?.adminMeta?.parents || [];
        const rawStudents = profile?.adminMeta?.students || [];

        const normalizedParents = rawParents.map((p) => ({
            id: p?.id ?? Date.now() + Math.random(),
            parentFirstName: p?.parentFirstName || "",
            parentLastName: p?.parentLastName || "",
            parentEmail: p?.parentEmail || "",
            parentPhoneNumber: p?.parentPhoneNumber || p?.phoneNumber || "",
            relationToChild: p?.relationToChild || "",
            howDidYouHear: p?.howDidYouHear || "",
            interestReason: p?.interestReason || "",
            interestReasonOther: p?.interestReasonOther || "",
        }));

        const normalizedStudents = rawStudents.map((s) => ({
            _tmpId: s?.id ?? Date.now() + Math.random(),
            studentFirstName: s?.studentFirstName || "",
            studentLastName: s?.studentLastName || "",
            dob: s?.dateOfBirth || "",
            age: s?.age ?? "",
            gender: typeof s?.gender === "string" ? s.gender.toLowerCase() : "",
            medicalInfo: s?.medicalInfo || s?.medicalInformation || "",
            selectedClassId: "",
            selectedClassData: null,
            time: "",
        }));

        const finalStudents = normalizedStudents.length ? normalizedStudents : [createStudent()];
        const finalParents = normalizedParents.length ? normalizedParents : [createParent()];

        setStudents(finalStudents);
        setParents(finalParents);
        setSelectedStudentIds(finalStudents.length === 1 ? [finalStudents[0]._tmpId] : finalStudents.map((s) => s._tmpId));

        if (finalStudents.length > 1) {
            setDemoMode("multi");
            setFlowStep("A");
        }

        const ec = profile?.adminMeta?.emergency;
        if (ec) {
            setEmergency({
                sameAsAbove: false,
                emergencyFirstName: ec?.emergencyFirstName || "",
                emergencyLastName: ec?.emergencyLastName || "",
                emergencyPhoneNumber: ec?.emergencyPhoneNumber || "",
                emergencyRelation: ec?.emergencyRelation || "",
            });
        }
    }, [profile]);

    const venueOptions = (holidayVenues || [])
        .filter((v) => v && v.venueId !== undefined && v.venueId !== null)
        .filter((v) => (v.classes || []).some((c) => Number(c.capacity) === 0))
        .map((v) => ({ value: v.venueId, label: v.venueName || "Unnamed venue", all: v }));

    // ── Classes derived from the real venue shape (flat array, no day grouping) ──
    const allClasses = (selectedVenue?.all?.classes || [])
        .filter((c) => c && c.classId !== undefined && c.classId !== null)
        .filter((c) => Number(c.capacity) === 0);

    const classOptions = allClasses
        .filter((c) => Number(c.capacity) === 0)
        .map((c) => ({
            value: c.classId,
            label: `${c.className || "Class"} ${c?.ability || c?.abilityLevel || ""}`.trim(),
            all: c,
            isDisabled: false,
        }));

    const campOptions = (selectedVenue?.all?.holidayCamps || [])
        .filter((c) => c && c.id !== undefined && c.id !== null)
        .map((c) => ({ value: c.id, label: c.name || "Unnamed camp" }));
    const isMulti = demoMode === "multi";
    const activeStudents = isMulti ? students.filter((s) => selectedStudentIds.includes(s._tmpId)) : students.slice(0, 1);
    const activeNames = activeStudents.map((s) => s?.studentFirstName || "Child").join(" & ") || "your child";

    const fullFlowStates = ["A", "B", "D"];
    const singleFlowStates = ["B", "D"];
    const flowStates = isMulti ? fullFlowStates : singleFlowStates;
    const stepsLabels = isMulti ? ["Children", "Trial details", "Done"] : ["Trial details", "Done"];
    const currentStepIndex = flowStates.indexOf(flowStep);

    const clearErr = (k) => setErrors((p) => { const n = { ...p }; delete n[k]; return n; });

    const toggleStudent = (id) => {
        if (id === undefined || id === null) return;
        setSelectedStudentIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const getStudentIdx = (student) => students.findIndex((s) => s._tmpId === student?._tmpId);

    const handleStudentField = (sIdx, field, value) => {
        setStudents((prev) =>
            prev.map((s, i) => {
                if (i !== sIdx) return s;
                const updated = { ...s, [field]: value };
                if (field === "dob") updated.age = calcAge(value);
                if (field === "selectedClassId") {
                    const found = allClasses.find((c) => String(c.classId) === String(value)) || null;
                    updated.selectedClassData = found;
                    updated.time = found?.time || "";
                }
                return updated;
            })
        );
        clearErr(`s${sIdx}_${field}`);
    };

    const handleParentField = (idx, field, value) => {
        setParents((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)));
        clearErr(`p${idx}_${field}`);
    };

    const handleAddParent = () => parents.length < 3 && setParents((prev) => [...prev, createParent()]);
    const handleRemoveParent = (id) => parents.length > 1 && setParents((prev) => prev.filter((p) => p.id !== id));

    const handleSameAsAbove = (e) => {
        const checked = e?.target?.checked || false;
        const p = parents?.[0] || {};
        setEmergency((prev) => ({
            ...prev,
            sameAsAbove: checked,
            emergencyFirstName: checked ? p.parentFirstName || "" : "",
            emergencyLastName: checked ? p.parentLastName || "" : "",
            emergencyPhoneNumber: checked ? p.parentPhoneNumber || "" : "",
            emergencyRelation: checked ? p.relationToChild || "" : "",
        }));
    };

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

    // ── Add-child modal handlers ───────────────────────────────────────
    const handleAddChildOpen = () => {
        setNewChildForm({ studentFirstName: "", studentLastName: "", dob: "", gender: "", medicalInfo: "" });
        setNewChildErrors({});
        setIsAddChildOpen(true);
    };

    const validateNewChild = () => {
        const errs = {};
        if (!newChildForm.studentFirstName.trim()) errs.studentFirstName = "Required";
        if (!newChildForm.studentLastName.trim()) errs.studentLastName = "Required";
        if (!newChildForm.dob) errs.dob = "Required";
        else if (newChildForm.dob.length !== 10 || calcAge(newChildForm.dob) === "") errs.dob = "Enter a valid date";
        if (!newChildForm.gender) errs.gender = "Required";
        setNewChildErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSaveNewChild = () => {
        if (!validateNewChild()) return;
        const newStudent = {
            ...createStudent(),
            studentFirstName: newChildForm.studentFirstName.trim(),
            studentLastName: newChildForm.studentLastName.trim(),
            dob: newChildForm.dob,
            age: calcAge(newChildForm.dob),
            gender: newChildForm.gender,
            medicalInfo: newChildForm.medicalInfo.trim(),
        };
        setStudents((prev) => [...prev, newStudent]);
        setSelectedStudentIds((prev) => [...prev, newStudent._tmpId]);
        if (!isMulti) { setDemoMode("multi"); setFlowStep("A"); }
        setIsAddChildOpen(false);
    };

    const handleRemoveStudentFromA = (id) => {
        setStudents((prev) => {
            const next = prev.filter((s) => s._tmpId !== id);
            return next.length ? next : [createStudent()];
        });
        setSelectedStudentIds((prev) => prev.filter((x) => x !== id));
    };

    // ── Validation ──────────────────────────────────────────────────────
    const validate = () => {
        const errs = {};
        if (!selectedVenue) errs.venue = "Required";

        activeStudents.forEach((student) => {
            const i = getStudentIdx(student);
            if (!student.studentFirstName.trim()) errs[`s${i}_studentFirstName`] = "Required";
            if (!student.studentLastName.trim()) errs[`s${i}_studentLastName`] = "Required";
            if (!student.dob) errs[`s${i}_dob`] = "Required";
            else if (student.dob.length !== 10 || calcAge(student.dob) === "") errs[`s${i}_dob`] = "Enter a valid date";
            if (!student.gender) errs[`s${i}_gender`] = "Required";
            if (!student.medicalInfo.trim()) errs[`s${i}_medicalInfo`] = "Required (write 'None')";
            if (!student.selectedClassId) errs[`s${i}_selectedClassId`] = "Required";
        });

        parents.forEach((p, i) => {
            if (!p.parentFirstName.trim()) errs[`p${i}_parentFirstName`] = "Required";
            if (!p.parentLastName.trim()) errs[`p${i}_parentLastName`] = "Required";
            if (!p.parentEmail.trim()) errs[`p${i}_parentEmail`] = "Required";
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.parentEmail)) errs[`p${i}_parentEmail`] = "Invalid email";
            if (!p.parentPhoneNumber.trim()) errs[`p${i}_parentPhoneNumber`] = "Required";
            if (!p.relationToChild) errs[`p${i}_relationToChild`] = "Required";
            if (!p.howDidYouHear) errs[`p${i}_howDidYouHear`] = "Required";
        });

        if (!emergency.emergencyFirstName.trim()) errs.e_firstName = "Required";
        if (!emergency.emergencyLastName.trim()) errs.e_lastName = "Required";
        if (!emergency.emergencyPhoneNumber.trim()) errs.e_phone = "Required";
        if (!emergency.emergencyRelation) errs.e_relation = "Required";

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) { showError?.("Error", "Please check the form for errors."); return; }
        setIsSubmitting(true);
        try {
            let parentData = {};
            try { parentData = JSON.parse(localStorage.getItem("parentData") || "{}") || {}; } catch { parentData = {}; }
            const parentId = parentData?.id;
            const token = localStorage.getItem("parentToken");

            const payload = {
                venueId: selectedVenue?.value,
                totalStudents: activeStudents.length,
                students: activeStudents.map((s) => ({
                    studentFirstName: s.studentFirstName,
                    studentLastName: s.studentLastName,
                    dateOfBirth: toDateOnly(s.dob),
                    age: Number(s.age) || 0,
                    gender: s.gender,
                    medicalInformation: s.medicalInfo,
                    classScheduleId: Number(s.selectedClassId) || null,
                })),
                parents: parents.map((p) => ({
                    parentFirstName: p.parentFirstName,
                    parentLastName: p.parentLastName,
                    parentEmail: p.parentEmail,
                    parentPhoneNumber: p.parentPhoneNumber,
                    relationToChild: p.relationToChild,
                    howDidYouHear: p.howDidYouHear,
                    interestReason: p.interestReason || "NA",
                    interestReasonOther: p.interestReasonOther || "NA",
                })),
                emergency,
            };

            const API_URL = import.meta.env.VITE_API_BASE_URL || "";
            const res = await fetch(`${API_URL}api/parent/booking/waiting-list/create/${parentId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token || ""}` },
                body: JSON.stringify(payload),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.message || "Something went wrong.");
            setFlowStep("D");
        } catch (err) {
            showError?.("Error", err?.message || "Something went wrong.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen booking-page bg-[#f4f6f9] text-[#1f2733] font-['Poppins',sans-serif] pb-28 sm:pb-16 pt-5">

            {/* Band */}
            <div className="bg-[#1e3a6e] text-white mx-6 rounded-[14px] px-5 py-4 flex items-center gap-3 font-bold text-[18px]">
                <span
                    className="cursor-pointer opacity-90 flex items-center"
                    onClick={() => {
                        if (currentStepIndex > 0) setFlowStep(flowStates[currentStepIndex - 1]);
                        else navigate(-1);
                    }}
                >
                    <ChevronLeft size={20} />
                </span>
                Add to Waiting List
            </div>

            <div className="max-w-[1040px] mx-auto md:px-6 pt-5 px-2">
                {/* Steps */}
                <div className="hidden md:flex items-center justify-center gap-2 mb-5 flex-wrap">
                    {flowStates.map((fs, i) => {
                        const isActive = fs === flowStep;
                        const isDone = i < currentStepIndex;
                        return (
                            <React.Fragment key={fs}>
                                <div className={`flex items-center gap-2 text-[13px] font-semibold ${isActive ? "text-[#1f2733]" : "text-[#6b7685]"}`}>
                                    <span
                                        className={`w-6 h-6 rounded-full border-[1.5px] flex items-center justify-center text-[12px] ${isActive ? "bg-[#21b573] border-[#21b573] text-white" : isDone ? "bg-[#cdeede] border-[#cdeede] text-[#21b573]" : "bg-white border-[#e7ebf1]"
                                            }`}
                                    >
                                        {isDone ? <Check size={13} /> : i + 1}
                                    </span>
                                    {stepsLabels[i]}
                                </div>
                                {i < flowStates.length - 1 && <span className="w-8 h-[2px] bg-[#e7ebf1] rounded-[2px]" />}
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Screens */}
                <div className="bg-white rounded-[16px] shadow-[0_8px_30px_rgba(20,40,80,0.08)] p-4 md:p-8">

                    {/* SCREEN A — Who's this trial for? */}
                    {flowStep === "A" && (
                        <div>
                            <div className="text-center text-[24px] font-bold mb-1.5 tracking-tight">Who's this trial for?</div>
                            <div className="text-center text-[#6b7685] text-[14px] mb-6">Select one or more children to add to the waiting list</div>

                            <div className="flex flex-col sm:flex-row justify-center gap-2.5 mb-5 w-full max-w-md mx-auto sm:max-w-none">
                                <button className="w-full sm:w-auto font-semibold text-[13px] rounded-[30px] px-4 py-2.5 bg-[#eaf1fe] text-[#3b7df6] border border-[#eaf1fe]">Select an existing child</button>
                                <button onClick={handleAddChildOpen} className="w-full sm:w-auto font-semibold text-[13px] rounded-[30px] px-4 py-2.5 bg-white text-[#6b7685] border border-[#e7ebf1]">Add a new child</button>
                            </div>

                            <div className="flex justify-center gap-4 flex-wrap mb-2">
                                {students.map((s, i) => {
                                    const isSel = selectedStudentIds.includes(s._tmpId);
                                    return (
                                        <div
                                            key={s._tmpId ?? i}
                                            onClick={() => toggleStudent(s._tmpId)}
                                            className={`w-[230px] border-[1.5px] rounded-[14px] p-4 cursor-pointer transition-all relative ${isSel ? "border-[#3b7df6] ring-4 ring-[#3b7df6]/10" : "border-[#e7ebf1] hover:border-[#bcd0f5]"
                                                }`}
                                        >
                                            <div
                                                className={`absolute top-3.5 right-3.5 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center text-white text-[12px] ${isSel ? "bg-[#3b7df6] border-[#3b7df6]" : "border-[#e7ebf1]"
                                                    }`}
                                            >
                                                {isSel && <Check size={13} />}
                                            </div>
                                            {students.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); handleRemoveStudentFromA(s._tmpId); }}
                                                    className="absolute top-3.5 left-3.5 text-[#c2c8d2] hover:text-[#e53e3e]"
                                                >
                                                    <X size={16} />
                                                </button>
                                            )}
                                            <div className="text-[#3b7df6] font-bold text-[16px] mb-3 text-center">{s.studentFirstName || `Child ${i + 1}`}</div>
                                            <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                                                <div><div className="text-[11px] text-[#6b7685]">Date of birth</div><div className="text-[14px] font-semibold">{s.dob || "-"}</div></div>
                                                <div><div className="text-[11px] text-[#6b7685]">Age</div><div className="text-[14px] font-semibold">{s.age || "-"}</div></div>
                                                <div><div className="text-[11px] text-[#6b7685]">Gender</div><div className="text-[14px] font-semibold">{s.gender || "-"}</div></div>
                                                <div><div className="text-[11px] text-[#6b7685]">Medical</div><div className="text-[14px] font-semibold truncate">{s.medicalInfo || "-"}</div></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e7ebf1] p-4 z-40 flex gap-3 w-full sm:relative sm:bottom-auto sm:left-auto sm:right-auto sm:bg-transparent sm:border-t-0 sm:p-0 sm:z-auto justify-center sm:mt-7 sm:w-auto">
                                <button onClick={() => navigate(-1)} className="sm:w-auto font-semibold text-[15px] rounded-[12px] md:px-8 py-3.5 border border-[#e7ebf1] text-[#1f2733] bg-white px-4">Cancel</button>
                                <button disabled={selectedStudentIds.length === 0} onClick={() => setFlowStep("B")} className="sm:w-auto font-semibold text-[15px] rounded-[12px] md:px-8 py-3.5 border border-[#3b7df6] text-white bg-[#3b7df6] disabled:opacity-50 hover:bg-[#2f6ae0] px-4">Next</button>
                            </div>
                        </div>
                    )}

                    {/* SCREEN B — Trial details */}
                    {flowStep === "B" && (
                        <div>
                            <div className="text-center text-[24px] font-bold mb-1.5 tracking-tight">Add {activeNames} to the waiting list</div>
                            <div className="text-center text-[#6b7685] text-[14px] mb-6">Confirm the details below and we'll get you on the list</div>

                            {/* Venue selector */}
                            <div className="mb-6">
                                <div style={{ background: "linear-gradient(120deg, #1e3a6e, #2f5aa0)" }} className="text-white px-5 py-4 rounded-t-[14px] flex items-center justify-between gap-3 flex-wrap">
                                    <div className="flex items-center gap-2.5 font-semibold text-[15px]">
                                        <MapPin size={16} /> {selectedVenue?.label || "Select a venue..."}
                                    </div>
                                    <button onClick={() => setIsChangingVenue(!isChangingVenue)} className="bg-white/15 border border-white/35 text-white rounded-[20px] px-3.5 py-1.5 text-[12px] font-semibold">
                                        {isChangingVenue ? "Cancel" : "Change venue"}
                                    </button>
                                </div>
                                {isChangingVenue && (
                                    <div className="border border-t-0 border-[#e7ebf1] px-5 py-3.5 bg-[#f4f6f9]">
                                        <Select
                                            styles={rsStyles(false)}
                                            options={venueOptions}
                                            value={venueOptions.find((o) => o.value === selectedVenue?.value) || null}
                                            placeholder={venueOptions.length ? "Select a venue..." : "No holidayVenues available"}
                                            isDisabled={venueOptions.length === 0}
                                            onChange={(opt) => {
                                                if (!opt) return;
                                                setSelectedVenue({ value: opt.value, label: opt.label, all: opt.all });
                                                setStudents((prev) => prev.map((s) => ({ ...s, selectedClassId: "", selectedClassData: null, time: "" })));
                                                setIsChangingVenue(false);
                                                clearErr("venue");
                                            }}
                                        />
                                    </div>
                                )}
                                {errors.venue && <p className="text-[12px] text-[#e53e3e] px-1 mt-2">{errors.venue}</p>}
                            </div>

                            {/* Select Camp(s) */}
                            <div className="mb-6">
                                <label className={labelClass}>Select Camp(s)</label>
                                <Select
                                    styles={rsStyles(!!errors.camps)}
                                    options={campOptions}
                                    value={campOptions.filter((o) => selectedCamps.includes(o.value))}
                                    isMulti
                                    isDisabled={!selectedVenue || campOptions.length === 0}
                                    placeholder={!selectedVenue ? "Select a venue first" : campOptions.length ? "Select camp(s)..." : "No camps available"}
                                    onChange={(opts) => {
                                        setSelectedCamps((opts || []).map((o) => o.value));
                                        clearErr("camps");
                                    }}
                                />
                                {errors.camps && <p className="text-[12px] text-[#e53e3e] mt-1">{errors.camps}</p>}
                            </div>

                            {/* Student detail cards */}
                            {activeStudents.map((student, idx) => {
                                const sIdx = getStudentIdx(student);
                                return (
                                    <div key={student._tmpId ?? idx} className="border border-[#e7ebf1] rounded-[14px] p-5 mb-4">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-[38px] h-[38px] rounded-full bg-[#eaf1fe] flex items-center justify-center font-bold text-[#3b7df6] shrink-0">
                                                {(student.studentFirstName || "?")[0].toUpperCase()}
                                            </div>
                                            <div className="font-bold text-[15px]">
                                                {activeStudents.length > 1 ? `Child ${idx + 1} Information` : "Student Information"}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className={labelClass}>First name</label>
                                                <input
                                                    className={inputClass(errors[`s${sIdx}_studentFirstName`])}
                                                    value={student.studentFirstName}
                                                    onChange={(e) => handleStudentField(sIdx, "studentFirstName", e.target.value.replace(/[^A-Za-z\s]/g, ""))}
                                                    placeholder="Enter first name"
                                                />
                                                {errors[`s${sIdx}_studentFirstName`] && <p className="text-[12px] text-[#e53e3e] mt-1">{errors[`s${sIdx}_studentFirstName`]}</p>}
                                            </div>
                                            <div>
                                                <label className={labelClass}>Last name</label>
                                                <input
                                                    className={inputClass(errors[`s${sIdx}_studentLastName`])}
                                                    value={student.studentLastName}
                                                    onChange={(e) => handleStudentField(sIdx, "studentLastName", e.target.value.replace(/[^A-Za-z\s]/g, ""))}
                                                    placeholder="Enter last name"
                                                />
                                                {errors[`s${sIdx}_studentLastName`] && <p className="text-[12px] text-[#e53e3e] mt-1">{errors[`s${sIdx}_studentLastName`]}</p>}
                                            </div>
                                            <div>
                                                <label className={labelClass}>Date of birth</label>
                                                <input
                                                    className={inputClass(errors[`s${sIdx}_dob`])}
                                                    value={student.dob}
                                                    onChange={(e) => handleStudentField(sIdx, "dob", formatDOBInput(e.target.value))}
                                                    placeholder="DD/MM/YYYY"
                                                    maxLength={10}
                                                />
                                                {errors[`s${sIdx}_dob`] && <p className="text-[12px] text-[#e53e3e] mt-1">{errors[`s${sIdx}_dob`]}</p>}
                                            </div>
                                            <div>
                                                <label className={labelClass}>Age</label>
                                                <input disabled className={`${inputClass(false)} bg-[#f4f6f9] text-[#6b7685]`} value={student.age} placeholder="Auto calculated" />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Gender</label>
                                                <Select
                                                    styles={rsStyles(!!errors[`s${sIdx}_gender`])}
                                                    options={genderOptions}
                                                    value={genderOptions.find((o) => o.value === student.gender) || null}
                                                    placeholder="Select gender"
                                                    onChange={(opt) => handleStudentField(sIdx, "gender", opt?.value || "")}
                                                />
                                                {errors[`s${sIdx}_gender`] && <p className="text-[12px] text-[#e53e3e] mt-1">{errors[`s${sIdx}_gender`]}</p>}
                                            </div>
                                            <div>
                                                <label className={labelClass}>Medical information</label>
                                                <input
                                                    className={inputClass(errors[`s${sIdx}_medicalInfo`])}
                                                    value={student.medicalInfo}
                                                    onChange={(e) => handleStudentField(sIdx, "medicalInfo", e.target.value)}
                                                    placeholder="e.g. Asthma, None"
                                                />
                                                {errors[`s${sIdx}_medicalInfo`] && <p className="text-[12px] text-[#e53e3e] mt-1">{errors[`s${sIdx}_medicalInfo`]}</p>}
                                            </div>
                                            <div>
                                                <label className={labelClass}>Class/Level</label>
                                                <Select
                                                    styles={rsStyles(!!errors[`s${sIdx}_selectedClassId`])}
                                                    options={classOptions}
                                                    value={classOptions.find((o) => String(o.value) === String(student.selectedClassId)) || null}
                                                    isDisabled={!selectedVenue}
                                                    placeholder={!selectedVenue ? "Select a venue first" : "Select Class"}
                                                    onChange={(opt) => handleStudentField(sIdx, "selectedClassId", opt?.value || "")}
                                                />
                                                {errors[`s${sIdx}_selectedClassId`] && <p className="text-[12px] text-[#e53e3e] mt-1">{errors[`s${sIdx}_selectedClassId`]}</p>}
                                            </div>
                                            <div>
                                                <label className={labelClass}>Time</label>
                                                <input disabled className={`${inputClass(false)} bg-[#f4f6f9] text-[#6b7685]`} value={student.time} placeholder="Set automatically from selected class" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Parent Information */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="text-[13px] font-bold uppercase tracking-[0.04em] text-[#6b7685]">Parent Information</div>
                                    <button
                                        disabled={parents.length >= 3}
                                        onClick={handleAddParent}
                                        className="bg-[#1e3a6e] text-white px-3.5 py-1.5 rounded-[10px] text-[12px] font-semibold hover:bg-[#16306e] disabled:opacity-50"
                                    >
                                        + Add Parent
                                    </button>
                                </div>

                                {parents.map((p, idx) => (
                                    <div key={p.id} className="border border-[#e7ebf1] rounded-[14px] p-5 mb-4 relative">
                                        {idx > 0 && (
                                            <button onClick={() => handleRemoveParent(p.id)} className="absolute right-4 top-4 text-[#e53e3e] hover:text-red-700">
                                                <X size={16} />
                                            </button>
                                        )}
                                        <div className="text-[12px] font-bold uppercase tracking-[0.04em] text-[#6b7685] mb-4">Parent / Guardian {idx + 1}</div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className={labelClass}>First name</label>
                                                <input
                                                    className={inputClass(errors[`p${idx}_parentFirstName`])}
                                                    value={p.parentFirstName}
                                                    onChange={(e) => handleParentField(idx, "parentFirstName", e.target.value.replace(/[^A-Za-z\s]/g, ""))}
                                                    placeholder="Enter first name"
                                                />
                                                {errors[`p${idx}_parentFirstName`] && <p className="text-[12px] text-[#e53e3e] mt-1">{errors[`p${idx}_parentFirstName`]}</p>}
                                            </div>
                                            <div>
                                                <label className={labelClass}>Last name</label>
                                                <input
                                                    className={inputClass(errors[`p${idx}_parentLastName`])}
                                                    value={p.parentLastName}
                                                    onChange={(e) => handleParentField(idx, "parentLastName", e.target.value.replace(/[^A-Za-z\s]/g, ""))}
                                                    placeholder="Enter last name"
                                                />
                                                {errors[`p${idx}_parentLastName`] && <p className="text-[12px] text-[#e53e3e] mt-1">{errors[`p${idx}_parentLastName`]}</p>}
                                            </div>
                                            <div>
                                                <label className={labelClass}>Email</label>
                                                <input
                                                    type="email"
                                                    className={inputClass(errors[`p${idx}_parentEmail`])}
                                                    value={p.parentEmail}
                                                    onChange={(e) => handleParentField(idx, "parentEmail", e.target.value)}
                                                    placeholder="Enter email address"
                                                />
                                                {errors[`p${idx}_parentEmail`] && <p className="text-[12px] text-[#e53e3e] mt-1">{errors[`p${idx}_parentEmail`]}</p>}
                                            </div>
                                            <div>
                                                <label className={labelClass}>Phone number</label>
                                                <PhoneNumberInput
                                                    value={p.parentPhoneNumber}
                                                    onChange={(v) => handleParentField(idx, "parentPhoneNumber", v)}
                                                    placeholder="Enter phone number"
                                                    className={errors[`p${idx}_parentPhoneNumber`] ? "border-[#e53e3e] bg-[#fff5f5]" : ""}
                                                />
                                                {errors[`p${idx}_parentPhoneNumber`] && <p className="text-[12px] text-[#e53e3e] mt-1">{errors[`p${idx}_parentPhoneNumber`]}</p>}
                                            </div>
                                            <div>
                                                <label className={labelClass}>Relation to child</label>
                                                <Select
                                                    styles={rsStyles(!!errors[`p${idx}_relationToChild`])}
                                                    options={relationOptions}
                                                    value={relationOptions.find((o) => o.value === p.relationToChild) || null}
                                                    placeholder="Select relation"
                                                    onChange={(opt) => handleParentField(idx, "relationToChild", opt?.value || "")}
                                                />
                                                {errors[`p${idx}_relationToChild`] && <p className="text-[12px] text-[#e53e3e] mt-1">{errors[`p${idx}_relationToChild`]}</p>}
                                            </div>
                                            <div>
                                                <label className={labelClass}>How did you hear about us?</label>
                                                <Select
                                                    styles={rsStyles(!!errors[`p${idx}_howDidYouHear`])}
                                                    options={hearOptions}
                                                    value={hearOptions.find((o) => o.value === p.howDidYouHear) || null}
                                                    placeholder="Select how you heard"
                                                    onChange={(opt) => handleParentField(idx, "howDidYouHear", opt?.value || "")}
                                                />
                                                {errors[`p${idx}_howDidYouHear`] && <p className="text-[12px] text-[#e53e3e] mt-1">{errors[`p${idx}_howDidYouHear`]}</p>}
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className={labelClass}>What's the main reason you're interested in Samba Soccer Schools?</label>
                                                <input
                                                    className={inputClass(false)}
                                                    value={p.interestReason}
                                                    onChange={(e) => handleParentField(idx, "interestReason", e.target.value)}
                                                    placeholder="To improve their technical foot..."
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className={labelClass}>Tell us a bit more (optional)</label>
                                                <textarea
                                                    className={`${inputClass(false)} h-20 resize-none`}
                                                    value={p.interestReasonOther}
                                                    onChange={(e) => handleParentField(idx, "interestReasonOther", e.target.value)}
                                                    placeholder="NA"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Emergency contact */}
                            <div className="mb-6">
                                <div className="text-[13px] font-bold uppercase tracking-[0.04em] text-[#6b7685] mb-3">Emergency contact details</div>
                                <div className="border border-[#e7ebf1] rounded-[14px] p-5">
                                    <label className="flex items-center gap-2 cursor-pointer mb-4">
                                        <input type="checkbox" checked={emergency.sameAsAbove} onChange={handleSameAsAbove} className="rounded border-[#e7ebf1] text-[#3b7df6] focus:ring-[#3b7df6]" />
                                        <span className="text-[13px] text-[#6b7685] font-medium">Same as above</span>
                                    </label>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>First name</label>
                                            <input
                                                className={inputClass(errors.e_firstName)}
                                                value={emergency.emergencyFirstName}
                                                disabled={emergency.sameAsAbove}
                                                onChange={(e) => setEmergency((p) => ({ ...p, emergencyFirstName: e.target.value }))}
                                                placeholder="Enter first name"
                                            />
                                            {errors.e_firstName && <p className="text-[12px] text-[#e53e3e] mt-1">{errors.e_firstName}</p>}
                                        </div>
                                        <div>
                                            <label className={labelClass}>Last name</label>
                                            <input
                                                className={inputClass(errors.e_lastName)}
                                                value={emergency.emergencyLastName}
                                                disabled={emergency.sameAsAbove}
                                                onChange={(e) => setEmergency((p) => ({ ...p, emergencyLastName: e.target.value }))}
                                                placeholder="Enter last name"
                                            />
                                            {errors.e_lastName && <p className="text-[12px] text-[#e53e3e] mt-1">{errors.e_lastName}</p>}
                                        </div>
                                        <div>
                                            <label className={labelClass}>Phone number</label>
                                            <PhoneNumberInput
                                                value={emergency.emergencyPhoneNumber}
                                                readOnly={emergency.sameAsAbove}
                                                onChange={(v) => setEmergency((p) => ({ ...p, emergencyPhoneNumber: v }))}
                                                placeholder="Enter phone number"
                                                className={errors.e_phone ? "border-[#e53e3e] bg-[#fff5f5]" : ""}
                                            />
                                            {errors.e_phone && <p className="text-[12px] text-[#e53e3e] mt-1">{errors.e_phone}</p>}
                                        </div>
                                        <div>
                                            <label className={labelClass}>Relation to child</label>
                                            <Select
                                                styles={rsStyles(!!errors.e_relation)}
                                                options={relationOptions}
                                                isDisabled={emergency.sameAsAbove}
                                                value={relationOptions.find((o) => o.value === emergency.emergencyRelation) || null}
                                                placeholder="Select relation"
                                                onChange={(opt) => setEmergency((p) => ({ ...p, emergencyRelation: opt?.value || "" }))}
                                            />
                                            {errors.e_relation && <p className="text-[12px] text-[#e53e3e] mt-1">{errors.e_relation}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e7ebf1] p-4 z-40 flex gap-3 w-full sm:relative sm:bottom-auto sm:left-auto sm:right-auto sm:bg-transparent sm:border-t-0 sm:p-0 sm:z-auto justify-center sm:mt-7 sm:w-auto">
                                <button onClick={() => (isMulti ? setFlowStep("A") : navigate(-1))} className="sm:w-auto font-semibold text-[15px] rounded-[12px] md:px-8 py-3.5 border border-[#e7ebf1] text-[#1f2733] bg-white px-4">
                                    {isMulti ? "Back" : "Cancel"}
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="sm:w-auto font-semibold text-[15px] rounded-[12px] px-8 py-3.5 border border-[#1e3a6e] text-white bg-[#1e3a6e] hover:bg-[#16306e] disabled:opacity-50"
                                >
                                    {isSubmitting ? "Submitting..." : "Add to Waiting List"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* SCREEN D — Success */}
                    {flowStep === "D" && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-[#e7f8f0] rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check size={32} className="text-[#21b573]" />
                            </div>
                            <div className="text-[26px] font-bold mb-2 tracking-tight">You're on the list!</div>
                            <div className="text-[#6b7685] text-[15px] mb-6 max-w-[440px] mx-auto">
                                We've added {activeNames} to the waiting list. We'll be in touch as soon as a spot opens up.
                            </div>
                             <button onClick={() => navigate(-1)} className="w-full sm:w-auto font-semibold text-[15px] rounded-[12px] px-8 py-3.5 bg-[#1e3a6e] text-white hover:bg-[#16306e]">
                                Back to Dashboard
                            </button>
                        </div>
                    )}
                </div>

                {/* Dev flow toggles — mirrors BookMembership */}
                <div className="max-w-[1040px] mx-auto mt-4 px-6 text-[12px] text-[#6b7685] text-center">
                    Prototype — single-child journey starts at "Trial details".
                </div>
                <div className="flex flex-col sm:flex-row justify-center gap-3 mt-3.5 mb-6 w-full max-w-md mx-auto sm:max-w-none">
                    <button
                        onClick={() => { setDemoMode("single"); setFlowStep("B"); }}
                        className={`w-full sm:w-auto font-semibold text-[13px] rounded-[12px] px-8 py-3.5 border transition-all ${demoMode === "single" ? "bg-[#3b7df6] text-white border-[#3b7df6]" : "bg-white text-[#1f2733] border-[#e7ebf1]"}`}
                    >
                        Single-child flow
                    </button>
                    <button
                        onClick={() => { setDemoMode("multi"); setFlowStep("A"); }}
                        className={`w-full sm:w-auto font-semibold text-[13px] rounded-[12px] px-8 py-3.5 border transition-all ${demoMode === "multi" ? "bg-[#3b7df6] text-white border-[#3b7df6]" : "bg-white text-[#1f2733] border-[#e7ebf1]"}`}
                    >
                        Multi-child flow
                    </button>
                </div>
            </div>

            {/* Add Child Modal */}
            {isAddChildOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto" onClick={() => setIsAddChildOpen(false)}>
                    <div className="bg-white rounded-3xl w-full max-w-[640px] shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center px-7 py-5 border-b border-gray-100">
                            <div>
                                <span className="text-[12px] uppercase tracking-wider text-[#3b7df6] font-bold">New child</span>
                                <h2 className="text-[20px] font-bold text-gray-900 leading-tight">Add a new child</h2>
                            </div>
                            <button onClick={() => setIsAddChildOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-7 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                                <div>
                                    <label className={labelClass}>First name</label>
                                    <input
                                        className={inputClass(newChildErrors.studentFirstName)}
                                        value={newChildForm.studentFirstName}
                                        onChange={(e) => { setNewChildForm((f) => ({ ...f, studentFirstName: e.target.value })); }}
                                        placeholder="Enter first name"
                                    />
                                    {newChildErrors.studentFirstName && <p className="text-[12px] text-[#e53e3e] mt-1">{newChildErrors.studentFirstName}</p>}
                                </div>
                                <div>
                                    <label className={labelClass}>Last name</label>
                                    <input
                                        className={inputClass(newChildErrors.studentLastName)}
                                        value={newChildForm.studentLastName}
                                        onChange={(e) => { setNewChildForm((f) => ({ ...f, studentLastName: e.target.value })); }}
                                        placeholder="Enter last name"
                                    />
                                    {newChildErrors.studentLastName && <p className="text-[12px] text-[#e53e3e] mt-1">{newChildErrors.studentLastName}</p>}
                                </div>
                                <div>
                                    <label className={labelClass}>Date of birth</label>
                                    <input
                                        className={inputClass(newChildErrors.dob)}
                                        value={newChildForm.dob}
                                        onChange={(e) => setNewChildForm((f) => ({ ...f, dob: formatDOBInput(e.target.value) }))}
                                        placeholder="DD/MM/YYYY"
                                        maxLength={10}
                                    />
                                    {newChildErrors.dob && <p className="text-[12px] text-[#e53e3e] mt-1">{newChildErrors.dob}</p>}
                                </div>
                                <div>
                                    <label className={labelClass}>Age</label>
                                    <input disabled className={`${inputClass(false)} bg-[#f4f6f9] text-[#6b7685]`} value={calcAge(newChildForm.dob)} placeholder="Auto calculated" />
                                </div>
                                <div>
                                    <label className={labelClass}>Gender</label>
                                    <Select
                                        styles={rsStyles(!!newChildErrors.gender)}
                                        options={genderOptions}
                                        value={genderOptions.find((o) => o.value === newChildForm.gender) || null}
                                        placeholder="Select gender"
                                        onChange={(opt) => setNewChildForm((f) => ({ ...f, gender: opt?.value || "" }))}
                                    />
                                    {newChildErrors.gender && <p className="text-[12px] text-[#e53e3e] mt-1">{newChildErrors.gender}</p>}
                                </div>
                                <div>
                                    <label className={labelClass}>Medical information</label>
                                    <input
                                        className={inputClass(false)}
                                        value={newChildForm.medicalInfo}
                                        onChange={(e) => setNewChildForm((f) => ({ ...f, medicalInfo: e.target.value }))}
                                        placeholder="e.g. Asthma, None"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 px-7 py-5 border-t border-gray-100">
                            <button onClick={() => setIsAddChildOpen(false)} className="w-full sm:w-auto font-semibold text-[14px] rounded-[12px] px-6 py-3 border border-[#e7ebf1] text-[#1f2733] bg-white">Cancel</button>
                            <button onClick={handleSaveNewChild} className="w-full sm:w-auto font-semibold text-[14px] rounded-[12px] px-7 py-3 border border-[#3b7df6] text-white bg-[#3b7df6] hover:bg-[#2f6ae0]">Add child</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HolidayWaitingList;