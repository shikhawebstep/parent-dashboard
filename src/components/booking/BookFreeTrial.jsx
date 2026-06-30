import React, { useState, useEffect } from 'react';
import CalendarWidget from './CalendarWidget';
import {
    ChevronLeft,
    Trash2,
    Check,
    MapPin,
} from 'lucide-react';
import { useCommon } from "../../context/CommonContext";
import PhoneNumberInput from "../../commom/PhoneNumberInput";
import axios from "axios";
import Select from "react-select";
import { useProfile } from "../../context/ProfileContext";
import { useNavigate } from "react-router-dom";
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
    { value: "To build my child's confidence",                      label: "To build my child's confidence"                      },
    { value: "To improve their technical football skills",          label: "To improve their technical football skills"          },
    { value: "Because my child loves football",                     label: "Because my child loves football"                     },
    { value: "To help my child make friends and build social skills", label: "To help my child make friends and build social skills" },
    { value: "To keep my child active and healthy",                 label: "To keep my child active and healthy"                 },
    { value: "High-quality coaching in a fun, positive environment",label: "High-quality coaching in a fun, positive environment"},
    { value: "Other",                                               label: "Other"                                               },
];

const hearOptions = [
    { value: "Google",    label: "Google"    },
    { value: "Facebook",  label: "Facebook"  },
    { value: "Instagram", label: "Instagram" },
    { value: "Friend",    label: "Friend"    },
    { value: "Flyer",     label: "Flyer"     },
];

const numStudentsOptions = [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
];

// ── Module-level helper ───────────────────────────────────────────────────────
const formatDOBForDisplay = (isoDate) => {
    if (!isoDate || typeof isoDate !== "string") return "";
    const [y, m, d] = isoDate.split("-");
    if (!y || !m || !d) return "";
    return `${d}/${m}/${y}`;
};

// ── Inits ─────────────────────────────────────────────────────────────────────
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
    error: null,
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

const INIT_EMERGENCY = {
    sameAsAbove: false,
    emergencyFirstName: "",
    emergencyLastName: "",
    emergencyPhoneNumber: "",
    emergencyRelation: "",
};

// ── Select styles (matches BookMembership) ────────────────────────────────────
const selectStyles = {
    control: (base, state) => ({
        ...base,
        minHeight: "44px",
        borderRadius: "10px",
        fontSize: "14px",
        borderColor: state.isFocused ? "#3b7df6" : "#e7ebf1",
        boxShadow: "none",
        "&:hover": { borderColor: "#3b7df6" },
    }),
    placeholder: (base) => ({ ...base, color: "#9CA3AF" }),
    menu: (base) => ({ ...base, zIndex: 9999 }),
};

const selectStylesError = {
    ...selectStyles,
    control: (base, state) => ({
        ...selectStyles.control(base, state),
        borderColor: "#e53e3e",
        backgroundColor: "#fff5f5",
    }),
};

