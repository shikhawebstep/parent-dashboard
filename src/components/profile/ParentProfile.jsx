
import { useState, useEffect } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import ReactSelect from "react-select";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useProfile } from "../../context/ProfileContext";

// add imports at top
import { showSuccess, showError } from "../../../utils/swalHelper";

// add saving state inside component


const options = [
    { value: "", label: "Select" },
    { value: "Father", label: "Father" },
    { value: "Mother", label: "Mother" },
    { value: "Guardian", label: "Guardian" },
];

const howDidYouHearOptions = [
    { value: "", label: "Select" },
    { value: "Google", label: "Google" },
    { value: "Facebook", label: "Facebook" },
    { value: "Instagram", label: "Instagram" },
    { value: "Friend", label: "Friend" },
    { value: "Flyer", label: "Flyer" },
];

const emptyParent = {
    parentFirstName: "",
    parentLastName: "",
    parentEmail: "",
    parentPhoneNumber: "",
    relationToChild: "",
    howDidYouHear: "",
    studentId: "",
    interestReason: "",
    interestReasonOther: "",
    isCustomReason: false,  // ← add this

};
const interestReasonOptions = [
    { value: "", label: "Select a reason" },
    { value: "To build my child's confidence", label: "To build my child's confidence" },
    { value: "To improve their technical football skills", label: "To improve their technical football skills" },
    { value: "Because my child loves football", label: "Because my child loves football" },
    { value: "To help my child make friends and build social skills", label: "To help my child make friends and build social skills" },
    { value: "To keep my child active and healthy", label: "To keep my child active and healthy" },
    { value: "High-quality coaching in a fun, positive environment", label: "High-quality coaching in a fun, positive environment" },
    { value: "Other", label: "Other" },
];
const emptyEmergency = {
    emergencyFirstName: "",
    emergencyLastName: "",
    emergencyPhoneNumber: "",
    emergencyRelation: "",
};

const TABS = ["Parent Profile", "Student Profile", "Service History", "Feedback", "Rewards", "Events"];

/* ─── Phone field styles injected once ─── */
const phoneInputStyles = `
.phone-field .react-tel-input .form-control {
    width: 100% !important;
    height: 52px !important;
    border-radius: 15px !important;
    border: 1px solid #D1D5DB !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    color: #383A46 !important;
    padding-left: 52px !important;
    background: #fff !important;
   
}
.phone-field.editable .react-tel-input .form-control {
    background: #fff !important;
}
.phone-field.error .react-tel-input .form-control {
    border-color: #ef4444 !important;
}
.phone-field .react-tel-input .flag-dropdown {
    border: 1px solid #D1D5DB !important;
    border-right: none !important;
    border-radius: 15px 0 0 15px !important;
    background: transparent !important;
}
.phone-field .react-tel-input .selected-flag {
    border-radius: 15px 0 0 15px !important;
    padding: 0 8px 0 10px !important;
    background: transparent !important;
}
.phone-field .react-tel-input .selected-flag:hover,
.phone-field .react-tel-input .selected-flag:focus,
.phone-field .react-tel-input .flag-dropdown.open .selected-flag {
    background: #fff !important;
    border-radius: 15px 0 0 15px !important;
}
.phone-field .react-tel-input .country-list {
    border-radius: 15px !important;
    box-shadow: 0 4px 20px rgba(0,0,0,0.12) !important;
    font-size: 13px !important;
    z-index: 9999 !important;
}
`;

