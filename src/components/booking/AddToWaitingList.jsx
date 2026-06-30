import React, { useState, useEffect } from "react";
import { ChevronLeft, Trash2, Check, MapPin } from "lucide-react";
import { useCommon } from "../../context/CommonContext";
import PhoneNumberInput from "../../commom/PhoneNumberInput";
import { useProfile } from "../../context/ProfileContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { showSuccess, showError } from "../../../utils/swalHelper";

// ── Dropdown options ──────────────────────────────────────────────────────────
const genderOptions = [
    { value: "male",   label: "Male"   },
    { value: "female", label: "Female" },
];

const relationOptions = [
    { value: "Mother",   label: "Mother"   },
    { value: "Father",   label: "Father"   },
    { value: "Guardian", label: "Guardian" },
];

const interestReasonOptions = [
    { value: "To build my child's confidence",                       label: "To build my child's confidence"                       },
    { value: "To improve their technical football skills",           label: "To improve their technical football skills"           },
    { value: "Because my child loves football",                      label: "Because my child loves football"                      },
    { value: "To help my child make friends and build social skills", label: "To help my child make friends and build social skills" },
    { value: "To keep my child active and healthy",                  label: "To keep my child active and healthy"                  },
    { value: "High-quality coaching in a fun, positive environment", label: "High-quality coaching in a fun, positive environment" },
    { value: "Other",                                                label: "Other"                                                },
];

const hearOptions = [
    { value: "Google",    label: "Google"    },
    { value: "Facebook",  label: "Facebook"  },
    { value: "Instagram", label: "Instagram" },
    { value: "Friend",    label: "Friend"    },
    { value: "Flyer",     label: "Flyer"     },
];

// ── Module-level helper ───────────────────────────────────────────────────────
const formatDOBForDisplay = (isoDate) => {
    if (!isoDate) return "";
    const [y, m, d] = isoDate.split("-");
    if (!y || !m || !d) return "";
    return `${d}/${m}/${y}`;
};

// ── Inits ─────────────────────────────────────────────────────────────────────
const createStudent = () => ({
    _tmpId:           Date.now() + Math.random(),
    studentFirstName: "",
    studentLastName:  "",
    dob:              "",
    age:              "",
    gender:           "",
    medicalInfo:      "",
    selectedClassId:  "",
    selectedClassData:null,
});

const createParent = () => ({
    id:                  Date.now() + Math.random(),
    parentFirstName:     "",
    parentLastName:      "",
    parentEmail:         "",
    parentPhoneNumber:   "",
    interestReason:      "",
    interestReasonOther: "",
    relationToChild:     "",
    howDidYouHear:       "",
    isCustomReason:      false,
});

