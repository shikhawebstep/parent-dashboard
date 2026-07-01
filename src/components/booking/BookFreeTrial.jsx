import React, { useState, useEffect } from 'react';
import CalendarWidget from './CalendarWidget';
import {
    ChevronLeft,
    Trash2,
    Check,
    MapPin,
    X,
    Loader2,
    PartyPopper,
    Calendar as CalendarIcon,
    Mail,
    User,
    Users,
    Smile,
    ShieldAlert,
    Sparkles,
    CheckCircle2,
    Phone,
    Info,
    CalendarDays,
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
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

// ── Module-level helper ───────────────────────────────────────────────────────
const formatDOBForDisplay = (isoDate) => {
    if (!isoDate || typeof isoDate !== "string") return "";
    const [y, m, d] = isoDate.split("-");
    if (!y || !m || !d) return "";
    return `${d}/${m}/${y}`;
};

// ── DOB / Age helpers for Add Child modal ─────────────────
const formatDOBInput = (raw = "") => {
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4);
};

const isValidDOB = (val = "") => {
    if (!val || typeof val !== "string") return false;
    const parts = val.split("/");
    if (parts.length !== 3) return false;
    const [d, m, y] = parts.map(Number);
    if (!d || !m || !y || Number.isNaN(d) || Number.isNaN(m) || Number.isNaN(y)) return false;
    const dob = new Date(y, m - 1, d);
    if (Number.isNaN(dob.getTime())) return false;
    if (dob.getDate() !== d || dob.getMonth() !== m - 1 || dob.getFullYear() !== y) return false;
    return dob <= new Date(); // not in the future
};