const ParentProfile = () => {
    const { profile, updateProfile } = useProfile();
    const [activeTab, setActiveTab] = useState("Parent Profile");
    const [parents, setParents] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);
    const [emergencyEditing, setEmergencyEditing] = useState(false);
    const [emergency, setEmergency] = useState(emptyEmergency);
    const [sameAsParent, setSameAsParent] = useState(false);
    const [parentErrors, setParentErrors] = useState([{}]);
    const [emergencyErrors, setEmergencyErrors] = useState({});
    const [hasEmergencyContact, setHasEmergencyContact] = useState(false);
    const [savingIndex, setSavingIndex] = useState(null);
    const [savingEmergency, setSavingEmergency] = useState(false);
    useEffect(() => {
        if (!profile) {
            setParents([]);
            setEmergency(emptyEmergency);
            setSameAsParent(false);
            setHasEmergencyContact(false);
            return;
        }
        const bookingParents = profile?.adminMeta?.parents || [];
        setParents(bookingParents);
        setParentErrors(bookingParents.map(() => ({})));

        const emergencyContact = profile?.adminMeta?.emergency;
        if (emergencyContact) {
            setEmergency(emergencyContact);
            setHasEmergencyContact(true);
            const activeParent = bookingParents[0];
            const isSame =
                activeParent &&
                activeParent.parentFirstName?.trim() === emergencyContact.emergencyFirstName?.trim() &&
                activeParent.parentLastName?.trim() === emergencyContact.emergencyLastName?.trim() &&
                activeParent.parentPhoneNumber?.trim() === emergencyContact.emergencyPhoneNumber?.trim();
            setSameAsParent(!!isSame);
        } else {
            setEmergency(emptyEmergency);
            setSameAsParent(false);
            setHasEmergencyContact(false);
        }
    }, [profile]);

    useEffect(() => {
        if (sameAsParent && Array.isArray(parents) && parents.length > 0 && parents[0]) {
            const parent = parents[0];
            setEmergency({
                id: emergency?.id,
                emergencyFirstName: parent?.parentFirstName || "",
                emergencyLastName: parent?.parentLastName || "",
                emergencyPhoneNumber: parent?.parentPhoneNumber || "",
                emergencyRelation: parent?.relationToChild || "",
            });
            setEmergencyErrors({});
        }
    }, [sameAsParent, parents]);

    useEffect(() => {
        if (!sameAsParent && !emergency) {
            setEmergency({ ...emptyEmergency });
            setEmergencyErrors({});
        }
    }, [sameAsParent]);

    const handleAddParent = () => {
        const firstParentEmail = parents.length > 0 ? parents[0].parentEmail : "";
        const firststudentId = parents.length > 0 ? parents[0].studentId : "";
        setParents((prev) => [...prev, { ...emptyParent, studentId: firststudentId, parentEmail: firstParentEmail }]);
        setParentErrors((prev) => [...prev, {}]);
        setEditingIndex(parents.length);
        setSameAsParent(false);
    };

    // Replace updateParent to support multiple fields at once
    const updateParent = (index, fieldOrFields, value) => {
        setParents((prev) => {
            const updated = [...prev];
            if (typeof fieldOrFields === "object") {
                updated[index] = { ...updated[index], ...fieldOrFields };
            } else {
                updated[index] = { ...updated[index], [fieldOrFields]: value };
                validateParentField(index, fieldOrFields, value);
            }
            return updated;
        });
    };
    const validateEmail = (email) => {
        if (!email) return "";
        return /\S+@\S+\.\S+/.test(email) ? "" : "Invalid email address";
    };
    const validatePhone = (phone) => {
        if (!phone) return "Phone number is required";
        return phone.length >= 7 ? "" : "Invalid phone number";
    };
    const validateText = (text, fieldName) => {
        if (!text || text.trim() === "") return `${fieldName} is required`;
        return "";
    };

    const validateParentField = (index, field, value) => {
        let errorMsg = "";
        if (["parentFirstName", "parentLastName"].includes(field)) {
            errorMsg = validateText(value, field === "parentFirstName" ? "First name" : "Last name");
        } else if (field === "parentEmail") {
            errorMsg = validateEmail(value);
        } else if (field === "parentPhoneNumber") {
            errorMsg = validatePhone(value);
        }
        setParentErrors((prev) => {
            const newErrors = [...prev];
            if (!newErrors[index]) newErrors[index] = {};
            newErrors[index][field] = errorMsg;
            return newErrors;
        });
    };

    const validateParent = (index) => {
        const parent = parents[index];
        const errors = {};
        errors.parentFirstName = validateText(parent.parentFirstName, "First name");
        errors.parentLastName = validateText(parent.parentLastName, "Last name");
        errors.parentEmail = validateEmail(parent.parentEmail);
        errors.parentPhoneNumber = validatePhone(parent.parentPhoneNumber);
        setParentErrors((prev) => {
            const newErrors = [...prev];
            newErrors[index] = errors;
            return newErrors;
        });
        return Object.values(errors).every((e) => e === "");
    };

    const validateEmergencyField = (field, value) => {
        let errorMsg = "";
        if (["emergencyFirstName", "emergencyLastName"].includes(field)) {
            errorMsg = validateText(value, field === "emergencyFirstName" ? "First name" : "Last name");
        } else if (field === "emergencyPhoneNumber") {
            errorMsg = validatePhone(value);
        }
        setEmergencyErrors((prev) => ({ ...prev, [field]: errorMsg }));
    };

    const validateEmergency = () => {
        const errors = {};
        errors.emergencyFirstName = validateText(emergency.emergencyFirstName, "First name");
        errors.emergencyLastName = validateText(emergency.emergencyLastName, "Last name");
        errors.emergencyPhoneNumber = validatePhone(emergency.emergencyPhoneNumber);
        errors.emergencyRelation = "";
        setEmergencyErrors(errors);
        return Object.values(errors).every((e) => e === "");
    };

    const handleEmergencyChange = (field, value) => {
        setEmergency((prev) => ({ ...prev, [field]: value }));
        validateEmergencyField(field, value);
    };

    const parentData = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("parentData") || "null") : null;
    const parentId = parentData?.id;

    const profileStudents = profile?.students || [];
    const cleanedStudents = profileStudents.map(
        ({ id = "", studentFirstName = "", studentLastName = "", dateOfBirth = "", age = "", gender = "", medicalInformation = "" }) => ({
            id, studentFirstName, studentLastName, dateOfBirth, age, gender, medicalInformation,
        })
    );

    const cleanedEmergency = {
        id: emergency?.id,
        studentId: emergency?.studentId,
        emergencyFirstName: emergency?.emergencyFirstName,
        emergencyLastName: emergency?.emergencyLastName,
        emergencyPhoneNumber: emergency?.emergencyPhoneNumber?.startsWith("+")
            ? emergency?.emergencyPhoneNumber
            : emergency?.emergencyPhoneNumber ? `+${emergency?.emergencyPhoneNumber}` : "",
        emergencyRelation: emergency?.emergencyRelation,
    };

    const cleanedParents = parents?.map(({ relationToChild, howDidYouHear, ...rest }) => ({
        ...rest,
        parentPhoneNumber: rest.parentPhoneNumber?.startsWith("+")
            ? rest.parentPhoneNumber
            : rest.parentPhoneNumber ? `+${rest.parentPhoneNumber}` : "",
        relationToChild: relationToChild,
        howDidYouHear: howDidYouHear,
    }));

    const handleSaveParent = async (index) => {
        if (!validateParent(index)) return;

        const token = localStorage.getItem("parentToken");
        const parent = parents[index];
        setSavingIndex(index);

        const isNew = !parent.id; // ← new parent has no id

        const payload = {
            parentFirstName: parent.parentFirstName,
            parentLastName: parent.parentLastName,
            parentEmail: parent.parentEmail,
            parentPhoneNumber: parent.parentPhoneNumber,
            relationToChild: parent.relationToChild,
            howDidYouHear: parent.howDidYouHear,
            interestReason: parent.interestReason || null,
            interestReasonOther: parent.interestReasonOther || null,
        };

        try {
            const url = isNew
                ? `${import.meta.env.VITE_API_BASE_URL}api/parent/booking-update/add-parent`
                : `${import.meta.env.VITE_API_BASE_URL}api/parent/booking-update/parent`;

            const res = await fetch(url, {
                method: isNew ? "POST" : "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || "Update failed");

            // If new parent was created, store the returned id so future saves use PUT
            if (isNew && data?.data?.id) {
                setParents((prev) => {
                    const updated = [...prev];
                    updated[index] = { ...updated[index], id: data.data.id };
                    return updated;
                });
            }

            showSuccess("Saved", data?.message || "Parent saved successfully");
            setEditingIndex(null);
        } catch (err) {
            console.error(err);
            showError("Error", err.message || "Something went wrong");
        } finally {
            setSavingIndex(null);
        }
    };

    const handleSaveEmergency = async () => {
        if (!validateEmergency()) return;
        setSavingEmergency(true);

        const token = localStorage.getItem("parentToken");

        const payload = {
            emergencyFirstName: emergency.emergencyFirstName,
            emergencyLastName: emergency.emergencyLastName,
            emergencyPhoneNumber: emergency.emergencyPhoneNumber,
            emergencyRelation: emergency.emergencyRelation,
        };

        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}api/parent/booking-update/emergency`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || "Update failed");
            showSuccess("Saved", data?.message || "Emergency contact updated successfully");
            setEmergencyEditing(false);
        } catch (err) {
            console.error(err);
            showError("Error", err.message || "Something went wrong");
        } finally {
            setSavingEmergency(false);
        }
    };
    const sidebarInfo = profile?.adminMeta || {};
    const memberName = profile?.students?.[0]
        ? `${profile.students[0].studentFirstName} ${profile.students[0].studentLastName}`
        : "Member";
    const initials = memberName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    const parentFirstName = sidebarInfo?.parents?.[0]?.parentFirstName?.trim() || "";
    const parentLastName = sidebarInfo?.parents?.[0]?.parentLastName?.trim() || "";

    const parentDisplayName = `${parentFirstName} ${parentLastName}`.trim();
    const profilePhoto = profile?.accountInfo?.profile;

    const relationToChild = sidebarInfo?.parents?.[0]?.relationToChild?.trim();

    const parentRelation = relationToChild ? ` / ${relationToChild}` : "";

    const allBookings = Array.isArray(profile?.bookings)
        ? profile.bookings
        : profile?.groupedBookings
            ? Object.values(profile.groupedBookings).flat()
            : profile?.combinedBookings || [];

    let displayBooking = null;
    const priorities = [
        "weekly class membership",
        "holiday camp",
        "one to one",
        "birthday party"
    ];

    for (const type of priorities) {
        const found = allBookings?.find(b => b?.serviceType?.toLowerCase() === type);
        if (found) {
            displayBooking = found;
            break;
        }
    }
    if (!displayBooking && allBookings?.length > 0) {
        displayBooking = allBookings[0];
    }

    const serviceType = displayBooking?.serviceType?.toLowerCase() || "weekly class membership";

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${day}-${month}-${year}`;
    };

    return (
        <div className="min-h-screen bg-[#F4F6FA] p-5 md:p-0">
            <style>{phoneInputStyles}</style>

            <div className="lg:flex gap-5 mt-2 items-start">
                {/* LEFT */}
                <div className="flex-1 lg:w-9/12 min-w-0 space-y-5">

                    {/* Parent Info Card */}
                    <div className="bg-white rounded-[16px] p-6 shadow-sm">
                        {parents.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-500 font-medium mb-4 text-[18px]">No parent information found.</p>
                                <button onClick={handleAddParent}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 font-semibold rounded-[12px] text-[16px] bg-[#0DD180] text-white hover:bg-green-600 transition">
                                    <Plus size={18} /> Add Parent
                                </button>
                            </div>
                        )}

                        {parents.map((parent, index) => {
                            const editable = editingIndex === index;
                            const errors = parentErrors[index] || {};

                            return (
                                <div key={index} className="mb-6">
                                    <div className="flex justify-between items-center mb-5">
                                        <h2 className="font-bold text-[18px] text-[#282829]">
                                            {parents.length === 1 ? "Parent information" : `Parent Information ${index + 1}`}
                                        </h2>
                                        <div className="flex items-center gap-3">
                                            {editable ? (
                                                <button
                                                    onClick={() => handleSaveParent(index)}
                                                    disabled={savingIndex === index}
                                                    className="text-gray-500 hover:text-black disabled:opacity-50"
                                                >
                                                    {savingIndex === index
                                                        ? <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin inline-block" />
                                                        : <Save size={18} />
                                                    }
                                                </button>
                                            ) : (
                                                <button onClick={() => { if (editingIndex === null) setEditingIndex(index); }}
                                                    className="text-gray-400 hover:text-black">
                                                    <img src="/assets/edit.png" className="w-5" alt="Edit" />
                                                </button>
                                            )}
                                            {index === 0 && (
                                                <button onClick={handleAddParent}
                                                    disabled={editingIndex !== null || parents.length >= 3}
                                                    className="hidden md:flex items-center gap-1 px-4 py-2 font-semibold rounded-[12px] text-sm bg-[#0DD180] text-white disabled:opacity-50 disabled:cursor-not-allowed">
                                                    <Plus size={16} /> Add Parent
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                                        <Field label="First name" error={errors.parentFirstName}>
                                            <input value={parent.parentFirstName} disabled={!editable}
                                                onChange={(e) => updateParent(index, "parentFirstName", e.target.value)}
                                                className={inputClass(editable, !!errors.parentFirstName)} />
                                        </Field>
                                        <Field label="Last name" error={errors.parentLastName}>
                                            <input value={parent.parentLastName} disabled={!editable}
                                                onChange={(e) => updateParent(index, "parentLastName", e.target.value)}
                                                className={inputClass(editable, !!errors.parentLastName)} />
                                        </Field>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                                        <Field label="Email" error={errors.parentEmail}>
                                            <input value={parent.parentEmail} disabled={!editable}
                                                onChange={(e) => updateParent(index, "parentEmail", e.target.value)}
                                                className={inputClass(editable, !!errors.parentEmail)} />
                                        </Field>
                                        <Field label="Phone number" error={errors.parentPhoneNumber}>
                                            <div className={`phone-field${editable ? " editable" : ""}${errors.parentPhoneNumber ? " error" : ""}`}>
                                                <PhoneInput
                                                    country="gb"
                                                    value={parent.parentPhoneNumber}
                                                    disabled={!editable}
                                                    onChange={(phone) => updateParent(index, "parentPhoneNumber", phone)}
                                                    enableSearch
                                                    searchPlaceholder="Search country..."
                                                />
                                            </div>
                                        </Field>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                                        <Field label="What's the main reason you're interested in Samba Soccer Schools?">
                                            {editable && parent.isCustomReason ? (
                                                <div className="relative">
                                                    <input
                                                        value={parent.interestReason || ""}
                                                        onChange={(e) => updateParent(index, "interestReason", e.target.value)}
                                                        className={inputClass(editable, false)}
                                                        placeholder="Please specify your reason"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            updateParent(index, "interestReason", "");
                                                            updateParent(index, "isCustomReason", false);
                                                        }}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-600 font-semibold"
                                                    >
                                                        ← Back
                                                    </button>
                                                </div>
                                            ) : (
                                                <ReactSelect
                                                    value={interestReasonOptions.find((o) => o.value === (parent.interestReason || "")) || interestReasonOptions[0]}
                                                    onChange={(selected) => {
                                                        if (!selected) return;
                                                        if (selected.value === "Other") {
                                                            updateParent(index, { interestReason: "", isCustomReason: true });
                                                        } else {
                                                            updateParent(index, { interestReason: selected.value, isCustomReason: false });
                                                        }
                                                    }}
                                                    options={interestReasonOptions}
                                                    isDisabled={!editable}
                                                    classNamePrefix="react-select"
                                                    styles={{
                                                        control: (provided, state) => ({
                                                            ...provided,
                                                            backgroundColor: "#fff",
                                                            borderColor: "#E2E1E5",
                                                            borderRadius: "12px",
                                                            minHeight: "52px",
                                                            fontWeight: "600",
                                                            fontSize: "14px",
                                                            boxShadow: "none",
                                                            "&:hover": { borderColor: state.isFocused ? "#042C89" : "#9CA3AF" },
                                                        }),
                                                        singleValue: (provided) => ({ ...provided, color: "#282829" }),
                                                        indicatorSeparator: () => ({ display: "none" }),
                                                        dropdownIndicator: (provided) => ({ ...provided, color: editable ? "#6B7280" : "#9CA3AF" }),
                                                        menu: (provided) => ({ ...provided, zIndex: 9999 }),
                                                    }}
                                                    placeholder="Select a reason"
                                                />
                                            )}
                                        </Field>
                                        <Field label="Tell us a bit more (optional)">
                                            <input
                                                value={parent.interestReasonOther || ""}
                                                disabled={!editable}
                                                onChange={(e) => updateParent(index, "interestReasonOther", e.target.value)}
                                                className={inputClass(editable, false)}
                                                placeholder="Anything else you'd like to share?"
                                            />
                                        </Field>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <Field label="Relation to child" error={errors.relationToChild}>
                                            <CustomSelect value={parent.relationToChild} editable={editable}
                                                options={options} error={errors.relationToChild}
                                                onChange={(e) => updateParent(index, "relationToChild", e.target.value)} />
                                        </Field>
                                        <Field label="How did you hear about us?" error={errors.howDidYouHear}>
                                            <CustomSelect value={parent.howDidYouHear} editable={editable}
                                                options={howDidYouHearOptions} error={errors.howDidYouHear}
                                                onChange={(e) => updateParent(index, "howDidYouHear", e.target.value)} />
                                        </Field>
                                    </div>

                                    {parents.length > 1 && index !== parents.length - 1 && (
                                        <hr className="mt-6 border-gray-200" />
                                    )}
                                </div>
                            );
                        })}

                        {parents.length > 0 && (
                            <button onClick={handleAddParent} disabled={editingIndex !== null}
                                className="md:hidden flex items-center gap-1 px-4 py-2 font-semibold rounded-[12px] text-sm bg-[#0DD180] text-white mt-2">
                                <Plus size={17} /> Add Parent
                            </button>
                        )}
                    </div>

                    {/* Emergency Contact Card */}
                    {hasEmergencyContact && (
                        <div className="bg-white rounded-[16px] p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="font-bold text-[18px] text-[#282829]">Emergency contact details</h2>
                                {emergencyEditing ? (
                                    <button onClick={handleSaveEmergency} className="text-gray-500 hover:text-black">
                                        <Save size={18} />
                                    </button>
                                ) : (
                                    <button onClick={() => { if (!sameAsParent) setEmergencyEditing(true); }}
                                        className="text-gray-400 hover:text-black">
                                        <img src="/assets/edit.png" className="w-5" alt="Edit" />
                                    </button>
                                )}
                            </div>

                            <label className="flex items-center gap-2 text-[14px] text-[#717073] font-medium mb-5 cursor-pointer select-none">
                                <input type="checkbox" checked={sameAsParent}
                                    onChange={(e) => setSameAsParent(e.target.checked)}
                                    className="w-4 h-4 accent-[#042C89]" />
                                Fill same as above
                            </label>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Field label="First name" error={emergencyErrors.emergencyFirstName}>
                                    <input value={emergency.emergencyFirstName}
                                        disabled={!(!sameAsParent && emergencyEditing)}
                                        onChange={(e) => handleEmergencyChange("emergencyFirstName", e.target.value)}
                                        className={inputClass(!sameAsParent && emergencyEditing, !!emergencyErrors.emergencyFirstName)} />
                                </Field>
                                <Field label="Last name" error={emergencyErrors.emergencyLastName}>
                                    <input value={emergency.emergencyLastName}
                                        disabled={!(!sameAsParent && emergencyEditing)}
                                        onChange={(e) => handleEmergencyChange("emergencyLastName", e.target.value)}
                                        className={inputClass(!sameAsParent && emergencyEditing, !!emergencyErrors.emergencyLastName)} />
                                </Field>
                                <Field label="Phone number" error={emergencyErrors.emergencyPhoneNumber}>
                                    <div className={`phone-field${(!sameAsParent && emergencyEditing) ? " editable" : ""}${emergencyErrors.emergencyPhoneNumber ? " error" : ""}`}>
                                        <PhoneInput
                                            country="gb"
                                            value={emergency.emergencyPhoneNumber}
                                            disabled={!(!sameAsParent && emergencyEditing)}
                                            onChange={(phone) => handleEmergencyChange("emergencyPhoneNumber", phone)}
                                            enableSearch
                                            searchPlaceholder="Search country..."
                                        />
                                    </div>
                                </Field>
                                <Field label="Relation to child" error={emergencyErrors.emergencyRelation}>
                                    <CustomSelect value={emergency.emergencyRelation}
                                        editable={!sameAsParent && emergencyEditing}
                                        options={options} error={emergencyErrors.emergencyRelation}
                                        onChange={(e) => handleEmergencyChange("emergencyRelation", e.target.value)} />
                                </Field>
                            </div>
                        </div>
                    )}


                </div>

                {/* RIGHT SIDEBAR */}
                <div className="xl:w-[30%] md:w-[40%]  m-auto mt-5 md:mt-0">
                    <div className="bg-[#363E49] rounded-[30px] overflow-hidden text-white shadow-lg flex flex-col lg:p-4 p-3 h-fit">

                        {/* Header */}
                        <div
                            style={{ backgroundImage: "url('/assets/Frame.png')" }}
                            className="bg-cover bg-center px-6 rounded-[20px] md:py-4 py-2 flex justify-between items-center relative overflow-hidden"
                        >
                            <div className="flex flex-col">
                                <h3 className="text-black font-bold 2xl:text-[20px] xl:text-[18px] lg:text-[16px] text-[14px] leading-tight">
                                    Account Status
                                </h3>
                                <span className="text-black/80 lg:text-[16px] text-[14px] text-[#282829] font-semibold">
                                    {displayBooking?.status || sidebarInfo?.status || "Active"}
                                </span>
                            </div>
                        </div>

                        <div className="px-5 py-4 space-y-4">
                            <div className="flex items-center gap-4">
                                <img
                                    src={profilePhoto || "/assets/dummy-avatar.png"}
                                    alt="Avatar"
                                    className="w-20 h-20  object-cover rounded-full"
                                />
                                <div>
                                    <h4 className="md:text-[24px] 2xl:text-[20px] xl:text-[18px] lg:text-[16px] text-[14px] font-bold leading-tight">
                                        Account Holder
                                    </h4>
                                    <p className="lg:text-[16px] text-[14px] text-[#BDC0C3] font-medium">
                                        {parentDisplayName}
                                        {parentRelation}
                                    </p>
                                </div>
                            </div>

                            <hr className="border-white/10" />

                            <SidebarRow label="Venue">
                                <span className="px-2.5 py-0.5 rounded-[6px] bg-[#042C89] text-white text-[12px] font-semibold">
                                    {displayBooking?.classSchedule?.venue?.name || displayBooking?.venue?.name || displayBooking?.holidayVenue?.name || displayBooking?.location || (typeof sidebarInfo.venue === "object"
                                        ? sidebarInfo.venue?.name || sidebarInfo.venue?.area || "London"
                                        : sidebarInfo.venue || "London")}
                                </span>
                            </SidebarRow>

                            {serviceType === "weekly class membership" && (
                                <>
                                    <SidebarRow label="Membership Plan" value={sidebarInfo.membershipPlan || displayBooking?.paymentPlan?.title || "—"} />
                                    <SidebarRow label="Membership Start Date" value={sidebarInfo.startDate || formatDate(displayBooking?.startDate || displayBooking?.createdAt)} />
                                    <SidebarRow label="Membership Tenure" value={sidebarInfo.tenure || "0 days"} />
                                    <SidebarRow label="ID" value={sidebarInfo.id || displayBooking?.id || "—"} mono />

                                    <div>
                                        <div className="flex justify-between mb-1.5">
                                            <span className="text-white 2xl:text-[20px] xl:text-[18px] lg:text-[16px] text-[14px] font-medium mb-1">Progress</span>
                                            <span className="font-semibold text-[#BDC0C3] lg:text-[16px] text-[14px]">{sidebarInfo.progress || 0}%</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#0DD180] rounded-full" style={{ width: `${sidebarInfo.progress || 0}%` }} />
                                        </div>
                                    </div>
                                    <hr className="border-white/10" />
                                    <SidebarRow label="Price" value={sidebarInfo.price ? `£${sidebarInfo.price}` : displayBooking?.paymentPlan?.price ? `£${displayBooking.paymentPlan.price}` : "—"} />
                                </>
                            )}

                            {serviceType === "holiday camp" && (
                                <>
                                    <SidebarRow label="Camp Name" value={displayBooking?.holidayCamp?.name || "—"} />
                                    <SidebarRow label="Camp Date(s)" value={formatDate(displayBooking?.holidayCamp?.holidayCampDates?.[0]?.startDate || displayBooking?.createdAt)} />
                                    <SidebarRow label="Number of Students" value={displayBooking?.students?.length || 0} />
                                    <SidebarRow label="ID" value={displayBooking?.id || "—"} mono />
                                    <hr className="border-white/10" />
                                    <SidebarRow label="Price" value={displayBooking?.payments?.[0]?.amount ? `£${displayBooking.payments[0].amount}` : "—"} />
                                </>
                            )}

                            {serviceType === "one to one" && (
                                <>
                                    <SidebarRow label="Coach Name" value={`${displayBooking?.coach?.firstName || ""} ${displayBooking?.coach?.lastName || ""}`.trim() || "—"} />
                                    <SidebarRow label="Package" value={displayBooking?.package?.packageName || "—"} />
                                    <SidebarRow label="Number of Lessons" value={displayBooking?.package?.noOfSessions || displayBooking?.package?.noOfLessons || "—"} />
                                    <SidebarRow label="Lessons Remaining" value={displayBooking?.lessonsRemaining ?? "—"} />
                                    <SidebarRow label="ID" value={displayBooking?.id || "—"} mono />
                                    <hr className="border-white/10" />
                                    <SidebarRow label="Price" value={displayBooking?.payment?.amount ? `£${displayBooking.payment.amount}` : "—"} />

                                    <div className="mt-4">
                                        <button className="w-full py-2 rounded-[8px] bg-[#0DD180] text-white text-[16px] font-semibold hover:bg-green-600 transition">
                                            Renew Package
                                        </button>
                                    </div>
                                </>
                            )}

                            {serviceType === "birthday party" && (
                                <>
                                    <SidebarRow label="Coach Name" value={`${displayBooking?.coach?.firstName || ""} ${displayBooking?.coach?.lastName || ""}`.trim() || "—"} />
                                    <SidebarRow label="Party Package" value={displayBooking?.package?.packageName || "—"} />
                                    <SidebarRow label="Party Date" value={formatDate(displayBooking?.leads?.partyDate || displayBooking?.date)} />
                                    <SidebarRow label="No of Children" value={displayBooking?.students?.length || displayBooking?.noOfChildren || "—"} />
                                    <SidebarRow label="ID" value={displayBooking?.id || "—"} mono />
                                    <hr className="border-white/10" />
                                    <SidebarRow label="Price Paid" value={displayBooking?.payment?.amount ? `£${displayBooking.payment.amount}` : "—"} />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ─── Helpers ─── */
const inputClass = (editable, hasError) =>
    `w-full lg:p-3 p-2 border border-[#E2E1E5] rounded-[12px] focus:outline-none focus:border-[#042C89] text-[#383A46] outline-none  transition-colors bg-white focus:border-[#042C89]
    } ${hasError ? "!border-red-500" : ""}`;

const Field = ({ label, error, children }) => (
    <div>
        <p className="text-[16px] font-semibold text-[#282829] mb-1.5">{label}</p>
        {children}
        {error && <p className="text-red-500 text-[12px] mt-1">{error}</p>}
    </div>
);

const SidebarRow = ({ label, value, children, mono }) => (
    <div className="border-b border-[#495362] pb-2">
        <p className="text-white 2xl:text-[20px] xl:text-[18px] lg:text-[16px] text-[14px] font-medium mb-1">{label}</p>
        {children || (
            <p className={`font-semibold text-[#BDC0C3] lg:text-[16px] text-[14px]`}>{value}</p>
        )}
    </div>
);

const CustomSelect = ({ value, onChange, editable, options, error }) => {
    const selectedOption = options.find((opt) => opt.value?.toLowerCase() === value?.toLowerCase()) || null;
    return (
        <ReactSelect
            value={selectedOption}
            onChange={(selected) => onChange({ target: { value: selected ? selected.value : "" } })}
            options={options}
            isDisabled={!editable}
            classNamePrefix="react-select"
            styles={{
                control: (provided, state) => ({
                    ...provided,
                    backgroundColor: "#fff",
                    borderColor: error ? "#ef4444" : "#E2E1E5",
                    borderRadius: "12px",
                    minHeight: "52px",
                    fontWeight: "600",
                    color: "#383A46",
                    fontSize: "14px",
                    boxShadow: "none",
                    "&:hover": { borderColor: state.isFocused ? "#042C89" : "#9CA3AF" },
                }),
                singleValue: (provided) => ({ ...provided, color: "#282829" }),
                indicatorSeparator: () => ({ display: "none" }),
                dropdownIndicator: (provided) => ({ ...provided, color: editable ? "#6B7280" : "#9CA3AF" }),
                menu: (provided) => ({ ...provided, zIndex: 9999 }),
            }}
            placeholder="Select"
        />
    );
};

export default ParentProfile;
