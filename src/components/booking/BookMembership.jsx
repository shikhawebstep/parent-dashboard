import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    X,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    MapPin,
    Truck,
    AlertTriangle,
    Check,
    Star,
    ArrowUp,
    Calendar as CalendarIcon,
    Mail,
    User,
    PartyPopper,
    Loader2,
    Zap,
} from "lucide-react";
import { showErrorToast, showError, showSuccess } from "../../../utils/swalHelper";
import { motion, AnimatePresence } from "framer-motion";
import Select from "react-select";
import PhoneNumberInput from "../../commom/PhoneNumberInput";
import { useCommon } from "../../context/CommonContext";
import { useProfile } from "../../context/ProfileContext";
import { getAddressesByPostcode } from "../../commom/getAddressesByPostcode";
import Loader from "../Loader";

// ── react-select shared styles ─────────────────────────────
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

// ── DOB / Age helpers for Add Child modal ─────────────────
const formatDOBInput = (raw = "") => {
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4);
};

const isValidDOB = (val = "") => {
    const iso = toDateOnly(val);
    if (!iso) return false;
    const [y, m, d] = iso.split("-").map(Number);
    const dob = new Date(y, m - 1, d);
    if (Number.isNaN(dob.getTime())) return false;
    return dob <= new Date(); // not in the future
};

const calculateAge = (val = "") => {
    if (!isValidDOB(val)) return "";
    const iso = toDateOnly(val);
    const [y, m, d] = iso.split("-").map(Number);
    const dob = new Date(y, m - 1, d);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
    return age >= 0 ? age : "";
};

const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
];

// ── Inits ─────────────────────────────────────────────────
const INIT_STUDENT = () => ({
    _tmpId: Date.now() + Math.random(),
    studentFirstName: "",
    studentLastName: "",
    dateOfBirth: "",
    age: null,
    gender: "",
    medicalInformation: "",
    selectedClassId: null,
    selectedClassData: null,
    error: null,
});

const INIT_PARENT = () => ({
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
    starterPackSize: "",
    emailMessage: "",
    emailStatus: "",
});

const INIT_EMERGENCY = () => ({
    sameAsAbove: false,
    emergencyFirstName: "",
    emergencyLastName: "",
    emergencyPhoneNumber: "",
    emergencyRelation: "",
});

const INIT_PAYMENT = () => ({
    email: "",
    account_holder_name: "",
    firstName: "",
    lastName: "",
    branch_code: "",
    account_number: "",
    line1: "",
    city: "",
    postalCode: "",
    authorise: false,
    nameOnCard: "",
    cardNumber: "",
    expiryDate: "",
    cvc: "",
    country: "United Kingdom",
    zipCode: "",
});

// ── Small helpers ─────────────────────────────────────────
const toDateOnly = (str) => {
    if (!str || typeof str !== "string") return null;
    if (str.includes("/")) {
        const parts = str.split("/").map(Number);
        const [d, m, y] = parts;
        if (!d || !m || !y || Number.isNaN(d) || Number.isNaN(m) || Number.isNaN(y)) return null;
        return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }
    return str;
};

const formatLocalDate = (date) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

// ── Payment field formatters ──────────────────────────────
const formatCardNumber = (raw = "") => {
    const digits = (raw || "").replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
};

const formatExpiry = (raw = "", prev = "") => {
    const safeRaw = raw || "";
    const safePrev = prev || "";
    const digits = safeRaw.replace(/\D/g, "").slice(0, 4);
    if (digits.length === 0) return "";
    if (digits.length >= 2) {
        const mm = parseInt(digits.slice(0, 2), 10);
        if (mm > 12) return safePrev;
    }
    if (digits.length <= 2) {
        if (safePrev.endsWith(" / ") && safeRaw.length < safePrev.length) {
            return digits.slice(0, 1);
        }
        return digits.length === 2 ? digits + " / " : digits;
    }
    return digits.slice(0, 2) + " / " + digits.slice(2);
};

const formatSortCode = (raw = "") => {
    const digits = (raw || "").replace(/\D/g, "").slice(0, 6);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return digits.slice(0, 2) + "-" + digits.slice(2);
    return digits.slice(0, 2) + "-" + digits.slice(2, 4) + "-" + digits.slice(4);
};

const formatCVC = (raw = "") => (raw || "").replace(/\D/g, "").slice(0, 4);
const formatAccountNumber = (raw = "") => (raw || "").replace(/\D/g, "").slice(0, 8);

// ── Validation helpers ────────────────────────────────────
const isValidExpiry = (val = "") => {
    const digits = (val || "").replace(/\D/g, "");
    if (digits.length < 4) return false;
    const mm = parseInt(digits.slice(0, 2), 10);
    const yy = parseInt(digits.slice(2, 4), 10);
    if (Number.isNaN(mm) || Number.isNaN(yy)) return false;
    if (mm < 1 || mm > 12) return false;
    const now = new Date();
    const expDate = new Date(2000 + yy, mm - 1, 1);
    return expDate >= new Date(now.getFullYear(), now.getMonth(), 1);
};

const isValidCardNumber = (val = "") => (val || "").replace(/\s/g, "").length === 16;
const isValidCVC = (val = "") => (val || "").length >= 3;
const isValidSortCode = (val = "") => (val || "").replace(/\D/g, "").length === 6;
const isValidAccountNumber = (val = "") => (val || "").replace(/\D/g, "").length === 8;

// ── Size options ──────────────────────────────────────────
const sizeOptions = [
    { value: "Small", label: "Small" },
    { value: "Medium", label: "Medium" },
    { value: "Large", label: "Large" },
    { value: "XL", label: "Extra Large" },
];

const countryOptions = [
    { value: "United Kingdom", label: "United Kingdom" },
    { value: "Ireland", label: "Ireland" },
    { value: "United States", label: "United States" },
    { value: "Canada", label: "Canada" },
    { value: "Australia", label: "Australia" },
];