const calculateAge = (val = "") => {
    if (!isValidDOB(val)) return "";
    const [d, m, y] = val.split("/").map(Number);
    const dob = new Date(y, m - 1, d);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
    return age >= 0 ? age : "";
};

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
const selectStyles = (hasError) => ({
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
    menu: (base) => ({ ...base, borderRadius: 10, overflow: "hidden", zIndex: 9999 }),
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

// ── Component ─────────────────────────────────────────────────────────────────
const BookFreeTrial = () => {
    const { fetchVenues, venues } = useCommon();
    const { profile, fetchProfileData } = useProfile();
    const navigate = useNavigate();

    // ── Form state ────────────────────────────────────────────────────────────
    const [selectedVenue, setSelectedVenue]   = useState(null);
    const [selectedDate,  setSelectedDate]    = useState(null);
    const [students,      setStudents]        = useState([createStudent()]);
    const [parents,       setParents]         = useState([createParent()]);
    const [emergency,     setEmergency]       = useState(INIT_EMERGENCY);
    const [errors,        setErrors]          = useState({});

    // ── Wizard state ──────────────────────────────────────────────────────────
    const [flowStep,            setFlowStep]            = useState("form");
    const [selectedStudentIds,  setSelectedStudentIds]  = useState([]);
    const [isChangingVenue,     setIsChangingVenue]     = useState(false);

    // ── Add Child Modal state ─────────────────────────────────────────────────
    const [isAddChildOpen, setIsAddChildOpen] = useState(false);
    const [newChildForm, setNewChildForm]     = useState({
        studentFirstName: "",
        studentLastName: "",
        dob: "",
        gender: "",
        medicalInfo: "",
    });
    const [newChildErrors, setNewChildErrors] = useState({});
    const [isSavingChild, setIsSavingChild]   = useState(false);

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
        setSelectedStudentIds(finalStudents.map((s) => s._tmpId));
        setFlowStep("form");

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

    // ── Selected students ─────────────────────────────────────────────────────
    const activeStudents = students.filter((s) => selectedStudentIds.includes(s._tmpId));

    const activeNames = activeStudents
        .map((s) => s?.studentFirstName || "Child")
        .join(" & ") || "your child";

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
            return result;
        });
    };

    const handleAddStudents = () => {
        setNewChildForm({
            studentFirstName: "",
            studentLastName: "",
            dob: "",
            gender: "",
            medicalInfo: "",
        });
        setNewChildErrors({});
        setIsAddChildOpen(true);
    };

    const handleNewChildDOBChange = (e) => {
        const formatted = formatDOBInput(e?.target?.value);
        setNewChildForm((f) => ({ ...f, dob: formatted }));
        if (newChildErrors.dob) setNewChildErrors((errs) => ({ ...errs, dob: "" }));
    };

    const validateNewChild = () => {
        const errs = {};
        if (!newChildForm.studentFirstName.trim()) errs.studentFirstName = "First name is required";
        if (!newChildForm.studentLastName.trim()) errs.studentLastName = "Last name is required";
        if (!isValidDOB(newChildForm.dob)) errs.dob = "Enter a valid date (DD/MM/YYYY)";
        if (!newChildForm.gender) errs.gender = "Gender is required";
        setNewChildErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSaveNewChild = () => {
        if (!validateNewChild()) return;
        setIsSavingChild(true);

        const newStudent = {
            ...createStudent(),
            studentFirstName: newChildForm.studentFirstName.trim(),
            studentLastName: newChildForm.studentLastName.trim(),
            dob: newChildForm.dob,
            age: calculateAge(newChildForm.dob),
            gender: newChildForm.gender,
            medicalInfo: newChildForm.medicalInfo.trim() || "None",
        };

        setStudents((prev) => {
            const next = [...prev, newStudent];
            setSelectedStudentIds((sel) => [...sel, newStudent._tmpId]);
            return next;
        });

        setIsSavingChild(false);
        setIsAddChildOpen(false);
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
                interestReasonOther: p?.interestReasonOther || "NA",
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

    const labelClass = "block text-[14px] font-semibold mb-1.5 text-[#1f2733]";

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen booking-page bg-[#f8fafc] text-[#1f2733] font-['Poppins',sans-serif] pb-28 sm:pb-16 pt-5">
            {/* ── Navy band ──────────────────────────────────────────────────── */}
            <div className="bg-[#1e3a6e] text-white mx-6 rounded-[16px] px-6 py-4.5 flex items-center justify-between gap-3 font-bold text-[18px] shadow-md">
                <div className="flex items-center gap-3">
                    <span
                        className="cursor-pointer opacity-90 hover:opacity-100 flex items-center p-1 hover:bg-white/10 rounded-lg transition-all"
                        onClick={() => navigate(-1)}
                    >
                        <ChevronLeft size={22} />
                    </span>
                    <span>Book a Free Trial</span>
                </div>
                <div className="bg-[#3b7df6] text-white text-[12px] font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                    <Sparkles size={13} />
                    <span>Free Session</span>
                </div>
            </div>

            <div className="max-w-[1140px] mx-auto md:px-6 pt-6 px-3">
                {flowStep !== "D" ? (
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
                        
                        {/* ── Left Column: Form Sections ── */}
                        <div className="flex flex-col gap-6">
                            
                            {/* Card 1: Who's this trial for? */}
                            <div className="bg-white rounded-[20px] p-6 border border-[#e2e8f0] shadow-sm hover:shadow-md transition-shadow duration-300">
                                <div className="flex items-center gap-2.5 mb-5">
                                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-[#3b7df6]">
                                        <Users size={18} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[16px] text-gray-900">Who's this trial for?</h3>
                                        <p className="text-[12px] text-[#6b7685]">Select children or add a new child profile</p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                                    <button className="flex-1 sm:flex-none font-semibold text-[13px] rounded-[30px] px-5 py-2.5 bg-[#eaf1fe] text-[#3b7df6] border border-[#eaf1fe] flex items-center justify-center gap-1.5 transition-all">
                                        <CheckCircle2 size={14} />
                                        Select Existing Child
                                    </button>
                                    <button 
                                        onClick={handleAddStudents} 
                                        className="flex-1 sm:flex-none font-semibold text-[13px] rounded-[30px] px-5 py-2.5 bg-white text-[#6b7685] border border-[#e2e8f0] hover:border-[#3b7df6] hover:text-[#3b7df6] flex items-center justify-center gap-1.5 transition-all"
                                    >
                                        + Add a New Child
                                    </button>
                                </div>

                                {/* Student cards grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {students.map((s, i) => {
                                        const isSel = selectedStudentIds.includes(s._tmpId);
                                        return (
                                            <div
                                                key={s._tmpId ?? i}
                                                onClick={() => toggleStudent(s._tmpId)}
                                                className={`border-[1.5px] rounded-[16px] p-4 cursor-pointer transition-all relative flex flex-col justify-between ${
                                                    isSel
                                                        ? "border-[#3b7df6] bg-blue-50/20 ring-4 ring-[#3b7df6]/5 shadow-sm"
                                                        : "border-[#e2e8f0] hover:border-[#bcd0f5] bg-white"
                                                }`}
                                            >
                                                {/* Checkbox indicator */}
                                                <div
                                                    className={`absolute top-3.5 right-3.5 w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center text-white text-[11px] transition-all ${
                                                        isSel ? "bg-[#3b7df6] border-[#3b7df6]" : "border-[#e2e8f0]"
                                                    }`}
                                                >
                                                    {isSel && <Check size={11} />}
                                                </div>

                                                <div className="flex items-center gap-2.5 mb-3.5">
                                                    <div className="w-[36px] h-[36px] rounded-full bg-[#eaf1fe] flex items-center justify-center font-bold text-[#3b7df6] text-[14px]">
                                                        {(s.studentFirstName || "?")[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-[15px] text-gray-800 leading-tight">
                                                            {s.studentFirstName || `Child ${i + 1}`}
                                                        </h4>
                                                        <span className="text-[11px] text-gray-400 capitalize">{s.gender || "Gender —"}</span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-gray-100">
                                                    <div>
                                                        <div className="text-[10px] text-[#6b7685] uppercase tracking-wider font-semibold">Age</div>
                                                        <div className="text-[13px] font-bold text-gray-700">{s.age ? `${s.age} yrs` : "–"}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] text-[#6b7685] uppercase tracking-wider font-semibold">Medical</div>
                                                        <div className="text-[13px] font-bold text-gray-700 truncate" title={s.medicalInfo}>{s.medicalInfo || "–"}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Card 2: Venue & Class select */}
                            <div className="bg-white rounded-[20px] p-6 border border-[#e2e8f0] shadow-sm hover:shadow-md transition-shadow duration-300">
                                <div className="flex items-center gap-2.5 mb-5">
                                    <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                                        <MapPin size={18} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[16px] text-gray-900">Venue & Class schedules</h3>
                                        <p className="text-[12px] text-[#6b7685]">Where and when would you like to attend?</p>
                                    </div>
                                </div>

                                <div className="border border-[#e2e8f0] rounded-[16px]  bg-gray-50/30">
                                    {/* Venue Banner */}
                                    <div className="bg-blue-500 rounded-tl-[16px] rounded-tr-[16px] text-white px-5 py-4 flex items-center justify-between gap-3 flex-wrap">
                                        <div className="flex items-center gap-2.5 font-bold text-[14px]">
                                            <MapPin size={15} />
                                            {selectedVenue?.venueName || "Select a Football Venue…"}
                                        </div>
                                        <button
                                            onClick={() => setIsChangingVenue(!isChangingVenue)}
                                            className="bg-white/20 border border-white/30 text-white rounded-full px-4 py-1.5 text-[11px] font-bold hover:bg-white/30 transition-all"
                                        >
                                            {isChangingVenue ? "Cancel" : "Change Venue"}
                                        </button>
                                    </div>

                                    {isChangingVenue && (
                                            <div className="border-b border-[#e2e8f0] px-5 py-4 bg-[#f8fafc] ">
                                            <label className="block text-[13px] font-semibold mb-1.5 text-[#1f2733]">Football Venue</label>
                                            <Select
                                                styles={selectStyles(false)}
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

                                    {/* Per-student Class List */}
                                    {activeStudents.length === 0 ? (
                                        <div className="p-6 text-center text-[#6b7685] text-[13.5px] bg-white">
                                            Please select a child profile above to configure schedules.
                                        </div>
                                    ) : (
                                        <div className=" divide-y divide-gray-100 ">
                                            {activeStudents.map((s, idx) => {
                                                const sIdx = getStudentIdx(s);
                                                return (
                                                    <div key={s._tmpId ?? idx} className="p-5 flex flex-col gap-3.5">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-[30px] h-[30px] rounded-full bg-blue-50 text-[#3b7df6] flex items-center justify-center font-bold text-[12px]">
                                                                {(s.studentFirstName || "?")[0].toUpperCase()}
                                                            </div>
                                                            <span className="font-bold text-[14px] text-gray-800">
                                                                {s.studentFirstName || "Child"}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <label className="block text-[12px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                                                                Choose Football Class Schedule
                                                            </label>
                                                            <Select
                                                                styles={selectStyles(!!errors[`s${sIdx}_selectedClassId`])}
                                                                options={classSelectOptions}
                                                                value={classSelectOptions.find((o) => String(o.value) === String(s.selectedClassId)) || null}
                                                                isDisabled={!selectedVenue || classSelectOptions.length === 0}
                                                                placeholder={!selectedVenue ? "Select a venue first" : classSelectOptions.length ? "Choose a class…" : "No classes available"}
                                                                onChange={(option) =>
                                                                    handleStudentChange(sIdx, "selectedClassId", option?.value ?? "")
                                                                }
                                                            />
                                                            {errors[`s${sIdx}_selectedClassId`] && (
                                                                <p className="text-[12px] text-[#e53e3e] mt-1.5 flex items-center gap-1">
                                                                    <Info size={12} />
                                                                    {errors[`s${sIdx}_selectedClassId`]}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                {errors.venue && (
                                    <p className="text-[12px] text-[#e53e3e] mt-2 flex items-center gap-1"><Info size={12} />{errors.venue}</p>
                                )}
                            </div>

                            {/* Card 3: Date calendar */}
                            <div className="bg-white rounded-[20px] p-6 border border-[#e2e8f0] shadow-sm hover:shadow-md transition-shadow duration-300">
                                <div className="flex items-center gap-2.5 mb-5">
                                    <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                                        <CalendarDays size={18} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[16px] text-gray-900">Select Trial Date</h3>
                                        <p className="text-[12px] text-[#6b7685]">Pick a date from our session calendar</p>
                                    </div>
                                </div>

                                <div className="border border-[#e2e8f0] rounded-[16px] p-6 bg-[#fdfdfd] flex justify-center">
                                    <div className="w-full max-w-[420px]">
                                        <CalendarWidget
                                            selectedDate={selectedDate}
                                            onSelectDate={setSelectedDate}
                                            availableDates={selectedVenue ? availableDatesSet : null}
                                        />
                                        {errors.selectedDate && (
                                            <p className="text-[12px] text-[#e53e3e] mt-2.5 flex items-center gap-1">
                                                <Info size={12} />
                                                {errors.selectedDate}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Card 4: Student detail inputs */}
                            {activeStudents.length > 0 && (
                                <div className="bg-white rounded-[20px] p-6 border border-[#e2e8f0] shadow-sm hover:shadow-md transition-shadow duration-300">
                                    <div className="flex items-center gap-2.5 mb-6">
                                        <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                                            <Smile size={18} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[16px] text-gray-900">Configure child profiles</h3>
                                            <p className="text-[12px] text-[#6b7685]">Enter information for registration</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-6">
                                        {activeStudents.map((student, idx) => {
                                            const sIdx = getStudentIdx(student);
                                            return (
                                                <div
                                                    key={student._tmpId ?? idx}
                                                    className="border border-[#e2e8f0] rounded-[16px] p-5 bg-gray-50/10 relative"
                                                >
                                                    {/* Card sub header */}
                                                    <div className="flex items-center gap-2.5 mb-5.5 pb-3 border-b border-gray-100">
                                                        <div className="w-[30px] h-[30px] rounded-full bg-blue-50 text-[#3b7df6] flex items-center justify-center font-bold text-[12px]">
                                                            {(student.studentFirstName || "?")[0].toUpperCase()}
                                                        </div>
                                                        <span className="font-bold text-[14px] text-gray-800">
                                                            {student.studentFirstName || `Child ${idx + 1}`} details
                                                        </span>
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
                                                                <p className="text-[12px] text-[#e53e3e] mt-1.5 flex items-center gap-1"><Info size={12} />{errors[`s${sIdx}_studentFirstName`]}</p>
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
                                                                <p className="text-[12px] text-[#e53e3e] mt-1.5 flex items-center gap-1"><Info size={12} />{errors[`s${sIdx}_studentLastName`]}</p>
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
                                                                <p className="text-[12px] text-[#e53e3e] mt-1.5 flex items-center gap-1"><Info size={12} />{errors[`s${sIdx}_dob`]}</p>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <label className={labelClass}>Age (Automatic)</label>
                                                            <input
                                                                disabled
                                                                placeholder="Automatic entry"
                                                                className={`${inputClass(false)} bg-[#f8fafc] text-[#6b7685] border-dashed cursor-not-allowed`}
                                                                value={student.age}
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className={labelClass}>Gender</label>
                                                            <Select
                                                                styles={selectStyles(!!errors[`s${sIdx}_gender`])}
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
                                                                <p className="text-[12px] text-[#e53e3e] mt-1.5 flex items-center gap-1"><Info size={12} />{errors[`s${sIdx}_gender`]}</p>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <label className={labelClass}>Medical info / Allergies</label>
                                                            <input
                                                                placeholder="e.g. Asthma, or write 'None'"
                                                                className={inputClass(errors[`s${sIdx}_medicalInfo`])}
                                                                value={student.medicalInfo}
                                                                onChange={(e) =>
                                                                    handleStudentChange(sIdx, "medicalInfo", e.target.value)
                                                                }
                                                            />
                                                            {errors[`s${sIdx}_medicalInfo`] && (
                                                                <p className="text-[12px] text-[#e53e3e] mt-1.5 flex items-center gap-1"><Info size={12} />{errors[`s${sIdx}_medicalInfo`]}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Card 5: Parent details */}
                            <div className="bg-white rounded-[20px] p-6 border border-[#e2e8f0] shadow-sm hover:shadow-md transition-shadow duration-300">
                                <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100 flex-wrap gap-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
                                            <User size={18} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[16px] text-gray-900">Parent / Guardian details</h3>
                                            <p className="text-[12px] text-[#6b7685]">Who should we contact for booking details?</p>
                                        </div>
                                    </div>
                                    <button
                                        disabled={parents.length >= 3}
                                        onClick={handleAddParent}
                                        className={`bg-[#1e3a6e] text-white px-4 py-2 rounded-xl text-[12px] font-bold hover:bg-[#16306e] transition-colors flex items-center gap-1.5 shadow-sm ${
                                            parents.length >= 3 ? "cursor-not-allowed opacity-50" : ""
                                        }`}
                                    >
                                        + Add Guardian
                                    </button>
                                </div>

                                <div className="flex flex-col gap-6">
                                    {parents.map((parent, index) => (
                                        <div
                                            key={parent.id}
                                            className="border border-[#e2e8f0] rounded-[16px] p-5 relative bg-[#fdfdfd]"
                                        >
                                            {/* Remove button */}
                                            {index > 0 && (
                                                <button
                                                    onClick={() => handleRemoveParent(parent.id)}
                                                    className="absolute right-4 top-4 text-[#e53e3e] hover:text-red-700 flex items-center gap-1 text-[12px] font-bold transition-all"
                                                >
                                                    <Trash2 size={13} />
                                                    Remove
                                                </button>
                                            )}

                                            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-4">
                                                Parent / Guardian #{index + 1}
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
                                                        <p className="text-[12px] text-[#e53e3e] mt-1.5 flex items-center gap-1"><Info size={12} />{errors[`p${index}_parentFirstName`]}</p>
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
                                                        <p className="text-[12px] text-[#e53e3e] mt-1.5 flex items-center gap-1"><Info size={12} />{errors[`p${index}_parentLastName`]}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className={labelClass}>Email address</label>
                                                    <input
                                                        type="email"
                                                        placeholder="Enter email address"
                                                        className={inputClass(errors[`p${index}_parentEmail`])}
                                                        value={parent.parentEmail}
                                                        onChange={(e) => handleParentChange(index, "parentEmail", e.target.value)}
                                                    />
                                                    {errors[`p${index}_parentEmail`] && (
                                                        <p className="text-[12px] text-[#e53e3e] mt-1.5 flex items-center gap-1"><Info size={12} />{errors[`p${index}_parentEmail`]}</p>
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
                                                        <p className="text-[12px] text-[#e53e3e] mt-1.5 flex items-center gap-1"><Info size={12} />{errors[`p${index}_parentPhoneNumber`]}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className={labelClass}>Relation to child</label>
                                                    <Select
                                                        styles={selectStyles(!!errors[`p${index}_relationToChild`])}
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
                                                        <p className="text-[12px] text-[#e53e3e] mt-1.5 flex items-center gap-1"><Info size={12} />{errors[`p${index}_relationToChild`]}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className={labelClass}>How did you hear about us?</label>
                                                    <Select
                                                        styles={selectStyles(!!errors[`p${index}_howDidYouHear`])}
                                                        placeholder="Select option"
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
                                                        <p className="text-[12px] text-[#e53e3e] mt-1.5 flex items-center gap-1"><Info size={12} />{errors[`p${index}_howDidYouHear`]}</p>
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
                                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#3b7df6] font-bold"
                                                            >
                                                                ← Back to List
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <Select
                                                            styles={selectStyles(!!errors[`p${index}_interestReason`])}
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
                                                        <p className="text-[12px] text-[#e53e3e] mt-1.5 flex items-center gap-1"><Info size={12} />{errors[`p${index}_interestReason`]}</p>
                                                    )}
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className={labelClass}>Tell us a bit more (optional)</label>
                                                    <textarea
                                                        placeholder="Anything else you'd like to share with the coaches?"
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
                            </div>

                            {/* Card 6: Emergency details */}
                            <div className="bg-white rounded-[20px] p-6 border border-[#e2e8f0] shadow-sm hover:shadow-md transition-shadow duration-300">
                                <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-gray-100">
                                    <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
                                        <ShieldAlert size={18} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[16px] text-gray-900">Emergency contact</h3>
                                        <p className="text-[12px] text-[#6b7685]">Required for student safety during training</p>
                                    </div>
                                </div>

                                <div className="border border-[#e2e8f0] rounded-[16px] p-5 bg-[#fdfdfd]">
                                    <label className="flex items-center gap-2.5 cursor-pointer mb-4.5 select-none">
                                        <input
                                            type="checkbox"
                                            checked={emergency.sameAsAbove}
                                            onChange={handleSameAsAboveChange}
                                            className="rounded border-[#e2e8f0] text-[#3b7df6] focus:ring-[#3b7df6] w-4.5 h-4.5"
                                        />
                                        <span className="text-[13px] text-[#6b7685] font-semibold">
                                            Same as Parent / Guardian #1 above
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
                                                <p className="text-[12px] text-[#e53e3e] mt-1.5 flex items-center gap-1"><Info size={12} />{errors.e_firstName}</p>
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
                                                <p className="text-[12px] text-[#e53e3e] mt-1.5 flex items-center gap-1"><Info size={12} />{errors.e_lastName}</p>
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
                                                <p className="text-[12px] text-[#e53e3e] mt-1.5 flex items-center gap-1"><Info size={12} />{errors.e_phone}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className={labelClass}>Relation to child</label>
                                            <Select
                                                styles={selectStyles(!!errors.e_relation)}
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
                                                <p className="text-[12px] text-[#e53e3e] mt-1.5 flex items-center gap-1"><Info size={12} />{errors.e_relation}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Right Column: Sticky Summary Sidebar ── */}
                        <div className="lg:sticky lg:top-6 flex flex-col gap-5">
                            
                            {/* Summary Card */}
                            <div className="bg-white rounded-[20px] p-6 border border-[#e2e8f0] shadow-sm">
                                <h3 className="font-bold text-[16px] text-gray-900 mb-4 pb-2.5 border-b border-gray-100 flex items-center gap-2">
                                    <Sparkles size={16} className="text-[#3b7df6]" />
                                    Trial Summary
                                </h3>

                                <div className="flex flex-col gap-4 mb-5">
                                    {/* Venue */}
                                    <div className="flex gap-3 items-start">
                                        <MapPin className="text-[#3b7df6] w-4 h-4 mt-0.5 shrink-0" />
                                        <div>
                                            <div className="text-[11px] font-bold uppercase text-gray-400 tracking-wider">Venue</div>
                                            <div className="text-[13px] font-bold text-gray-700 leading-tight">
                                                {selectedVenue?.venueName || "Not selected"}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Date */}
                                    <div className="flex gap-3 items-start">
                                        <CalendarIcon className="text-[#3b7df6] w-4 h-4 mt-0.5 shrink-0" />
                                        <div>
                                            <div className="text-[11px] font-bold uppercase text-gray-400 tracking-wider">Session Date</div>
                                            <div className="text-[13px] font-bold text-gray-700 leading-tight">
                                                {selectedDate ? formatDOBForDisplay(toDateOnly(selectedDate)) || selectedDate.toLocaleDateString('en-GB') : "Not selected"}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Children & Classes */}
                                    <div className="flex gap-3 items-start">
                                        <User className="text-[#3b7df6] w-4 h-4 mt-0.5 shrink-0" />
                                        <div className="w-full">
                                            <div className="text-[11px] font-bold uppercase text-gray-400 tracking-wider">Attendees & classes</div>
                                            {activeStudents.length === 0 ? (
                                                <div className="text-[13px] text-[#6b7685] italic">No child selected</div>
                                            ) : (
                                                <div className="flex flex-col gap-2 mt-1">
                                                    {activeStudents.map((s, i) => (
                                                        <div key={s._tmpId ?? i} className="bg-gray-50 rounded-lg p-2.5 border border-gray-100/50">
                                                            <div className="text-[13px] font-bold text-gray-800 leading-none mb-1">
                                                                {s.studentFirstName || "Unnamed child"}
                                                            </div>
                                                            <div className="text-[11px] text-gray-500 font-medium">
                                                                {s.selectedClassData?.className 
                                                                    ? `${s.selectedClassData.className} (${s.selectedClassData.dayOfWeek})` 
                                                                    : "No class selected"}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-4.5 mb-5">
                                    <div className="flex items-center justify-between text-gray-900 mb-1">
                                        <span className="font-bold text-[14px]">Registration Fee</span>
                                        <span className="text-[#6b7685] line-through text-[13px]">£20.00</span>
                                    </div>
                                    <div className="flex items-center justify-between text-gray-900">
                                        <span className="font-bold text-[14px]">Free Trial Cost</span>
                                        <span className="text-emerald-500 font-extrabold text-[15px] bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider">Free</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={activeStudents.length === 0}
                                    className="w-full font-bold text-[14.5px] rounded-2xl py-4 border border-[#3b7df6] text-white bg-[#3b7df6] hover:bg-[#2f6ae0] disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md shadow-[#3b7df6]/10"
                                >
                                    Confirm Free Trial Booking
                                </button>
                                
                                <button
                                    onClick={() => navigate(-1)}
                                    className="w-full mt-3 font-semibold text-[13.5px] text-gray-500 hover:text-gray-700 py-2.5 text-center transition-all bg-transparent border-0"
                                >
                                    Cancel & Return
                                </button>
                            </div>
                            
                            {/* Guarantee / Value Card */}
                            <div className="bg-[#f8fafc] rounded-2xl p-4.5 border border-dashed border-[#cbd5e1] text-gray-500 text-[12px] flex gap-3">
                                <ShieldAlert size={18} className="text-[#3b7df6] shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-gray-700 mb-0.5">Samba Soccer Guarantee</h4>
                                    <p className="leading-relaxed">All free trials include full coaching instruction in a safe, vetted venue. There is no commitment to continue after the session.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* ════════════════════════════════════════════════════════
                        Success Screen D
                    ════════════════════════════════════════════════════════ */
                    <div className="max-w-[580px] mx-auto bg-white rounded-[24px] border border-[#e2e8f0] p-8 shadow-sm text-center">
                        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-[#21b573]">
                            <PartyPopper size={28} />
                        </div>
                        <h2 className="text-[22px] font-extrabold text-gray-900 leading-tight mb-1 flex items-center justify-center gap-2">
                            Free Trial Booked!
                        </h2>
                        <p className="text-gray-500 text-[14px] mb-6 max-w-[420px] mx-auto">
                            Awesome! {activeNames}'s free trial is fully confirmed. Here are the registration details:
                        </p>

                        <div className="border border-[#e2e8f0] rounded-[20px] overflow-hidden text-left mb-6.5">
                            <div className="bg-gradient-to-r from-[#1e3a6e] to-[#2f5aa0] text-white px-5 py-4 font-bold text-[14.5px] flex items-center gap-2">
                                <MapPin size={15} /> 
                                {selectedVenue?.venueName || "Trinity Sports Centre"}
                            </div>
                            <div className="p-5 divide-y divide-gray-100 bg-[#fcfdfd]">
                                {activeStudents.map((s, i) => (
                                    <div key={s._tmpId ?? i} className="flex items-start gap-3 py-3.5 first:pt-1">
                                        <User size={15} className="text-[#3b7df6] mt-0.5 shrink-0" /> 
                                        <div>
                                            <div className="text-[14px] font-bold text-gray-800">{s.studentFirstName} {s.studentLastName}</div>
                                            <div className="text-[12px] text-gray-500 font-medium">{s.selectedClassData?.className || "Class (Age Group)"}</div>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex items-center gap-3 py-3.5 last:pb-1">
                                    <CalendarIcon size={15} className="text-[#3b7df6] shrink-0" /> 
                                    <div>
                                        <div className="text-[12px] text-gray-400 font-bold uppercase tracking-wide">Session Date</div>
                                        <div className="text-[14px] font-bold text-gray-800">
                                            {selectedDate ? formatDOBForDisplay(toDateOnly(selectedDate)) || selectedDate.toLocaleDateString('en-GB') : "-"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50/30 rounded-xl p-4 text-[12.5px] text-gray-600 mb-8 flex items-start gap-2.5 text-left border border-blue-50/50">
                            <Mail size={15} className="text-[#3b7df6] shrink-0 mt-0.5" />
                            <span>A confirmation email with your booking slot, venue details, and coach contact info has been sent to your inbox.</span>
                        </div>

                        <button
                            onClick={() => navigate(-1)}
                            className="w-full sm:w-auto font-bold text-[14.5px] rounded-xl px-12 py-3.5 border border-[#21b573] text-white bg-[#21b573] hover:bg-[#1a935d] hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md shadow-emerald-500/10"
                        >
                            Finish & Return
                        </button>
                    </div>
                )}
            </div>

            {/* ── Add Child Modal ── */}
            <AnimatePresence>
                {isAddChildOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto"
                        onClick={() => !isSavingChild && setIsAddChildOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            transition={{ type: "spring", duration: 0.4 }}
                            className="bg-white rounded-3xl w-full max-w-[600px] shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex justify-between items-center px-7 py-5 border-b border-gray-100">
                                <div>
                                    <span className="text-[12px] uppercase tracking-wider text-[#3b7df6] font-bold">New Child Profile</span>
                                    <h2 className="text-[20px] font-bold text-gray-900 leading-tight">Add a new child</h2>
                                </div>
                                <button
                                    onClick={() => !isSavingChild && setIsAddChildOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
                                >
                                    <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-7 overflow-y-auto">
                                <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                                    {/* First name */}
                                    <div>
                                        <label className="block text-[14px] font-semibold mb-1.5">First name</label>
                                        <input
                                            className={inputClass(!!newChildErrors.studentFirstName)}
                                            value={newChildForm.studentFirstName}
                                            onChange={(e) => {
                                                setNewChildForm((f) => ({ ...f, studentFirstName: e.target.value }));
                                                if (newChildErrors.studentFirstName) setNewChildErrors((errs) => ({ ...errs, studentFirstName: "" }));
                                            }}
                                            placeholder="Enter first name"
                                        />
                                        {newChildErrors.studentFirstName && <p className="text-[12px] text-[#e53e3e] mt-1">{newChildErrors.studentFirstName}</p>}
                                    </div>

                                    {/* Last name */}
                                    <div>
                                        <label className="block text-[14px] font-semibold mb-1.5">Last name</label>
                                        <input
                                            className={inputClass(!!newChildErrors.studentLastName)}
                                            value={newChildForm.studentLastName}
                                            onChange={(e) => {
                                                setNewChildForm((f) => ({ ...f, studentLastName: e.target.value }));
                                                if (newChildErrors.studentLastName) setNewChildErrors((errs) => ({ ...errs, studentLastName: "" }));
                                            }}
                                            placeholder="Enter last name"
                                        />
                                        {newChildErrors.studentLastName && <p className="text-[12px] text-[#e53e3e] mt-1">{newChildErrors.studentLastName}</p>}
                                    </div>

                                    {/* Date of birth */}
                                    <div>
                                        <label className="block text-[14px] font-semibold mb-1.5">Date of birth</label>
                                        <input
                                            className={inputClass(!!newChildErrors.dob)}
                                            value={newChildForm.dob}
                                            onChange={handleNewChildDOBChange}
                                            placeholder="DD/MM/YYYY"
                                            inputMode="numeric"
                                            maxLength={10}
                                        />
                                        {newChildErrors.dob && <p className="text-[12px] text-[#e53e3e] mt-1">{newChildErrors.dob}</p>}
                                    </div>

                                    {/* Age (auto) */}
                                    <div>
                                        <label className="block text-[14px] font-semibold mb-1.5">Age</label>
                                        <input
                                            className="w-full font-inherit text-[14px] border border-[#e7ebf1] bg-[#f4f6f9] text-[#6b7685] rounded-[10px] px-3.5 py-3 cursor-not-allowed"
                                            value={calculateAge(newChildForm.dob)}
                                            placeholder="Auto calculated"
                                            disabled
                                            readOnly
                                        />
                                    </div>

                                    {/* Gender */}
                                    <div>
                                        <label className="block text-[14px] font-semibold mb-1.5">Gender</label>
                                        <Select
                                            styles={selectStyles(!!newChildErrors.gender)}
                                            options={genderOptions}
                                            value={genderOptions.find((o) => o.value === newChildForm.gender) || null}
                                            placeholder="Select gender"
                                            onChange={(opt) => {
                                                setNewChildForm((f) => ({ ...f, gender: opt?.value || "" }));
                                                if (newChildErrors.gender) setNewChildErrors((errs) => ({ ...errs, gender: "" }));
                                            }}
                                        />
                                        {newChildErrors.gender && <p className="text-[12px] text-[#e53e3e] mt-1">{newChildErrors.gender}</p>}
                                    </div>

                                    {/* Medical information */}
                                    <div>
                                        <label className="block text-[14px] font-semibold mb-1.5">Medical information</label>
                                        <input
                                            className={inputClass(false)}
                                            value={newChildForm.medicalInfo}
                                            onChange={(e) => setNewChildForm((f) => ({ ...f, medicalInfo: e.target.value }))}
                                            placeholder="e.g. Asthma, None"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 px-7 py-5 border-t border-gray-100">
                                <button
                                    onClick={() => setIsAddChildOpen(false)}
                                    disabled={isSavingChild}
                                    className="w-full sm:w-auto font-semibold text-[14px] rounded-[12px] px-6 py-3 border border-[#e7ebf1] text-[#1f2733] bg-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveNewChild}
                                    disabled={isSavingChild}
                                    className="w-full sm:w-auto font-semibold text-[14px] rounded-[12px] px-7 py-3 border border-[#3b7df6] text-white bg-[#3b7df6] disabled:opacity-50 hover:bg-[#2f6ae0] flex items-center justify-center gap-2"
                                >
                                    {isSavingChild && <Loader2 className="animate-spin w-4 h-4" />}
                                    Add Child
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BookFreeTrial;