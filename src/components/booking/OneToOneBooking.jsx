import { useState, useEffect } from "react";
import { ChevronDown, Trash2 } from "lucide-react";
import { useProfile } from "../../context/ProfileContext";
import PhoneNumberInput from "../../commom/PhoneNumberInput";

// ── factories ────────────────────────────────────────────────────────────────

const newParent = () => ({
    id: Date.now() + Math.random(),
    parentFirstName: "", parentLastName: "", parentEmail: "",
    parentPhoneNumber: "", relationToChild: "", howDidYouHear: "",
    interestReason: "", interestReasonOther: "", isCustomReason: false,
});

const newStudent = () => ({
    id: Date.now() + Math.random(),
    firstName: "", lastName: "", dob: "", age: "", gender: "", medicalInfo: "",
});

const initialEmergency = { sameAsAbove: false, emergencyFirstName: "", emergencyLastName: "", emergencyPhoneNumber: "", emergencyRelation: "" };
const initialGeneral = { location: "", address: "", date: "", time: "", students: 1, areasToWorkOn: "", coach: "", package: "", discount: "" };
const initialPayment = { firstName: "", lastName: "", email: "", billingAddress: "", cardNumber: "", expiry: "", securityCode: "" };

const GENDERS = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
];
const RELATIONS = [
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
const HEAR_ABOUT = [
    { value: "Google", label: "Google" },
    { value: "Facebook", label: "Facebook" },
    { value: "Instagram", label: "Instagram" },
    { value: "Friend", label: "Friend" },
    { value: "Flyer", label: "Flyer" },
];
const COACHES = ["Coach A", "Coach B", "Coach C"];
const PACKAGES = ["One Package (Gold) – £39.99", "Two Package (Silver) – £29.99", "Three Package (Bronze) – £19.99"];
const DISCOUNTS = ["SAVE10", "FAMILY20", "STUDENT15"];

// ── helpers ──────────────────────────────────────────────────────────────────

function formatDOB(raw) {
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4);
}

function dobToISO(dob) {
    const parts = dob.split("/");
    if (parts.length !== 3 || parts[2].length !== 4) return "";
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

function calcAge(iso) {
    if (!iso || iso.length < 10) return "";
    const d = new Date(iso);
    if (isNaN(d)) return "";
    return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25)).toString();
}

function isoToDDMMYYYY(iso) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    if (!y || !m || !d) return "";
    return `${d}/${m}/${y}`;
}

function luhn(val) {
    const num = val.replace(/\s/g, "");
    let sum = 0, alt = false;
    for (let i = num.length - 1; i >= 0; i--) {
        let n = parseInt(num[i], 10);
        if (alt) { n *= 2; if (n > 9) n -= 9; }
        sum += n; alt = !alt;
    }
    return sum % 10 === 0;
}

// ── style helpers ─────────────────────────────────────────────────────────────

const inputClass = (error) =>
    `w-full bg-white border ${error ? "border-red-500" : "border-[#E2E1E5]"} rounded-[12px] px-4 py-3 text-[16px] focus:ring-2 focus:ring-[#0496FF] focus:border-transparent outline-none transition-all placeholder-gray-400`;
const labelClass = "text-[16px] font-medium text-[#282829] mb-1 block";

// ── atoms ────────────────────────────────────────────────────────────────────

function Section({ title, children, action }) {
    return (
        <div className="space-y-3 bg-white p-6 rounded-3xl shadow-sm">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-[24px] font-semibold">{title}</h2>
                {action}
            </div>
            {children}
        </div>
    );
}

// ── student card ──────────────────────────────────────────────────────────────