// ── Component ─────────────────────────────────────────────
const BookMembership = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("parentToken") : null;
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
    const [addressList, setAddressList] = useState([]);
    const [addressLoading, setAddressLoading] = useState(false);
    const [addressError, setAddressError] = useState("");

    const { fetchVenues, venues, loading: commonLoading } = useCommon();
    const { profile, fetchProfileData, loading: profileLoading } = useProfile();
    const location = useLocation();
    const booking = location?.state?.booking;
    const navigate = useNavigate();




    // ── Reserved booking via URL (?bookingId=&venueId=&createdAt=) ──
    const searchParams = new URLSearchParams(location.search);
    const urlBookingId = searchParams.get("bookingId");
    const urlVenueId = searchParams.get("venueId");
    const urlCreatedAt = searchParams.get("createdAt");
    const RESERVATION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hr
    const [reservationTimeLeft, setReservationTimeLeft] = useState(null);
    const [reservationExpired, setReservationExpired] = useState(false);

    // form
    const [students, setStudents] = useState([INIT_STUDENT()]);
    const [parents, setParents] = useState([INIT_PARENT()]);
    const [emergency, setEmergency] = useState(INIT_EMERGENCY());
    const [payment, setPayment] = useState(INIT_PAYMENT());

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Wizard State
    const [flowStep, setFlowStep] = useState("B");
    const [demoMode, setDemoMode] = useState("single");
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);

    // Delivery address state
    const [postcode, setPostcode] = useState("");
    const [showAddrSelect, setShowAddrSelect] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState("");
    const [isChangingVenue, setIsChangingVenue] = useState(false);
    const [studentSizes, setStudentSizes] = useState({});
    // info
    const [selectedVenue, setSelectedVenue] = useState(null);
    const [numberOfStudents, setNumberOfStudents] = useState(1);
    const [membershipPlan, setMembershipPlan] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());

    // Discount state (ported from file 2)
    const [discountCode, setDiscountCode] = useState("");
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    const [isApplied, setIsApplied] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [isDiscountLoading, setIsDiscountLoading] = useState(false);

    // Size chart modal
    const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);

    // pricing
    const [pricingBreakdown, setPricingBreakdown] = useState({
        pricePerClassPerChild: 0,
        numberOfLessonsProRated: 0,
        finalProRataCost: 0,
        starterPack: 0,
        totalAmountToday: 0,
        isFullMonthCharge: false,
        stripeAmount: 0,
        nextMonthPayment: 0,
    });

    // Field-level errors for payment screens
    const [cardErrors, setCardErrors] = useState({});
    const [ddErrors, setDdErrors] = useState({});

    const hasInitialized = useRef(false);

    // ── Derived ───────────────────────────────────────────
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();



    const [isAddChildOpen, setIsAddChildOpen] = useState(false);
    const [newChildForm, setNewChildForm] = useState({
        studentFirstName: "",
        studentLastName: "",
        dateOfBirth: "",
        gender: "",
        medicalInformation: "",
    });
    const [newChildErrors, setNewChildErrors] = useState({});
    const [isSavingChild, setIsSavingChild] = useState(false);
    const [isDirty, setIsDirty] = useState(false); // tracks unsaved changes
    const DRAFT_KEY = "bookMembership_draft";

    let adminInfo = {};
    try {
        adminInfo = JSON.parse(localStorage.getItem("adminInfo") || "{}") || {};
    } catch {
        adminInfo = {};
    }
    const isFranchisee = adminInfo?.role?.role === "Franchisee";

    const venueData = selectedVenue?.all || null;

    const allPaymentPlans =
        venueData?.paymentGroups?.[0]?.paymentPlans?.map((p) => ({
            label: `${p?.title || "Plan"} (${p?.students || 0} student${p?.students > 1 ? "s" : ""})`,
            value: p?.id,
            starterPackPrice: p?.starterPackPrice || 0,
            all: p,
        })) || [];

    const paymentPlanOptions = numberOfStudents
        ? allPaymentPlans.filter((p) => Number(p?.all?.students) === Number(numberOfStudents))
        : allPaymentPlans;

    const sessionDates =
        venueData?.terms?.flatMap((t) =>
            (t?.sessionsMap || [])
                .map((s) => s?.sessionDate?.split?.("T")?.[0])
                .filter(Boolean)
        ) || [];

    const availableDatesSet = new Set(sessionDates);

    const showStarterPack = Boolean(selectedVenue?.all?.starterPack);
    const starterPackPrice = Number(selectedVenue?.all?.starterPacks?.[0]?.price) || 0;

    const formatDOBForDisplay = (isoDate) => {
        if (!isoDate || typeof isoDate !== "string") return "";
        const [y, m, d] = isoDate.split("-");
        if (!y || !m || !d) return "";
        return `${d}/${m}/${y}`;
    };

    // ── react-select option builders (null-safe) ──────────
    const venueOptions = (venues?.capacityVenues || [])
        .filter((v) => v && v.venueId !== undefined && v.venueId !== null)
        .map((v) => ({ value: v.venueId, label: v.venueName || "Unnamed venue", all: v }));

    const buildClassOptions = () => {
        const classesObj = venueData?.classes;
        if (!classesObj || typeof classesObj !== "object") return [];
        const opts = [];
        Object.keys(classesObj).forEach((day) => {
            (classesObj[day] || []).forEach((c) => {
                if (!c || c.classId === undefined || c.classId === null) return;
                opts.push({
                    value: c.classId,
                    label: `${c.className || "Class"} (${day}) ${c.time || ""} ${c.level ? `- ${c.level}` : ""}`.trim(),
                    all: c,
                });
            });
        });
        return opts;
    };
    const classOptions = buildClassOptions();

    const addressOptions = (addressList || [])
        .filter((a) => a && a.address)
        .map((a) => ({ value: a.address, label: a.address }));

    // ── Effects ───────────────────────────────────────────
    useEffect(() => {
        fetchVenues?.();
        fetchProfileData?.();
    }, [fetchVenues]);

    // ── Mark form dirty whenever key fields change ────────────────────────────
    useEffect(() => {
        if (flowStep === "D") return; // don't flag dirty on success screen
        const hasData =
            selectedVenue ||
            selectedDate ||
            students.some((s) => s.studentFirstName || s.selectedClassId) ||
            parents.some((p) => p.parentFirstName || p.parentEmail);
        setIsDirty(!!hasData);
    }, [selectedVenue, selectedDate, students, parents, flowStep]);

    // ── Save draft to sessionStorage whenever form data changes ───────────────
    useEffect(() => {
        if (!isDirty || flowStep === "D") return;
        try {
            sessionStorage.setItem(
                DRAFT_KEY,
                JSON.stringify({
                    students,
                    parents,
                    emergency,
                    selectedStudentIds,
                    savedAt: Date.now(),
                })
            );
        } catch { /* storage quota exceeded — silently ignore */ }
    }, [isDirty, students, parents, emergency, selectedStudentIds]);

    // ── Warn on browser close/refresh when form has unsaved data ─────────────
    useEffect(() => {
        const handler = (e) => {
            if (!isDirty || flowStep === "D") return;
            e.preventDefault();
            e.returnValue = "";
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [isDirty, flowStep]);

    // ── Clear draft on successful submit ──────────────────────────────────────
    const clearDraft = () => {
        try { sessionStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
        setIsDirty(false);
    };

    useEffect(() => {
        if (!profile) return;
        const rawParents = profile?.adminMeta?.parents || [];
        const rawStudents = profile?.adminMeta?.students || [];

        const normalizeDOB = (raw) => {
            if (!raw) return "";
            return raw.includes("-") ? formatDOBForDisplay(raw) : raw;
        };

        const normalizedParents = rawParents.map((p) => ({
            id: p?.id ?? Date.now() + Math.random(),
            parentFirstName: p?.parentFirstName || "",
            parentLastName: p?.parentLastName || "",
            parentEmail: p?.parentEmail || "",
            parentPhoneNumber: p?.parentPhoneNumber || p?.phoneNumber || "",
            interestReason: p?.interestReason || "",
            interestReasonOther: p?.interestReasonOther || "",
            relationToChild: p?.relationToChild || "",
            howDidYouHear: p?.howDidYouHear || "",
            isCustomReason: p?.isCustomReason || false,
            starterPackSize: p?.starterPackSize || "",
        }));

        const normalizedStudents = rawStudents.map((s, index) => ({
            _tmpId: s?.id ?? index,
            studentFirstName: s?.studentFirstName || "",
            studentLastName: s?.studentLastName || "",
            dateOfBirth: normalizeDOB(s?.dateOfBirth || s?.dob),
            age: s?.age ?? "",
            gender: s?.gender || "",
            medicalInformation: s?.medicalInformation || s?.medicalInfo || "",
            selectedClassId: s?.selectedClassId || null,
            selectedClassData: s?.selectedClassData || null,
        }));

        setParents(normalizedParents.length ? normalizedParents : [INIT_PARENT()]);
        setStudents(normalizedStudents.length ? normalizedStudents : [INIT_STUDENT()]);

        if (normalizedStudents.length === 1) {
            setSelectedStudentIds([normalizedStudents[0]._tmpId]);
        } else if (normalizedStudents.length > 1) {
            setSelectedStudentIds(normalizedStudents.map((s) => s._tmpId));
        }

        const emergencyContact = profile?.adminMeta?.emergency;

        if (emergencyContact) {
            setEmergency({
                sameAsAbove: false,
                emergencyFirstName: emergencyContact?.emergencyFirstName || "",
                emergencyLastName: emergencyContact?.emergencyLastName || "",
                emergencyPhoneNumber: emergencyContact?.emergencyPhoneNumber || "",
                emergencyRelation: emergencyContact?.emergencyRelation || "",
                id: emergencyContact?.id || "",
            });
        }
    }, [profile]);

    useEffect(() => {
        if (hasInitialized.current || !availableDatesSet.size) return;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const future = Array.from(availableDatesSet)
            .map((d) => new Date(d))
            .filter((d) => !Number.isNaN(d.getTime()))
            .filter((d) => {
                const x = new Date(d);
                x.setHours(0, 0, 0, 0);
                return x >= today;
            })
            .sort((a, b) => a - b);
        if (!future.length) return;
        setCurrentDate(new Date(future[0].getFullYear(), future[0].getMonth(), 1));
        hasInitialized.current = true;
    }, [availableDatesSet.size]);

    useEffect(() => {
        if (selectedDate && membershipPlan) calculateAmount(selectedDate);
    }, [numberOfStudents, membershipPlan, selectedDate, isApplied, appliedDiscount]);

    // Derived selected students
    const isMulti = demoMode === "multi";
    const activeStudents = isMulti
        ? students.filter((s) => selectedStudentIds.includes(s._tmpId))
        : students.slice(0, 1);

    useEffect(() => {
        setNumberOfStudents(activeStudents.length || 1);
    }, [selectedStudentIds, activeStudents.length]);

    // ── Check if selected class capacity is less than selected students ──────
    const getOverCapacityWarning = () => {
        if (activeStudents.length < 2) return null;

        const classCounts = {};
        activeStudents.forEach((s) => {
            if (s.selectedClassId) {
                classCounts[s.selectedClassId] = (classCounts[s.selectedClassId] || 0) + 1;
            }
        });

        for (const [classId, count] of Object.entries(classCounts)) {
            const studentWithClass = activeStudents.find((s) => String(s.selectedClassId) === String(classId));
            const classData = studentWithClass?.selectedClassData;
            if (classData) {
                const cap = Number(classData.capacity);
                if (!isNaN(cap) && count > cap) {
                    return {
                        className: classData.className || "Selected Class",
                        capacity: cap,
                        count
                    };
                }
            }
        }
        return null;
    };

    const overCapacityInfo = getOverCapacityWarning();


    // ── IST conversion helpers ──────────────────────────────
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // UTC+5:30

    const toIST = (date) => new Date(date.getTime() + IST_OFFSET_MS);

    const getNowIST = () => toIST(new Date());

    const formatISTDisplay = (date) => {
        const ist = toIST(date);
        return ist.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
            timeZone: "UTC", // since we've already manually shifted to IST
        });
    };
    useEffect(() => {
        if (!urlCreatedAt) return;
        const createdTimeUTC = new Date(urlCreatedAt);
        if (Number.isNaN(createdTimeUTC.getTime())) return;

        // Convert createdAt to IST
        const createdIST = toIST(createdTimeUTC);
        const expiryIST = new Date(createdIST.getTime() + RESERVATION_DURATION_MS);

        const tick = () => {
            const nowIST = getNowIST();
            const diff = expiryIST.getTime() - nowIST.getTime();
            if (diff <= 0) {
                setReservationTimeLeft(0);
                setReservationExpired(true);
                return;
            }
            setReservationTimeLeft(diff);
        };

        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [urlCreatedAt]);

    useEffect(() => {
        if (!urlVenueId || selectedVenue) return;
        const match = (venues?.capacityVenues || []).find(
            (v) => String(v.venueId) === String(urlVenueId)
        );
        if (match) {
            setSelectedVenue({ value: match.venueId, label: match.venueName || "Unnamed venue", all: match });
        }
    }, [venues, urlVenueId]);

    // ── Prefill venue + student class selections from MyBookings navigation ────
    // When parent clicks "Book Membership" from a trial booking row, the booking
    // object is passed via location.state — use it to pre-select venue & classes.
    // Booking students appear FIRST in the list and are the only ones pre-selected.
    useEffect(() => {
        if (!booking || !venues?.capacityVenues?.length) return;

        // 1. Auto-select venue
        const sourceVenueId = booking?.venue?.id ?? booking?.venueId;
        if (sourceVenueId && !selectedVenue) {
            const match = venues.capacityVenues.find(
                (v) => String(v.venueId) === String(sourceVenueId)
            );
            if (match) {
                setSelectedVenue({
                    value: match.venueId,
                    label: match.venueName || booking?.venue?.name || "Venue",
                    all: match,
                });
            }
        }

        // 2. Reorder students: booking students first, enrich with class data
        const bookingStudents = booking?.students || [];
        if (!bookingStudents.length) return;

        const bookingNames = new Set(
            bookingStudents.map((bs) => (bs?.studentFirstName || "").toLowerCase())
        );

        setStudents((prev) => {
            const enriched = prev.map((student) => {
                const match = bookingStudents.find(
                    (bs) =>
                        (bs?.studentFirstName || "").toLowerCase() ===
                        (student.studentFirstName || "").toLowerCase()
                );
                if (!match) return student;
                const sched = match?.classSchedule || match?.holidayClassSchedules || null;
                const classId =
                    sched?.classScheduleId ?? sched?.id ?? sched?.classId ?? null;
                return {
                    ...student,
                    selectedClassId: classId ? String(classId) : student.selectedClassId,
                    selectedClassData: sched ?? student.selectedClassData,
                };
            });

            // Sort: booking students first, rest after
            const inBooking = enriched.filter((s) =>
                bookingNames.has((s.studentFirstName || "").toLowerCase())
            );
            const notInBooking = enriched.filter(
                (s) => !bookingNames.has((s.studentFirstName || "").toLowerCase())
            );
            const reordered = [...inBooking, ...notInBooking];

            // Only pre-select students from this booking
            setSelectedStudentIds(inBooking.map((s) => s._tmpId));

            return reordered;
        });
    }, [booking, venues]);

    useEffect(() => {
        if (urlBookingId && showStarterPack && !isApplied && !reservationExpired) {
            setAppliedDiscount({
                status: true,
                message: "50% off applied for your reserved booking!",
                data: { type: "percentage", value: 50 },
            });
            setIsApplied(true);
            setIsChecked(true);
        }
    }, [urlBookingId, showStarterPack, reservationExpired]);

    const formatTimeLeft = (ms) => {
        if (ms === null) return "--:--:--";
        const totalSeconds = Math.floor(ms / 1000);
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return { h, m, s };
    };

    // ── Pricing (ported from file 2) ──────────────────────
    const calculateAmount = (startDate) => {
        if (!membershipPlan || !startDate) return;
        const monthlyPrice = Number(membershipPlan?.all?.price) || 0;
        const starterPack = showStarterPack ? Number(starterPackPrice) : 0;

        const parse = (s) => {
            if (!s || typeof s !== "string") return null;
            const [y, m, d] = s.split("-").map(Number);
            if (!y || !m || !d) return null;
            return new Date(y, m - 1, d);
        };

        const selected = parse(startDate);
        if (!selected) return;
        selected.setHours(0, 0, 0, 0);

        const allS = Array.from(availableDatesSet)
            .map((d) => {
                const x = parse(d);
                if (x) x.setHours(0, 0, 0, 0);
                return x;
            })
            .filter(Boolean);

        const inMonth = allS
            .filter((d) => d.getMonth() === selected.getMonth() && d.getFullYear() === selected.getFullYear())
            .sort((a, b) => a - b);

        const first = inMonth[0];
        const isFirstSelected = first && selected.getTime() === first.getTime();
        const remaining = inMonth.filter((d) => d.getTime() >= selected.getTime());
        const proRataLessons = remaining.length;
        const ppl = (Number(membershipPlan?.all?.priceLesson) || 0);
        const proRataCost = Math.min(Number((proRataLessons * ppl).toFixed(2)) || 0, monthlyPrice || 0);
        const isFullMonth = (isFirstSelected && proRataLessons >= 3) || proRataCost >= monthlyPrice;

        // Discount logic (matches file 2 exactly)
        let starterDiscount = 0;
        if (isApplied && appliedDiscount?.data) {
            starterDiscount = appliedDiscount.data.type === "percentage"
                ? (starterPack * Number(appliedDiscount.data.value)) / 100
                : Number(appliedDiscount.data.discountAmount || 0);
        }

        // total today = starterPack + 3.99 delivery - discount (file 2 formula)
        const totalToday = showStarterPack
            ? Number((Math.max(starterPack + 3.99 - starterDiscount, 0)).toFixed(2))
            : proRataCost;

        const stripeAmount = showStarterPack
            ? Math.max(starterPack - starterDiscount, 0) + 3.99
            : proRataCost;

        const breakdown = {
            pricePerClassPerChild: ppl,
            numberOfLessonsProRated: proRataLessons,
            finalProRataCost: proRataCost,
            starterPack,
            starterDiscount,
            totalAmountToday: totalToday,
            nextMonthPayment: Number(monthlyPrice.toFixed(2)) || 0,
            isFullMonthCharge: isFullMonth,
            stripeAmount,
        };
        setPricingBreakdown(breakdown);
        return { totalToday, breakdown };
    };

    // ── Discount handler (ported from file 2) ─────────────
    const handleApplyDiscount = async () => {
        if (!discountCode.trim()) { setIsChecked(true); setIsApplied(false); return; }
        setIsChecked(true); setIsDiscountLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}api/admin/book-membership/apply-discount`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ starterPack: starterPackPrice, code: discountCode }),
            });
            const result = await res.json();
            if (res.ok && result?.status) { setAppliedDiscount(result); setIsApplied(true); }
            else { setAppliedDiscount(null); setIsApplied(false); }
        } catch { setIsApplied(false); }
        finally { setIsDiscountLoading(false); }
    };

    const toggleStudent = (id) => {
        if (id === undefined || id === null) return;
        setSelectedStudentIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    // ── Payment field handlers ────────────────────────────
    const handleCardNumberChange = (e) => {
        const formatted = formatCardNumber(e?.target?.value);
        setPayment((p) => ({ ...p, cardNumber: formatted }));
        if (cardErrors.cardNumber) setCardErrors((errs) => ({ ...errs, cardNumber: "" }));
    };

    const handleExpiryChange = (e) => {
        const formatted = formatExpiry(e?.target?.value, payment.expiryDate);
        setPayment((p) => ({ ...p, expiryDate: formatted }));
        if (cardErrors.expiryDate) setCardErrors((errs) => ({ ...errs, expiryDate: "" }));
    };

    const handleCVCChange = (e) => {
        const formatted = formatCVC(e?.target?.value);
        setPayment((p) => ({ ...p, cvc: formatted }));
        if (cardErrors.cvc) setCardErrors((errs) => ({ ...errs, cvc: "" }));
    };

    const handleSortCodeChange = (e) => {
        const formatted = formatSortCode(e?.target?.value);
        setPayment((p) => ({ ...p, branch_code: formatted }));
        if (ddErrors.branch_code) setDdErrors((errs) => ({ ...errs, branch_code: "" }));
    };

    const handleAccountNumberChange = (e) => {
        const formatted = formatAccountNumber(e?.target?.value);
        setPayment((p) => ({ ...p, account_number: formatted }));
        if (ddErrors.account_number) setDdErrors((errs) => ({ ...errs, account_number: "" }));
    };

    // ── DD validation ─────────────────────────────────────
    const validateDD = () => {
        const errs = {};
        if (!(payment.account_holder_name || "").trim()) errs.account_holder_name = "Account holder name is required";
        if (!isValidSortCode(payment.branch_code || "")) errs.branch_code = "Enter a valid 6-digit sort code";
        if (!isValidAccountNumber(payment.account_number || "")) errs.account_number = "Enter a valid 8-digit account number";
        if (!payment.authorise) errs.authorise = "You must agree to the Direct Debit Guarantee";
        setDdErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // ── Card validation ───────────────────────────────────
    const validateCard = () => {
        const errs = {};
        if (!isValidCardNumber(payment.cardNumber || "")) errs.cardNumber = "Enter a valid 16-digit card number";
        if (!isValidExpiry(payment.expiryDate || "")) errs.expiryDate = "Enter a valid expiry date (MM / YY)";
        if (!isValidCVC(payment.cvc || "")) errs.cvc = "Enter a valid CVC (3–4 digits)";
        if (!(payment.nameOnCard || "").trim()) errs.nameOnCard = "Name on card is required";
        setCardErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleDDContinue = () => {
        if (validateDD()) setFlowStep("E");
    };

    const handleSubmit = async () => {
        if (!validateCard()) return;
        setIsSubmitting(true);
        try {
            let parentData = {};
            try {
                parentData = JSON.parse(localStorage.getItem("parentData") || "{}") || {};
            } catch {
                parentData = {};
            }
            const parentId = parentData?.id;
            const holderParts = (payment.account_holder_name || "").trim().split(" ").filter(Boolean);
            const payload = {
                venueId: selectedVenue?.value,
                startDate: selectedDate,
                totalStudents: activeStudents.length,
                students: activeStudents.map((student) => ({
                    studentFirstName: student?.studentFirstName || "",
                    studentLastName: student?.studentLastName || "",
                    dateOfBirth: toDateOnly(student?.dateOfBirth),
                    age: Number(student?.age) || 0,
                    gender: student?.gender || "",
                    medicalInformation: student?.medicalInformation || "NA",
                    classScheduleId: Number(student?.selectedClassId) || 1,
                    initialClassId: student?.initialClassId || null,
                    starterPackSize: studentSizes[student._tmpId] || null,
                })),
                parents: parents.map((parent) => ({
                    parentFirstName: parent?.parentFirstName || "NA",
                    parentLastName: parent?.parentLastName || "NA",
                    parentEmail: parent?.parentEmail || "na@na.com",
                    parentPhoneNumber: parent?.parentPhoneNumber || "00000000000",
                    interestReason: parent?.interestReason || "Other",
                    interestReasonOther: parent?.interestReasonOther || "NA",
                    relationToChild: parent?.relationToChild || "Parent",
                    howDidYouHear: parent?.howDidYouHear || "Google",
                    isCustomReason: parent?.isCustomReason || false,
                    starterPackSize: parent?.starterPackSize || null,
                })),
                starterPack: showStarterPack ? starterPackPrice : 0,
                discountId: isApplied && appliedDiscount?.data?.id ? appliedDiscount.data.id : null,
                size: showStarterPack ? (parents?.[0]?.starterPackSize || null) : null,
                emergency: {
                    sameAsAbove: true,
                    emergencyFirstName: "NA",
                    emergencyLastName: "NA",
                    emergencyPhoneNumber: "00000000000",
                    emergencyRelation: "Parent",
                },
                paymentPlanId: Number(membershipPlan?.value) || 1,
                payment: {
                    paymentType: "bank",
                    firstName: payment.firstName || holderParts[0] || "NA",
                    lastName: payment.lastName || holderParts.slice(1).join(" ") || "NA",
                    account_number: payment.account_number || "",
                    branch_code: (payment.branch_code || "").replace(/\D/g, ""),
                    account_holder_name: payment.account_holder_name || "",
                    authorise: payment.authorise || false,
                    price: Number(pricingBreakdown.nextMonthPayment) || 0,
                    proRataAmount: Number(pricingBreakdown.finalProRataCost) || 0,
                    line1: selectedAddress || payment.line1 || "NA",
                    city: payment.city || "NA",
                    postCode: postcode || payment.postalCode || "NA",
                    nameOnCard: payment.nameOnCard || "",
                    cardNumber: (payment.cardNumber || "").replace(/\s/g, ""),
                    expiryDate: payment.expiryDate || "",
                    cvc: payment.cvc || "",
                    country: payment.country || "United Kingdom",
                    zipCode: payment.zipCode || "",
                },
            };

            const APIURL = `${API_BASE_URL}api/parent/booking/membership/create/${parentId}`;
            const response = await fetch(APIURL, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token || ""}` },
                body: JSON.stringify(payload),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data?.message || data?.error || "Something went wrong.");

            clearDraft(); // remove saved draft on successful booking
            setFlowStep("D");
        } catch (err) {
            showErrorToast("Error", err?.message || "Something went wrong.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // UI Flow Config
    const fullFlowStates = ["A", "B", "C", "E", "D"];
    const singleFlowStates = ["B", "C", "E", "D"];
    const flowStates = isMulti ? fullFlowStates : singleFlowStates;
    const stepsLabels = isMulti
        ? ["Children", "Confirm & choose", "Direct Debit", "Card payment", "Done"]
        : ["Confirm & choose", "Direct Debit", "Card payment", "Done"];
    const currentStepIndex = flowStates.indexOf(flowStep);
    const activeNames = activeStudents.map((s) => s?.studentFirstName || "Child").join(" & ") || "your child";

    // ── DD button enabled check ───────────────────────────
    const isDDValid =
        (payment.account_holder_name || "").trim() &&
        isValidSortCode(payment.branch_code || "") &&
        isValidAccountNumber(payment.account_number || "") &&
        payment.authorise;

    // ── Card button enabled check ─────────────────────────
    const isCardValid =
        isValidCardNumber(payment.cardNumber || "") &&
        isValidExpiry(payment.expiryDate || "") &&
        isValidCVC(payment.cvc || "") &&
        (payment.nameOnCard || "").trim();

    // ── Input class helper ────────────────────────────────
    const inputClass = (hasErr) =>
        `w-full font-inherit text-[14px] border rounded-[10px] px-3.5 py-3 focus:outline-none focus:ring-2 transition-colors ${hasErr
            ? "border-[#e53e3e] focus:ring-[#e53e3e]/30 bg-[#fff5f5]"
            : "border-[#e7ebf1] focus:ring-[#3b7df6]"
        }`;

    const handleAddStudents = () => {
        setNewChildForm({
            studentFirstName: "",
            studentLastName: "",
            dateOfBirth: "",
            gender: "",
            medicalInformation: "",
        });
        setNewChildErrors({});
        setIsAddChildOpen(true);
    };

    const handleNewChildDOBChange = (e) => {
        const formatted = formatDOBInput(e?.target?.value);
        setNewChildForm((f) => ({ ...f, dateOfBirth: formatted }));
        if (newChildErrors.dateOfBirth) setNewChildErrors((errs) => ({ ...errs, dateOfBirth: "" }));
    };

    const validateNewChild = () => {
        const errs = {};
        if (!newChildForm.studentFirstName.trim()) errs.studentFirstName = "First name is required";
        if (!newChildForm.studentLastName.trim()) errs.studentLastName = "Last name is required";
        if (!isValidDOB(newChildForm.dateOfBirth)) errs.dateOfBirth = "Enter a valid date (DD/MM/YYYY)";
        if (!newChildForm.gender) errs.gender = "Gender is required";
        setNewChildErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSaveNewChild = () => {
        if (!validateNewChild()) return;
        setIsSavingChild(true);

        const newStudent = {
            ...INIT_STUDENT(),
            studentFirstName: newChildForm.studentFirstName.trim(),
            studentLastName: newChildForm.studentLastName.trim(),
            dateOfBirth: newChildForm.dateOfBirth,
            age: calculateAge(newChildForm.dateOfBirth),
            gender: newChildForm.gender,
            medicalInformation: newChildForm.medicalInformation.trim() || "NA",
        };

        setStudents((prev) => [...prev, newStudent]);
        setSelectedStudentIds((prev) => [...prev, newStudent._tmpId]);

        setIsSavingChild(false);
        setIsAddChildOpen(false);
    };

    if (!venues || (profile === null && profileLoading)) {
        return <Loader />;
    }

    return (
        <div className="min-h-screen booking-page bg-[#f4f6f9] text-[#1f2733] font-['Poppins',sans-serif] pb-28 sm:pb-16 pt-5">

            {/* Band */}
            <div className="bg-[#1e3a6e] text-white mx-6 rounded-[14px] px-5 py-4 flex items-center gap-3 font-bold text-[18px]">
                <span
                    className="cursor-pointer opacity-90 flex items-center"
                    onClick={() => {
                        if (currentStepIndex > 0) setFlowStep(flowStates[currentStepIndex - 1]);
                    }}
                >
                    <ChevronLeft size={20} />
                </span>
                Booking
            </div>

            {urlCreatedAt && !reservationExpired && (() => {
                const t = formatTimeLeft(reservationTimeLeft);
                const pad = (n) => String(n).padStart(2, "0");
                return (
                    <div className="max-w-[1040px] mx-auto md:px-6 px-2 mt-4">
                        <div className="bg-[#fff4dd] border border-[#ffd98a] text-[#7a5210] rounded-[14px] px-5 py-3 flex items-center justify-center gap-3 flex-wrap text-[14px]">
                            <Zap size={16} className="text-[#d98c00] shrink-0" fill="currentColor" />
                            <span>
                                Book within 24 hours for <strong>50% off</strong> the full Samba starter pack
                            </span>
                            <div className="flex items-center gap-1.5 ml-1">
                                {[["h", t.h], ["m", t.m], ["s", t.s]].map(([unit, val], i) => (
                                    <React.Fragment key={unit}>
                                        <span className="bg-[#3b2a14] text-white font-bold text-[13px] rounded-[6px] px-2.5 py-1.5 tabular-nums">
                                            {pad(val)}
                                        </span>
                                        {i < 2 && <span className="text-[#7a5210] font-bold">:</span>}
                                    </React.Fragment>
                                ))}
                                <span className="text-[10px] text-[#9c7a3a] font-semibold ml-1 uppercase tracking-wide">Left</span>
                            </div>
                        </div>
                    </div>
                );
            })()}
            {urlCreatedAt && reservationExpired && (
                <div className="max-w-[1040px] mx-auto md:px-6 px-2 mt-4">
                    <div className="bg-[#fff5f5] border border-[#feb2b2] text-[#c53030] rounded-[14px] px-5 py-3.5 flex items-center gap-2.5 font-semibold text-[14px]">
                        <AlertTriangle size={18} />
                        Your reservation has expired — the 50% discount is no longer available, but you can still continue booking.
                    </div>
                </div>
            )}

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
                                        className={`w-6 h-6 rounded-full border-[1.5px] flex items-center justify-center text-[12px] ${isActive
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
                                {i < flowStates.length - 1 && <span className="w-8 h-[2px] bg-[#e7ebf1] rounded-[2px]" />}
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Screens */}
                <div className="bg-white rounded-[16px] shadow-[0_8px_30px_rgba(20,40,80,0.08)] p-4 md:p-8">

                    {/* SCREEN A */}
                    {flowStep === "A" && (
                        <div>
                            <div className="text-center text-[24px] font-bold mb-1.5 tracking-tight">Who's this membership for?</div>
                            <div className="text-center text-[#6b7685] text-[14px] mb-6">Select one or more children to enrol</div>

                            <div className="flex flex-col sm:flex-row justify-center gap-2.5 mb-5 w-full max-w-md mx-auto sm:max-w-none">
                                <button className="w-full sm:w-auto font-semibold text-[13px] rounded-[30px] px-4 py-2.5 bg-[#eaf1fe] text-[#3b7df6] border border-[#eaf1fe]">Select an existing child</button>
                                <button onClick={handleAddStudents} className="w-full sm:w-auto font-semibold text-[13px] rounded-[30px] px-4 py-2.5 bg-white text-[#6b7685] border border-[#e7ebf1]">Add a new child</button>
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
                                            <div className="text-[#3b7df6] font-bold text-[16px] mb-3">{s.studentFirstName || `Child ${i + 1}`}</div>
                                            <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                                                <div><div className="text-[11px] text-[#6b7685]">Date of birth</div><div className="text-[14px] font-semibold">{s.dateOfBirth || "-"}</div></div>
                                                <div><div className="text-[11px] text-[#6b7685]">Age</div><div className="text-[14px] font-semibold">{s.age || "-"}</div></div>
                                                <div><div className="text-[11px] text-[#6b7685]">Gender</div><div className="text-[14px] font-semibold">{s.gender || "-"}</div></div>
                                                <div><div className="text-[11px] text-[#6b7685]">Class</div><div className="text-[14px] font-semibold">{s.selectedClassData?.className || ""}</div></div>
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

                    {/* SCREEN B */}
                    {flowStep === "B" && (
                        <div>
                            <div className="text-center text-[24px] font-bold mb-1.5 tracking-tight">Book {activeNames}'s membership</div>
                            <div className="text-center text-[#6b7685] text-[14px] mb-6">Confirm the details, choose a plan, and you're done</div>

                            {/* Venue selector */}
                            <div className="mb-6">
                                <div style={{ background: "linear-gradient(120deg, #1e3a6e, #2f5aa0)" }} className="text-white px-5 py-4 rounded-t-[14px] flex items-center justify-between gap-3 flex-wrap">
                                    <div className="flex items-center gap-2.5 font-semibold text-[15px]">
                                        <MapPin size={16} /> {selectedVenue?.label || "Select a venue..."}
                                    </div>
                                    <button onClick={() => setIsChangingVenue(!isChangingVenue)} className="bg-white/15 border border-white/35 text-white rounded-[20px] px-3.5 py-1.5 text-[12px] font-semibold">Change venue</button>
                                </div>
                                {isChangingVenue && (
                                    <div className="border border-t-0 border-[#e7ebf1] px-5 py-3.5 flex gap-6 flex-wrap bg-[#f4f6f9]">
                                        <div className="w-full">
                                            <Select
                                                styles={rsStyles(false)}
                                                options={venueOptions}
                                                value={venueOptions.find((o) => o.value === selectedVenue?.value) || null}
                                                placeholder={venueOptions.length ? "Select a venue to see available details..." : "No venues available"}
                                                isDisabled={venueOptions.length === 0}
                                                isClearable={false}
                                                onChange={(opt) => {
                                                    if (!opt) return;
                                                    setSelectedVenue({ value: opt.value, label: opt.label, all: opt.all });
                                                    setMembershipPlan(null);
                                                    setSelectedDate(null);
                                                    setIsChangingVenue(false);
                                                    setStudents((prev) => prev.map((s) => ({ ...s, selectedClassId: null, selectedClassData: null })));
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Student class selectors */}
                                {activeStudents.map((s, idx) => (
                                    <div key={s._tmpId ?? idx} className={`border border-t-0 border-[#e7ebf1] p-3.5 px-5 flex flex-col gap-3.5 ${idx === activeStudents.length - 1 && !showStarterPack ? "rounded-b-[14px]" : ""}`}>
                                        <div className="flex items-center justify-between gap-3.5 flex-wrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-[38px] h-[38px] rounded-full bg-[#eaf1fe] flex items-center justify-center font-bold text-[#3b7df6]">{(s.studentFirstName || "?")[0]}</div>
                                                <div>
                                                    <div className="font-semibold text-[15px]">{s.studentFirstName} {s.studentLastName}</div>
                                                    {s.selectedClassData && (
                                                        <div className="text-[12px] text-[#6b7685]">
                                                            Class: {`${s.selectedClassData?.className || ""}${s.selectedClassData?.level ? ` (${s.selectedClassData.level})` : ""}`}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {s.selectedClassData && (
                                                <div className="bg-[#e7f8f0] text-[#0e7a4d] font-semibold text-[12.5px] px-3 py-1.5 rounded-[20px] flex items-center gap-2">
                                                    <span className="w-4 h-4 rounded-full bg-[#21b573] text-white flex items-center justify-center">
                                                        <Star size={10} fill="currentColor" />
                                                    </span>
                                                    Coach's verdict: {s?.selectedClassData?.level} level
                                                </div>
                                            )}
                                        </div>
                                        {!s.selectedClassData && (
                                            <div className="flex items-end gap-3">
                                                <div className="flex-1">
                                                    <label className="block text-[13px] font-semibold mb-1.5">Select class for {s.studentFirstName || "this child"}</label>
                                                    <Select
                                                        styles={rsStyles(false)}
                                                        options={classOptions}
                                                        value={classOptions.find((o) => o.value === s.selectedClassId) || null}
                                                        isDisabled={!selectedVenue || classOptions.length === 0}
                                                        placeholder={!selectedVenue ? "Select a venue first" : classOptions.length ? "Choose a class..." : "No classes available"}
                                                        onChange={(opt) => {
                                                            if (!opt) return;
                                                            setStudents((prev) =>
                                                                prev.map((st) =>
                                                                    st._tmpId === s._tmpId ? { ...st, selectedClassId: opt.value, selectedClassData: opt.all } : st
                                                                )
                                                            );
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Starter pack section */}
                            {showStarterPack && (
                                <>
                                    <div className="text-[13px] font-bold uppercase tracking-[0.04em] text-[#6b7685] mb-3">Starter pack</div>
                                    <div className="grid md:grid-cols-[200px_1fr] gap-5 border border-[#e7ebf1] rounded-[14px] p-4 mb-3.5 items-center">
                                        <div className="bg-gradient-to-br from-[#15336b] to-[#ffd21f] rounded-[12px] h-[150px] flex items-center justify-center text-white text-center font-bold relative overflow-hidden">
                                            <img src="/assets/Kids-Size-Guide.png" alt="" />
                                        </div>
                                        <div>
                                            <h5 className="text-[15px] font-bold mb-2.5 text-[#1f2733]">Every membership includes the Samba starter pack:</h5>
                                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2.5 list-none">
                                                {["Samba T-shirt, shorts & socks", "Drawstring bag", "Skills ball", "Road to Rio skills tracker book"].map((item, i) => (
                                                    <li key={i} className="text-[13.5px] flex items-center gap-2 text-[#1f2733]">
                                                        <Check size={14} className="text-[#21b573] shrink-0" />{item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Starter pack price + discount */}
                                    {/* Starter pack price + discount */}
                                    {(() => {
                                        const starterOfferActive = isApplied && !!appliedDiscount?.data;
                                        const starterDiscountAmount = starterOfferActive
                                            ? appliedDiscount.data.type === "percentage"
                                                ? (starterPackPrice * Number(appliedDiscount.data.value)) / 100
                                                : Number(appliedDiscount.data.discountAmount || 0)
                                            : 0;
                                        const starterPackOriginalTotal = starterPackPrice + 3.99;
                                        const starterPackDiscountedTotal = Math.max(starterPackOriginalTotal - starterDiscountAmount, 0);

                                        return (
                                            <div className="border border-[#e7ebf1] rounded-[14px] p-4 mb-4 relative overflow-hidden">

                                                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                                                    <div>
                                                        <div className="font-semibold text-[14px] flex items-center gap-2">
                                                            Starter pack
                                                            {starterOfferActive && (
                                                                <span className="bg-[#fff0f0] text-[#e53e3e] text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                                    {appliedDiscount.data.type === "percentage"
                                                                        ? `${appliedDiscount.data.value}% OFF`
                                                                        : "Discount applied"}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-[13px] text-[#6b7685]">£{starterPackPrice.toFixed(2)} + £3.99 delivery</div>
                                                    </div>
                                                    <div className="text-right">
                                                        {starterOfferActive ? (
                                                            <>
                                                                <div className="text-[12px] text-[#a0a8b4] line-through">£{starterPackOriginalTotal.toFixed(2)}</div>
                                                                <div className="text-[18px] font-bold text-[#21b573]">£{starterPackDiscountedTotal.toFixed(2)}</div>
                                                            </>
                                                        ) : (
                                                            <div className="text-[18px] font-bold text-[#1e3a6e]">£{starterPackOriginalTotal.toFixed(2)}</div>
                                                        )}
                                                    </div>
                                                </div>
                                                {/* Discount code */}
                                                <div>
                                                    <label className="block text-[13px] font-semibold mb-1.5">Discount code (optional)</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        <input
                                                            className="flex-1 font-inherit text-[14px] border border-[#e7ebf1] rounded-[10px] px-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-[#3b7df6]"
                                                            value={discountCode}
                                                            placeholder="Enter discount code"
                                                            onChange={(e) => {
                                                                setDiscountCode(e.target.value);
                                                                setIsApplied(false);
                                                                setAppliedDiscount(null);
                                                                setIsChecked(false);
                                                            }}
                                                        />
                                                        <button
                                                            onClick={handleApplyDiscount}
                                                            disabled={isDiscountLoading || !discountCode.trim()}
                                                            className="bg-[#1e3a6e] text-white rounded-[10px] px-5 py-3 font-semibold text-[14px] disabled:opacity-50"
                                                        >
                                                            {isDiscountLoading ? "Applying..." : "Apply"}
                                                        </button>
                                                    </div>
                                                    {isChecked && !isDiscountLoading && (
                                                        isApplied
                                                            ? <p className="text-[#21b573] text-[12px] mt-1.5 flex items-center gap-1"><Check size={12} /> {appliedDiscount?.message || "Discount applied!"}</p>
                                                            : <p className="text-[#e53e3e] text-[12px] mt-1.5">Invalid discount code</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                    {/* Kit size per student */}
                                    <div className="text-[13px] font-bold uppercase tracking-[0.04em] text-[#6b7685] mb-3 mt-5">
                                        Kit size{" "}
                                        <button
                                            type="button"
                                            onClick={() => setIsSizeChartOpen(true)}
                                            className="normal-case text-[#3b7df6] font-semibold text-[12px] hover:underline ml-2"
                                        >
                                            Size chart →
                                        </button>
                                    </div>
                                    {activeStudents.map((s, idx) => {
                                        const currentSize = studentSizes[s._tmpId] ?? parents?.[0]?.starterPackSize ?? "";
                                        return (
                                            <div key={s._tmpId ?? idx} className={`border border-[#e7ebf1] rounded-[14px] p-4 mb-3 flex items-center justify-between gap-4 flex-wrap`}>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-[38px] h-[38px] rounded-full bg-[#eaf1fe] flex items-center justify-center font-bold text-[#3b7df6]">{(s.studentFirstName || "?")[0]}</div>
                                                    <div className="font-semibold text-[15px]">{s.studentFirstName} {s.studentLastName}</div>
                                                </div>
                                                <div className="flex-1 min-w-[160px] max-w-[240px]">
                                                    <Select
                                                        styles={rsStyles(false)}
                                                        options={sizeOptions}
                                                        value={sizeOptions.find((o) => o.value === currentSize) || null}
                                                        placeholder="Select size..."
                                                        onChange={(opt) => {
                                                            const size = opt?.value || "";
                                                            setStudentSizes((prev) => ({ ...prev, [s._tmpId]: size }));
                                                            setStudents((prev) => prev.map((st) =>
                                                                st._tmpId === s._tmpId ? { ...st, starterPackSize: size } : st
                                                            ));
                                                            setParents((prev) =>
                                                                prev.length
                                                                    ? prev.map((p, i) => (i === 0 ? { ...p, starterPackSize: size } : p))
                                                                    : prev
                                                            );
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Address lookup */}
                                    <div className="border border-[#e7ebf1] rounded-[14px] p-4 mt-1 mb-5">
                                        <div className="font-bold text-[14px] mb-3 flex flex-wrap items-center gap-2">
                                            <Truck size={16} /> Delivery address <span className="font-medium text-[#6b7685] text-[13px]">— where should we send the starter pack?</span>
                                        </div>
                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                                            <div className="flex-1">
                                                <label className="block text-[13px] font-semibold mb-1.5">Postcode</label>
                                                <input
                                                    className="w-full font-inherit text-[14px] border border-[#e7ebf1] rounded-[10px] px-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-[#3b7df6]"
                                                    value={postcode}
                                                    onChange={(e) => {
                                                        setPostcode(e.target.value);
                                                        setAddressError("");
                                                        setAddressList([]);
                                                        setSelectedAddress("");
                                                    }}
                                                    placeholder="e.g. OX25 4JT"
                                                />
                                            </div>
                                            <button
                                                className="bg-[#3b7df6] text-white rounded-[12px] px-5 py-[11px] font-semibold text-[14px] whitespace-nowrap border border-[#3b7df6] disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto flex items-center justify-center"
                                                disabled={!postcode || addressLoading}
                                                onClick={async () => {
                                                    setAddressLoading(true);
                                                    setAddressError("");
                                                    try {
                                                        const result = await getAddressesByPostcode(postcode);
                                                        if (result?.success) {
                                                            setAddressList(result.addresses || []);
                                                            setShowAddrSelect(true);
                                                        } else {
                                                            setAddressError(result?.message || "Could not find addresses for this postcode.");
                                                            setShowAddrSelect(false);
                                                        }
                                                    } catch (err) {
                                                        setAddressError(err?.message || "Could not find addresses for this postcode.");
                                                        setShowAddrSelect(false);
                                                    } finally {
                                                        setAddressLoading(false);
                                                    }
                                                }}
                                            >
                                                {addressLoading ? "Searching..." : "Find address"}
                                            </button>
                                        </div>
                                        {addressError && (
                                            <div className="mt-3 text-[13px] text-[#e53e3e] bg-[#fff5f5] border border-[#feb2b2] rounded-lg px-3.5 py-2.5 flex items-start gap-2">
                                                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                                                <span>{addressError}</span>
                                            </div>
                                        )}
                                        {showAddrSelect && addressOptions.length > 0 && (
                                            <div className="mt-3">
                                                <label className="block text-[13px] font-semibold mb-1.5">Select your address</label>
                                                <Select
                                                    styles={rsStyles(false)}
                                                    options={addressOptions}
                                                    value={addressOptions.find((o) => o.value === selectedAddress) || null}
                                                    placeholder="Select from the list"
                                                    onChange={(opt) => setSelectedAddress(opt?.value || "")}
                                                />
                                                {selectedAddress && (
                                                    <div className="mt-3 text-[13.5px] text-[#0e7a4d] font-semibold bg-[#e7f8f0] rounded-lg px-3.5 py-2.5 flex items-center gap-2">
                                                        <Check size={14} />
                                                        Starter pack will ship here.
                                                        <span className="text-[#3b7df6] cursor-pointer underline ml-1.5" onClick={() => setSelectedAddress("")}>Change</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {showAddrSelect && addressOptions.length === 0 && !addressLoading && (
                                            <div className="mt-3 text-[13px] text-[#8a6d00] bg-[#fffcf0] border border-[#ffd21f] rounded-lg px-3.5 py-2.5 flex items-center gap-2">
                                                <MapPin size={16} />
                                                No addresses found for this postcode. Try a different one.
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Membership plan */}
                            {selectedVenue ? (
                                <>
                                    <div className="text-[13px] font-bold uppercase tracking-[0.04em] text-[#6b7685] mb-3 mt-5">Choose your membership plan</div>
                                    {paymentPlanOptions.length === 0 ? (
                                        <div className="border border-[#ffd21f] bg-[#fffcf0] text-[#8a6d00] font-medium p-4 rounded-[12px] text-[14px] mb-2 flex items-start gap-3">
                                            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                                            <div>
                                                No membership plans are available for {numberOfStudents} student{numberOfStudents > 1 ? "s" : ""} at this venue.<br />
                                                <button onClick={() => setIsChangingVenue(true)} className="text-[#3b7df6] font-bold mt-1.5 underline hover:text-[#2f6ae0]">Please select a different venue</button> to continue.
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid md:grid-cols-2 gap-3.5 mb-2">
                                            {paymentPlanOptions.map((plan, idx) => {
                                                const isSel = membershipPlan?.value === plan.value;
                                                return (
                                                    <div key={plan?.value ?? idx} onClick={() => setMembershipPlan(plan)} className={`border-[1.5px] rounded-[14px] p-4 cursor-pointer transition-all relative ${isSel ? "border-[#3b7df6] bg-[#f5f9ff] ring-4 ring-[#3b7df6]/10" : "border-[#e7ebf1] hover:border-[#bcd0f5]"}`}>
                                                        <span className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 ${isSel ? "border-[#3b7df6] bg-white ring-inset ring-4 ring-[#3b7df6]" : "border-[#e7ebf1]"}`} />
                                                        <div className="text-[12px] text-[#6b7685] font-semibold">{plan.all?.title || "Plan"}</div>
                                                        <div className="text-[17px] font-bold my-0.5 mb-1.5">{plan.all?.title || "Plan"}</div>
                                                        <div className="text-[22px] font-bold text-[#1e3a6e]">£{plan.all?.price ?? 0}<small className="text-[13px] text-[#6b7685] font-medium"> / month</small></div>
                                                        <span className="inline-block mt-2 bg-[#e7f8f0] text-[#0e7a4d] text-[11px] font-bold px-2.5 py-1 rounded-[20px]">Save £60 / year</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-[15px] font-bold  tracking-[0.04em] text-[#6b7685] mb-3 mt-5 text-center py-4 flex flex-col items-center gap-2">

                                    Select a venue above to view membership plans
                                </div>
                            )}

                            {/* Calendar */}
                            {membershipPlan && (
                                <>
                                    <div className="text-[13px] font-bold uppercase tracking-[0.04em] text-[#6b7685] mb-3 mt-5">Select your start date</div>
                                    {availableDatesSet.size === 0 ? (
                                        <div className="border border-[#ffd21f] bg-[#fffcf0] text-[#8a6d00] font-medium p-4 rounded-[12px] text-[14px] mb-6 flex items-start gap-3">
                                            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                                            <div>
                                                <b>No session dates available</b> at <b>{selectedVenue?.label || "this venue"}</b>.<br />
                                                <button onClick={() => setIsChangingVenue(true)} className="text-[#3b7df6] font-bold mt-1.5 underline hover:text-[#2f6ae0] block">Select a different venue to continue</button>
                                            </div>
                                        </div>
                                    ) : (() => {
                                        const today = new Date(); today.setHours(0, 0, 0, 0);
                                        const hasFutureDates = Array.from(availableDatesSet).some((dateStr) => {
                                            const dateObj = new Date(dateStr);
                                            if (Number.isNaN(dateObj.getTime())) return false;
                                            dateObj.setHours(0, 0, 0, 0);
                                            return dateObj >= today;
                                        });
                                        return hasFutureDates ? (
                                            <div className="border border-[#e7ebf1] rounded-[14px] p-4 max-w-[360px] mb-6">
                                                <div className="flex items-center justify-between mb-3">
                                                    <button onClick={() => { const nd = new Date(currentDate); nd.setMonth(nd.getMonth() - 1); setCurrentDate(nd); }} className="border border-[#e7ebf1] bg-white rounded-full w-[30px] h-[30px] flex items-center justify-center text-[#6b7685] font-bold hover:bg-[#f4f6f9]">
                                                        <ChevronLeft size={16} />
                                                    </button>
                                                    <span className="font-bold text-[15px]">{currentDate.toLocaleString("default", { month: "long" })} {year}</span>
                                                    <button onClick={() => { const nd = new Date(currentDate); nd.setMonth(nd.getMonth() + 1); setCurrentDate(nd); }} className="border border-[#e7ebf1] bg-white rounded-full w-[30px] h-[30px] flex items-center justify-center text-[#6b7685] font-bold hover:bg-[#f4f6f9]">
                                                        <ChevronRight size={16} />
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-7 gap-1 text-center">
                                                    {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <div key={i} className="text-[11px] text-[#6b7685] font-semibold py-1">{d}</div>)}
                                                    {Array.from({ length: (new Date(year, month, 1).getDay() + 6) % 7 }).map((_, i) => <div key={`e${i}`} />)}
                                                    {Array.from({ length: new Date(year, month + 1, 0).getDate() }).map((_, i) => {
                                                        const d = i + 1;
                                                        const dateStr = `${year}-${(month + 1).toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`;
                                                        const isAvail = availableDatesSet.has(dateStr);
                                                        const isSel = selectedDate === dateStr;
                                                        const dateObj = new Date(year, month, d);
                                                        const todayLocal = new Date(); todayLocal.setHours(0, 0, 0, 0);
                                                        const isPast = dateObj < todayLocal;
                                                        let styleClass = "text-[#c2c8d2]";
                                                        if (isAvail) {
                                                            if (isPast) styleClass = "bg-[#ffebee] text-[#d32f2f] font-semibold cursor-not-allowed";
                                                            else styleClass = "bg-[#eef5ff] text-[#1f2733] font-semibold cursor-pointer hover:bg-[#dcebff]";
                                                        }
                                                        if (isSel) styleClass = "!bg-[#3b7df6] !text-white font-semibold cursor-pointer";
                                                        return (
                                                            <div key={d} onClick={() => { if (isAvail && !isPast) setSelectedDate(dateStr); }}
                                                                className={`py-2 text-[13px] rounded-lg ${styleClass}`}>
                                                                {d}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <div className="text-[12px] text-[#6b7685] mt-2.5 flex items-center gap-2">
                                                    <span className="w-2.5 h-2.5 rounded-[3px] bg-[#eef5ff] border border-[#cfe0fb] inline-block"></span> Only dates with an available class are selectable
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="border border-[#ffd21f] bg-[#fffcf0] text-[#8a6d00] font-medium p-4 rounded-[12px] text-[14px] mb-6 flex items-start gap-3">
                                                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                                                <div>
                                                    <b>All session dates have passed</b> at <b>{selectedVenue?.label || "this venue"}</b>.<br />
                                                    <button onClick={() => setIsChangingVenue(true)} className="text-[#3b7df6] font-bold mt-1.5 underline hover:text-[#2f6ae0] block">Select a different venue to continue</button>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </>
                            )}

                            {/* Price breakdown */}
                            {selectedDate && (
                                <div className="bg-[#f7f9fc] border border-[#e7ebf1] rounded-[14px] p-4 md:p-5 mt-5">
                                    <h4 className="text-[13px] uppercase tracking-[0.04em] text-[#6b7685] font-semibold mb-3">Price breakdown</h4>
                                    <div className="flex justify-between items-center text-[14px] py-1.5">
                                        <span className="text-[#6b7685]">{membershipPlan?.label || "Plan"} · {numberOfStudents} student{numberOfStudents > 1 ? "s" : ""}</span>
                                        <span className="font-semibold">£{(pricingBreakdown.nextMonthPayment || 0).toFixed(2)} / mo</span>
                                    </div>
                                    {showStarterPack && (
                                        <>
                                            <div className="flex justify-between items-center text-[14px] py-1.5">
                                                <span className="text-[#6b7685]">Starter pack</span>
                                                <span className="font-semibold">£{(pricingBreakdown.starterPack || 0).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[14px] py-1.5">
                                                <span className="text-[#6b7685]">Delivery fee</span>
                                                <span className="font-semibold">£3.99</span>
                                            </div>
                                            {isApplied && pricingBreakdown.starterDiscount > 0 && (
                                                <div className="flex justify-between items-center text-[14px] py-1.5 text-[#0e7a4d] font-semibold">
                                                    <span>Discount ({appliedDiscount?.data?.type === "percentage" ? `${appliedDiscount.data.value}%` : "fixed"})</span>
                                                    <span>-£{(pricingBreakdown.starterDiscount || 0).toFixed(2)}</span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                    <div className="flex justify-between items-center text-[14px] py-1.5"><span className="text-[#6b7685]">Joining fee</span><span className="font-semibold">No joining fee</span></div>
                                    <div className="flex justify-between items-center text-[14px] py-1.5"><span className="text-[#6b7685]">Pro-rata</span><span className="font-semibold">£{(pricingBreakdown.finalProRataCost || 0).toFixed(2)}</span></div>
                                    <div className="h-[1px] bg-[#e7ebf1] my-2.5" />
                                    <div className="flex justify-between items-center text-[17px] font-bold pt-2"><span className="text-[#1f2733]">Due today</span><span className="text-[#1e3a6e]">£{(pricingBreakdown.totalAmountToday || 0).toFixed(2)}</span></div>
                                    <div className="text-[12px] text-[#6b7685] bg-[#eef5ff] rounded-lg p-3 mt-2.5 leading-[1.6]">
                                        <b className="text-[#1f2733]">Collected immediately (today):</b> {showStarterPack ? "the starter pack (incl. £3.99 delivery) and " : ""}the pro-rata for the part-month you're joining.<br />
                                        <b className="text-[#1f2733]">From the 1st of next month:</b> your first full monthly payment (£{(pricingBreakdown.nextMonthPayment || 0).toFixed(2)}), then on the 1st of each month.
                                    </div>
                                </div>
                            )}

                            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e7ebf1] p-4 z-40 flex gap-3 w-full sm:relative sm:bottom-auto sm:left-auto sm:right-auto sm:bg-transparent sm:border-t-0 sm:p-0 sm:z-auto justify-center sm:mt-7 sm:w-auto">
                                <button onClick={() => (isMulti ? setFlowStep("A") : navigate(-1))} className="sm:w-auto font-semibold text-[15px] rounded-[12px] md:px-8 py-3.5 border border-[#e7ebf1] text-[#1f2733] bg-white px-4">Cancel</button>
                                <button
                                    disabled={!membershipPlan || !selectedDate || (showStarterPack && !selectedAddress) || (showStarterPack && !parents?.[0]?.starterPackSize) || activeStudents.some((s) => !s.selectedClassData) || !!overCapacityInfo}
                                    onClick={() => setFlowStep("C")}
                                    className="sm:w-auto font-semibold text-[15px] rounded-[12px] md:px-8 py-3.5 border border-[#3b7df6] text-white bg-[#3b7df6] disabled:opacity-50 hover:bg-[#2f6ae0] px-4">
                                    Continue to payment
                                </button>
                            </div>
                        </div>
                    )}

                    {/* SCREEN C — Direct Debit */}
                    {flowStep === "C" && (
                        <div>
                            <div className="text-center text-[24px] font-bold mb-1.5 tracking-tight">Set up your monthly Direct Debit</div>
                            <div className="text-center text-[#6b7685] text-[14px] mb-6">This covers your membership, collected on the 1st of each month</div>

                            <div className="grid md:grid-cols-[1fr_1.1fr] gap-6">
                                {/* Summary */}
                                <div className="bg-[#f1f6ff] rounded-[14px] p-5">
                                    <h3 className="text-[#1e3a6e] text-[18px] mb-3.5 font-bold">Your membership</h3>
                                    <div className="flex justify-between text-[13.5px] py-1 text-[#6b7685]"><span>{membershipPlan?.label || "Plan"}</span><span>£{(pricingBreakdown.nextMonthPayment || 0).toFixed(2)} / mo</span></div>
                                    <div className="flex justify-between text-[13.5px] py-1 text-[#6b7685]"><span>Start date</span><span>{selectedDate || "-"}</span></div>
                                    <div className="flex justify-between text-[13.5px] py-1 text-[#6b7685]"><span>First full payment</span><span>1st of Next Month</span></div>
                                    <div className="flex justify-between text-[18px] font-bold text-[#1e3a6e] mt-3.5 border-t border-[#d4e0f5] pt-3"><span>Monthly from 1st</span><span>£{(pricingBreakdown.nextMonthPayment || 0).toFixed(2)}</span></div>
                                </div>

                                {/* Form */}
                                <div>
                                    <h3 className="text-[18px] mb-1 font-bold">Direct Debit details</h3>
                                    <p className="text-[13px] text-[#6b7685] mb-4">Your monthly membership payment is collected by Direct Debit on the 1st of each month.</p>

                                    <div className="mb-4">
                                        <label className="block text-[13px] font-semibold mb-1.5">Account holder name</label>
                                        <input
                                            className={inputClass(!!ddErrors.account_holder_name)}
                                            value={payment.account_holder_name}
                                            onChange={(e) => {
                                                setPayment((p) => ({ ...p, account_holder_name: e.target.value }));
                                                if (ddErrors.account_holder_name) setDdErrors((errs) => ({ ...errs, account_holder_name: "" }));
                                            }}
                                            placeholder="Full name as on bank account"
                                        />
                                        {ddErrors.account_holder_name && <p className="text-[12px] text-[#e53e3e] mt-1">{ddErrors.account_holder_name}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3.5 mb-4">
                                        <div>
                                            <label className="block text-[13px] font-semibold mb-1.5">Sort code</label>
                                            <input className={inputClass(!!ddErrors.branch_code)} value={payment.branch_code} onChange={handleSortCodeChange} placeholder="12-34-56" inputMode="numeric" maxLength={8} />
                                            <div className="text-[11px] text-[#6b7685] mt-1">6 digits, auto-formatted</div>
                                            {ddErrors.branch_code && <p className="text-[12px] text-[#e53e3e] mt-1">{ddErrors.branch_code}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-[13px] font-semibold mb-1.5">Account number</label>
                                            <input className={inputClass(!!ddErrors.account_number)} value={payment.account_number} onChange={handleAccountNumberChange} placeholder="00000000" inputMode="numeric" maxLength={8} />
                                            <div className="text-[11px] text-[#6b7685] mt-1">8 digits</div>
                                            {ddErrors.account_number && <p className="text-[12px] text-[#e53e3e] mt-1">{ddErrors.account_number}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className={`flex items-start gap-2.5 text-[13px] cursor-pointer ${ddErrors.authorise ? "text-[#e53e3e]" : "text-[#6b7685]"}`}>
                                            <input type="checkbox" className="mt-0.5 cursor-pointer" checked={payment.authorise}
                                                onChange={(e) => {
                                                    setPayment((p) => ({ ...p, authorise: e.target.checked }));
                                                    if (ddErrors.authorise) setDdErrors((errs) => ({ ...errs, authorise: "" }));
                                                }} />
                                            <span>I agree to the <strong>Direct Debit Guarantee</strong>, Terms & Conditions and Privacy Policy.</span>
                                        </label>
                                        {ddErrors.authorise && <p className="text-[12px] text-[#e53e3e] mt-1 ml-6">{ddErrors.authorise}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e7ebf1] p-4 z-40 flex gap-3 w-full sm:relative sm:bottom-auto sm:left-auto sm:right-auto sm:bg-transparent sm:border-t-0 sm:p-0 sm:z-auto justify-center sm:mt-7 sm:w-auto">
                                <button onClick={() => setFlowStep("B")} className="sm:w-auto font-semibold text-[15px] rounded-[12px] md:px-8 py-3.5 border border-[#e7ebf1] text-[#1f2733] bg-white px-4">Back</button>
                                <button onClick={handleDDContinue} disabled={!isDDValid} className="sm:w-auto font-semibold text-[15px] rounded-[12px] md:px-8 py-3.5 border border-[#3b7df6] text-white bg-[#3b7df6] disabled:opacity-50 hover:bg-[#2f6ae0] px-4">
                                    Continue to card payment
                                </button>
                            </div>
                        </div>
                    )}

                    {/* SCREEN E — Card */}
                    {flowStep === "E" && (
                        <div>
                            <div className="text-center text-[24px] font-bold mb-1.5 tracking-tight">Pay for your starter pack</div>
                            <div className="text-center text-[#6b7685] text-[14px] mb-6">Your starter pack & delivery are taken today by card — a one-off payment</div>

                            <div className="grid md:grid-cols-[1fr_1.1fr] gap-6">
                                {/* Summary */}
                                <div className="bg-[#f1f6ff] rounded-[14px] p-5">
                                    <h3 className="text-[#1e3a6e] text-[18px] mb-3.5 font-bold">Due today</h3>
                                    <div className="font-bold text-[#1e3a6e] mt-3.5 text-[14px]">Collected now (one-off)</div>
                                    {showStarterPack && (
                                        <>
                                            <div className="flex justify-between text-[13.5px] py-1 text-[#6b7685]">
                                                <span>Starter pack</span>
                                                <span>£{(pricingBreakdown.starterPack || 0).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-[13.5px] py-1 text-[#6b7685]">
                                                <span>Delivery fee</span>
                                                <span>£3.99</span>
                                            </div>
                                            {isApplied && pricingBreakdown.starterDiscount > 0 && (
                                                <div className="flex justify-between text-[13.5px] py-1 text-[#0e7a4d] font-semibold">
                                                    <span>Discount</span>
                                                    <span>-£{(pricingBreakdown.starterDiscount || 0).toFixed(2)}</span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                    <div className="flex justify-between text-[13.5px] py-1 text-[#6b7685]"><span>Joining fee</span><span>£0.00</span></div>
                                    <div className="flex justify-between text-[18px] font-bold text-[#1e3a6e] mt-3.5 border-t border-[#d4e0f5] pt-3">
                                        <span>Total today</span>
                                        <span>£{(pricingBreakdown.totalAmountToday || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="text-[12px] text-[#6b7685] bg-[#eef5ff] rounded-lg p-3 mt-3.5 leading-[1.6]">
                                        Your monthly membership Direct Debit (£{(pricingBreakdown.nextMonthPayment || 0).toFixed(2)}) starts separately on 1st.
                                    </div>
                                </div>

                                {/* Card form */}
                                <div>
                                    <h3 className="text-[18px] mb-1 font-bold">Card details</h3>
                                    <p className="text-[13px] text-[#6b7685] mb-4">This one-off payment covers your starter pack and delivery.</p>

                                    <div className="mb-4">
                                        <label className="block text-[13px] font-semibold mb-1.5">Card number</label>
                                        <div className="relative">
                                            <input className={inputClass(!!cardErrors.cardNumber)} value={payment.cardNumber} onChange={handleCardNumberChange} placeholder="1234 5678 9012 3456" inputMode="numeric" maxLength={19} autoComplete="cc-number" />
                                            {(payment.cardNumber || "").startsWith("4") && (
                                                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#1a1f71] bg-[#e8eaf6] px-2 py-0.5 rounded">VISA</span>
                                            )}
                                            {((payment.cardNumber || "").startsWith("5") || (payment.cardNumber || "").startsWith("2")) && (
                                                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#eb001b] bg-[#fce4ec] px-2 py-0.5 rounded">MC</span>
                                            )}
                                        </div>
                                        {cardErrors.cardNumber
                                            ? <p className="text-[12px] text-[#e53e3e] mt-1">{cardErrors.cardNumber}</p>
                                            : payment.cardNumber && isValidCardNumber(payment.cardNumber)
                                                ? <p className="text-[12px] text-[#21b573] mt-1 flex items-center gap-1"><Check size={12} /> Valid card number</p>
                                                : <div className="text-[11px] text-[#6b7685] mt-1">{(payment.cardNumber || "").replace(/\s/g, "").length}/16 digits</div>
                                        }
                                    </div>

                                    <div className="grid grid-cols-2 gap-3.5 mb-4">
                                        <div>
                                            <label className="block text-[13px] font-semibold mb-1.5">Expiry date</label>
                                            <input className={inputClass(!!cardErrors.expiryDate)} value={payment.expiryDate} onChange={handleExpiryChange} placeholder="MM / YY" inputMode="numeric" maxLength={7} autoComplete="cc-exp" />
                                            {cardErrors.expiryDate
                                                ? <p className="text-[12px] text-[#e53e3e] mt-1">{cardErrors.expiryDate}</p>
                                                : payment.expiryDate && isValidExpiry(payment.expiryDate)
                                                    ? <p className="text-[12px] text-[#21b573] mt-1"><Check size={12} /></p>
                                                    : null
                                            }
                                        </div>
                                        <div>
                                            <label className="block text-[13px] font-semibold mb-1.5">CVC</label>
                                            <input className={inputClass(!!cardErrors.cvc)} value={payment.cvc} onChange={handleCVCChange} placeholder="123" inputMode="numeric" maxLength={4} autoComplete="cc-csc" />
                                            {cardErrors.cvc
                                                ? <p className="text-[12px] text-[#e53e3e] mt-1">{cardErrors.cvc}</p>
                                                : <div className="text-[11px] text-[#6b7685] mt-1">3–4 digits on back</div>
                                            }
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-[13px] font-semibold mb-1.5">Name on card</label>
                                        <input className={inputClass(!!cardErrors.nameOnCard)} value={payment.nameOnCard}
                                            onChange={(e) => {
                                                setPayment((p) => ({ ...p, nameOnCard: e.target.value }));
                                                if (cardErrors.nameOnCard) setCardErrors((errs) => ({ ...errs, nameOnCard: "" }));
                                            }}
                                            placeholder="Full name as printed on card" autoComplete="cc-name" />
                                        {cardErrors.nameOnCard && <p className="text-[12px] text-[#e53e3e] mt-1">{cardErrors.nameOnCard}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3.5">
                                        <div>
                                            <label className="block text-[13px] font-semibold mb-1.5">Country</label>
                                            <Select
                                                styles={rsStyles(false)}
                                                options={countryOptions}
                                                value={countryOptions.find((o) => o.value === payment.country) || countryOptions[0]}
                                                onChange={(opt) => setPayment((p) => ({ ...p, country: opt?.value || "United Kingdom" }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[13px] font-semibold mb-1.5">Postcode / ZIP</label>
                                            <input
                                                className="w-full font-inherit text-[14px] border border-[#e7ebf1] rounded-[10px] px-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-[#3b7df6]"
                                                value={payment.zipCode}
                                                onChange={(e) => setPayment((p) => ({ ...p, zipCode: e.target.value }))}
                                                placeholder="e.g. OX25 4JT"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e7ebf1] p-4 z-40 flex gap-3 w-full sm:relative sm:bottom-auto sm:left-auto sm:right-auto sm:bg-transparent sm:border-t-0 sm:p-0 sm:z-auto justify-center sm:mt-7 sm:w-auto">
                                <button onClick={() => setFlowStep("C")} className="sm:w-auto font-semibold text-[15px] rounded-[12px] md:px-8 py-3.5 border border-[#e7ebf1] text-[#1f2733] bg-white px-4">Back</button>
                                <button
                                    disabled={isSubmitting || !isCardValid}
                                    onClick={handleSubmit}
                                    className="sm:w-auto font-semibold text-[15px] rounded-[12px] md:px-11 px-4 py-3.5 border border-[#21b573] text-white bg-[#21b573] disabled:opacity-50 hover:bg-[#1a935d] flex items-center justify-center gap-2">
                                    {isSubmitting && <Loader2 className="animate-spin w-4 h-4" />}
                                    {isSubmitting ? "Processing..." : `Pay £${(pricingBreakdown.totalAmountToday || 0).toFixed(2)} & confirm`}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* SCREEN D — Success */}
                    {flowStep === "D" && (
                        <div>
                            <div className="text-center text-[24px] font-bold mb-1.5 tracking-tight flex items-center justify-center gap-2">
                                You're all set! <PartyPopper size={22} />
                            </div>
                            <div className="text-center text-[#6b7685] text-[14px] mb-6">{activeNames}'s membership is confirmed</div>

                            <div className="max-w-[560px] mx-auto border border-[#e7ebf1] rounded-[16px] overflow-hidden">
                                <div className="bg-[#3b7df6] text-white px-4 py-3.5 font-semibold text-[14px] flex items-center gap-2">
                                    <MapPin size={16} /> {selectedVenue?.label || "Trinity Sports Centre"}
                                </div>
                                <div className="p-4">
                                    {activeStudents.map((s, i) => (
                                        <div key={s._tmpId ?? i} className="flex items-center gap-3.5 py-2.5 font-semibold text-[14px]">
                                            <User size={16} className="text-[#3b7df6]" /> {s.studentFirstName} {s.studentLastName} — {s.selectedClassData?.className || " (Beginner)"} {showStarterPack ? `· kit ${parents?.[0]?.starterPackSize || ""}` : ""}
                                        </div>
                                    ))}
                                    <div className="flex items-center gap-3.5 py-2.5 font-semibold text-[14px]">
                                        <CalendarIcon size={16} className="text-[#3b7df6]" /> Starts {selectedDate || "-"} · {membershipPlan?.label || "Plan"}
                                    </div>
                                </div>
                            </div>
                            <div className="max-w-[560px] mx-auto text-[12px] text-[#6b7685] text-center mt-3.5 flex items-center justify-center gap-1.5">
                                <Mail size={14} />
                                A confirmation email with your booking details, payment summary and Direct Debit schedule has been sent to your inbox.
                            </div>

                            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e7ebf1] p-4 z-40 flex gap-3 w-full sm:relative sm:bottom-auto sm:left-auto sm:right-auto sm:bg-transparent sm:border-t-0 sm:p-0 sm:z-auto justify-center sm:mt-7 sm:w-auto">
                                <button onClick={() => navigate("/bookings")} className="sm:w-auto font-semibold text-[15px] rounded-[12px] px-11 py-3.5 border border-[#21b573] text-white bg-[#21b573] hover:bg-[#1a935d]">Finish</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Dev flow toggles */}
                <div className="max-w-[1040px] mx-auto mt-4 px-6 text-[12px] text-[#6b7685] text-center">
                    Prototype — single-child journey starts at "Confirm & choose".
                </div>
                <div className="flex flex-col sm:flex-row justify-center gap-3 mt-3.5 mb-6 w-full max-w-md mx-auto sm:max-w-none">
                    <button onClick={() => { setDemoMode("single"); setFlowStep("B"); }}
                        className={`w-full sm:w-auto font-semibold text-[13px] rounded-[12px] px-8 py-3.5 border transition-all ${demoMode === "single" ? "bg-[#3b7df6] text-white border-[#3b7df6]" : "bg-white text-[#1f2733] border-[#e7ebf1]"}`}>
                        Single-child flow
                    </button>
                    <button onClick={() => { setDemoMode("multi"); setFlowStep("A"); }}
                        className={`w-full sm:w-auto font-semibold text-[13px] rounded-[12px] px-8 py-3.5 border transition-all ${demoMode === "multi" ? "bg-[#3b7df6] text-white border-[#3b7df6]" : "bg-white text-[#1f2733] border-[#e7ebf1]"}`}>
                        Multi-child flow
                    </button>
                </div>
            </div>

            {/* ── Size Chart Modal ── */}
            <AnimatePresence>
                {isSizeChartOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto"
                        onClick={() => setIsSizeChartOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            transition={{ type: "spring", duration: 0.4 }}
                            className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex justify-between items-center px-8 py-5 border-b border-gray-100">
                                <div>
                                    <span className="text-[12px] uppercase tracking-wider text-[#237FEA] font-bold">Size guides</span>
                                    <h2 className="text-[22px] font-bold text-gray-900 leading-tight">Kids Size Chart</h2>
                                </div>
                                <button
                                    onClick={() => setIsSizeChartOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
                                >
                                    <X className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-8 space-y-6 overflow-y-auto">
                                <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
                                    <table className="w-full text-center border-collapse text-sm">
                                        <thead>
                                            <tr className="bg-gray-900 text-white text-[13px] font-semibold tracking-wider uppercase">
                                                <th rowSpan="2" className="py-3 px-4 border-r border-gray-800 align-middle">Size</th>
                                                <th rowSpan="2" className="py-3 px-4 border-r border-gray-800 align-middle">Age</th>
                                                <th colSpan="2" className="py-2 px-4 border-r border-gray-800">Height</th>
                                                <th colSpan="2" className="py-2 px-4 border-r border-gray-800">Chest</th>
                                                <th colSpan="2" className="py-2 px-4">Waist</th>
                                            </tr>
                                            <tr className="bg-gray-800 text-gray-200 text-[11px] font-semibold uppercase">
                                                <th className="py-2 px-4 border-r border-gray-700">cm</th>
                                                <th className="py-2 px-4 border-r border-gray-700">in</th>
                                                <th className="py-2 px-4 border-r border-gray-700">cm</th>
                                                <th className="py-2 px-4 border-r border-gray-700">in</th>
                                                <th className="py-2 px-4 border-r border-gray-700">cm</th>
                                                <th className="py-2 px-4">in</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 text-gray-700">
                                            {[
                                                { size: "Small", age: "4-5", height: { cm: "107", in: "42" }, chest: { cm: "68", in: "26" }, waist: { cm: "46", in: "18" } },
                                                { size: "Medium", age: "6-7", height: { cm: "119", in: "46" }, chest: { cm: "74", in: "29" }, waist: { cm: "50", in: "20" } },
                                                { size: "Large", age: "8-9", height: { cm: "131", in: "51" }, chest: { cm: "84", in: "33" }, waist: { cm: "54", in: "21" } },
                                                { size: "Extra Large", age: "10-12", height: { cm: "143", in: "56" }, chest: { cm: "89", in: "34" }, waist: { cm: "58", in: "23" } },
                                                { size: "XXL", age: "13-14", height: { cm: "152", in: "60" }, chest: { cm: "98", in: "38" }, waist: { cm: "68", in: "26" } },
                                            ].map((row, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50/70 transition-colors odd:bg-white even:bg-gray-50/30">
                                                    <td className="py-3.5 px-4 font-semibold text-gray-900 border-r border-gray-100">{row.size}</td>
                                                    <td className="py-3.5 px-4 border-r border-gray-100">{row.age}</td>
                                                    <td className="py-3.5 px-4 border-r border-gray-100">{row.height.cm}</td>
                                                    <td className="py-3.5 px-4 border-r border-gray-100">{row.height.in}</td>
                                                    <td className="py-3.5 px-4 border-r border-gray-100">{row.chest.cm}</td>
                                                    <td className="py-3.5 px-4 border-r border-gray-100">{row.chest.in}</td>
                                                    <td className="py-3.5 px-4 border-r border-gray-100">{row.waist.cm}</td>
                                                    <td className="py-3.5 px-4">{row.waist.in}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="border-l-4 border-[#237FEA] pl-4 py-1">
                                    <h3 className="text-[16px] font-bold text-gray-900">How to measure?</h3>
                                    <p className="text-sm text-gray-600 mt-1">To choose the correct size, measure your child's body as follows:</p>
                                </div>

                                <div className="flex justify-center items-center py-6 bg-[#fcfcfc] rounded-2xl border border-gray-100 shadow-inner">
                                    <img
                                        src="/assets/Kids-Size-Guide.png"
                                        alt="Kids Measuring Guide"
                                        className="max-h-[380px] w-auto object-contain rounded-xl hover:scale-[1.01] transition-transform duration-300"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}


            </AnimatePresence>

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
                            className="bg-white rounded-3xl w-full max-w-[640px] shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex justify-between items-center px-7 py-5 border-b border-gray-100">
                                <div>
                                    <span className="text-[12px] uppercase tracking-wider text-[#3b7df6] font-bold">New child</span>
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
                                            className={inputClass(!!newChildErrors.dateOfBirth)}
                                            value={newChildForm.dateOfBirth}
                                            onChange={handleNewChildDOBChange}
                                            placeholder="DD/MM/YYYY"
                                            inputMode="numeric"
                                            maxLength={10}
                                        />
                                        {newChildErrors.dateOfBirth && <p className="text-[12px] text-[#e53e3e] mt-1">{newChildErrors.dateOfBirth}</p>}
                                    </div>

                                    {/* Age (auto) */}
                                    <div>
                                        <label className="block text-[14px] font-semibold mb-1.5">Age</label>
                                        <input
                                            className="w-full font-inherit text-[14px] border border-[#e7ebf1] bg-[#f4f6f9] text-[#6b7685] rounded-[10px] px-3.5 py-3 cursor-not-allowed"
                                            value={calculateAge(newChildForm.dateOfBirth)}
                                            placeholder="Auto calculated"
                                            disabled
                                            readOnly
                                        />
                                    </div>

                                    {/* Gender */}
                                    <div>
                                        <label className="block text-[14px] font-semibold mb-1.5">Gender</label>
                                        <Select
                                            styles={rsStyles(!!newChildErrors.gender)}
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
                                            value={newChildForm.medicalInformation}
                                            onChange={(e) => setNewChildForm((f) => ({ ...f, medicalInformation: e.target.value }))}
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
                                    Add child
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BookMembership;