const INIT_EMERGENCY = {
    sameAsAbove:          false,
    emergencyFirstName:   "",
    emergencyLastName:    "",
    emergencyPhoneNumber: "",
    emergencyRelation:    "",
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function AddToWaitingList() {
    const { fetchVenues, venues } = useCommon();
    const { profile, fetchProfileData } = useProfile();
    const navigate = useNavigate();

    // ── Form state ────────────────────────────────────────────────────────────
    const [selectedVenue,    setSelectedVenue]    = useState(null);
    const [numberOfStudents, setNumberOfStudents] = useState("1");
    const [students,         setStudents]         = useState([createStudent()]);
    const [parents,          setParents]          = useState([createParent()]);
    const [emergency,        setEmergency]        = useState(INIT_EMERGENCY);
    const [levelOfInterest,  setLevelOfInterest]  = useState("Low");
    const [errors,           setErrors]           = useState({});
    const [submitting,       setSubmitting]       = useState(false);

    // ── Wizard state ──────────────────────────────────────────────────────────
    const [flowStep,           setFlowStep]           = useState("B");
    const [demoMode,           setDemoMode]           = useState("single");
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);
    const [isChangingVenue,    setIsChangingVenue]    = useState(false);

    // ── Profile prefill ───────────────────────────────────────────────────────
    useEffect(() => {
        if (!profile) {
            const s = createStudent();
            setStudents([s]);
            setSelectedStudentIds([s._tmpId]);
            setParents([createParent()]);
            setEmergency(INIT_EMERGENCY);
            return;
        }

        const rawParents  = profile?.adminMeta?.parents  || [];
        const rawStudents = profile?.adminMeta?.students || [];

        const normalizedParents = rawParents.map((p) => ({
            id:                  p.id ?? Date.now() + Math.random(),
            parentFirstName:     p.parentFirstName     || "",
            parentLastName:      p.parentLastName      || "",
            parentEmail:         p.parentEmail         || "",
            parentPhoneNumber:   p.parentPhoneNumber   || p.phoneNumber || "",
            interestReason:      p.interestReason      || "",
            interestReasonOther: p.interestReasonOther || "",
            relationToChild:     p.relationToChild     || "",
            howDidYouHear:       p.howDidYouHear       || "",
            isCustomReason:      p.isCustomReason      || false,
        }));

        const normalizedStudents = rawStudents.map((s) => ({
            _tmpId:            s.id ?? Date.now() + Math.random(),
            studentFirstName:  s.studentFirstName  || "",
            studentLastName:   s.studentLastName   || "",
            dob:               s.dob || formatDOBForDisplay(s.dateOfBirth),
            age:               s.age ?? "",
            gender:            s.gender            || "",
            medicalInfo:       s.medicalInfo || s.medicalInformation || "",
            selectedClassId:   s.selectedClassId   || "",
            selectedClassData: s.selectedClassData || null,
        }));

        const finalStudents = normalizedStudents.length ? normalizedStudents : [createStudent()];
        const finalParents  = normalizedParents.length  ? normalizedParents  : [createParent()];

        setStudents(finalStudents);
        setParents(finalParents);
        setNumberOfStudents(String(finalStudents.length));
        setSelectedStudentIds(finalStudents.map((s) => s._tmpId));

        if (finalStudents.length > 1) {
            setDemoMode("multi");
            setFlowStep("A");
        } else {
            setDemoMode("single");
            setFlowStep("B");
        }

        const ec = profile?.adminMeta?.emergency;
    console.log('ec',ec)
        if (ec) {
            const p0     = finalParents[0];
            const isSame =
                !!p0 &&
                p0.parentFirstName?.trim()   === ec.emergencyFirstName?.trim()   &&
                p0.parentLastName?.trim()    === ec.emergencyLastName?.trim()    &&
                p0.parentPhoneNumber?.trim() === ec.emergencyPhoneNumber?.trim();
            setEmergency({
                sameAsAbove:          isSame,
                emergencyFirstName:   ec.emergencyFirstName   || "",
                emergencyLastName:    ec.emergencyLastName    || "",
                emergencyPhoneNumber: ec.emergencyPhoneNumber || "",
                emergencyRelation:    ec.emergencyRelation    || "",
            });
        } else {
            setEmergency(INIT_EMERGENCY);
        }
    }, [profile]);

    // ── Fetch on mount ────────────────────────────────────────────────────────
    useEffect(() => {
        fetchVenues();
        fetchProfileData();
    }, [fetchVenues]);

    // ── Venue derived ─────────────────────────────────────────────────────────
    const allClasses = selectedVenue
        ? Object.entries(selectedVenue.classes || {}).flatMap(([day, cls]) =>
            cls.map((c) => ({
                id:        c.classId,
                className: c.className,
                dayOfWeek: day,
                capacity:  c.capacity,
                level:     c.level,
                time:      c.time,
            }))
        )
        : [];

    // ── Wizard derived ────────────────────────────────────────────────────────
    const isMulti = demoMode === "multi";

    const activeStudents = isMulti
        ? students.filter((s) => selectedStudentIds.includes(s._tmpId))
        : students.slice(0, 1);

    const activeNames = activeStudents
        .map((s) => s.studentFirstName || "Child")
        .join(" & ") || "your child";

    const fullFlowStates   = ["A", "B", "D"];
    const singleFlowStates = ["B", "D"];
    const flowStates       = isMulti ? fullFlowStates : singleFlowStates;
    const stepsLabels      = isMulti
        ? ["Children", "Waiting list details", "Done"]
        : ["Waiting list details", "Done"];
    const currentStepIndex = flowStates.indexOf(flowStep);

    // ── Helpers ───────────────────────────────────────────────────────────────
    const getStudentIdx = (student) =>
        students.findIndex((s) => s._tmpId === student._tmpId);

    const clearError = (key) =>
        setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });

    // ── Handlers ──────────────────────────────────────────────────────────────
    const toggleStudent = (id) => {
        if (id == null) return;
        setSelectedStudentIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const handleNumStudentsChange = (val) => {
        const count = Number(val) || 1;
        setNumberOfStudents(String(count));
        setStudents((prev) => {
            let next;
            if (count > prev.length) {
                next = [...prev, ...Array.from({ length: count - prev.length }, createStudent)];
            } else {
                next = prev.slice(0, count);
            }
            setSelectedStudentIds(next.map((s) => s._tmpId));
            return next;
        });
        setDemoMode(count > 1 ? "multi" : "single");
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
                    const dobDate   = new Date(y, m - 1, d);
                    const isValid   =
                        dobDate.getDate()     === d &&
                        dobDate.getMonth()    === m - 1 &&
                        dobDate.getFullYear() === y;
                    if (isValid) {
                        const today    = new Date();
                        let calcAge    = today.getFullYear() - y;
                        const md       = today.getMonth() - (m - 1);
                        if (md < 0 || (md === 0 && today.getDate() < d)) calcAge--;
                        age = calcAge >= 3 && calcAge <= 100 ? calcAge : "";
                    }
                }
                return { ...s, dob: formatted, age };
            })
        );
        clearError(`s${index}_dob`);
    };

    const handleStudentChange = (index, field, value) => {
        setStudents((prev) =>
            prev.map((s, i) => {
                if (i !== index) return s;
                const updated = { ...s, [field]: value };
                if (field === "selectedClassId") {
                    const foundClass         = allClasses.find((c) => String(c.id) === String(value)) || null;
                    updated.selectedClassData = foundClass;
                }
                return updated;
            })
        );
        clearError(`s${index}_${field}`);
    };

    const handleRemoveStudent = (index) => {
        setStudents((prev) => {
            const next   = prev.filter((_, i) => i !== index);
            const result = next.length ? next : [createStudent()];
            setSelectedStudentIds(result.map((s) => s._tmpId));
            setNumberOfStudents(String(result.length));
            if (result.length <= 1) setDemoMode("single");
            return result;
        });
    };

    const handleParentChange = (index, field, value) => {
        setParents((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
        clearError(`p${index}_${field}`);
    };

    const addParent = () => {
        if (parents.length < 3) setParents((prev) => [...prev, createParent()]);
    };

    const removeParent = (id) => {
        if (parents.length > 1) setParents((prev) => prev.filter((p) => p.id !== id));
    };

    const handleSameAsAboveChange = (e) => {
        const checked = e.target.checked;
        const p       = parents[0];
        setEmergency((prev) => ({
            ...prev,
            sameAsAbove:          checked,
            emergencyFirstName:   checked ? p.parentFirstName   || "" : "",
            emergencyLastName:    checked ? p.parentLastName    || "" : "",
            emergencyPhoneNumber: checked ? p.parentPhoneNumber || "" : "",
            emergencyRelation:    checked ? p.relationToChild   || "" : "",
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

    useEffect(() => {
        if (emergency.sameAsAbove && parents[0]) {
            const p = parents[0];
            setEmergency((prev) => ({
                ...prev,
                emergencyFirstName:   p.parentFirstName   || "",
                emergencyLastName:    p.parentLastName    || "",
                emergencyPhoneNumber: p.parentPhoneNumber || "",
                emergencyRelation:    p.relationToChild   || "",
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
        }
        return value;
    };

    const validate = () => {
        const errs = {};
        if (!selectedVenue) errs.venue = "Required";

        activeStudents.forEach((student) => {
            const i = getStudentIdx(student);
            if (!student.studentFirstName?.trim())  errs[`s${i}_studentFirstName`]  = "Required";
            if (!student.studentLastName?.trim())   errs[`s${i}_studentLastName`]   = "Required";
            if (!student.dob) {
                errs[`s${i}_dob`] = "Required";
            } else if (student.dob.length !== 10) {
                errs[`s${i}_dob`] = "Enter a valid date (DD/MM/YYYY)";
            } else {
                const [d, m, y] = student.dob.split("/").map(Number);
                const dobDate   = new Date(y, m - 1, d);
                const isValid   =
                    dobDate.getDate()     === d &&
                    dobDate.getMonth()    === m - 1 &&
                    dobDate.getFullYear() === y;
                if (!isValid) {
                    errs[`s${i}_dob`] = "Enter a valid date (DD/MM/YYYY)";
                } else if (dobDate > new Date()) {
                    errs[`s${i}_dob`] = "Date of birth cannot be in the future";
                }
            }
            if (!student.gender)             errs[`s${i}_gender`]      = "Required";
            if (!student.medicalInfo?.trim()) errs[`s${i}_medicalInfo`] = "Required (write 'None')";
            if (!student.selectedClassId)     errs[`s${i}_selectedClassId`] = "Required";
        });

        parents.forEach((p, i) => {
            if (!p.parentFirstName?.trim())  errs[`p${i}_parentFirstName`]  = "Required";
            if (!p.parentLastName?.trim())   errs[`p${i}_parentLastName`]   = "Required";
            if (!p.parentEmail?.trim()) {
                errs[`p${i}_parentEmail`] = "Required";
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.parentEmail)) {
                errs[`p${i}_parentEmail`] = "Invalid email";
            }
            if (!p.parentPhoneNumber?.trim()) errs[`p${i}_parentPhoneNumber`] = "Required";
            if (!p.relationToChild)           errs[`p${i}_relationToChild`]   = "Required";
            if (!p.interestReason)            errs[`p${i}_interestReason`]    = "Required";
            if (!p.howDidYouHear)             errs[`p${i}_howDidYouHear`]     = "Required";
        });

        if (!emergency.emergencyFirstName?.trim())   errs.e_firstName = "Required";
        if (!emergency.emergencyLastName?.trim())    errs.e_lastName  = "Required";
        if (!emergency.emergencyPhoneNumber?.trim()) errs.e_phone     = "Required";
        if (!emergency.emergencyRelation)            errs.e_relation  = "Required";

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleCancel = () => {
        setSelectedVenue(null);
        setNumberOfStudents("1");
        setStudents([createStudent()]);
        setParents([createParent()]);
        setEmergency(INIT_EMERGENCY);
        setLevelOfInterest("Low");
        setErrors({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            alert("Please check the form for errors.");
            return;
        }

        setSubmitting(true);
        try {
            const parentData = JSON.parse(localStorage.getItem("parentData") || "{}");
            const parentId   = parentData?.id;
            const token      = localStorage.getItem("parentToken");
            const API_URL    = import.meta.env.VITE_API_BASE_URL;

            const payload = {
                interest:      levelOfInterest,
                venueId:       selectedVenue?.venueId,
                totalStudents: activeStudents.length,
                students: activeStudents.map((s) => ({
                    studentFirstName:  s.studentFirstName,
                    studentLastName:   s.studentLastName,
                    dateOfBirth:       toDateOnly(s.dob),
                    age:               Number(s.age),
                    gender:            s.gender,
                    medicalInformation:s.medicalInfo,
                    classScheduleId:   Number(s.selectedClassId),
                })),
                parents: parents.map((p) => ({
                    parentFirstName:     p.parentFirstName,
                    parentLastName:      p.parentLastName,
                    parentEmail:         p.parentEmail,
                    parentPhoneNumber:   p.parentPhoneNumber,
                    relationToChild:     p.relationToChild,
                    interestReason:      p.interestReason,
                    interestReasonOther: p.interestReasonOther || "NA",
                    howDidYouHear:       p.howDidYouHear,
                    isCustomReason:      p.isCustomReason,
                })),
                emergency: {
                    sameAsAbove:          emergency.sameAsAbove,
                    emergencyFirstName:   emergency.emergencyFirstName,
                    emergencyLastName:    emergency.emergencyLastName,
                    emergencyPhoneNumber: emergency.emergencyPhoneNumber,
                    emergencyRelation:    emergency.emergencyRelation,
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

            showSuccess("Success", response?.data?.message || "Successfully added to waiting list.");
            setFlowStep("D");
        } catch (err) {
            console.error("Waiting List Error:", err);
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.error   ||
                "Something went wrong while submitting.";
            showError("Error", msg);
        } finally {
            setSubmitting(false);
        }
    };

    // ── UI class helpers ──────────────────────────────────────────────────────
    const inputClass = (hasErr) =>
        `w-full font-inherit text-[14px] border rounded-[10px] px-3.5 py-3 focus:outline-none focus:ring-2 transition-colors ${
            hasErr
                ? "border-[#e53e3e] focus:ring-[#e53e3e]/30 bg-[#fff5f5]"
                : "border-[#e7ebf1] focus:ring-[#3b7df6]"
        }`;

    const labelClass  = "block text-[13px] font-semibold mb-1.5 text-[#1f2733]";

    const nativeSelectClass =
        "w-full font-inherit text-[14px] font-medium text-[#1f2733] border border-[#e7ebf1] rounded-[10px] px-3.5 py-[11px] bg-white focus:outline-none focus:ring-2 focus:ring-[#3b7df6] appearance-none";

    const chevronBg =
        `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236b7685' stroke-width='1.6' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`;

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#f4f6f9] booking-page text-[#1f2733] font-['Poppins',sans-serif] pb-16">

         

            {/* ── Navy band ──────────────────────────────────────────────────── */}
            <div className="bg-[#1e3a6e] text-white mx-6 mt-4 rounded-[14px] px-5 py-4 flex items-center gap-3 font-bold text-[18px]">
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

            <div className="max-w-[1040px] mx-auto px-6 pt-5">

                {/* ── Steps indicator ────────────────────────────────────────── */}
                <div className="hidden md:flex items-center justify-center gap-2 mb-5 flex-wrap">
                    {flowStates.map((fs, i) => {
                        const isActive = fs === flowStep;
                        const isDone   = i < currentStepIndex;
                        return (
                            <React.Fragment key={fs}>
                                <div
                                    className={`flex items-center gap-2 text-[13px] font-semibold ${
                                        isActive ? "text-[#1f2733]" : "text-[#6b7685]"
                                    }`}
                                >
                                    <span
                                        className={`w-6 h-6 rounded-full border-[1.5px] flex items-center justify-center text-[12px] ${
                                            isActive
                                                ? "bg-[#21b573] border-[#21b573] text-white"
                                                : isDone
                                                ? "bg-[#cdeede] border-[#cdeede] text-[#21b573]"
                                                : "bg-white border-[#e7ebf1]"
                                        }`}
                                    >
                                        {isDone ? <Check size={13} /> : i + 1}
                                    </span>
                                    {stepsLabels[i]}
                                </div>
                                {i < flowStates.length - 1 && (
                                    <span className="w-8 h-[2px] bg-[#e7ebf1] rounded-[2px]" />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* ── Main white card ────────────────────────────────────────── */}
                <div className="bg-white rounded-[16px] shadow-[0_8px_30px_rgba(20,40,80,0.08)] p-8">

                    {/* ════════════════════════════════════════════════════════
                        SCREEN A  —  Who's this for? (multi only)
                    ════════════════════════════════════════════════════════ */}
                    {flowStep === "A" && (
                        <div>
                            <div className="text-center text-[24px] font-bold mb-1.5 tracking-tight">
                                Who's this for?
                            </div>
                            <div className="text-center text-[#6b7685] text-[14px] mb-6">
                                Select the children you'd like to add to the waiting list
                            </div>

                            {/* Number of children picker */}
                            <div className="flex justify-center mb-6">
                                <div className="flex items-center gap-3 bg-[#f4f6f9] rounded-[12px] px-4 py-3">
                                    <span className="text-[13px] font-semibold text-[#6b7685]">
                                        Number of children:
                                    </span>
                                    <select
                                        className="font-inherit text-[14px] font-medium border border-[#e7ebf1] rounded-[10px] px-3.5 py-2 pr-8 bg-white focus:outline-none focus:ring-2 focus:ring-[#3b7df6] appearance-none"
                                        style={{ backgroundImage: chevronBg, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}
                                        value={numberOfStudents}
                                        onChange={(e) => handleNumStudentsChange(e.target.value)}
                                    >
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                    </select>
                                </div>
                            </div>

                            {/* Student selection cards */}
                            <div className="flex justify-center gap-4 flex-wrap mb-2">
                                {students.map((s, i) => {
                                    const isSel = selectedStudentIds.includes(s._tmpId);
                                    return (
                                        <div
                                            key={s._tmpId ?? i}
                                            onClick={() => toggleStudent(s._tmpId)}
                                            className={`w-[230px] border-[1.5px] rounded-[14px] p-4 cursor-pointer transition-all relative ${
                                                isSel
                                                    ? "border-[#3b7df6] ring-4 ring-[#3b7df6]/10"
                                                    : "border-[#e7ebf1] hover:border-[#bcd0f5]"
                                            }`}
                                        >
                                            {/* Checkbox indicator */}
                                            <div
                                                className={`absolute top-3.5 right-3.5 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center text-white text-[12px] ${
                                                    isSel ? "bg-[#3b7df6] border-[#3b7df6]" : "border-[#e7ebf1]"
                                                }`}
                                            >
                                                {isSel && <Check size={13} />}
                                            </div>

                                            <div className="text-[#3b7df6] font-bold text-[16px] mb-3">
                                                {s.studentFirstName || `Child ${i + 1}`}
                                            </div>

                                            <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                                                <div>
                                                    <div className="text-[11px] text-[#6b7685]">Date of birth</div>
                                                    <div className="text-[14px] font-semibold">{s.dob || "–"}</div>
                                                </div>
                                                <div>
                                                    <div className="text-[11px] text-[#6b7685]">Age</div>
                                                    <div className="text-[14px] font-semibold">{s.age || "–"}</div>
                                                </div>
                                                <div>
                                                    <div className="text-[11px] text-[#6b7685]">Gender</div>
                                                    <div className="text-[14px] font-semibold">{s.gender || "–"}</div>
                                                </div>
                                                <div>
                                                    <div className="text-[11px] text-[#6b7685]">Medical</div>
                                                    <div className="text-[14px] font-semibold truncate">{s.medicalInfo || "–"}</div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Actions */}
                            <div className="flex justify-center gap-3.5 mt-7 flex-wrap">
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="font-semibold text-[15px] rounded-[12px] px-8 py-3.5 border border-[#e7ebf1] text-[#1f2733] bg-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={selectedStudentIds.length === 0}
                                    onClick={() => setFlowStep("B")}
                                    className="font-semibold text-[15px] rounded-[12px] px-8 py-3.5 border border-[#3b7df6] text-white bg-[#3b7df6] disabled:opacity-50 hover:bg-[#2f6ae0]"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ════════════════════════════════════════════════════════
                        SCREEN B  —  Main form
                    ════════════════════════════════════════════════════════ */}
                    {flowStep === "B" && (
                        <form onSubmit={handleSubmit} noValidate>
                            <div className="text-center text-[24px] font-bold mb-1.5 tracking-tight">
                                Add {activeNames} to the waiting list
                            </div>
                            <div className="text-center text-[#6b7685] text-[14px] mb-6">
                                Fill in the details below and we'll notify you when a spot opens up
                            </div>

                            {/* ── Venue selector ─────────────────────────────────────────── */}
                            <div className="mb-6">
                                {/* Gradient header */}
                                <div
                                    style={{ background: "linear-gradient(120deg, #1e3a6e, #2f5aa0)" }}
                                    className="text-white px-5 py-4 rounded-t-[14px] flex items-center justify-between gap-3 flex-wrap"
                                >
                                    <div className="flex items-center gap-2.5 font-semibold text-[15px]">
                                        <MapPin size={16} />
                                        {selectedVenue?.venueName || "Select a venue…"}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsChangingVenue(!isChangingVenue)}
                                        className="bg-white/15 border border-white/35 text-white rounded-[20px] px-3.5 py-1.5 text-[12px] font-semibold"
                                    >
                                        {isChangingVenue ? "Cancel" : "Change venue"}
                                    </button>
                                </div>

                                {/* Venue dropdown (visible when changing) */}
                                {isChangingVenue && (
                                    <div className="border border-t-0 border-[#e7ebf1] px-5 py-3.5 bg-[#f4f6f9]">
                                        <select
                                            className={nativeSelectClass}
                                            style={{ backgroundImage: chevronBg, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}
                                            value={selectedVenue?.venueId || ""}
                                            onChange={(e) => {
                                                const vId = Number(e.target.value);
                                                const v   = venues?.noCapacityVenues?.find((x) => x.venueId === vId)
                                                         || venues?.capacityVenues?.find((x) => x.venueId === vId);
                                                if (v) {
                                                    setSelectedVenue(v);
                                                    setStudents((prev) =>
                                                        prev.map((s) => ({ ...s, selectedClassId: "", selectedClassData: null }))
                                                    );
                                                    setIsChangingVenue(false);
                                                    clearError("venue");
                                                }
                                            }}
                                        >
                                            <option value="" disabled>Select a venue…</option>
                                            {(venues?.noCapacityVenues || venues?.capacityVenues || []).map((v) => (
                                                <option key={v.venueId} value={v.venueId}>{v.venueName}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Per-student class selectors */}
                                {activeStudents.map((s, idx) => {
                                    const sIdx = getStudentIdx(s);
                                    return (
                                        <div
                                            key={s._tmpId ?? idx}
                                            className={`border border-t-0 border-[#e7ebf1] p-3.5 px-5 flex flex-col gap-3 ${
                                                idx === activeStudents.length - 1 ? "rounded-b-[14px]" : ""
                                            }`}
                                        >
                                            {/* Student avatar row */}
                                            <div className="flex items-center gap-3">
                                                <div className="w-[38px] h-[38px] rounded-full bg-[#eaf1fe] flex items-center justify-center font-bold text-[#3b7df6] shrink-0">
                                                    {(s.studentFirstName || "?")[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-[15px]">
                                                        {s.studentFirstName
                                                            ? `${s.studentFirstName} ${s.studentLastName}`
                                                            : `Child ${idx + 1}`}
                                                    </div>
                                                    {s.selectedClassData && (
                                                        <div className="text-[12px] text-[#6b7685]">
                                                            Class: {s.selectedClassData.className}
                                                            {s.selectedClassData.level ? ` (${s.selectedClassData.level})` : ""}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Class picker */}
                                            <div>
                                                <label className="block text-[13px] capitalize font-semibold mb-1.5">
                                                    Select class for {s.studentFirstName || `Child ${idx + 1}`}
                                                </label>
                                                <select
                                                    className={`w-full capitalize font-inherit text-[14px] border rounded-[10px] px-3.5 py-[11px] appearance-none focus:outline-none focus:ring-2 ${
                                                        !selectedVenue
                                                            ? "border-[#e7ebf1] bg-[#f4f6f9] text-[#9CA3AF] cursor-not-allowed"
                                                            : "border-[#ffd21f] bg-[#fffcf0] focus:ring-[#ffd21f]"
                                                    }`}
                                                    style={{ backgroundImage: chevronBg, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}
                                                    disabled={!selectedVenue}
                                                    value={s.selectedClassId || ""}
                                                    onChange={(e) => handleStudentChange(sIdx, "selectedClassId", e.target.value)}
                                                >
                                                    <option value="" disabled>
                                                        {selectedVenue ? "Choose a class…" : "Select a venue first"}
                                                    </option>
                                                    {allClasses.map((c) => (
                                                        <option key={c.id} value={c.id}>
                                                            {c.className} ({c.dayOfWeek}) {c.time}
                                                            {c.level ? ` – ${c.level}` : ""}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors[`s${sIdx}_selectedClassId`] && (
                                                    <p className="text-[12px] text-[#e53e3e] mt-1">
                                                        {errors[`s${sIdx}_selectedClassId`]}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {errors.venue && (
                                    <p className="text-[12px] text-[#e53e3e] mt-2">{errors.venue}</p>
                                )}
                            </div>

                            {/* ── Student detail forms ────────────────────────────────────── */}
                            <div className="mb-6">
                                <div className="text-[13px] font-bold uppercase tracking-[0.04em] text-[#6b7685] mb-3">
                                    Student details
                                </div>

                                {activeStudents.map((student, idx) => {
                                    const sIdx = getStudentIdx(student);
                                    return (
                                        <div
                                            key={student._tmpId ?? idx}
                                            className="border border-[#e7ebf1] rounded-[14px] p-5 mb-4 relative"
                                        >
                                            {/* Remove button (multi only) */}
                                            {activeStudents.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveStudent(sIdx)}
                                                    className="absolute top-4 right-4 flex items-center gap-1 text-[12px] font-semibold text-[#e53e3e] hover:text-red-600 transition"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                    Remove
                                                </button>
                                            )}

                                            {/* Card header */}
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-[38px] h-[38px] rounded-full bg-[#eaf1fe] flex items-center justify-center font-bold text-[#3b7df6] shrink-0">
                                                    {(student.studentFirstName || "?")[0].toUpperCase()}
                                                </div>
                                                <div className="font-bold text-[15px]">
                                                    {activeStudents.length > 1
                                                        ? `Child ${idx + 1} Information`
                                                        : "Student Information"}
                                                </div>
                                            </div>

                                            {/* Fields grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className={labelClass}>First name</label>
                                                    <input
                                                        placeholder="Enter first name"
                                                        className={inputClass(errors[`s${sIdx}_studentFirstName`])}
                                                        value={student.studentFirstName}
                                                        onChange={(e) =>
                                                            handleStudentChange(sIdx, "studentFirstName", e.target.value)
                                                        }
                                                    />
                                                    {errors[`s${sIdx}_studentFirstName`] && (
                                                        <p className="text-[12px] text-[#e53e3e] mt-1">
                                                            {errors[`s${sIdx}_studentFirstName`]}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className={labelClass}>Last name</label>
                                                    <input
                                                        placeholder="Enter last name"
                                                        className={inputClass(errors[`s${sIdx}_studentLastName`])}
                                                        value={student.studentLastName}
                                                        onChange={(e) =>
                                                            handleStudentChange(sIdx, "studentLastName", e.target.value)
                                                        }
                                                    />
                                                    {errors[`s${sIdx}_studentLastName`] && (
                                                        <p className="text-[12px] text-[#e53e3e] mt-1">
                                                            {errors[`s${sIdx}_studentLastName`]}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className={labelClass}>Date of birth</label>
                                                    <input
                                                        type="text"
                                                        placeholder="DD/MM/YYYY"
                                                        maxLength={10}
                                                        className={inputClass(errors[`s${sIdx}_dob`])}
                                                        value={student.dob}
                                                        onChange={(e) => handleDOBChange(sIdx, e.target.value)}
                                                    />
                                                    {errors[`s${sIdx}_dob`] && (
                                                        <p className="text-[12px] text-[#e53e3e] mt-1">
                                                            {errors[`s${sIdx}_dob`]}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className={labelClass}>Age</label>
                                                    <input
                                                        disabled
                                                        placeholder="Automatic entry"
                                                        className={`${inputClass(false)} bg-[#f4f6f9] text-[#6b7685]`}
                                                        value={student.age}
                                                    />
                                                </div>

                                                <div>
                                                    <label className={labelClass}>Gender</label>
                                                    <select
                                                        className={`w-full font-inherit text-[14px] border rounded-[10px] px-3.5 py-[11px] appearance-none focus:outline-none focus:ring-2 ${
                                                            errors[`s${sIdx}_gender`]
                                                                ? "border-[#e53e3e] focus:ring-[#e53e3e]/30 bg-[#fff5f5]"
                                                                : "border-[#e7ebf1] focus:ring-[#3b7df6] bg-white"
                                                        }`}
                                                        style={{ backgroundImage: chevronBg, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}
                                                        value={student.gender}
                                                        onChange={(e) =>
                                                            handleStudentChange(sIdx, "gender", e.target.value)
                                                        }
                                                    >
                                                        <option value="">Select gender</option>
                                                        {genderOptions.map((o) => (
                                                            <option key={o.value} value={o.value}>{o.label}</option>
                                                        ))}
                                                    </select>
                                                    {errors[`s${sIdx}_gender`] && (
                                                        <p className="text-[12px] text-[#e53e3e] mt-1">
                                                            {errors[`s${sIdx}_gender`]}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className={labelClass}>Medical information</label>
                                                    <input
                                                        placeholder="e.g. Asthma, None"
                                                        className={inputClass(errors[`s${sIdx}_medicalInfo`])}
                                                        value={student.medicalInfo}
                                                        onChange={(e) =>
                                                            handleStudentChange(sIdx, "medicalInfo", e.target.value)
                                                        }
                                                    />
                                                    {errors[`s${sIdx}_medicalInfo`] && (
                                                        <p className="text-[12px] text-[#e53e3e] mt-1">
                                                            {errors[`s${sIdx}_medicalInfo`]}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="col-span-2">
                                                    <label className={labelClass}>Time</label>
                                                    <input
                                                        disabled
                                                        readOnly
                                                        placeholder="Automatic entry"
                                                        className={`${inputClass(false)} bg-[#f4f6f9] text-[#6b7685]`}
                                                        value={student.selectedClassData?.time || ""}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* ── Parent / Guardian information ───────────────────────────── */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="text-[13px] font-bold uppercase tracking-[0.04em] text-[#6b7685]">
                                        Parent / Guardian information
                                    </div>
                                    <button
                                        type="button"
                                        disabled={parents.length >= 3}
                                        onClick={addParent}
                                        className={`bg-[#1e3a6e] text-white px-3.5 py-1.5 rounded-[10px] text-[12px] font-semibold hover:bg-[#16306e] transition-colors ${
                                            parents.length >= 3 ? "cursor-not-allowed opacity-50" : ""
                                        }`}
                                    >
                                        + Add Guardian
                                    </button>
                                </div>

                                {parents.map((parent, index) => (
                                    <div
                                        key={parent.id}
                                        className="border border-[#e7ebf1] rounded-[14px] p-5 mb-4 relative"
                                    >
                                        {/* Remove button */}
                                        {index > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => removeParent(parent.id)}
                                                className="absolute right-4 top-4 text-[#e53e3e] hover:text-red-700 flex items-center gap-1 text-[12px] font-semibold"
                                            >
                                                <Trash2 size={14} />
                                                Remove
                                            </button>
                                        )}

                                        <div className="text-[12px] font-bold uppercase tracking-[0.04em] text-[#6b7685] mb-4">
                                            Parent / Guardian {index + 1}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className={labelClass}>First name</label>
                                                <input
                                                    placeholder="Enter first name"
                                                    className={inputClass(errors[`p${index}_parentFirstName`])}
                                                    value={parent.parentFirstName}
                                                    onChange={(e) =>
                                                        handleParentChange(index, "parentFirstName", e.target.value.replace(/[^A-Za-z\s]/g, ""))
                                                    }
                                                />
                                                {errors[`p${index}_parentFirstName`] && (
                                                    <p className="text-[12px] text-[#e53e3e] mt-1">
                                                        {errors[`p${index}_parentFirstName`]}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className={labelClass}>Last name</label>
                                                <input
                                                    placeholder="Enter last name"
                                                    className={inputClass(errors[`p${index}_parentLastName`])}
                                                    value={parent.parentLastName}
                                                    onChange={(e) =>
                                                        handleParentChange(index, "parentLastName", e.target.value.replace(/[^A-Za-z\s]/g, ""))
                                                    }
                                                />
                                                {errors[`p${index}_parentLastName`] && (
                                                    <p className="text-[12px] text-[#e53e3e] mt-1">
                                                        {errors[`p${index}_parentLastName`]}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className={labelClass}>Email</label>
                                                <input
                                                    type="email"
                                                    placeholder="Enter email address"
                                                    className={inputClass(errors[`p${index}_parentEmail`])}
                                                    value={parent.parentEmail}
                                                    onChange={(e) =>
                                                        handleParentChange(index, "parentEmail", e.target.value)
                                                    }
                                                />
                                                {errors[`p${index}_parentEmail`] && (
                                                    <p className="text-[12px] text-[#e53e3e] mt-1">
                                                        {errors[`p${index}_parentEmail`]}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className={labelClass}>Phone number</label>
                                                <PhoneNumberInput
                                                    value={parent.parentPhoneNumber}
                                                    onChange={(v) => handleParentChange(index, "parentPhoneNumber", v)}
                                                    placeholder="Enter phone number"
                                                    className={errors[`p${index}_parentPhoneNumber`] ? "border-[#e53e3e] bg-[#fff5f5]" : ""}
                                                />
                                                {errors[`p${index}_parentPhoneNumber`] && (
                                                    <p className="text-[12px] text-[#e53e3e] mt-1">
                                                        {errors[`p${index}_parentPhoneNumber`]}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className={labelClass}>Relation to child</label>
                                                <select
                                                    className={`w-full font-inherit text-[14px] border rounded-[10px] px-3.5 py-[11px] appearance-none focus:outline-none focus:ring-2 ${
                                                        errors[`p${index}_relationToChild`]
                                                            ? "border-[#e53e3e] focus:ring-[#e53e3e]/30 bg-[#fff5f5]"
                                                            : "border-[#e7ebf1] focus:ring-[#3b7df6] bg-white"
                                                    }`}
                                                    style={{ backgroundImage: chevronBg, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}
                                                    value={parent.relationToChild}
                                                    onChange={(e) =>
                                                        handleParentChange(index, "relationToChild", e.target.value)
                                                    }
                                                >
                                                    <option value="">Select relation</option>
                                                    {relationOptions.map((o) => (
                                                        <option key={o.value} value={o.value}>{o.label}</option>
                                                    ))}
                                                </select>
                                                {errors[`p${index}_relationToChild`] && (
                                                    <p className="text-[12px] text-[#e53e3e] mt-1">
                                                        {errors[`p${index}_relationToChild`]}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className={labelClass}>How did you hear about us?</label>
                                                <select
                                                    className={`w-full font-inherit text-[14px] border rounded-[10px] px-3.5 py-[11px] appearance-none focus:outline-none focus:ring-2 ${
                                                        errors[`p${index}_howDidYouHear`]
                                                            ? "border-[#e53e3e] focus:ring-[#e53e3e]/30 bg-[#fff5f5]"
                                                            : "border-[#e7ebf1] focus:ring-[#3b7df6] bg-white"
                                                    }`}
                                                    style={{ backgroundImage: chevronBg, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}
                                                    value={parent.howDidYouHear}
                                                    onChange={(e) =>
                                                        handleParentChange(index, "howDidYouHear", e.target.value)
                                                    }
                                                >
                                                    <option value="">Select</option>
                                                    {hearOptions.map((o) => (
                                                        <option key={o.value} value={o.value}>{o.label}</option>
                                                    ))}
                                                </select>
                                                {errors[`p${index}_howDidYouHear`] && (
                                                    <p className="text-[12px] text-[#e53e3e] mt-1">
                                                        {errors[`p${index}_howDidYouHear`]}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className={labelClass}>
                                                    What's the main reason you're interested in Samba Soccer Schools?
                                                </label>
                                                {parent.isCustomReason ? (
                                                    <div className="relative">
                                                        <input
                                                            placeholder="Please specify your reason"
                                                            className={inputClass(errors[`p${index}_interestReason`])}
                                                            value={parent.interestReason}
                                                            onChange={(e) =>
                                                                handleParentChange(index, "interestReason", e.target.value)
                                                            }
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                handleParentChange(index, "interestReason", "");
                                                                handleParentChange(index, "isCustomReason", false);
                                                            }}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#3b7df6] font-semibold"
                                                        >
                                                            ← Back
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <select
                                                        className={`w-full font-inherit text-[14px] border rounded-[10px] px-3.5 py-[11px] appearance-none focus:outline-none focus:ring-2 ${
                                                            errors[`p${index}_interestReason`]
                                                                ? "border-[#e53e3e] focus:ring-[#e53e3e]/30 bg-[#fff5f5]"
                                                                : "border-[#e7ebf1] focus:ring-[#3b7df6] bg-white"
                                                        }`}
                                                        style={{ backgroundImage: chevronBg, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}
                                                        value={parent.interestReason}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val === "Other") {
                                                                handleParentChange(index, "interestReason", "");
                                                                handleParentChange(index, "isCustomReason", true);
                                                            } else {
                                                                handleParentChange(index, "interestReason", val);
                                                                handleParentChange(index, "isCustomReason", false);
                                                            }
                                                        }}
                                                    >
                                                        <option value="">Select a reason</option>
                                                        {interestReasonOptions.map((o) => (
                                                            <option key={o.value} value={o.value}>{o.label}</option>
                                                        ))}
                                                    </select>
                                                )}
                                                {errors[`p${index}_interestReason`] && (
                                                    <p className="text-[12px] text-[#e53e3e] mt-1">
                                                        {errors[`p${index}_interestReason`]}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className={labelClass}>Tell us a bit more (optional)</label>
                                                <textarea
                                                    placeholder="Anything else you'd like to share?"
                                                    className={`${inputClass(false)} h-24 resize-none`}
                                                    value={parent.interestReasonOther}
                                                    onChange={(e) =>
                                                        handleParentChange(index, "interestReasonOther", e.target.value)
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* ── Emergency contact ───────────────────────────────────────── */}
                            <div className="mb-6">
                                <div className="text-[13px] font-bold uppercase tracking-[0.04em] text-[#6b7685] mb-3">
                                    Emergency contact
                                </div>

                                <div className="border border-[#e7ebf1] rounded-[14px] p-5">
                                    <label className="flex items-center gap-2 cursor-pointer mb-4">
                                        <input
                                            type="checkbox"
                                            checked={emergency.sameAsAbove}
                                            onChange={handleSameAsAboveChange}
                                            className="rounded border-[#e7ebf1] text-[#3b7df6] focus:ring-[#3b7df6]"
                                        />
                                        <span className="text-[13px] text-[#6b7685] font-medium">
                                            Same as parent / guardian above
                                        </span>
                                    </label>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>First name</label>
                                            <input
                                                placeholder="Enter first name"
                                                className={inputClass(errors.e_firstName)}
                                                value={emergency.emergencyFirstName}
                                                disabled={emergency.sameAsAbove}
                                                onChange={(e) =>
                                                    handleEmergencyChange("emergencyFirstName", e.target.value)
                                                }
                                            />
                                            {errors.e_firstName && (
                                                <p className="text-[12px] text-[#e53e3e] mt-1">{errors.e_firstName}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className={labelClass}>Last name</label>
                                            <input
                                                placeholder="Enter last name"
                                                className={inputClass(errors.e_lastName)}
                                                value={emergency.emergencyLastName}
                                                disabled={emergency.sameAsAbove}
                                                onChange={(e) =>
                                                    handleEmergencyChange("emergencyLastName", e.target.value)
                                                }
                                            />
                                            {errors.e_lastName && (
                                                <p className="text-[12px] text-[#e53e3e] mt-1">{errors.e_lastName}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className={labelClass}>Phone number</label>
                                            <PhoneNumberInput
                                                value={emergency.emergencyPhoneNumber}
                                                readOnly={emergency.sameAsAbove}
                                                onChange={(v) => handleEmergencyChange("emergencyPhoneNumber", v)}
                                                placeholder="Enter phone number"
                                                className={errors.e_phone ? "border-[#e53e3e] bg-[#fff5f5]" : ""}
                                            />
                                            {errors.e_phone && (
                                                <p className="text-[12px] text-[#e53e3e] mt-1">{errors.e_phone}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className={labelClass}>Relation to child</label>
                                            <select
                                                className={`w-full font-inherit text-[14px] border rounded-[10px] px-3.5 py-[11px] appearance-none focus:outline-none focus:ring-2 ${
                                                    errors.e_relation
                                                        ? "border-[#e53e3e] focus:ring-[#e53e3e]/30 bg-[#fff5f5]"
                                                        : "border-[#e7ebf1] focus:ring-[#3b7df6] bg-white"
                                                }`}
                                                style={{ backgroundImage: chevronBg, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}
                                                value={emergency.emergencyRelation}
                                                disabled={emergency.sameAsAbove}
                                                onChange={(e) =>
                                                    handleEmergencyChange("emergencyRelation", e.target.value)
                                                }
                                            >
                                                <option value="">Select relation</option>
                                                {relationOptions.map((o) => (
                                                    <option key={o.value} value={o.value}>{o.label}</option>
                                                ))}
                                            </select>
                                            {errors.e_relation && (
                                                <p className="text-[12px] text-[#e53e3e] mt-1">{errors.e_relation}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── Level of interest ───────────────────────────────────────── */}
                            <div className="mb-6">
                                <div className="text-[13px] font-bold uppercase tracking-[0.04em] text-[#6b7685] mb-3">
                                    Level of interest
                                </div>
                                <div className="border border-[#e7ebf1] rounded-[14px] p-5 flex items-center gap-6 flex-wrap">
                                    {["Low", "Medium", "High"].map((level) => {
                                        const isActive = levelOfInterest === level;
                                        const colors   = {
                                            Low:    { bg: "#fff7ed", ring: "#fb923c", text: "#c2410c" },
                                            Medium: { bg: "#fefce8", ring: "#facc15", text: "#a16207" },
                                            High:   { bg: "#f0fdf4", ring: "#4ade80", text: "#166534" },
                                        };
                                        const c = colors[level];
                                        return (
                                            <label
                                                key={level}
                                                className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-[10px] border-[1.5px] transition-all text-[14px] font-semibold ${
                                                    isActive
                                                        ? `border-[${c.ring}] bg-[${c.bg}] text-[${c.text}]`
                                                        : "border-[#e7ebf1] text-[#6b7685]"
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="levelOfInterest"
                                                    value={level}
                                                    checked={isActive}
                                                    onChange={() => setLevelOfInterest(level)}
                                                    className="h-4 w-4"
                                                />
                                                {level}
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ── Actions ─────────────────────────────────────────────────── */}
                            <div className="flex justify-center gap-3.5 mt-7 flex-wrap">
                                <button
                                    type="button"
                                    onClick={() => (isMulti ? setFlowStep("A") : navigate(-1))}
                                    className="font-semibold text-[15px] rounded-[12px] px-8 py-3.5 border border-[#e7ebf1] text-[#1f2733] bg-white"
                                >
                                    {isMulti ? "Back" : "Cancel"}
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="font-semibold text-[15px] rounded-[12px] px-8 py-3.5 border border-[#1e3a6e] text-white bg-[#1e3a6e] hover:bg-[#16306e] transition-colors disabled:opacity-50"
                                >
                                    {submitting ? "Adding…" : "Add to Waiting List"}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* ════════════════════════════════════════════════════════
                        SCREEN D  —  Success
                    ════════════════════════════════════════════════════════ */}
                    {flowStep === "D" && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-[#e7f8f0] rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check size={32} className="text-[#21b573]" />
                            </div>
                            <div className="text-[26px] font-bold mb-2 tracking-tight">
                                You're on the list! 🎉
                            </div>
                            <div className="text-[#6b7685] text-[15px] mb-6 max-w-[440px] mx-auto">
                                {activeNames} ha{activeStudents.length > 1 ? "ve" : "s"} been added to the waiting list.
                                We'll contact you as soon as a spot becomes available.
                            </div>
                            <button
                                onClick={() => navigate(-1)}
                                className="font-semibold text-[15px] rounded-[12px] px-8 py-3.5 bg-[#1e3a6e] text-white hover:bg-[#16306e] transition-colors"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}