// ── Component ─────────────────────────────────────────────────────────────────
const BookFreeTrial = () => {
    const { fetchVenues, venues } = useCommon();
    const { profile, fetchProfileData } = useProfile();
    const navigate = useNavigate();

    // ── Form state ────────────────────────────────────────────────────────────
    const [selectedVenue, setSelectedVenue]   = useState(null);
    const [selectedDate,  setSelectedDate]    = useState(null);
    const [numStudents,   setNumStudents]     = useState("1");
    const [students,      setStudents]        = useState([createStudent()]);
    const [parents,       setParents]         = useState([createParent()]);
    const [emergency,     setEmergency]       = useState(INIT_EMERGENCY);
    const [errors,        setErrors]          = useState({});

    // ── Wizard state ──────────────────────────────────────────────────────────
    const [flowStep,            setFlowStep]            = useState("B");
    const [demoMode,            setDemoMode]            = useState("single");
    const [selectedStudentIds,  setSelectedStudentIds]  = useState([]);
    const [isChangingVenue,     setIsChangingVenue]     = useState(false);

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
            id: p?.id ?? Date.now() + Math.random(),
            parentFirstName:    p?.parentFirstName    || "",
            parentLastName:     p?.parentLastName     || "",
            parentEmail:        p?.parentEmail        || "",
            parentPhoneNumber:  p?.parentPhoneNumber  || p?.phoneNumber || "",
            interestReason:     p?.interestReason     || "",
            interestReasonOther:p?.interestReasonOther|| "",
            relationToChild:    p?.relationToChild    || "",
            howDidYouHear:      p?.howDidYouHear      || "",
            isCustomReason:     p?.isCustomReason     || false,
        }));

        const normalizedStudents = rawStudents.map((s) => ({
            _tmpId:             s?.id ?? Date.now() + Math.random(),
            studentFirstName:   s?.studentFirstName  || "",
            studentLastName:    s?.studentLastName   || "",
            dob:                s?.dob || formatDOBForDisplay(s?.dateOfBirth),
            age:                s?.age ?? "",
            gender:             s?.gender            || "",
            medicalInfo:        s?.medicalInfo || s?.medicalInformation || "",
            selectedClassId:    s?.selectedClassId   || "",
            selectedClassData:  s?.selectedClassData || null,
            error:              null,
        }));

        const finalStudents = normalizedStudents.length ? normalizedStudents : [createStudent()];
        const finalParents  = normalizedParents.length  ? normalizedParents  : [createParent()];

        setStudents(finalStudents);
        setParents(finalParents);
        setNumStudents(String(finalStudents.length));
        setSelectedStudentIds(finalStudents.map((s) => s._tmpId));

        if (finalStudents.length > 1) {
            setDemoMode("multi");
            setFlowStep("A");
        } else {
            setDemoMode("single");
            setFlowStep("B");
        }

        const ec = profile?.adminMeta?.emergency;

        if (ec) {
            const p0 = finalParents[0];
            const isSame =
                !!p0 &&
                (p0.parentFirstName || "").trim()   === (ec?.emergencyFirstName || "").trim()   &&
                (p0.parentLastName || "").trim()    === (ec?.emergencyLastName || "").trim()    &&
                (p0.parentPhoneNumber || "").trim() === (ec?.emergencyPhoneNumber || "").trim();
            setEmergency({
                sameAsAbove:          isSame,
                emergencyFirstName:   ec?.emergencyFirstName   || "",
                emergencyLastName:    ec?.emergencyLastName    || "",
                emergencyPhoneNumber: ec?.emergencyPhoneNumber || "",
                emergencyRelation:    ec?.emergencyRelation    || "",
            });
        } else {
            setEmergency(INIT_EMERGENCY);
        }
    }, [profile]);

    // ── Fetch on mount ────────────────────────────────────────────────────────
    useEffect(() => {
        fetchVenues?.();
        fetchProfileData?.();
    }, [fetchVenues]);

    // ── Venue derived ─────────────────────────────────────────────────────────
    const sessionDates = (selectedVenue?.terms || []).flatMap((t) =>
        (t?.sessionsMap || []).map((s) => s?.sessionDate).filter(Boolean)
    );
    const availableDatesSet = new Set(sessionDates);

    // Auto-select first future session date when venue changes
    useEffect(() => {
        if (!sessionDates.length) { setSelectedDate(null); return; }
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const future = sessionDates
            .map((d) => new Date(d))
            .filter((d) => !Number.isNaN(d.getTime()))
            .filter((d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x >= today; })
            .sort((a, b) => a - b);
        setSelectedDate(future.length ? future[0] : new Date(sessionDates[0]));
    }, [selectedVenue]);

    // ── react-select option builders (null-safe) ──────────────────────────────
    const venueSelectOptions = (venues?.capacityVenues || [])
        .filter((v) => v && v.venueId !== undefined && v.venueId !== null)
        .map((v) => ({ value: v.venueId, label: v.venueName || "Unnamed venue", all: v }));

    const allClasses = selectedVenue
        ? Object.entries(selectedVenue.classes || {}).flatMap(([day, cls]) =>
            (cls || [])
                .filter((c) => c && c.classId !== undefined && c.classId !== null)
                .map((c) => ({
                    id:          c.classId,
                    className:   c.className || "Class",
                    dayOfWeek:   day,
                    startTime:   c.time?.split(" - ")[0] || "",
                    endTime:     c.time?.split(" - ")[1] || "",
                    capacity:    c.capacity ?? 0,
                    level:       c.level || "",
                    time:        c.time || "",
                }))
        )
        : [];

    const buildClassSelectOptions = () =>
        allClasses.map((c) => ({
            value: c.id,
            label: `${c.className} (${c.dayOfWeek}) ${c.time}${c.level ? ` – ${c.level}` : ""}`.trim(),
            all: c,
        }));
    const classSelectOptions = buildClassSelectOptions();

    // ── Wizard derived ────────────────────────────────────────────────────────
    const isMulti = demoMode === "multi";

    const activeStudents = isMulti
        ? students.filter((s) => selectedStudentIds.includes(s._tmpId))
        : students.slice(0, 1);

    const activeNames = activeStudents
        .map((s) => s?.studentFirstName || "Child")
        .join(" & ") || "your child";

    const fullFlowStates   = ["A", "B", "D"];
    const singleFlowStates = ["B", "D"];
    const flowStates       = isMulti ? fullFlowStates : singleFlowStates;
    const stepsLabels      = isMulti
        ? ["Children", "Trial details", "Done"]
        : ["Trial details", "Done"];
    const currentStepIndex = flowStates.indexOf(flowStep);

    // ── Helpers ───────────────────────────────────────────────────────────────
    const getStudentIdx = (student) =>
        students.findIndex((s) => s._tmpId === student?._tmpId);

    const clearErr = (k) =>
        setErrors((p) => { const n = { ...p }; delete n[k]; return n; });

    // ── Handlers ──────────────────────────────────────────────────────────────
    const toggleStudent = (id) => {
        if (id === undefined || id === null) return;
        setSelectedStudentIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const handleNumStudentsChange = (val) => {
        const count = Number(val) || 1;
        setNumStudents(String(count));
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
        let formatted = (value || "").replace(/[^\d]/g, "");
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
                        const md = today.getMonth() - (m - 1);
                        if (md < 0 || (md === 0 && today.getDate() < d)) calcAge--;
                        age = calcAge >= 3 && calcAge <= 100 ? calcAge : "";
                    }
                }
                return { ...s, dob: formatted, age };
            })
        );
        clearErr(`s${index}_dob`);
    };

    const handleStudentChange = (index, field, value) => {
        let classError = null;
        setStudents((prev) =>
            prev.map((s, i) => {
                if (i !== index) return s;
                const updated = { ...s, [field]: value };
                if (field === "selectedClassId") {
                    const foundClass = allClasses.find((c) => String(c.id) === String(value)) || null;
                    const alreadyCount = prev.filter(
                        (st, idx) => idx !== index && String(st.selectedClassId) === String(value)
                    ).length;
                    const remaining = (foundClass?.capacity || 0) - alreadyCount;
                    if (foundClass?.capacity === 0) {
                        updated.error = "This class has no capacity. Please select another.";
                        classError = updated.error;
                    } else if (remaining <= 0) {
                        updated.error = "Not enough space in this class for another student.";
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
            setErrors((prev) => ({ ...prev, [`s${index}_selectedClassId`]: classError }));
        }
    };

    const handleRemoveStudent = (index) => {
        setStudents((prev) => {
            const next = prev.filter((_, i) => i !== index);
            const result = next.length ? next : [createStudent()];
            setSelectedStudentIds(result.map((s) => s._tmpId));
            setNumStudents(String(result.length));
            if (result.length <= 1) setDemoMode("single");
            return result;
        });
    };

    const handleParentChange = (index, field, value) => {
        setParents((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
        clearErr(`p${index}_${field}`);
    };

    const handleAddParent = () => {
        if (parents.length < 3) setParents((prev) => [...prev, createParent()]);
    };

    const handleRemoveParent = (id) => {
        if (parents.length > 1) setParents((prev) => prev.filter((p) => p.id !== id));
    };

    const handleSameAsAboveChange = (e) => {
        const checked = e?.target?.checked || false;
        const p = parents?.[0] || {};
        setEmergency((prev) => ({
            ...prev,
            sameAsAbove:          checked,
            emergencyFirstName:   checked ? p.parentFirstName   || "" : "",
            emergencyLastName:    checked ? p.parentLastName    || "" : "",
            emergencyPhoneNumber: checked ? p.parentPhoneNumber || "" : "",
            emergencyRelation:    checked ? p.relationToChild   || "" : "",
        }));
        clearErr("e_firstName");
        clearErr("e_lastName");
        clearErr("e_phone");
        clearErr("e_relation");
    };

    const handleEmergencyChange = (field, value) => {
        setEmergency((prev) => ({ ...prev, [field]: value }));
        clearErr(`e_${(field || "").replace("emergency", "").toLowerCase()}`);
    };

    // Sync emergency when "same as above" is checked and parent data changes
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
            const parsed = new Date(value);
            if (isNaN(parsed.getTime())) return "";
            value = parsed;
        }
        if (!(value instanceof Date) || Number.isNaN(value.getTime())) return "";
        const y = value.getFullYear();
        const m = String(value.getMonth() + 1).padStart(2, "0");
        const d = String(value.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    };

    const validate = () => {
        const errs = {};
        if (!selectedVenue) errs.venue = "Required";
        if (!selectedDate)  errs.selectedDate = "Required";

        const classSelections = {};
        activeStudents.forEach((student) => {
            const i = getStudentIdx(student);
            if (!(student?.studentFirstName || "").trim())  errs[`s${i}_studentFirstName`] = "Required";
            if (!(student?.studentLastName || "").trim())   errs[`s${i}_studentLastName`]  = "Required";
            if (!student?.dob) {
                errs[`s${i}_dob`] = "Required";
            } else if (student.dob.length !== 10) {
                errs[`s${i}_dob`] = "Enter a valid date (DD/MM/YYYY)";
            } else {
                const [d, m, y] = student.dob.split("/").map(Number);
                const dobDate = new Date(y, m - 1, d);
                const isValid =
                    dobDate.getDate() === d &&
                    dobDate.getMonth() === m - 1 &&
                    dobDate.getFullYear() === y;
                if (!isValid) {
                    errs[`s${i}_dob`] = "Enter a valid date (DD/MM/YYYY)";
                } else if (dobDate > new Date()) {
                    errs[`s${i}_dob`] = "Date of birth cannot be in the future";
                }
            }
            if (!student?.gender)            errs[`s${i}_gender`]     = "Required";
            if (!(student?.medicalInfo || "").trim())errs[`s${i}_medicalInfo`]= "Required (write 'None')";
            if (!student?.selectedClassId) {
                errs[`s${i}_selectedClassId`] = "Required";
            } else {
                const clsId = student.selectedClassId;
                classSelections[clsId] = (classSelections[clsId] || 0) + 1;
                if (student.selectedClassData && classSelections[clsId] > student.selectedClassData.capacity) {
                    errs[`s${i}_selectedClassId`] = "Not enough space in this class.";
                } else if (student.selectedClassData?.capacity === 0) {
                    errs[`s${i}_selectedClassId`] = "This class has no capacity";
                } else if (student.error) {
                    errs[`s${i}_selectedClassId`] = student.error;
                }
            }
        });

        parents.forEach((p, i) => {
            if (!(p?.parentFirstName || "").trim())  errs[`p${i}_parentFirstName`]  = "Required";
            if (!(p?.parentLastName || "").trim())   errs[`p${i}_parentLastName`]   = "Required";
            if (!(p?.parentEmail || "").trim()) {
                errs[`p${i}_parentEmail`] = "Required";
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.parentEmail)) {
                errs[`p${i}_parentEmail`] = "Invalid email";
            }
            if (!(p?.parentPhoneNumber || "").trim()) errs[`p${i}_parentPhoneNumber`] = "Required";
            if (!p?.relationToChild)           errs[`p${i}_relationToChild`]   = "Required";
            if (!p?.interestReason)            errs[`p${i}_interestReason`]    = "Required";
            if (!p?.howDidYouHear)             errs[`p${i}_howDidYouHear`]     = "Required";
        });

        if (!(emergency?.emergencyFirstName || "").trim())   errs.e_firstName = "Required";
        if (!(emergency?.emergencyLastName || "").trim())    errs.e_lastName  = "Required";
        if (!(emergency?.emergencyPhoneNumber || "").trim()) errs.e_phone     = "Required";
        if (!emergency?.emergencyRelation)            errs.e_relation  = "Required";

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) {
            alert("Please check the form for errors.");
            return;
        }
        let parentData = {};
        try {
            parentData = JSON.parse(localStorage.getItem("parentData") || "{}") || {};
        } catch {
            parentData = {};
        }
        const parentId   = parentData?.id;
        const token      = localStorage.getItem("parentToken");

        const payload = {
            venueId:       selectedVenue?.venueId,
            trialDate:     toDateOnly(selectedDate),
            totalStudents: activeStudents.length,
            students: activeStudents.map((s) => ({
                studentFirstName:  s?.studentFirstName || "",
                studentLastName:   s?.studentLastName || "",
                dateOfBirth:       toDateOnly(s?.dob),
                age:               Number(s?.age) || 0,
                gender:            s?.gender || "",
                medicalInformation:s?.medicalInfo || "",
                classScheduleId:   Number(s?.selectedClassId) || null,
            })),
            parents: parents.map((p) => ({
                parentFirstName:    p?.parentFirstName || "",
                parentLastName:     p?.parentLastName || "",
                parentEmail:        p?.parentEmail || "",
                parentPhoneNumber:  p?.parentPhoneNumber || "",
                relationToChild:    p?.relationToChild || "",
                interestReason:     p?.interestReason || "",
                interestReasonOther:p?.interestReasonOther || "NA",
                howDidYouHear:      p?.howDidYouHear || "",
                isCustomReason:     p?.isCustomReason || false,
            })),
            emergency: {
                sameAsAbove:          emergency?.sameAsAbove || false,
                emergencyFirstName:   emergency?.emergencyFirstName || "",
                emergencyLastName:    emergency?.emergencyLastName || "",
                emergencyPhoneNumber: emergency?.emergencyPhoneNumber || "",
                emergencyRelation:    emergency?.emergencyRelation || "",
            },
        };

        try {
            const API_URL = import.meta.env.VITE_API_BASE_URL || "";
            const response = await axios.post(
                `${API_URL}api/parent/booking/free-trial/create/${parentId}`,
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token || ""}`,
                    },
                }
            );
            showSuccess("Success", response?.data?.message || "Free Trial Booked Successfully");
            setFlowStep("D");
        } catch (err) {
            console.error("Booking Error:", err);
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.error   ||
                "Something went wrong while booking the trial.";
            showError("Error", msg);
        }
    };

    // ── UI class helpers ──────────────────────────────────────────────────────
    const inputClass = (hasErr) =>
        `w-full font-inherit text-[14px] border rounded-[10px] px-3.5 py-3 focus:outline-none focus:ring-2 transition-colors ${
            hasErr
                ? "border-[#e53e3e] focus:ring-[#e53e3e]/30 bg-[#fff5f5]"
                : "border-[#e7ebf1] focus:ring-[#3b7df6]"
        }`;

    const labelClass = "block text-[13px] font-semibold mb-1.5 text-[#1f2733]";

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen booking-page bg-[#f4f6f9] text-[#1f2733] font-['Poppins',sans-serif] pb-28 sm:pb-16 pt-5 md:pt-0">


            {/* ── Navy band ──────────────────────────────────────────────────── */}
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
                Book a Free Trial
            </div>

            <div className="max-w-[1040px] mx-auto md:px-6 pt-5 px-2">

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
                <div className="bg-white rounded-[16px] shadow-[0_8px_30px_rgba(20,40,80,0.08)] md:p-8 p-4">

                    {/* ════════════════════════════════════════════════════════
                        SCREEN A  —  Who's this trial for? (multi only)
                    ════════════════════════════════════════════════════════ */}
                    {flowStep === "A" && (
                        <div>
                            <div className="text-center text-[24px] font-bold mb-1.5 tracking-tight">
                                Who's this trial for?
                            </div>
                            <div className="text-center text-[#6b7685] text-[14px] mb-6">
                                Select the children you'd like to book a free trial for
                            </div>

                            {/* Number of children picker */}
                            <div className="flex justify-center mb-6">
                                <div className="flex items-center gap-3 bg-[#f4f6f9] rounded-[12px] px-4 py-3">
                                    <span className="text-[13px] font-semibold text-[#6b7685] whitespace-nowrap">
                                        Number of children:
                                    </span>
                                    <div className="w-[90px]">
                                        <Select
                                            styles={selectStyles}
                                            options={numStudentsOptions}
                                            value={numStudentsOptions.find((o) => o.value === numStudents) || numStudentsOptions[0]}
                                            isSearchable={false}
                                            onChange={(option) => handleNumStudentsChange(option?.value || "1")}
                                        />
                                    </div>
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
                            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e7ebf1] p-4 z-40 flex gap-3 w-full sm:relative sm:bottom-auto sm:left-auto sm:right-auto sm:bg-transparent sm:border-t-0 sm:p-0 sm:z-auto justify-center sm:mt-7 sm:w-auto">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="sm:w-auto font-semibold text-[15px] rounded-[12px] md:px-8 py-3.5 border border-[#e7ebf1] text-[#1f2733] bg-white px-4"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={selectedStudentIds.length === 0}
                                    onClick={() => setFlowStep("B")}
                                    className="sm:w-auto font-semibold text-[15px] rounded-[12px] md:px-8 py-3.5 border border-[#3b7df6] text-white bg-[#3b7df6] disabled:opacity-50 hover:bg-[#2f6ae0] px-4"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ════════════════════════════════════════════════════════
                        SCREEN B  —  Main booking form
                    ════════════════════════════════════════════════════════ */}
                    {flowStep === "B" && (
                        <div>
                            <div className="text-center text-[24px] font-bold mb-1.5 tracking-tight">
                                Book {activeNames}'s free trial
                            </div>
                            <div className="text-center text-[#6b7685] text-[14px] mb-6">
                                Confirm the details below and we'll get you booked in
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
                                        onClick={() => setIsChangingVenue(!isChangingVenue)}
                                        className="bg-white/15 border border-white/35 text-white rounded-[20px] px-3.5 py-1.5 text-[12px] font-semibold"
                                    >
                                        {isChangingVenue ? "Cancel" : "Change venue"}
                                    </button>
                                </div>

                                {/* Venue dropdown (visible when changing) */}
                                {isChangingVenue && (
                                    <div className="border border-t-0 border-[#e7ebf1] px-5 py-3.5 bg-[#f4f6f9]">
                                        <Select
                                            styles={selectStyles}
                                            options={venueSelectOptions}
                                            value={venueSelectOptions.find((o) => o.value === selectedVenue?.venueId) || null}
                                            placeholder={venueSelectOptions.length ? "Select a venue…" : "No venues available"}
                                            isDisabled={venueSelectOptions.length === 0}
                                            onChange={(option) => {
                                                if (!option) return;
                                                setSelectedVenue(option.all);
                                                setStudents((prev) =>
                                                    prev.map((s) => ({ ...s, selectedClassId: "", selectedClassData: null }))
                                                );
                                                setIsChangingVenue(false);
                                                clearErr("venue");
                                            }}
                                        />
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
                                                <Select
                                                    styles={errors[`s${sIdx}_selectedClassId`] ? selectStylesError : selectStyles}
                                                    options={classSelectOptions}
                                                    value={classSelectOptions.find((o) => String(o.value) === String(s.selectedClassId)) || null}
                                                    isDisabled={!selectedVenue || classSelectOptions.length === 0}
                                                    placeholder={!selectedVenue ? "Select a venue first" : classSelectOptions.length ? "Choose a class…" : "No classes available"}
                                                    onChange={(option) =>
                                                        handleStudentChange(sIdx, "selectedClassId", option?.value ?? "")
                                                    }
                                                />
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

                            {/* ── Trial date calendar ─────────────────────────────────────── */}
                            <div className="mb-6">
                                <div className="text-[13px] font-bold uppercase tracking-[0.04em] text-[#6b7685] mb-3">
                                    Select your trial date
                                </div>
                                <div className="border border-[#e7ebf1] xl:w-[60%] rounded-[14px] p-8">
                                    <CalendarWidget
                                        selectedDate={selectedDate}
                                        onSelectDate={setSelectedDate}
                                        availableDates={selectedVenue ? availableDatesSet : null}
                                    />
                                    {errors.selectedDate && (
                                        <p className="text-[12px] text-[#e53e3e] mt-1">{errors.selectedDate}</p>
                                    )}
                                </div>
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
                                                        onChange={(e) => handleStudentChange(sIdx, "studentFirstName", e.target.value)}
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
                                                        onChange={(e) => handleStudentChange(sIdx, "studentLastName", e.target.value)}
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
                                                    <Select
                                                        styles={errors[`s${sIdx}_gender`] ? selectStylesError : selectStyles}
                                                        placeholder="Select gender"
                                                        options={genderOptions}
                                                        value={
                                                            student.gender
                                                                ? {
                                                                    value: student.gender,
                                                                    label: genderOptions.find((g) => g.value === student.gender)?.label || "",
                                                                }
                                                                : null
                                                        }
                                                        onChange={(option) =>
                                                            handleStudentChange(sIdx, "gender", option?.value || "")
                                                        }
                                                    />
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
                                        disabled={parents.length >= 3}
                                        onClick={handleAddParent}
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
                                                onClick={() => handleRemoveParent(parent.id)}
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
                                                    onChange={(e) => handleParentChange(index, "parentEmail", e.target.value)}
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
                                                <Select
                                                    styles={errors[`p${index}_relationToChild`] ? selectStylesError : selectStyles}
                                                    placeholder="Select relation"
                                                    options={relationOptions}
                                                    value={
                                                        parent.relationToChild
                                                            ? { value: parent.relationToChild, label: parent.relationToChild }
                                                            : null
                                                    }
                                                    onChange={(option) =>
                                                        handleParentChange(index, "relationToChild", option?.value || "")
                                                    }
                                                />
                                                {errors[`p${index}_relationToChild`] && (
                                                    <p className="text-[12px] text-[#e53e3e] mt-1">
                                                        {errors[`p${index}_relationToChild`]}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className={labelClass}>How did you hear about us?</label>
                                                <Select
                                                    styles={errors[`p${index}_howDidYouHear`] ? selectStylesError : selectStyles}
                                                    placeholder="Select how you heard"
                                                    options={hearOptions}
                                                    value={
                                                        parent.howDidYouHear
                                                            ? { value: parent.howDidYouHear, label: parent.howDidYouHear }
                                                            : null
                                                    }
                                                    onChange={(option) =>
                                                        handleParentChange(index, "howDidYouHear", option?.value || "")
                                                    }
                                                />
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
                                                            ← Back to List
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <Select
                                                        styles={errors[`p${index}_interestReason`] ? selectStylesError : selectStyles}
                                                        placeholder="Select your reason…"
                                                        options={interestReasonOptions}
                                                        value={
                                                            parent.interestReason
                                                                ? { value: parent.interestReason, label: parent.interestReason }
                                                                : null
                                                        }
                                                        onChange={(option) => {
                                                            if (option?.value === "Other") {
                                                                handleParentChange(index, "interestReason", "");
                                                                handleParentChange(index, "isCustomReason", true);
                                                            } else {
                                                                handleParentChange(index, "interestReason", option?.value || "");
                                                                handleParentChange(index, "isCustomReason", false);
                                                            }
                                                        }}
                                                    />
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
                                            <Select
                                                styles={errors.e_relation ? selectStylesError : selectStyles}
                                                placeholder="Select relation"
                                                options={relationOptions}
                                                isDisabled={emergency.sameAsAbove}
                                                value={
                                                    emergency.emergencyRelation
                                                        ? {
                                                            value: emergency.emergencyRelation,
                                                            label:
                                                                relationOptions.find((o) => o.value === emergency.emergencyRelation)?.label ||
                                                                emergency.emergencyRelation,
                                                        }
                                                        : null
                                                }
                                                onChange={(option) =>
                                                    handleEmergencyChange("emergencyRelation", option?.value || "")
                                                }
                                            />
                                            {errors.e_relation && (
                                                <p className="text-[12px] text-[#e53e3e] mt-1">{errors.e_relation}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── Actions ─────────────────────────────────────────────────── */}
                            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e7ebf1] p-4 z-40 flex gap-3 w-full sm:relative sm:bottom-auto sm:left-auto sm:right-auto sm:bg-transparent sm:border-t-0 sm:p-0 sm:z-auto justify-center sm:mt-7 sm:w-auto">
                                <button
                                    onClick={() => (isMulti ? setFlowStep("A") : navigate(-1))}
                                    className="sm:w-auto font-semibold text-[15px] rounded-[12px] md:px-8 py-3.5 border border-[#e7ebf1] text-[#1f2733] bg-white px-4"
                                >
                                    {isMulti ? "Back" : "Cancel"}
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="sm:w-auto font-semibold text-[15px] rounded-[12px] md:px-8 py-3.5 border border-[#1e3a6e] text-white bg-[#1e3a6e] hover:bg-[#16306e] transition-colors px-4"
                                >
                                    Book FREE Trial
                                </button>
                            </div>
                        </div>
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
                                Free Trial Booked !
                            </div>
                            <div className="text-[#6b7685] text-[15px] mb-6 max-w-[440px] mx-auto">
                                We've confirmed {activeNames}'s free trial. We'll be in touch with all the details shortly.
                            </div>
                            <button
                                onClick={() => navigate(-1)}
                                className="w-full sm:w-auto font-semibold text-[15px] rounded-[12px] px-8 py-3.5 bg-[#1e3a6e] text-white hover:bg-[#16306e] transition-colors"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default BookFreeTrial;