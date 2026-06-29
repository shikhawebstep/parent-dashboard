import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { showErrorToast, showError, showSuccess } from "../../../utils/swalHelper";
import { motion, AnimatePresence } from "framer-motion";
import Select from "react-select";
import PhoneNumberInput from "../../commom/PhoneNumberInput";
import { useCommon } from "../../context/CommonContext";
import { useProfile } from "../../context/ProfileContext";

// ── Options ───────────────────────────────────────────────
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
const sizeOptions = [
    { value: "Small", label: "Small" },
    { value: "Medium", label: "Medium" },
    { value: "Large", label: "Large" },
    { value: "XL", label: "Extra Large" },
];

// ── Inits ─────────────────────────────────────────────────
const INIT_STUDENT = () => ({
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

const INIT_EMERGENCY = {
    sameAsAbove: false,
    emergencyFirstName: "",
    emergencyLastName: "",
    emergencyPhoneNumber: "",
    emergencyRelation: "",
};

const INIT_PAYMENT = {
    email: "", account_holder_name: "", firstName: "", lastName: "",
    branch_code: "", account_number: "", line1: "", city: "",
    postalCode: "", authorise: false,
};

// ── Small helpers ─────────────────────────────────────────
const Err = ({ k, e }) => e[k] ? <p className="text-red-500 text-sm mt-1 ml-1 font-medium">{e[k]}</p> : null;

const fc = (k, e) =>
    `w-full mt-2 border rounded-xl px-4 py-3 text-base focus:outline-none ${e[k] ? "border-red-500 bg-red-50" : "border-gray-300"}`;

const ss = (k, e) => ({
    control: (b, s) => ({
        ...b, borderRadius: "0.75rem", minHeight: "48px", marginTop: "8px",
        borderColor: e[k] ? "#ef4444" : b.borderColor,
        "&:hover": { borderColor: e[k] ? "#ef4444" : b.borderColor },
        boxShadow: s.isFocused && e[k] ? "0 0 0 1px #ef4444" : b.boxShadow,
    }),
});

const toDateOnly = (str) => {
    if (!str) return null;
    // handle both DD/MM/YYYY and YYYY-MM-DD
    if (str.includes("/")) {
        const [d, m, y] = str.split("/").map(Number);
        if (!d || !m || !y) return null;
        return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }
    return str;
};

const formatLocalDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

// ── Component ─────────────────────────────────────────────
const BookMembership = () => {
    const token = localStorage.getItem("parentToken");
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const { fetchVenues, venues } = useCommon();
    const { profile, fetchProfileData } = useProfile();
    const location = useLocation();
    const booking = location.state?.booking;
    const navigate = useNavigate();

    // ── State ─────────────────────────────────────────────
    const [fe, setFe] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [step, setStep] = useState(1);
    const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
    const [isBooked, setIsBooked] = useState(false);
    const [isOpenMembership, setIsOpenMembership] = useState(false);

    // info
    const [selectedVenue, setSelectedVenue] = useState(null);
    const [numberOfStudents, setNumberOfStudents] = useState(1);
    const [membershipPlan, setMembershipPlan] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [discountCode, setDiscountCode] = useState("");
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    const [isApplied, setIsApplied] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [isDiscountLoading, setIsDiscountLoading] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());

    // pricing
    const [pricingBreakdown, setPricingBreakdown] = useState({
        pricePerClassPerChild: 0, numberOfLessonsProRated: 0, finalProRataCost: 0,
        starterPack: 0, totalAmountToday: 0, isFullMonthCharge: false,
        stripeAmount: 0, nextMonthPayment: 0,
    });

    // form
    const [students, setStudents] = useState([INIT_STUDENT()]);
    const [parents, setParents] = useState([INIT_PARENT()]);
    const [emergency, setEmergency] = useState(INIT_EMERGENCY);
    const [payment, setPayment] = useState(INIT_PAYMENT);

    // card (step 2)
    const [nameOnCard, setNameOnCard] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [cvc, setCvc] = useState("");
    const [checkoutCountry, setCheckoutCountry] = useState("United Kingdom");
    const [zipCode, setZipCode] = useState("");

    const infoRef = useRef(null);
    const studentRefs = useRef([]);
    const parentRefs = useRef([]);
    const emergencyRef = useRef(null);
    const hasInitialized = useRef(false);

    // ── Derived ───────────────────────────────────────────
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const adminInfo = JSON.parse(localStorage.getItem("adminInfo") || "{}");
    const isFranchisee = adminInfo?.role?.role === "Franchisee";

    const venueData = selectedVenue?.all || null;

    const allPaymentPlans = venueData?.paymentGroups?.[0]?.paymentPlans?.map((p) => ({
        label: `${p.title} (${p.students} student${p.students > 1 ? "s" : ""})`,
        value: p.id,
        starterPackPrice: p.starterPackPrice || 0,
        all: p,
    })) || [];

    const paymentPlanOptions = numberOfStudents
        ? allPaymentPlans.filter((p) => p.all?.students === Number(numberOfStudents))
        : allPaymentPlans;

    const allClasses = venueData
        ? Object.entries(venueData.classes || {}).flatMap(([, classes]) =>
            classes.map((c) => ({
                id: c.classId,
                className: c.className,
                startTime: c.time?.split(" - ")[0] || "",
                endTime: c.time?.split(" - ")[1] || "",
                capacity: c.capacity,
                level: c.level,
            }))
        )
        : [];

    const classesWithCapacity = allClasses.filter((c) => c.capacity > 0);

    const venueClassOptions = classesWithCapacity.map((cls) => ({
        value: cls.id,
        label: `${cls.className}${cls.level ? ` (${cls.level})` : ""}`,
    }));

    const sessionDates = venueData?.terms?.flatMap((t) =>
        t.sessionsMap.map((s) => s.sessionDate)
    ) || [];
    const sessionDatesSet = new Set(sessionDates);

    // starter pack — driven by selected plan's starterPackPrice
    console.log('selectedVenue', selectedVenue)
    const showStarterPack = selectedVenue?.all?.starterPack;
    const starterPackPrice = selectedVenue?.all?.starterPacks[0]?.price || 0;


    const formatDOBForDisplay = (isoDate) => {
        if (!isoDate) return "";
        const [y, m, d] = isoDate.split("-");
        if (!y || !m || !d) return "";
        return `${d}/${m}/${y}`;
    };

    useEffect(() => {
        if (!profile) {
            setParents([INIT_PARENT()]);
            setStudents([INIT_STUDENT()]);
            setEmergency(INIT_EMERGENCY);
            return;
        }

        const rawParents = profile?.adminMeta?.parents || [];
        const rawStudents = profile?.adminMeta?.students || [];

        const normalizeDOB = (raw) => {
            if (!raw) return "";
            return raw.includes("-") ? formatDOBForDisplay(raw) : raw;
        };

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
            starterPackSize: p.starterPackSize || "",
            emailMessage: "",
            emailStatus: "",
        }));

        const normalizedStudents = rawStudents.map((s) => ({
            studentFirstName: s.studentFirstName || "",
            studentLastName: s.studentLastName || "",
            dateOfBirth: normalizeDOB(s.dateOfBirth || s.dob),
            age: s.age ?? "",
            gender: s.gender || "",
            medicalInformation: s.medicalInformation || s.medicalInfo || "",
            selectedClassId: s.selectedClassId || null,
            selectedClassData: s.selectedClassData || null,
        }));

        setParents(normalizedParents.length ? normalizedParents : [INIT_PARENT()]);
        setStudents(normalizedStudents.length ? normalizedStudents : [INIT_STUDENT()]);

        setNumberOfStudents(normalizedStudents.length)

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
                id: emergencyContact.id || "",
            });
        } else {
            setEmergency(INIT_EMERGENCY);
        }
    }, [profile]);


    // ── Effects ───────────────────────────────────────────

    useEffect(() => {
        fetchVenues();
        fetchProfileData();
    }, [fetchVenues]);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!booking?.serviceType || !booking?.id) return;
            try {
                const parentToken = localStorage.getItem("parentToken");
                const serviceType = (booking.serviceType.trim() || "")
                    .replace(/\s+/g, "")
                    .toLowerCase();

                const formattedServices = (service) => {
                    const serviceMap = {
                        "weeklyclassmembership": "weekly",
                        "weeklyclasstrial": "weekly",
                        "onetoone": "onetoone",
                        "birthdayparty": "birthday",
                        "holidaycamp": "holiday",
                    };
                    return serviceMap[service] || service;
                };

                const response = await fetch(
                    `${API_BASE_URL}api/parent/account-profile/preview?serviceType=${formattedServices(serviceType)}&bookingId=${booking.id}`,
                    {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${parentToken}`,
                            "Content-Type": "application/json"
                        }
                    }
                );

                const data = await response.json();
                if (response.ok) {
                    const details = data?.data || data;

                    const rawParents = details?.parents || (details?.parent ? [details.parent] : []);
                    const rawStudents = details?.students || (details?.student ? [details.student] : []);

                    const normalizeDOB = (raw) => {
                        if (!raw) return "";
                        return raw.includes("-") ? formatDOBForDisplay(raw) : raw;
                    };

                    const normalizedParents = rawParents.map((p) => ({
                        id: p.id ?? Date.now() + Math.random(),
                        parentFirstName: p.parentFirstName || p.firstName || "",
                        parentLastName: p.parentLastName || p.lastName || "",
                        parentEmail: p.parentEmail || p.email || "",
                        parentPhoneNumber: p.parentPhoneNumber || p.phoneNumber || "",
                        interestReason: p.interestReason || "",
                        interestReasonOther: p.interestReasonOther || "",
                        relationToChild: p.relationToChild || p.relationChild || "",
                        howDidYouHear: p.howDidYouHear || p.howDidHear || "",
                        isCustomReason: p.isCustomReason || false,
                        starterPackSize: p.starterPackSize || "",
                        emailMessage: "",
                        emailStatus: "",
                    }));

                    const normalizedStudents = rawStudents.map((s) => ({
                        studentFirstName: s.studentFirstName || s.firstName || "",
                        studentLastName: s.studentLastName || s.lastName || "",
                        dateOfBirth: normalizeDOB(s.dateOfBirth || s.dob),
                        age: s.age ?? "",
                        gender: s.gender || "",
                        medicalInformation: s.medicalInformation || s.medicalInfo || "",
                        selectedClassId: s.selectedClassId || s?.classSchedule?.id || null,
                        selectedClassData: s.selectedClassData || s?.classSchedule || null,
                    }));

                    if (normalizedParents.length) setParents(normalizedParents);
                    if (normalizedStudents.length) {
                        setStudents(normalizedStudents);
                        setNumberOfStudents(normalizedStudents.length);
                    }

                    const emergencyContact = details?.emergency;
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
                    }

                    if (details?.venue) {
                        const vId = details.venue.id || details.venue.venueId;
                        const vOption = venues?.capacityVenues?.find(v => v.venueId === vId);
                        if (vOption) {
                            setSelectedVenue({
                                value: vOption.venueId,
                                label: vOption.venueName,
                                all: vOption,
                            });
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching preview details:", error);
            }
        };

        if (venues?.capacityVenues?.length > 0) {
            fetchDetails();
        }
    }, [booking, venues, API_BASE_URL]);


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


    useEffect(() => {
        if (hasInitialized.current || !sessionDatesSet.size) return;
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const future = Array.from(sessionDatesSet)
            .map((d) => new Date(d))
            .filter((d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x >= today; })
            .sort((a, b) => a - b);
        if (!future.length) return;
        setCurrentDate(new Date(future[0].getFullYear(), future[0].getMonth(), 1));
        hasInitialized.current = true;
    }, [sessionDatesSet.size]);

    useEffect(() => {
        if (selectedDate && membershipPlan) calculateAmount(selectedDate);
    }, [numberOfStudents, membershipPlan, selectedDate, isApplied, appliedDiscount]);

    // ── Calendar ──────────────────────────────────────────
    const getDaysArray = () => {
        const startDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = [];
        const offset = startDay === 0 ? 6 : startDay - 1;
        for (let i = 0; i < offset; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
        return days;
    };
    const calendarDays = getDaysArray();

    const isSameDate = (d1, d2) => {
        const a = typeof d1 === "string" ? new Date(d1) : d1;
        const b = typeof d2 === "string" ? new Date(d2) : d2;
        return a && b && a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
    };

    // ── Helpers ───────────────────────────────────────────
    const clearErr = (k) => setFe((p) => { const n = { ...p }; delete n[k]; return n; });

    const handleNumberChange = (e) => {
        const val = e.target.value === "" ? "" : Number(e.target.value);
        if (val === "" || [1, 2, 3, 4].includes(val)) {
            setNumberOfStudents(val);
            setStudents((prev) => {
                if (val === "") return [];
                if (val > prev.length) {
                    // profile se students lo agar available hain
                    const profileStudents = profile?.adminMeta?.students || [];
                    const extra = Array.from({ length: val - prev.length }, (_, i) => {
                        const profileStudent = profileStudents[prev.length + i];
                        if (profileStudent) {
                            return {
                                studentFirstName: profileStudent.studentFirstName || "",
                                studentLastName: profileStudent.studentLastName || "",
                                dateOfBirth: profileStudent.dateOfBirth
                                    ? profileStudent.dateOfBirth.includes("-")
                                        ? formatDOBForDisplay(profileStudent.dateOfBirth)
                                        : profileStudent.dateOfBirth
                                    : "",
                                age: profileStudent.age ?? "",
                                gender: profileStudent.gender || "",
                                medicalInformation: profileStudent.medicalInformation || profileStudent.medicalInfo || "",
                                selectedClassId: profileStudent.selectedClassId || null,
                                selectedClassData: profileStudent.selectedClassData || null,
                                error: null,
                            };
                        }
                        return INIT_STUDENT();
                    });
                    return [...prev, ...extra];
                }
                return prev.slice(0, val);
            });
            if (membershipPlan && membershipPlan.all?.students !== val) {
                setMembershipPlan(paymentPlanOptions.find((p) => p.all?.students === val) || null);
            }
        }
    };

    const handlePlanChange = (plan) => {
        setMembershipPlan(plan);
        if (!plan) return;
        const val = Number(plan.all?.students);
        setNumberOfStudents(val);
        setStudents((prev) => {
            if (val > prev.length) {
                const profileStudents = profile?.adminMeta?.students || [];
                const extra = Array.from({ length: val - prev.length }, (_, i) => {
                    const profileStudent = profileStudents[prev.length + i];
                    if (profileStudent) {
                        return {
                            studentFirstName: profileStudent.studentFirstName || "",
                            studentLastName: profileStudent.studentLastName || "",
                            dateOfBirth: profileStudent.dateOfBirth
                                ? profileStudent.dateOfBirth.includes("-")
                                    ? formatDOBForDisplay(profileStudent.dateOfBirth)
                                    : profileStudent.dateOfBirth
                                : "",
                            age: profileStudent.age ?? "",
                            gender: profileStudent.gender || "",
                            medicalInformation: profileStudent.medicalInformation || profileStudent.medicalInfo || "",
                            selectedClassId: profileStudent.selectedClassId || null,
                            selectedClassData: profileStudent.selectedClassData || null,
                            error: null,
                        };
                    }
                    return INIT_STUDENT();
                });
                return [...prev, ...extra];
            }
            return prev.slice(0, val);
        });
    };

    const handleDOBChange = (index, value) => {
        let c = value.replace(/[^\d]/g, "");
        if (c.length > 2 && c.length <= 4) c = `${c.slice(0, 2)}/${c.slice(2)}`;
        else if (c.length > 4) c = `${c.slice(0, 2)}/${c.slice(2, 4)}/${c.slice(4, 8)}`;
        const updated = [...students];
        updated[index].dateOfBirth = c;
        if (c.length === 10) {
            const [d, m, y] = c.split("/").map(Number);
            const date = new Date(y, m - 1, d);
            if (date.getDate() === d && date.getMonth() === m - 1 && date.getFullYear() === y) {
                const today = new Date();
                let age = today.getFullYear() - y;
                const mo = today.getMonth() - (m - 1);
                if (mo < 0 || (mo === 0 && today.getDate() < d)) age--;
                updated[index].age = age >= 3 && age <= 100 ? age : "";
            } else updated[index].age = "";
        } else updated[index].age = "";
        setStudents(updated);
    };

    const handleStudentChange = (index, field, value) => {
        const u = [...students]; u[index][field] = value; setStudents(u);
    };

    const handleStudentClassChange = (index, option) => {
        const u = [...students];
        if (!option) {
            u[index].selectedClassId = null;
            u[index].selectedClassData = null;
            u[index].error = null;
        } else {
            const cls = allClasses.find((c) => c.id === option.value);

            const alreadySelectedCount = u.filter((s, i) => i !== index && s.selectedClassId === option.value).length;
            const remainingCapacity = (cls?.capacity || 0) - alreadySelectedCount;

            u[index].selectedClassId = option.value;
            u[index].selectedClassData = cls || null;

            if (cls?.capacity === 0) {
                u[index].error = "This class has no capacity. Please select another.";
            } else if (remainingCapacity <= 0) {
                u[index].error = "Not enough space in this class for another student. Please select another.";
            } else {
                u[index].error = null;
            }
        }
        setStudents(u);
    };

    const handleRemoveStudent = (index) => {
        setStudents((prev) => {
            const next = prev.filter((_, i) => i !== index);
            setNumberOfStudents(next.length);
            return next;
        });
    };

    const handleParentChange = (index, field, value) => {
        const u = [...parents]; u[index][field] = value; setParents(u);
    };

    const handleEmailBlur = async (index, email) => {
        if (!email) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/check-parent-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ email }),
            });
            const result = await res.json();
            handleParentChange(index, "emailMessage", result.message || "");
            handleParentChange(index, "emailStatus", res.ok ? "success" : "error");
        } catch {
            handleParentChange(index, "emailMessage", "Error checking email");
            handleParentChange(index, "emailStatus", "error");
        }
    };

    const handleApplyDiscount = async () => {
        if (!discountCode.trim()) { setIsChecked(true); setIsApplied(false); return; }
        setIsChecked(true); setIsDiscountLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/book-membership/apply-discount`, {
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

    // ── Pricing ───────────────────────────────────────────
    const calculateAmount = (startDate) => {
        if (!membershipPlan || !startDate) return;
        const monthlyPrice = Number(membershipPlan?.all?.price ?? 0);
        const starterPack = showStarterPack ? Number(starterPackPrice) : 0;
        const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
        const selected = parse(startDate); selected.setHours(0, 0, 0, 0);
        const allS = Array.from(sessionDatesSet).map((d) => { const x = parse(d); x.setHours(0, 0, 0, 0); return x; });
        const inMonth = allS.filter((d) => d.getMonth() === selected.getMonth() && d.getFullYear() === selected.getFullYear()).sort((a, b) => a - b);
        const first = inMonth[0];
        const isFirstSelected = first && selected.getTime() === first.getTime();
        const remaining = inMonth.filter((d) => d.getTime() >= selected.getTime());
        const proRataLessons = remaining.length;
        const ppl = membershipPlan?.all?.priceLesson || 0;
        const proRataCost = Math.min(Number((proRataLessons * ppl).toFixed(2)), monthlyPrice);
        const isFullMonth = (isFirstSelected && proRataLessons >= 3) || proRataCost >= monthlyPrice;
        let starterDiscount = 0;
        if (isApplied && appliedDiscount?.data) {
            starterDiscount = appliedDiscount.data.type === "percentage"
                ? (starterPack * Number(appliedDiscount.data.value)) / 100
                : Number(appliedDiscount.data.discountAmount || 0);
        }
        const totalToday = showStarterPack
            ? Number((Math.max(starterPack + 3.99 - starterDiscount, 0)).toFixed(2))
            : 0;

        const breakdown = {
            pricePerClassPerChild: ppl,
            numberOfLessonsProRated: proRataLessons,
            finalProRataCost: proRataCost,
            starterPack,
            totalAmountToday: totalToday,
            nextMonthPayment: Number(monthlyPrice.toFixed(2)),
            isFullMonthCharge: isFullMonth,
            stripeAmount: showStarterPack ? Math.max(starterPack - starterDiscount, 0) + 3.99 : 0,
        };
        setPricingBreakdown(breakdown);
        return { totalToday, breakdown };
    };

    // ── Validation ────────────────────────────────────────
    const validate = () => {
        if (parents.some((p) => p.emailStatus === "error")) return false;
        const errs = {};
        if (!membershipPlan) errs.membershipPlan = "Membership plan is required";
        if (!selectedDate) errs.selectedDate = "Start date is required";

        const classSelections = {};
        students.forEach((s, i) => {
            if (!s.studentFirstName?.trim()) errs[`s${i}_firstName`] = "First name is required";
            if (!s.studentLastName?.trim()) errs[`s${i}_lastName`] = "Last name is required";
            if (!s.dateOfBirth) errs[`s${i}_dob`] = "Date of birth is required";
            if (!s.gender) errs[`s${i}_gender`] = "Gender is required";
            if (!s.medicalInformation?.trim()) errs[`s${i}_medical`] = "Required — write 'None' if not applicable";

            if (!s.selectedClassId) {
                errs[`s${i}_class`] = "Please select a class";
            } else {
                const clsId = s.selectedClassId;
                classSelections[clsId] = (classSelections[clsId] || 0) + 1;
                if (s.selectedClassData && classSelections[clsId] > s.selectedClassData.capacity) {
                    errs[`s${i}_class`] = "Not enough space in this class for all selected students.";
                } else if (s.selectedClassData?.capacity === 0) {
                    errs[`s${i}_class`] = "This class has no capacity";
                } else if (s.error) {
                    errs[`s${i}_class`] = s.error;
                }
            }
        });

        parents.forEach((p, i) => {
            if (!p.parentFirstName?.trim()) errs[`p${i}_firstName`] = "First name is required";
            if (!p.parentLastName?.trim()) errs[`p${i}_lastName`] = "Last name is required";
            if (!p.parentEmail?.trim()) errs[`p${i}_email`] = "Email is required";
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.parentEmail)) errs[`p${i}_email`] = "Enter a valid email";
            if (!p.parentPhoneNumber?.trim()) errs[`p${i}_phone`] = "Phone number is required";
            if (!p.interestReason) errs[`p${i}_reason`] = "Selection required";
            if (!p.relationToChild) errs[`p${i}_relation`] = "Relation is required";
            if (!p.howDidYouHear) errs[`p${i}_hear`] = "Please select how you heard about us";
            if (i === 0 && showStarterPack && !p.starterPackSize) errs[`p${i}_size`] = "Size is required";
        });

        if (!emergency.emergencyFirstName?.trim()) errs.e_firstName = "First name is required";
        if (!emergency.emergencyLastName?.trim()) errs.e_lastName = "Last name is required";
        if (!emergency.emergencyPhoneNumber?.trim()) errs.e_phone = "Phone number is required";
        if (!emergency.emergencyRelation) errs.e_relation = "Relation is required";

        setFe(errs);

        if (Object.keys(errs).length) {
            showErrorToast("Validation Error", "Please fill in all required fields highlighted in red.");
            const first = Object.keys(errs)[0];
            setTimeout(() => {
                if (errs.membershipPlan || errs.selectedDate || errs.venue) infoRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                else if (first.startsWith("s")) studentRefs.current[Number(first[1])]?.scrollIntoView({ behavior: "smooth", block: "center" });
                else if (first.startsWith("p")) parentRefs.current[Number(first[1])]?.scrollIntoView({ behavior: "smooth", block: "center" });
                else if (first.startsWith("e")) emergencyRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 100);
            return false;
        }
        return true;
    };


    console.log('students', students)
    // ── Submit ────────────────────────────────────────────
    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const API_URL = import.meta.env.VITE_API_BASE_URL;
            const parentData = JSON.parse(localStorage.getItem("parentData"));
            const parentId = parentData?.id;

            let overridePaymentType = "bank";
            const allBookings = profile?.bookings ? (Array.isArray(profile.bookings) ? profile.bookings : Object.values(profile.bookings).flat()) : [];
            const weeklyMembershipBooking = allBookings.find(b => b?.serviceType?.toLowerCase() === "weekly class membership");

            if (weeklyMembershipBooking) {
                const usesAccessPaySuite = weeklyMembershipBooking?.payments?.some(p => p?.paymentType?.toLowerCase() === "accesspaysuite");
                if (usesAccessPaySuite) {
                    overridePaymentType = "accesspaysuite";
                }
            }

            const payload = {
                venueId: selectedVenue?.value,
                startDate: selectedDate,
                totalStudents: students.length,

                students: students.map((student) => ({
                    studentFirstName: student.studentFirstName,
                    studentLastName: student.studentLastName,
                    dateOfBirth: toDateOnly(student.dateOfBirth),
                    age: Number(student.age),
                    gender: student.gender,
                    medicalInformation: student.medicalInformation || "NA",
                    selectedClassId: Number(student.selectedClassId),
                    initialClassId: student.initialClassId || null,
                    classScheduleId: student.selectedClassData?.id || student.selectedClassData?.classScheduleId
                        ? Number(student.selectedClassData.classScheduleId || student.selectedClassData?.id)
                        : null,
                    ...(booking && { id: student.id || student?.studentId || "" }),
                })),

                parents: parents.map((parent) => ({
                    parentFirstName: parent.parentFirstName,
                    parentLastName: parent.parentLastName,
                    parentEmail: parent.parentEmail,
                    parentPhoneNumber: parent.parentPhoneNumber,
                    interestReason: parent.interestReason,
                    interestReasonOther: parent.interestReasonOther || "NA",
                    relationToChild: parent.relationToChild,
                    howDidYouHear: parent.howDidYouHear,
                    isCustomReason: parent.isCustomReason || false,
                    starterPackSize: parent.starterPackSize || null,
                    ...(booking && { id: parent.id || parent?.parentId || "" }),
                })),

                starterPack: showStarterPack ? Number(starterPackPrice) : 0,
                discountId: isApplied && appliedDiscount?.data?.id ? appliedDiscount.data.id : null,
                size: showStarterPack ? (parents[0]?.starterPackSize || null) : null,

                emergency: {
                    sameAsAbove: emergency.sameAsAbove,
                    emergencyFirstName: emergency.emergencyFirstName,
                    emergencyLastName: emergency.emergencyLastName,
                    emergencyPhoneNumber: emergency.emergencyPhoneNumber,
                    emergencyRelation: emergency.emergencyRelation,
                    ...(booking && { id: emergency.id || "" }),
                },

                paymentPlanId: Number(membershipPlan?.value),

                payment: {
                    paymentType: overridePaymentType,
                    firstName: payment.firstName,
                    lastName: payment.lastName,
                    account_number: payment.account_number,
                    branch_code: payment.branch_code,
                    account_holder_name: payment.account_holder_name,
                    authorise: payment.authorise,
                    price: Number(pricingBreakdown.nextMonthPayment),
                    proRataAmount: Number(pricingBreakdown.finalProRataCost),
                    line1: payment.line1,
                    city: payment.city,
                    postCode: payment.postalCode,
                    nameOnCard,
                    cardNumber: cardNumber.replace(/\s/g, ""),
                    expiryDate,
                    cvc,
                    country: checkoutCountry,
                    zipCode,
                },
            };

       
            const APIURL = booking
                ? `${API_URL}api/parent/booking/start-membership/${booking?.id}`
                : `${API_URL}api/parent/booking/membership/create/${parentId}`;

            const response = await fetch(APIURL, {
                method: booking ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || data?.error || "Something went wrong.");
            }

            setIsBooked(true);

            setShowPopup(false);
            showSuccess("Success", data?.message || "Membership created successfully.");
            navigate('/bookings')
        } catch (err) {
            console.error(err);
            showErrorToast("Error", err.message || "Something went wrong.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isBankValid =
        payment.account_holder_name && payment.account_number && payment.branch_code &&
        payment.line1 && payment.city && payment.postalCode && payment.authorise;

    const isCardValid =
        nameOnCard.trim() && cardNumber.replace(/\s/g, "").length === 16 &&
        expiryDate.length === 5 && cvc.length >= 3 && checkoutCountry && zipCode;

    const formatCard = (v) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
    const formatExpiry = (v) => { const d = v.replace(/\D/g, "").slice(0, 4); return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d; };

    // ── Render ────────────────────────────────────────────
    return (
        <div className="md:p-7 bg-gray-50 min-h-screen booking-page">
            <div className="flex px-4 items-center mb-4">
                <h2 className="text-xl md:text-2xl font-semibold">Book a Membership</h2>
            </div>

            <div className="md:flex w-full gap-4 px-4">
                {/* ── LEFT ── */}
                <div className="md:min-w-[508px] md:max-w-[508px] space-y-5" ref={infoRef}>
                    <div className="bg-white p-6 rounded-3xl shadow-sm space-y-5">
                        <h2 className="text-[24px] font-semibold">Information</h2>

                        {/* Venue */}
                        <div>
                            <label className="text-base font-semibold">Venue</label>
                            <Select
                                options={venues?.capacityVenues?.map((v) => ({
                                    value: v.venueId,
                                    label: v.venueName,
                                    all: v,
                                })) || []}
                                value={selectedVenue}
                                onChange={(opt) => {
                                    setSelectedVenue(opt);
                                    setMembershipPlan(null);
                                    setSelectedDate(null);
                                    setStudents(prev => prev.map(s => ({ ...s, selectedClassId: null, selectedClassData: null, error: null })));
                                    hasInitialized.current = false;
                                }}
                                placeholder="Select venue"
                                className="mt-2"
                                classNamePrefix="react-select"
                                isClearable
                                styles={ss("venue", fe)}
                            />
                        </div>

                        {/* Number of students */}
                        <div>
                            <label className="text-base font-semibold">Number of students</label>
                            <input type="number" value={numberOfStudents || ""} onChange={handleNumberChange}
                                min={1} max={4} placeholder="Choose number of students"
                                className="w-full border border-gray-300 rounded-xl px-3 py-3 mt-2 focus:outline-none" />
                        </div>

                        {/* Membership Plan */}
                        <div>
                            <label className="text-base font-semibold">Membership Plan</label>
                            <Select options={paymentPlanOptions} value={membershipPlan}
                                onChange={(p) => { handlePlanChange(p); clearErr("membershipPlan"); }}
                                placeholder="Choose Plan" className="mt-2" classNamePrefix="react-select"
                                isClearable isDisabled={!numberOfStudents || !selectedVenue}
                                styles={ss("membershipPlan", fe)}
                            />
                            <Err k="membershipPlan" e={fe} />
                        </div>

                        {/* Starter Pack */}
                        {showStarterPack && (
                            <div>
                                <label className="text-base font-semibold">Starter Pack</label>
                                <input readOnly value={`£${starterPackPrice}`}
                                    className="w-full border border-gray-300 rounded-xl px-3 py-3 mt-2 focus:outline-none bg-gray-50" />
                            </div>
                        )}

                        {/* Discount */}
                        {showStarterPack && (
                            <div>
                                <label className="text-base font-semibold">Discount Code</label>
                                <div className="relative mt-2">
                                    <input value={discountCode} placeholder="Enter Discount Code"
                                        onChange={(e) => { setDiscountCode(e.target.value); setIsApplied(false); setAppliedDiscount(null); setIsChecked(false); }}
                                        className="w-full border border-gray-300 rounded-xl px-3 py-3 pr-24" />
                                    <button onClick={handleApplyDiscount} disabled={isDiscountLoading}
                                        className="absolute top-1 right-1 px-4 py-2 rounded-xl bg-[#003997] text-white font-medium hover:bg-gray-900 disabled:opacity-60">
                                        {isDiscountLoading ? "Applying..." : "Apply"}
                                    </button>
                                </div>
                                {isChecked && !isDiscountLoading && (
                                    isApplied
                                        ? <p className="text-green-600 text-sm mt-1">✅ {appliedDiscount?.message}</p>
                                        : <p className="text-red-500 text-sm mt-1">❌ Invalid discount code</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Calendar */}
                    <div className={`bg-white p-6 rounded-3xl shadow-sm ${fe.selectedDate ? "border-2 border-red-500" : ""}`}>
                        <h2 className="text-[24px] font-semibold mb-4">Select start date</h2>
                        <div className="text-center">
                            <div className="flex justify-center gap-5 items-center mb-3">
                                <button onClick={() => membershipPlan && setCurrentDate(new Date(year, month - 1, 1))}
                                    className={`w-8 h-8 rounded-full border border-black flex items-center justify-center ${!membershipPlan ? "opacity-40 cursor-not-allowed" : "hover:bg-black hover:text-white"}`}>
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <p className="font-semibold text-[20px]">
                                    {currentDate.toLocaleString("default", { month: "long" })} {year}
                                </p>
                                <button onClick={() => membershipPlan && setCurrentDate(new Date(year, month + 1, 1))}
                                    className={`w-8 h-8 rounded-full border border-black flex items-center justify-center ${!membershipPlan ? "opacity-40 cursor-not-allowed" : "hover:bg-black hover:text-white"}`}>
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="grid grid-cols-7 text-sm text-gray-500 mb-1">
                                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                                    <div key={i} className="font-medium text-center">{d}</div>
                                ))}
                            </div>
                            <div className="flex flex-col gap-1">
                                {Array.from({ length: Math.ceil(calendarDays.length / 7) }).map((_, wi) => (
                                    <div key={wi} className="grid grid-cols-7 gap-1">
                                        {calendarDays.slice(wi * 7, wi * 7 + 7).map((date, i) => {
                                            if (!date) return <div key={i} />;
                                            const fd = formatLocalDate(date);
                                            const isAvailable = membershipPlan && sessionDatesSet.has(fd);
                                            const isSelected = isSameDate(date, selectedDate);
                                            const today = new Date(); today.setHours(0, 0, 0, 0);
                                            const cur = new Date(date); cur.setHours(0, 0, 0, 0);
                                            const isPast = isAvailable && cur < today;
                                            return (
                                                <div key={i}
                                                    onClick={() => {
                                                        if (isAvailable && !isPast) {
                                                            setSelectedDate(isSameDate(date, selectedDate) ? null : fd);
                                                            clearErr("selectedDate");
                                                        }
                                                    }}
                                                    className={`w-8 h-8 flex items-center justify-center mx-auto text-sm rounded-full
                                                        ${!membershipPlan ? "opacity-40 cursor-not-allowed" :
                                                            isPast ? "bg-red-200 text-red-700 cursor-not-allowed" :
                                                                isAvailable ? "cursor-pointer bg-sky-200" : "opacity-40 cursor-not-allowed"}
                                                        ${isSelected ? "!bg-blue-600 text-white font-bold" : ""}`}>
                                                    {date.getDate()}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Err k="selectedDate" e={fe} />
                    </div>

                    {/* Breakdown */}
                    <div>
                        <button disabled={!membershipPlan} onClick={() => setIsOpenMembership(!isOpenMembership)}
                            className={`w-full text-white text-[18px] font-semibold px-6 py-3 rounded-lg flex items-center justify-center gap-2
                                ${membershipPlan ? "bg-[#237FEA]" : "bg-gray-400 cursor-not-allowed"}`}>
                            Membership Plan Breakdown
                            <ChevronDown className={`w-5 h-5 transition-transform ${isOpenMembership ? "rotate-180" : ""}`} />
                        </button>
                        {isOpenMembership && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                                className="bg-white mt-3 rounded-2xl shadow p-6 space-y-3 text-[15px]">
                                <div className="flex justify-between font-semibold">
                                    <span>{membershipPlan?.all?.duration} {membershipPlan?.all?.interval} Plan</span>
                                    <span>£{pricingBreakdown.nextMonthPayment?.toFixed(2)}/mo</span>
                                </div>
                                {showStarterPack && (
                                    <>
                                        <div className="flex justify-between">
                                            <span>Starter Pack</span>
                                            <span>£{pricingBreakdown.starterPack?.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Delivery Fee</span>
                                            <span>£3.99</span>
                                        </div>
                                    </>
                                )}
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Price per lesson</span>
                                    <span>£{pricingBreakdown.pricePerClassPerChild}</span>
                                </div>
                                {pricingBreakdown.isFullMonthCharge ? (
                                    <div className="flex justify-between">
                                        <span>Full monthly charge</span>
                                        <span>£{pricingBreakdown.nextMonthPayment?.toFixed(2)}</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between">
                                            <span>Pro-rata lessons</span>
                                            <span>{pricingBreakdown.numberOfLessonsProRated}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Pro-rata cost</span>
                                            <span>£{pricingBreakdown.finalProRataCost?.toFixed(2)}</span>
                                        </div>
                                    </>
                                )}
                                <div className="flex justify-between font-bold text-[17px] border-t pt-3">
                                    <span>Total due today</span>
                                    <span>£{pricingBreakdown.totalAmountToday?.toFixed(2)}</span>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* ── RIGHT ── */}
                <div className="flex-1 space-y-6 bg-[#f9f9f9] px-2">

                    {/* Students */}
                    {students.map((student, index) => (
                        <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            ref={(el) => (studentRefs.current[index] = el)}
                            className="bg-white p-6 rounded-3xl shadow-sm space-y-5 relative">
                            {students.length > 1 && (
                                <button onClick={() => handleRemoveStudent(index)}
                                    className="absolute top-4 right-4 text-red-400 hover:text-red-600">
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                            <h2 className="text-[20px] font-semibold">
                                Student {students.length > 1 ? `${index + 1} ` : ""}Information
                            </h2>

                            <div className="md:flex gap-4">
                                <div className="md:w-1/2">
                                    <label className="block text-[16px] font-semibold">First name</label>
                                    <input value={student.studentFirstName} placeholder="Enter first name"
                                        className={fc(`s${index}_firstName`, fe)}
                                        onChange={(e) => { handleStudentChange(index, "studentFirstName", e.target.value); clearErr(`s${index}_firstName`); }} />
                                    <Err k={`s${index}_firstName`} e={fe} />
                                </div>
                                <div className="md:w-1/2">
                                    <label className="block text-[16px] font-semibold">Last name</label>
                                    <input value={student.studentLastName} placeholder="Enter last name"
                                        className={fc(`s${index}_lastName`, fe)}
                                        onChange={(e) => { handleStudentChange(index, "studentLastName", e.target.value); clearErr(`s${index}_lastName`); }} />
                                    <Err k={`s${index}_lastName`} e={fe} />
                                </div>
                            </div>

                            <div className="md:flex gap-4">
                                <div className="md:w-1/2">
                                    <label className="block text-[16px] font-semibold">Date of Birth</label>
                                    <input value={student.dateOfBirth} placeholder="DD/MM/YYYY" maxLength={10}
                                        className={fc(`s${index}_dob`, fe)}
                                        onChange={(e) => { handleDOBChange(index, e.target.value); clearErr(`s${index}_dob`); }} />
                                    <Err k={`s${index}_dob`} e={fe} />
                                </div>
                                <div className="md:w-1/2">
                                    <label className="block text-[16px] font-semibold">Age</label>
                                    <input readOnly value={student.age || ""} placeholder="Automatic entry"
                                        className="w-full mt-2 border border-gray-300 rounded-xl px-4 py-3 text-base bg-gray-50" />
                                </div>
                            </div>

                            <div className="md:flex gap-4">
                                <div className="md:w-1/2">
                                    <label className="block text-[16px] font-semibold">Gender</label>
                                    <Select options={genderOptions} classNamePrefix="react-select"
                                        placeholder="Select gender"
                                        value={genderOptions.find((o) => o.value === student.gender) || null}
                                        onChange={(o) => { handleStudentChange(index, "gender", o?.value || ""); clearErr(`s${index}_gender`); }}
                                        styles={ss(`s${index}_gender`, fe)} />
                                    <Err k={`s${index}_gender`} e={fe} />
                                </div>
                                <div className="md:w-1/2">
                                    <label className="block text-[16px] font-semibold">Medical information</label>
                                    <input value={student.medicalInformation} placeholder="Enter medical info"
                                        className={fc(`s${index}_medical`, fe)}
                                        onChange={(e) => { handleStudentChange(index, "medicalInformation", e.target.value); clearErr(`s${index}_medical`); }} />
                                    <Err k={`s${index}_medical`} e={fe} />
                                </div>
                            </div>

                            <div className="md:flex gap-4">
                                <div className="md:w-1/2">
                                    <label className="block text-[16px] font-semibold">Class / Level</label>
                                    <Select options={venueClassOptions} classNamePrefix="react-select"
                                        placeholder="Select class"
                                        value={venueClassOptions.find((o) => o.value === student.selectedClassId) || null}
                                        onChange={(o) => { handleStudentClassChange(index, o); clearErr(`s${index}_class`); }}
                                        styles={ss(`s${index}_class`, fe)} />
                                    {student.error && !fe[`s${index}_class`] && <p className="text-red-500 text-sm mt-1 ml-1 font-medium">{student.error}</p>}
                                    <Err k={`s${index}_class`} e={fe} />
                                </div>
                                <div className="md:w-1/2">
                                    <label className="block text-[16px] font-semibold">Time</label>
                                    <input readOnly
                                        value={student.selectedClassData ? `${student.selectedClassData.startTime} - ${student.selectedClassData.endTime}` : ""}
                                        placeholder="Automatic entry"
                                        className="w-full mt-2 border border-gray-300 rounded-xl px-4 py-3 bg-gray-50" />
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Parents */}
                    {parents.map((parent, index) => (
                        <motion.div key={parent.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            ref={(el) => (parentRefs.current[index] = el)}
                            className="bg-white p-6 rounded-3xl shadow-sm space-y-5">
                            <div className="flex justify-between items-center">
                                <h2 className="text-[20px] font-semibold">
                                    {index === 0 ? "Parent information" : `Parent ${index + 1} information`}
                                </h2>
                                <div className="flex gap-2">
                                    {index === 0 && (
                                        <button onClick={() => { if (parents.length < 3) setParents((p) => [...p, INIT_PARENT()]); }}
                                            disabled={parents.length >= 3}
                                            className="text-white text-sm px-4 py-2 bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50">
                                            Add Parent
                                        </button>
                                    )}
                                    {index > 0 && (
                                        <button onClick={() => setParents((p) => p.filter((x) => x.id !== parent.id))}>
                                            <X className="w-5 h-5 text-gray-400 hover:text-red-500" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="md:flex gap-4">
                                <div className="md:w-1/2">
                                    <label className="block text-[16px] font-semibold">First name</label>
                                    <input value={parent.parentFirstName} placeholder="Enter first name"
                                        className={fc(`p${index}_firstName`, fe)}
                                        onChange={(e) => { handleParentChange(index, "parentFirstName", e.target.value.replace(/[^A-Za-z\s]/g, "")); clearErr(`p${index}_firstName`); }} />
                                    <Err k={`p${index}_firstName`} e={fe} />
                                </div>
                                <div className="md:w-1/2">
                                    <label className="block text-[16px] font-semibold">Last name</label>
                                    <input value={parent.parentLastName} placeholder="Enter last name"
                                        className={fc(`p${index}_lastName`, fe)}
                                        onChange={(e) => { handleParentChange(index, "parentLastName", e.target.value.replace(/[^A-Za-z\s]/g, "")); clearErr(`p${index}_lastName`); }} />
                                    <Err k={`p${index}_lastName`} e={fe} />
                                </div>
                            </div>

                            <div className="md:flex gap-4">
                                <div className="md:w-1/2">
                                    <label className="block text-[16px] font-semibold">Email</label>
                                    <input type="email" value={parent.parentEmail} placeholder="Enter email"
                                        className={fc(`p${index}_email`, fe)}
                                        onBlur={(e) => handleEmailBlur(index, e.target.value)}
                                        onChange={(e) => { handleParentChange(index, "parentEmail", e.target.value); clearErr(`p${index}_email`); }} />
                                    <Err k={`p${index}_email`} e={fe} />
                                    {parent.emailMessage && (
                                        <p className={`text-sm mt-1 ${parent.emailStatus === "success" ? "text-green-600" : "text-red-500"}`}>
                                            {parent.emailMessage}
                                        </p>
                                    )}
                                </div>
                                <div className="md:w-1/2">
                                    <label className="block text-[16px] font-semibold">Phone number</label>
                                    <div className={fe[`p${index}_phone`] ? "border border-red-500 rounded-xl bg-red-50 mt-2" : "mt-2"}>
                                        <PhoneNumberInput value={parent.parentPhoneNumber}
                                            onChange={(v) => { handleParentChange(index, "parentPhoneNumber", v); clearErr(`p${index}_phone`); }}
                                            placeholder="Enter phone number" />
                                    </div>
                                    <Err k={`p${index}_phone`} e={fe} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[16px] font-semibold">What's the main reason you're interested in Samba Soccer Schools?</label>
                                {parent.isCustomReason ? (
                                    <div className="relative">
                                        <input value={parent.interestReason} placeholder="Please specify"
                                            className={fc(`p${index}_reason`, fe)}
                                            onChange={(e) => { handleParentChange(index, "interestReason", e.target.value); clearErr(`p${index}_reason`); }} />
                                        <button type="button" onClick={() => { handleParentChange(index, "interestReason", ""); handleParentChange(index, "isCustomReason", false); }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-600">
                                            ← Select
                                        </button>
                                    </div>
                                ) : (
                                    <Select options={interestReasonOptions} classNamePrefix="react-select"
                                        placeholder="Select a reason"
                                        value={interestReasonOptions.find((o) => o.value === parent.interestReason) || null}
                                        onChange={(o) => {
                                            clearErr(`p${index}_reason`);
                                            if (o?.value === "Other") { handleParentChange(index, "interestReason", ""); handleParentChange(index, "isCustomReason", true); }
                                            else { handleParentChange(index, "interestReason", o?.value || ""); handleParentChange(index, "isCustomReason", false); }
                                        }}
                                        styles={ss(`p${index}_reason`, fe)} />
                                )}
                                <Err k={`p${index}_reason`} e={fe} />
                            </div>

                            <div>
                                <label className="block text-[16px] font-semibold">Tell us a bit more (optional)</label>
                                <input value={parent.interestReasonOther} placeholder="Anything else you'd like to share?"
                                    className="w-full mt-2 border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none"
                                    onChange={(e) => handleParentChange(index, "interestReasonOther", e.target.value)} />
                            </div>

                            <div className="md:flex gap-4">
                                <div className="md:w-1/2">
                                    <label className="block text-[16px] font-semibold">Relation to child</label>
                                    <Select options={relationOptions} classNamePrefix="react-select"
                                        placeholder="Select Relation"
                                        value={relationOptions.find((o) => o.value === parent.relationToChild) || null}
                                        onChange={(o) => { handleParentChange(index, "relationToChild", o?.value || ""); clearErr(`p${index}_relation`); }}
                                        styles={ss(`p${index}_relation`, fe)} />
                                    <Err k={`p${index}_relation`} e={fe} />
                                </div>
                                <div className="md:w-1/2">
                                    <label className="block text-[16px] font-semibold">How did you hear about us?</label>
                                    <Select options={hearOptions} classNamePrefix="react-select"
                                        placeholder="Select"
                                        value={hearOptions.find((o) => o.value === parent.howDidYouHear) || null}
                                        onChange={(o) => { handleParentChange(index, "howDidYouHear", o?.value || ""); clearErr(`p${index}_hear`); }}
                                        styles={ss(`p${index}_hear`, fe)} />
                                    <Err k={`p${index}_hear`} e={fe} />
                                </div>
                            </div>

                            {index === 0 && showStarterPack && (
                                <div>
                                    <label className="block text-[16px] font-semibold">
                                        Starter Pack Kit Size{" "}
                                        <button type="button" onClick={() => setIsSizeChartOpen(true)}
                                            className="text-[#237FEA] text-sm font-medium hover:underline ml-2">
                                            Size Chart
                                        </button>
                                    </label>
                                    <Select options={sizeOptions} classNamePrefix="react-select"
                                        placeholder="Select Size"
                                        value={sizeOptions.find((o) => o.value === parent.starterPackSize) || null}
                                        onChange={(o) => { handleParentChange(index, "starterPackSize", o?.value || ""); clearErr(`p${index}_size`); }}
                                        styles={ss(`p${index}_size`, fe)} />
                                    <Err k={`p${index}_size`} e={fe} />
                                </div>
                            )}
                        </motion.div>
                    ))}

                    {/* Emergency */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm space-y-5" ref={emergencyRef}>
                        <h2 className="text-[20px] font-semibold">Emergency contact details</h2>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={emergency.sameAsAbove}
                                onChange={() => setEmergency((p) => ({ ...p, sameAsAbove: !p.sameAsAbove }))}
                                className="w-4 h-4 accent-blue-600" />
                            <span className="text-base font-semibold text-[#34353B]">Fill same as above</span>
                        </label>

                        <div className="md:flex gap-4">
                            <div className="md:w-1/2">
                                <label className="block text-[16px] font-semibold">First name</label>
                                <input value={emergency.emergencyFirstName} placeholder="Enter first name"
                                    className={fc("e_firstName", fe)}
                                    onChange={(e) => { setEmergency((p) => ({ ...p, emergencyFirstName: e.target.value })); clearErr("e_firstName"); }} />
                                <Err k="e_firstName" e={fe} />
                            </div>
                            <div className="md:w-1/2">
                                <label className="block text-[16px] font-semibold">Last name</label>
                                <input value={emergency.emergencyLastName} placeholder="Enter last name"
                                    className={fc("e_lastName", fe)}
                                    onChange={(e) => { setEmergency((p) => ({ ...p, emergencyLastName: e.target.value })); clearErr("e_lastName"); }} />
                                <Err k="e_lastName" e={fe} />
                            </div>
                        </div>

                        <div className="md:flex gap-4">
                            <div className="md:w-1/2">
                                <label className="block text-[16px] font-semibold">Phone number</label>
                                <div className={fe.e_phone ? "border border-red-500 rounded-xl bg-red-50 mt-2" : "mt-2"}>
                                    <PhoneNumberInput value={emergency.emergencyPhoneNumber}
                                        onChange={(v) => { setEmergency((p) => ({ ...p, emergencyPhoneNumber: v })); clearErr("e_phone"); }}
                                        placeholder="Enter phone number" />
                                </div>
                                <Err k="e_phone" e={fe} />
                            </div>
                            <div className="md:w-1/2">
                                <label className="block text-[16px] font-semibold">Relation to child</label>
                                <Select options={relationOptions} classNamePrefix="react-select"
                                    placeholder="Select Relation"
                                    value={relationOptions.find((o) => o.value === emergency.emergencyRelation) || null}
                                    onChange={(o) => { setEmergency((p) => ({ ...p, emergencyRelation: o?.value || "" })); clearErr("e_relation"); }}
                                    styles={ss("e_relation", fe)} />
                                <Err k="e_relation" e={fe} />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="sm:flex justify-end gap-4 pb-6">
                        <button type="button"
                            className="border md:w-max w-full border-[#717073] text-[#717073] px-12 text-[18px] py-2 rounded-lg font-semibold">
                            Cancel
                        </button>
                        <button type="button"
                            disabled={isBooked || parents.some((p) => p.emailStatus === "error")}
                            onClick={() => {
                                if (validate()) {
                                    setStep(1);
                                    setShowPopup(true);
                                }
                            }}
                            className={`text-white md:w-max mt-3 sm:mt-0 w-full font-semibold text-[18px] px-6 py-3 rounded-lg
                                ${isBooked || parents.some((p) => p.emailStatus === "error")
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-[#237FEA]"}`}>
                            {isBooked ? "Booked" : "Setup Direct Debit"}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Payment Popup ── */}
            <AnimatePresence>
                {showPopup && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-auto flex gap-6 p-8">

                            {/* Step 1 — Direct Debit */}
                            {step === 1 && (
                                <div className="flex-1 flex flex-col gap-4">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-xl font-semibold">Set up Direct Debit</h2>
                                        <img src="/images/Directdebitlogo.png" className="h-10" alt="" />
                                    </div>
                                    <p className="text-gray-500 text-sm">
                                        Payments collected via {isFranchisee ? "GoCardless" : "Access Pay Suite"} from the 1st of next month.
                                    </p>

                                    <label className="block">
                                        <span className="block text-[16px] font-semibold">Email</span>
                                        <input type="email"
                                            value={payment.email || parents[0]?.parentEmail || ""}
                                            placeholder="Email address"
                                            onChange={(e) => setPayment({ ...payment, email: e.target.value })}
                                            className="w-full mt-2 border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none" />
                                    </label>

                                    <label className="block">
                                        <span className="block text-[16px] font-semibold">Account Holder Name</span>
                                        <input value={payment.account_holder_name} placeholder="Full name on account"
                                            onChange={(e) => {
                                                const parts = e.target.value.trim().split(" ");
                                                setPayment({ ...payment, account_holder_name: e.target.value, firstName: parts[0] || "", lastName: parts.slice(1).join(" ") });
                                            }}
                                            className="w-full mt-2 border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none" />
                                    </label>

                                    <div className="md:flex gap-4">
                                        <label className="flex-1">
                                            <span className="block text-[16px] font-semibold">Sort Code</span>
                                            <input value={payment.branch_code} placeholder="00-00-00"
                                                onChange={(e) => setPayment({ ...payment, branch_code: e.target.value.replace(/\D/g, "") })}
                                                className="w-full mt-2 border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none" />
                                        </label>
                                        <label className="flex-1">
                                            <span className="block text-[16px] font-semibold">Account Number</span>
                                            <input value={payment.account_number} placeholder="12345678"
                                                onChange={(e) => setPayment({ ...payment, account_number: e.target.value.replace(/\D/g, "") })}
                                                className="w-full mt-2 border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none" />
                                        </label>
                                    </div>

                                    <label className="block">
                                        <span className="block text-[16px] font-semibold">Address Line 1</span>
                                        <input value={payment.line1}
                                            onChange={(e) => setPayment({ ...payment, line1: e.target.value })}
                                            className="w-full mt-2 border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none" />
                                    </label>

                                    <div className="md:flex gap-4">
                                        <label className="flex-1">
                                            <span className="block text-[16px] font-semibold">City</span>
                                            <input value={payment.city}
                                                onChange={(e) => setPayment({ ...payment, city: e.target.value })}
                                                className="w-full mt-2 border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none" />
                                        </label>
                                        <label className="flex-1">
                                            <span className="block text-[16px] font-semibold">Postal Code</span>
                                            <input value={payment.postalCode}
                                                onChange={(e) => setPayment({ ...payment, postalCode: e.target.value })}
                                                className="w-full mt-2 border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none" />
                                        </label>
                                    </div>

                                    <label className="flex items-center gap-2 text-sm text-gray-700">
                                        <input type="checkbox" checked={payment.authorise}
                                            onChange={(e) => setPayment({ ...payment, authorise: e.target.checked })}
                                            className="w-4 h-4 accent-blue-600" />
                                        I can authorise Direct Debits on this account myself
                                    </label>

                                    <div className="flex justify-end gap-3 py-3">
                                        <button onClick={() => setShowPopup(false)}
                                            className="border border-gray-400 text-gray-600 px-8 py-2 rounded-lg font-semibold">
                                            Cancel
                                        </button>
                                        <button
                                            disabled={!isBankValid || isSubmitting}
                                            onClick={() => {
                                                // if no starter pack, submit directly from step 1
                                                if (!showStarterPack) {
                                                    handleSubmit();
                                                } else {
                                                    setStep(2);
                                                }
                                            }}
                                            className="bg-[#042C89] text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50">
                                            {isSubmitting ? "Submitting..." : showStarterPack ? "Next" : "Complete Booking"}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 2 — Card (only when showStarterPack) */}
                            {step === 2 && showStarterPack && (
                                <div className="flex-1 flex flex-col gap-4">
                                    <h2 className="text-xl font-semibold">Checkout</h2>

                                    <label className="block">
                                        <span className="block text-[16px] font-semibold">Name on card</span>
                                        <input value={nameOnCard} placeholder="Name on card"
                                            onChange={(e) => setNameOnCard(e.target.value)}
                                            className="w-full mt-2 border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none" />
                                    </label>

                                    <label className="block">
                                        <span className="block text-[16px] font-semibold">Card number</span>
                                        <input value={cardNumber} placeholder="1234 1234 1234 1234" maxLength={19} inputMode="numeric"
                                            onChange={(e) => setCardNumber(formatCard(e.target.value))}
                                            className="w-full mt-2 border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none" />
                                    </label>

                                    <div className="md:flex gap-4">
                                        <label className="flex-1">
                                            <span className="block text-[16px] font-semibold">Expiry</span>
                                            <input value={expiryDate} placeholder="MM/YY" maxLength={5} inputMode="numeric"
                                                onChange={(e) => setExpiryDate(formatExpiry(e.target.value))}
                                                className="w-full mt-2 border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none" />
                                        </label>
                                        <label className="flex-1">
                                            <span className="block text-[16px] font-semibold">CVC</span>
                                            <input value={cvc} placeholder="CVC" maxLength={4} inputMode="numeric"
                                                onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                                                className="w-full mt-2 border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none" />
                                        </label>
                                    </div>

                                    <label className="block">
                                        <span className="block text-[16px] font-semibold">Country</span>
                                        <Select options={[
                                            { value: "United Kingdom", label: "United Kingdom" },
                                            { value: "United States", label: "United States" },
                                            { value: "Ireland", label: "Ireland" },
                                            { value: "Australia", label: "Australia" },
                                            { value: "Canada", label: "Canada" },
                                        ]} classNamePrefix="react-select"
                                            value={{ value: checkoutCountry, label: checkoutCountry }}
                                            onChange={(o) => setCheckoutCountry(o.value)}
                                            styles={ss("checkoutCountry", fe)} />
                                    </label>

                                    <label className="block">
                                        <span className="block text-[16px] font-semibold">Postal Code</span>
                                        <input value={zipCode}
                                            onChange={(e) => setZipCode(e.target.value)}
                                            className="w-full mt-2 border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none" />
                                    </label>

                                    <div className="flex justify-between font-semibold text-base border-t pt-3">
                                        <span>Total</span>
                                        <span className="text-blue-900">£{pricingBreakdown.stripeAmount?.toFixed(2)}</span>
                                    </div>

                                    <div className="flex justify-end gap-3 py-3">
                                        <button onClick={() => setShowPopup(false)}
                                            className="border border-gray-400 text-gray-600 px-6 py-2 rounded-lg font-semibold">
                                            Cancel
                                        </button>
                                        <button onClick={() => setStep(1)}
                                            className="border-2 border-blue-900 text-blue-900 px-6 py-2 rounded-lg font-semibold">
                                            Back
                                        </button>
                                        <button disabled={!isCardValid || isSubmitting} onClick={handleSubmit}
                                            className="bg-blue-900 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50">
                                            {isSubmitting ? "Processing..." : "Complete Booking"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Size Chart Modal */}
            <AnimatePresence>
                {isSizeChartOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4"
                        onClick={() => setIsSizeChartOpen(false)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-auto"
                            onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center px-8 py-5 border-b">
                                <h2 className="text-xl font-bold">Kids Size Chart</h2>
                                <button onClick={() => setIsSizeChartOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full">
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                            <div className="p-8 overflow-x-auto">
                                <table className="w-full text-center text-sm border-collapse">
                                    <thead>
                                        <tr className="bg-gray-900 text-white uppercase text-xs">
                                            <th rowSpan="2" className="py-3 px-4 border-r border-gray-700">Size</th>
                                            <th rowSpan="2" className="py-3 px-4 border-r border-gray-700">Age</th>
                                            <th colSpan="2" className="py-2 px-4 border-r border-gray-700">Height</th>
                                            <th colSpan="2" className="py-2 px-4 border-r border-gray-700">Chest</th>
                                            <th colSpan="2" className="py-2 px-4">Waist</th>
                                        </tr>
                                        <tr className="bg-gray-800 text-gray-200 text-xs uppercase">
                                            {["cm", "in", "cm", "in", "cm", "in"].map((u, i) => (
                                                <th key={i} className="py-2 px-4 border-r border-gray-700">{u}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { size: "Small", age: "4-5", h: ["107", "42"], c: ["68", "26"], w: ["46", "18"] },
                                            { size: "Medium", age: "6-7", h: ["119", "46"], c: ["74", "29"], w: ["50", "20"] },
                                            { size: "Large", age: "8-9", h: ["131", "51"], c: ["84", "33"], w: ["54", "21"] },
                                            { size: "Extra Large", age: "10-12", h: ["143", "56"], c: ["89", "34"], w: ["58", "23"] },
                                            { size: "XXL", age: "13-14", h: ["152", "60"], c: ["98", "38"], w: ["68", "26"] },
                                        ].map((row, i) => (
                                            <tr key={i} className="border-b hover:bg-gray-50">
                                                <td className="py-3 px-4 font-semibold border-r">{row.size}</td>
                                                <td className="py-3 px-4 border-r">{row.age}</td>
                                                {[...row.h, ...row.c, ...row.w].map((v, j) => (
                                                    <td key={j} className="py-3 px-4 border-r">{v}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BookMembership;