function StudentCard({ student, index, errors, onChange, total }) {
    const e = errors[student.id] || {};

    function handleDOBChange(ev) {
        const formatted = formatDOB(ev.target.value);
        const iso = dobToISO(formatted);
        onChange(student.id, "dob", formatted);
        onChange(student.id, "age", calcAge(iso));
    }

    return (
        <div className={`${index > 0 ? "mt-6 pt-6 border-t relative border-dashed border-gray-200" : ""}`}>
            <div className="flex items-center justify-between mb-4">
                {total > 1 && (
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-semibold">{index + 1}</div>
                        <p className="text-sm font-semibold text-gray-700">Student {index + 1}</p>
                    </div>
                )}
                {total > 1 && (
                    <button onClick={() => onRemove(student.id)}
                        className="flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-700">
                        <Trash2 size={16} /> Remove
                    </button>
                )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>First name <span className="text-red-500">*</span></label>
                    <input className={inputClass(e.firstName)} placeholder="Enter first name"
                        value={student.firstName}
                        onChange={(ev) => onChange(student.id, "firstName", ev.target.value)} />
                    {e.firstName && <span className="text-red-500 text-sm">{e.firstName}</span>}
                </div>
                <div>
                    <label className={labelClass}>Last name <span className="text-red-500">*</span></label>
                    <input className={inputClass(e.lastName)} placeholder="Enter last name"
                        value={student.lastName}
                        onChange={(ev) => onChange(student.id, "lastName", ev.target.value)} />
                    {e.lastName && <span className="text-red-500 text-sm">{e.lastName}</span>}
                </div>

                <div>
                    <label className={labelClass}>Date of birth <span className="text-red-500">*</span></label>
                    <input className={inputClass(e.dob)} placeholder="DD/MM/YYYY"
                        inputMode="numeric" maxLength={10}
                        value={student.dob} onChange={handleDOBChange} />
                    {e.dob && <span className="text-red-500 text-sm">{e.dob}</span>}
                </div>
                <div>
                    <label className={labelClass}>Age</label>
                    <input className={`${inputClass()} bg-gray-50`} placeholder="Auto calculated"
                        value={student.age} disabled />
                </div>

                <div>
                    <label className={labelClass}>Gender <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <select className={`${inputClass(e.gender)} appearance-none`}
                            value={student.gender}
                            onChange={(ev) => onChange(student.id, "gender", ev.target.value)}>
                            <option value="">Select gender</option>
                            {GENDERS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                    {e.gender && <span className="text-red-500 text-sm">{e.gender}</span>}
                </div>
                <div>
                    <label className={labelClass}>Medical information</label>
                    <input className={inputClass()} placeholder="Enter any medical information (optional)"
                        value={student.medicalInfo}
                        onChange={(ev) => onChange(student.id, "medicalInfo", ev.target.value)} />
                </div>
            </div>
        </div>
    );
}

// ── parent card ───────────────────────────────────────────────────────────────

function ParentCard({ parent, index, errors, onChange, onRemove, canRemove }) {
    const e = (field) => errors[`p${index}_${field}`];
    const set = (field) => (ev) => onChange(parent.id, field, ev.target.value);

    return (
        <div className={`${index > 0 ? "mt-8 pt-8 border-t border-gray-100 relative" : "relative"}`}>
            {index > 0 && (
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-gray-500">
                            {index > 0 ? `Parent / Guardian ${index + 1}` : ""}
                        </span>
                        {canRemove && (
                            <button onClick={() => onRemove(parent.id)}
                                className="flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-700 ml-auto">
                                <Trash2 size={16} /> Remove
                            </button>
                        )}
                    </div>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className={labelClass}>First name <span className="text-red-500">*</span></label>
                    <input placeholder="Enter first name" className={inputClass(e("parentFirstName"))}
                        value={parent.parentFirstName}
                        onChange={(ev) => onChange(parent.id, "parentFirstName", ev.target.value.replace(/[^A-Za-z\s]/g, ""))} />
                    {e("parentFirstName") && <span className="text-red-500 text-sm">{e("parentFirstName")}</span>}
                </div>
                <div>
                    <label className={labelClass}>Last name <span className="text-red-500">*</span></label>
                    <input placeholder="Enter last name" className={inputClass(e("parentLastName"))}
                        value={parent.parentLastName}
                        onChange={(ev) => onChange(parent.id, "parentLastName", ev.target.value.replace(/[^A-Za-z\s]/g, ""))} />
                    {e("parentLastName") && <span className="text-red-500 text-sm">{e("parentLastName")}</span>}
                </div>

                <div>
                    <label className={labelClass}>Email <span className="text-red-500">*</span></label>
                    <input type="email" placeholder="Enter email address" className={inputClass(e("parentEmail"))}
                        value={parent.parentEmail} onChange={set("parentEmail")} />
                    {e("parentEmail") && <span className="text-red-500 text-sm">{e("parentEmail")}</span>}
                </div>
                <div>
                    <label className={labelClass}>Phone number <span className="text-red-500">*</span></label>
                    <PhoneNumberInput
                        value={parent.parentPhoneNumber}
                        onChange={(v) => onChange(parent.id, "parentPhoneNumber", v)}
                        placeholder="Enter phone number"
                        className={e("parentPhoneNumber") ? "border-red-500 bg-red-50" : ""}
                    />
                    {e("parentPhoneNumber") && <span className="text-red-500 text-sm">{e("parentPhoneNumber")}</span>}
                </div>

                <div>
                    <label className={labelClass}>Relation to child <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <select className={`${inputClass(e("relationToChild"))} appearance-none`}
                            value={parent.relationToChild} onChange={set("relationToChild")}>
                            <option value="">Select relation</option>
                            {RELATIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                    {e("relationToChild") && <span className="text-red-500 text-sm">{e("relationToChild")}</span>}
                </div>
                <div>
                    <label className={labelClass}>How did you hear about us? <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <select className={`${inputClass(e("howDidYouHear"))} appearance-none`}
                            value={parent.howDidYouHear} onChange={set("howDidYouHear")}>
                            <option value="">Select how you heard</option>
                            {HEAR_ABOUT.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                    {e("howDidYouHear") && <span className="text-red-500 text-sm">{e("howDidYouHear")}</span>}
                </div>

                <div className="md:col-span-2">
                    <label className={labelClass}>Main reason for joining <span className="text-red-500">*</span></label>
                    {parent.isCustomReason ? (
                        <div className="relative">
                            <input placeholder="Please specify custom reason"
                                className={inputClass(e("interestReason"))}
                                value={parent.interestReason}
                                onChange={set("interestReason")} />
                            <button type="button"
                                onClick={() => { onChange(parent.id, "interestReason", ""); onChange(parent.id, "isCustomReason", false); }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-600 font-semibold">
                                ← Back to List
                            </button>
                        </div>
                    ) : (
                        <div className="relative">
                            <select className={`${inputClass(e("interestReason"))} appearance-none`}
                                value={parent.interestReason}
                                onChange={(ev) => {
                                    if (ev.target.value === "Other") {
                                        onChange(parent.id, "interestReason", "");
                                        onChange(parent.id, "isCustomReason", true);
                                    } else {
                                        onChange(parent.id, "interestReason", ev.target.value);
                                        onChange(parent.id, "isCustomReason", false);
                                    }
                                }}>
                                <option value="">Select a reason</option>
                                {interestReasonOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>
                    )}
                    {e("interestReason") && <span className="text-red-500 text-sm">{e("interestReason")}</span>}
                </div>

                <div className="md:col-span-2">
                    <label className={labelClass}>Tell us a bit more (optional)</label>
                    <textarea placeholder="Anything else you'd like to share?"
                        className={`${inputClass()} h-24 resize-none`}
                        value={parent.interestReasonOther}
                        onChange={set("interestReasonOther")} />
                </div>
            </div>
        </div>
    );
}

// ── payment modal ─────────────────────────────────────────────────────────────

function PaymentModal({ pkg, onClose, onSuccess }) {
    const [data, setData] = useState(initialPayment);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const set = (k) => (e) => setData((p) => ({ ...p, [k]: e.target.value }));

    function validate() {
        const e = {};
        if (!data.firstName.trim()) e.firstName = "First name is required";
        if (!data.lastName.trim()) e.lastName = "Last name is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = "Enter a valid email";
        if (!data.billingAddress.trim()) e.billingAddress = "Billing address is required";
        const raw = data.cardNumber.replace(/\s/g, "");
        if (!/^\d{13,19}$/.test(raw) || !luhn(raw)) e.cardNumber = "Enter a valid card number";
        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(data.expiry)) e.expiry = "Use MM/YY format";
        else {
            const [m, y] = data.expiry.split("/");
            if (new Date(2000 + +y, +m - 1, 1) < new Date()) e.expiry = "Card has expired";
        }
        if (!/^\d{3,4}$/.test(data.securityCode)) e.securityCode = "Enter a valid CVV";
        return e;
    }

    async function handlePay() {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        setLoading(true);
        await new Promise((r) => setTimeout(r, 1400));
        setLoading(false);
        onSuccess();
    }

    const fmtCard = (v) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
    const fmtExpiry = (v) => { const d = v.replace(/\D/g, "").slice(0, 4); return d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d; };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800">Payment</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">✕</button>
                </div>
                <div className="p-5 flex flex-col gap-5">
                    <div className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 p-4 text-white">
                        <p className="text-xs font-medium opacity-80 mb-1">Selected package</p>
                        <p className="text-sm font-semibold">{pkg || "One Package (Gold)"}</p>
                        <p className="text-2xl font-bold mt-1">£39.99</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelClass}>First name <span className="text-red-500">*</span></label>
                            <input className={inputClass(errors.firstName)} placeholder="Jane"
                                value={data.firstName} onChange={set("firstName")} />
                            {errors.firstName && <span className="text-red-500 text-sm">{errors.firstName}</span>}
                        </div>
                        <div>
                            <label className={labelClass}>Last name <span className="text-red-500">*</span></label>
                            <input className={inputClass(errors.lastName)} placeholder="Smith"
                                value={data.lastName} onChange={set("lastName")} />
                            {errors.lastName && <span className="text-red-500 text-sm">{errors.lastName}</span>}
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <div>
                            <label className={labelClass}>Email address <span className="text-red-500">*</span></label>
                            <input type="email" className={inputClass(errors.email)} placeholder="jane@example.com"
                                value={data.email} onChange={set("email")} />
                            {errors.email && <span className="text-red-500 text-sm">{errors.email}</span>}
                        </div>
                        <div>
                            <label className={labelClass}>Billing address <span className="text-red-500">*</span></label>
                            <input className={inputClass(errors.billingAddress)} placeholder="123 Main St, London"
                                value={data.billingAddress} onChange={set("billingAddress")} />
                            {errors.billingAddress && <span className="text-red-500 text-sm">{errors.billingAddress}</span>}
                        </div>
                        <div>
                            <label className={labelClass}>Card Number <span className="text-red-500">*</span></label>
                            <input className={inputClass(errors.cardNumber)} placeholder="0000 0000 0000 0000"
                                inputMode="numeric" value={data.cardNumber}
                                onChange={(e) => setData((p) => ({ ...p, cardNumber: fmtCard(e.target.value) }))} />
                            {errors.cardNumber && <span className="text-red-500 text-sm">{errors.cardNumber}</span>}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelClass}>Expiry <span className="text-red-500">*</span></label>
                                <input className={inputClass(errors.expiry)} placeholder="MM/YY"
                                    inputMode="numeric" value={data.expiry}
                                    onChange={(e) => setData((p) => ({ ...p, expiry: fmtExpiry(e.target.value) }))} />
                                {errors.expiry && <span className="text-red-500 text-sm">{errors.expiry}</span>}
                            </div>
                            <div>
                                <label className={labelClass}>CVV <span className="text-red-500">*</span></label>
                                <input className={inputClass(errors.securityCode)} placeholder="CVV"
                                    inputMode="numeric" type="password" value={data.securityCode}
                                    onChange={(e) => setData((p) => ({ ...p, securityCode: e.target.value.replace(/\D/g, "").slice(0, 4) }))} />
                                {errors.securityCode && <span className="text-red-500 text-sm">{errors.securityCode}</span>}
                            </div>
                        </div>
                    </div>
                    <button onClick={handlePay} disabled={loading}
                        className="w-full bg-[#0496FF] hover:bg-[#037ecc] disabled:opacity-60 text-white font-semibold py-3 rounded-[12px] transition text-sm">
                        {loading ? "Processing…" : "Make Payment"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── success ───────────────────────────────────────────────────────────────────

function SuccessScreen({ onReset }) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-xl p-10 text-center max-w-sm w-full">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Booking Confirmed!</h2>
                <p className="text-sm text-gray-500 mb-6">Payment processed. A confirmation email will be sent shortly.</p>
                <button onClick={onReset} className="bg-[#0496FF] text-white px-6 py-2.5 rounded-[12px] text-sm font-medium hover:bg-[#037ecc] transition">
                    New Booking
                </button>
            </div>
        </div>
    );
}

// ── main ──────────────────────────────────────────────────────────────────────

export default function OneToOneBookingForm() {
    const [general, setGeneral] = useState(initialGeneral);
    const [students, setStudents] = useState([newStudent()]);
    const [parents, setParents] = useState([newParent()]);
    const [emergency, setEmergency] = useState(initialEmergency);
    const [errors, setErrors] = useState({});
    const [studentErrors, setStudentErrors] = useState({});
    const [parentErrors, setParentErrors] = useState({});
    const [showPayment, setShowPayment] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const { profile, fetchProfileData } = useProfile();

    const setG = (k) => (e) => setGeneral((p) => ({ ...p, [k]: e.target.value }));

    // sync student count
    useEffect(() => {
        const count = Math.max(1, parseInt(general.students) || 1);
        setStudents((prev) => {
            if (count === prev.length) return prev;
            if (count > prev.length) return [...prev, ...Array.from({ length: count - prev.length }, newStudent)];
            return prev.slice(0, count);
        });
    }, [general.students]);

    useEffect(() => { fetchProfileData(); }, []);
    // add this handler in main
    function handleRemoveStudent(id) {
        setStudents((prev) => {
            const next = prev.filter((s) => s.id !== id);
            return next.length ? next : [newStudent()];
        });
        setGeneral((prev) => ({ ...prev, students: Math.max(1, students.length - 1) }));
        setStudentErrors((prev) => { const n = { ...prev }; delete n[id]; return n; });
    }
    useEffect(() => {
        if (!profile) {
            setParents([newParent()]); setStudents([newStudent()]); setEmergency(initialEmergency);
            return;
        }

        const rawParents = profile?.adminMeta?.parents || [];
        const rawStudents = profile?.adminMeta?.students || [];

        const normalizeDOB = (raw) => {
            if (!raw) return "";
            return raw.includes("-") ? isoToDDMMYYYY(raw) : raw;
        };

        const normalizedParents = rawParents.map((p) => ({
            id: p.id ?? Date.now() + Math.random(),
            parentFirstName: p.parentFirstName || p.firstName || "",
            parentLastName: p.parentLastName || p.lastName || "",
            parentEmail: p.parentEmail || p.email || "",
            parentPhoneNumber: p.parentPhoneNumber || p.phone || p.phoneNumber || "",
            relationToChild: p.relationToChild || p.relation || "",
            howDidYouHear: p.howDidYouHear || p.hearAbout || "",
            interestReason: p.interestReason || "",
            interestReasonOther: p.interestReasonOther || "",
            isCustomReason: p.isCustomReason || false,
        }));

        const normalizedStudents = rawStudents.map((s) => ({
            id: s.id ?? Date.now() + Math.random(),
            firstName: s.firstName || s.studentFirstName || "",
            lastName: s.lastName || s.studentLastName || "",
            dob: normalizeDOB(s.dob || s.dateOfBirth),
            age: s.age ?? "",
            gender: s.gender || "",
            medicalInfo: s.medicalInfo || s.medicalInformation || "",
        }));

        const finalParents = normalizedParents.length ? normalizedParents : [newParent()];
        const finalStudents = normalizedStudents.length ? normalizedStudents : [newStudent()];

        setParents(finalParents);
        setStudents(finalStudents);
        setGeneral((prev) => ({ ...prev, students: finalStudents.length }));

        const ec = profile?.adminMeta?.emergency;
        if (ec) {
            const p0 = finalParents[0];
            const ecFirst = ec.emergencyFirstName || ec.firstName || "";
            const ecLast = ec.emergencyLastName || ec.lastName || "";
            const ecPhone = ec.emergencyPhoneNumber || ec.phone || "";
            const isSame = !!p0 &&
                p0.parentFirstName?.trim() === ecFirst.trim() &&
                p0.parentLastName?.trim() === ecLast.trim() &&
                p0.parentPhoneNumber?.trim() === ecPhone.trim();
            setEmergency({
                sameAsAbove: isSame,
                emergencyFirstName: ecFirst,
                emergencyLastName: ecLast,
                emergencyPhoneNumber: ecPhone,
                emergencyRelation: ec.emergencyRelation || ec.relation || "",
            });
        } else {
            setEmergency(initialEmergency);
        }
    }, [profile]);

    function handleStudentChange(id, field, value) {
        setStudents((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s));
        setStudentErrors((prev) => {
            if (!prev[id]?.[field]) return prev;
            const u = { ...prev[id] }; delete u[field];
            return { ...prev, [id]: u };
        });
    }

    function handleParentChange(id, field, value) {
        setParents((prev) => prev.map((p) => p.id === id ? { ...p, [field]: value } : p));
        setParentErrors((prev) => {
            const idx = parents.findIndex((p) => p.id === id);
            const key = `p${idx}_${field}`;
            if (!prev[key]) return prev;
            const n = { ...prev }; delete n[key]; return n;
        });
    }

    function addParent() { setParents((prev) => [...prev, newParent()]); }
    function removeParent(id) {
        setParents((prev) => prev.filter((p) => p.id !== id));
        setParentErrors({});
    }

    function toggleSameAsAbove(e) {
        const checked = e.target.checked;
        const first = parents[0];
        setEmergency((prev) => ({
            ...prev, sameAsAbove: checked,
            ...(checked ? {
                emergencyFirstName: first.parentFirstName,
                emergencyLastName: first.parentLastName,
                emergencyPhoneNumber: first.parentPhoneNumber,
                emergencyRelation: first.relationToChild,
            } : {
                emergencyFirstName: "", emergencyLastName: "",
                emergencyPhoneNumber: "", emergencyRelation: "",
            }),
        }));
    }

    function validateStudents() {
        const all = {};
        students.forEach((s) => {
            const e = {};
            if (!s.firstName.trim()) e.firstName = "Required";
            if (!s.lastName.trim()) e.lastName = "Required";
            if (!s.dob || s.dob.length < 10) e.dob = "Enter a valid date (DD/MM/YYYY)";
            if (!s.gender) e.gender = "Required";
            if (Object.keys(e).length) all[s.id] = e;
        });
        return all;
    }

    function validateParents() {
        const all = {};
        parents.forEach((pa, i) => {
            const e = {};
            if (!pa.parentFirstName?.trim()) e.parentFirstName = "Required";
            if (!pa.parentLastName?.trim()) e.parentLastName = "Required";
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pa.parentEmail)) e.parentEmail = "Invalid email";
            if (!pa.parentPhoneNumber?.trim()) e.parentPhoneNumber = "Required";
            if (!pa.relationToChild) e.relationToChild = "Required";
            if (!pa.interestReason) e.interestReason = "Required";
            if (!pa.howDidYouHear) e.howDidYouHear = "Required";
            Object.entries(e).forEach(([k, v]) => { all[`p${i}_${k}`] = v; });
        });
        return all;
    }

    function validate() {
        const e = {};
        if (!general.location.trim()) e["gen.location"] = "Location is required";
        if (!general.date) e["gen.date"] = "Date is required";
        if (!general.time) e["gen.time"] = "Time is required";
        if (!general.coach) e["gen.coach"] = "Select a coach";
        if (!general.package) e["gen.package"] = "Select a package";
        if (!emergency.sameAsAbove) {
            if (!emergency.emergencyFirstName?.trim()) e["em.firstName"] = "Required";
            if (!emergency.emergencyLastName?.trim()) e["em.lastName"] = "Required";
            if (!emergency.emergencyPhoneNumber?.trim()) e["em.phone"] = "Required";
        }
        return e;
    }

    function handleMakePayment() {
        const e = validate();
        const se = validateStudents();
        const pe = validateParents();
        setErrors(e); setStudentErrors(se); setParentErrors(pe);
        if (!Object.keys(e).length && !Object.keys(se).length && !Object.keys(pe).length) {
            setShowPayment(true); return;
        }
        setTimeout(() => {
            document.querySelector(".border-red-500")?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 50);
    }

    function resetAll() {
        setGeneral(initialGeneral); setStudents([newStudent()]); setParents([newParent()]);
        setEmergency(initialEmergency); setErrors({}); setStudentErrors({}); setParentErrors({}); setSubmitted(false);
    }

    if (submitted) return <SuccessScreen onReset={resetAll} />;

    const hasErrors = Object.keys(errors).length > 0 || Object.keys(studentErrors).length > 0 || Object.keys(parentErrors).length > 0;

    return (
        <div className="min-h-screen booking-page bg-gray-50 font-sans">
            <div className="mx-auto p-4 lg:p-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">New Session Booking</h1>
                    <p className="text-sm text-gray-500 mt-1">Complete all sections then proceed to payment.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* sidebar */}
                    <div className="md:w-1/3 lg:w-1/4 flex-shrink-0 space-y-4">
                        <Section title="General Information">
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className={labelClass}>Location <span className="text-red-500">*</span></label>
                                    <div className={`flex items-center w-full border rounded-[12px] px-3 py-3 gap-3 ${errors["gen.location"] ? "border-red-500 bg-red-50" : "border-[#E2E1E5] bg-white"}`}>
                                        <img src="/assets/search.png" className="h-4 w-4 opacity-40" alt="" />
                                        <input className="flex-1 text-sm outline-none bg-transparent" placeholder="Search location"
                                            value={general.location} onChange={setG("location")} />
                                    </div>
                                    {errors["gen.location"] && <span className="text-red-500 text-sm">{errors["gen.location"]}</span>}
                                </div>

                                <div>
                                    <label className={labelClass}>Address</label>
                                    <div className="flex items-center w-full border border-[#E2E1E5] rounded-[12px] px-3 py-3 gap-3 bg-white">
                                        <img src="/assets/search.png" className="h-4 w-4 opacity-40" alt="" />
                                        <input className="flex-1 text-sm outline-none bg-transparent" placeholder="Search address"
                                            value={general.address} onChange={setG("address")} />
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>Date <span className="text-red-500">*</span></label>
                                    <input type="date" className={inputClass(errors["gen.date"])}
                                        value={general.date} onChange={setG("date")} />
                                    {errors["gen.date"] && <span className="text-red-500 text-sm">{errors["gen.date"]}</span>}
                                </div>

                                <div>
                                    <label className={labelClass}>Time <span className="text-red-500">*</span></label>
                                    <input type="time" className={inputClass(errors["gen.time"])}
                                        value={general.time} onChange={setG("time")} />
                                    {errors["gen.time"] && <span className="text-red-500 text-sm">{errors["gen.time"]}</span>}
                                </div>

                                <div>
                                    <label className={labelClass}>Students</label>
                                    <input type="number" min={1} max={20}
                                        className={inputClass()}
                                        value={general.students}
                                        onChange={(e) => setGeneral((p) => ({ ...p, students: Math.max(1, parseInt(e.target.value) || 1) }))} />
                                    <p className="text-xs text-gray-400 mt-1">{students.length} form{students.length > 1 ? "s" : ""} below</p>
                                </div>

                                <div>
                                    <label className={labelClass}>Areas to work on</label>
                                    <textarea rows={3} className={`${inputClass()} resize-none`}
                                        placeholder="Describe areas…" value={general.areasToWorkOn} onChange={setG("areasToWorkOn")} />
                                </div>

                                <div>
                                    <label className={labelClass}>Select a coach <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <select className={`${inputClass(errors["gen.coach"])} appearance-none`}
                                            value={general.coach} onChange={setG("coach")}>
                                            <option value="">Choose a coach</option>
                                            {COACHES.map((c) => <option key={c}>{c}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                    </div>
                                    {errors["gen.coach"] && <span className="text-red-500 text-sm">{errors["gen.coach"]}</span>}
                                </div>

                                <div>
                                    <label className={labelClass}>Package <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <select className={`${inputClass(errors["gen.package"])} appearance-none`}
                                            value={general.package} onChange={setG("package")}>
                                            <option value="">Choose a package</option>
                                            {PACKAGES.map((p) => <option key={p}>{p}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                    </div>
                                    {errors["gen.package"] && <span className="text-red-500 text-sm">{errors["gen.package"]}</span>}
                                </div>

                                <div>
                                    <label className={labelClass}>Apply discount</label>
                                    <div className="relative">
                                        <select className={`${inputClass()} appearance-none`}
                                            value={general.discount} onChange={setG("discount")}>
                                            <option value="">Select a discount code</option>
                                            {DISCOUNTS.map((d) => <option key={d}>{d}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                    </div>
                                </div>
                            </div>
                        </Section>

                        <button className="w-full bg-[#0496FF] hover:bg-[#037ecc] text-white font-semibold py-3 px-4 rounded-[12px] flex items-center justify-center gap-2 text-sm transition">
                            Price Breakdown <span>+</span>
                        </button>
                    </div>

                    {/* main */}
                    <div className="flex-1 flex flex-col gap-5">
                        <Section title={`Student information${students.length > 1 ? ` (${students.length} students)` : ""}`}>
                            {students.map((s, idx) => (
                                <StudentCard key={s.id} student={s} index={idx}
                                    errors={studentErrors} onChange={handleStudentChange} total={students.length} onRemove={handleRemoveStudent}   // ← add this
                                />
                            ))}
                        </Section>

                        <Section title="Parent information"
                            action={
                                <button onClick={addParent}
                                    className="bg-[#0496FF] hover:bg-[#037ecc] text-white text-xs font-semibold px-3 py-1.5 rounded-[8px] transition flex items-center gap-1">
                                    + Add Parent
                                </button>
                            }>
                            {parents.map((pa, idx) => (
                                <ParentCard key={pa.id} parent={pa} index={idx} errors={parentErrors}
                                    onChange={handleParentChange} onRemove={removeParent} canRemove={parents.length > 1} />
                            ))}
                        </Section>

                        <Section title="Emergency contact details">
                            <label className="flex items-center gap-2 mb-4 cursor-pointer select-none text-[16px] text-[#717073] font-medium">
                                <input type="checkbox" checked={emergency.sameAsAbove} onChange={toggleSameAsAbove}
                                    className="w-4 h-4 rounded border-gray-300 accent-[#0496FF]" />
                                Fill same as above
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>First name <span className="text-red-500">*</span></label>
                                    <input className={inputClass(errors["em.firstName"])} placeholder="Enter first name"
                                        value={emergency.emergencyFirstName} disabled={emergency.sameAsAbove}
                                        onChange={(e) => setEmergency((p) => ({ ...p, emergencyFirstName: e.target.value }))} />
                                    {errors["em.firstName"] && <span className="text-red-500 text-sm">{errors["em.firstName"]}</span>}
                                </div>
                                <div>
                                    <label className={labelClass}>Last name <span className="text-red-500">*</span></label>
                                    <input className={inputClass(errors["em.lastName"])} placeholder="Enter last name"
                                        value={emergency.emergencyLastName} disabled={emergency.sameAsAbove}
                                        onChange={(e) => setEmergency((p) => ({ ...p, emergencyLastName: e.target.value }))} />
                                    {errors["em.lastName"] && <span className="text-red-500 text-sm">{errors["em.lastName"]}</span>}
                                </div>
                                <div>
                                    <label className={labelClass}>Phone number <span className="text-red-500">*</span></label>
                                    <PhoneNumberInput
                                        value={emergency.emergencyPhoneNumber}
                                        readOnly={emergency.sameAsAbove}
                                        onChange={(v) => setEmergency((p) => ({ ...p, emergencyPhoneNumber: v }))}
                                        placeholder="Enter phone number"
                                        className={errors["em.phone"] ? "border-red-500 bg-red-50" : ""}
                                    />
                                    {errors["em.phone"] && <span className="text-red-500 text-sm">{errors["em.phone"]}</span>}
                                </div>
                                <div>
                                    <label className={labelClass}>Relation to child</label>
                                    <div className="relative">
                                        <select className={`${inputClass()} appearance-none`}
                                            value={emergency.emergencyRelation} disabled={emergency.sameAsAbove}
                                            onChange={(e) => setEmergency((p) => ({ ...p, emergencyRelation: e.target.value }))}>
                                            <option value="">Select relation</option>
                                            {RELATIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                    </div>
                                </div>
                            </div>
                        </Section>

                        {hasErrors && (
                            <div className="bg-red-50 border border-red-200 rounded-[12px] px-4 py-3 flex items-start gap-2">
                                <span className="text-red-500 mt-0.5">⚠</span>
                                <p className="text-sm text-red-600">Please fix the highlighted errors above before proceeding to payment.</p>
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-3 pt-1">
                            <button onClick={resetAll}
                                className="px-8 py-3 rounded-[12px] border text-[#717073] border-[#717073] text-[18px] font-semibold hover:bg-gray-50 transition">
                                Cancel
                            </button>
                            <button onClick={handleMakePayment}
                                className="px-8 py-3 rounded-[12px] bg-[#0496FF] hover:bg-[#037ecc] text-white text-[18px] font-semibold transition">
                                Make payment
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showPayment && (
                <PaymentModal pkg={general.package}
                    onClose={() => setShowPayment(false)}
                    onSuccess={() => { setShowPayment(false); setSubmitted(true); }} />
            )}
        </div>
    );
}