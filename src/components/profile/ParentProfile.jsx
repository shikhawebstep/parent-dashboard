import { useState, useEffect } from "react";
import { Plus, Save } from "lucide-react";
import ReactSelect from "react-select";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
/* ================= DEFAULT MODELS ================= */

const options = [
    { value: "", label: "Select" },
    { value: "Father", label: "Father" },
    { value: "Mother", label: "Mother" },
    { value: "Guardian", label: "Guardian" },
    { value: "Social media", label: "Social media" },
    { value: "Google", label: "Google" },
];

const emptyParent = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    relation: "",
    source: "",
};

const emptyEmergency = {
    firstName: "",
    lastName: "",
    phone: "",
    relation: "",
};

const ParentProfile = () => {
    /* ===== 1 PARENT BY DEFAULT ===== */
    const [parents, setParents] = useState([emptyParent]);
    const [editingIndex, setEditingIndex] = useState(null);
    const [emergencyEditing, setEmergencyEditing] = useState(false);
    const [dialCodes, setDialCodes] = useState("+1");

    const [emergency, setEmergency] = useState(emptyEmergency);
    const [sameAsParent, setSameAsParent] = useState(false);

    // Validation states
    const [parentErrors, setParentErrors] = useState([{}]); // one object per parent
    const [emergencyErrors, setEmergencyErrors] = useState({});

    /* ===== COPY ACTIVE PARENT → EMERGENCY ===== */
    useEffect(() => {
        if (sameAsParent && parents[0]) {
            const parent = parents[0];
            setEmergency({
                firstName: parent.firstName,
                lastName: parent.lastName,
                phone: parent.phone,
                relation: parent.relation,
            });
            setEmergencyErrors({}); // clear errors if copying from valid parent
        }
    }, [sameAsParent, parents]);

    /* ===== CLEAR EMERGENCY WHEN SAMEASPARENT OFF ===== */
    useEffect(() => {
        if (!sameAsParent) {
            setEmergency(emptyEmergency);
            setEmergencyErrors({});
        }
    }, [sameAsParent]);

    /* ===== ADD PARENT ===== */
    const handleAddParent = () => {
        setParents((prev) => [...prev, emptyParent]);
        setParentErrors((prev) => [...prev, {}]);
        setEditingIndex(parents.length);
        setSameAsParent(false); // reset emergency toggle on add parent
    };

    /* ===== UPDATE PARENT ===== */
    const updateParent = (index, field, value) => {
        const updated = [...parents];
        updated[index] = { ...updated[index], [field]: value };
        setParents(updated);

        // Validate on update (optional, for realtime feedback)
        validateParentField(index, field, value);
    };

    /* ===== VALIDATION HELPERS ===== */
    const validateEmail = (email) => {
        if (!email) return "Email is required";
        // simple email regex
        const re = /\S+@\S+\.\S+/;
        return re.test(email) ? "" : "Invalid email address";
    };

    const validatePhone = (phone) => {
        if (!phone) return "Phone number is required";
        // simple numeric check + length 7-15 digits
        const re = /^[0-9]{7,15}$/;
        return re.test(phone) ? "" : "Invalid phone number";
    };

    const validateText = (text, fieldName) => {
        if (!text || text.trim() === "") return `${fieldName} is required`;
        return "";
    };

    /* ===== VALIDATE PARENT FIELD (single) ===== */
    const validateParentField = (index, field, value) => {
        let errorMsg = "";
        if (["firstName", "lastName"].includes(field)) {
            errorMsg = validateText(value, field === "firstName" ? "First name" : "Last name");
        } else if (field === "email") {
            errorMsg = validateEmail(value);
        } else if (field === "phone") {
            errorMsg = validatePhone(value);
        } else if (field === "relation" || field === "source") {
            // optional fields or you can require if you want
            errorMsg = "";
        }

        setParentErrors((prev) => {
            const newErrors = [...prev];
            if (!newErrors[index]) newErrors[index] = {};
            newErrors[index][field] = errorMsg;
            return newErrors;
        });
    };

    /* ===== VALIDATE ALL FIELDS FOR A PARENT ===== */
    const validateParent = (index) => {
        const parent = parents[index];
        const errors = {};

        errors.firstName = validateText(parent.firstName, "First name");
        errors.lastName = validateText(parent.lastName, "Last name");
        errors.email = validateEmail(parent.email);
        errors.phone = validatePhone(parent.phone);

        // relation and source optional or validate if needed
        errors.relation = "";
        errors.source = "";

        setParentErrors((prev) => {
            const newErrors = [...prev];
            newErrors[index] = errors;
            return newErrors;
        });

        return Object.values(errors).every((e) => e === "");
    };

    /* ===== VALIDATE EMERGENCY FIELD (single) ===== */
    const validateEmergencyField = (field, value) => {
        let errorMsg = "";
        if (["firstName", "lastName"].includes(field)) {
            errorMsg = validateText(value, field === "firstName" ? "First name" : "Last name");
        } else if (field === "phone") {
            errorMsg = validatePhone(value);
        } else if (field === "relation") {
            errorMsg = ""; // optional, can add if needed
        }

        setEmergencyErrors((prev) => ({
            ...prev,
            [field]: errorMsg,
        }));
    };

    /* ===== VALIDATE ALL EMERGENCY FIELDS ===== */
    const validateEmergency = () => {
        const errors = {};

        errors.firstName = validateText(emergency.firstName, "First name");
        errors.lastName = validateText(emergency.lastName, "Last name");
        errors.phone = validatePhone(emergency.phone);
        errors.relation = "";

        setEmergencyErrors(errors);

        return Object.values(errors).every((e) => e === "");
    };

    /* ===== HANDLE EMERGENCY CHANGE ===== */
    const handleEmergencyChange = (field, value) => {
        setEmergency((prev) => ({
            ...prev,
            [field]: value,
        }));
        validateEmergencyField(field, value);
    };

    /* ===== HANDLE SAVE PARENT ===== */
    const handleSaveParent = (index) => {
        const isValid = validateParent(index);
        if (isValid) {
            setEditingIndex(null);
        } else {
        }
    };

    /* ===== HANDLE SAVE EMERGENCY ===== */
    const handleSaveEmergency = () => {
        if (validateEmergency()) {
            setEmergencyEditing(false);
        } else {
        }
    };

    return (
        <div className="lg:space-y-6">
            {/* ================= Parent Info ================= */}
            <div className="bg-white lg:rounded-[30px] p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    {parents.length === 1 && (
                        <>
                            <div className="flex gap-2 items-center cursor-pointer">
                                <h2 className="font-bold 2xl:text-[24px] lg:text-[20px] text-[18px]">Parent Information</h2>
                                {editingIndex !== 0 ? (
                                    <img
                                        src="/assets/edit.png"
                                        className="w-5 cursor-pointer"
                                        alt="Edit"
                                        onClick={() => setEditingIndex(0)}
                                    />
                                ) : (
                                    <button onClick={() => handleSaveParent(0)} aria-label="Save Parent">
                                        <Save size={20} />
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={handleAddParent}
                                className="md:flex hidden items-center gap-1 px-4 py-2 font-semibold rounded-lg text-sm bg-[#0DD180] text-white"
                                disabled={editingIndex !== null}
                            >
                                <Plus size={17} /> Add Parent
                            </button>
                        </>
                    )}

                </div>

                {parents.map((parent, index) => {
                    const editable = editingIndex === index;
                    const errors = parentErrors[index] || {};

                    return (
                        <div key={index} className="rounded-xl mb-6">
                            {parents.length > 1 && (
                                <div className="flex mb-2 justify-between">
                                    <div className="flex gap-2"> <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (editingIndex === null) setEditingIndex(index);
                                            // Don't toggle off if editing, force Save button
                                        }}
                                        className="text-sm font-semibold cursor-pointer flex gap-2 items-center"
                                    >
                                        <h2 className="font-bold 2xl:text-[24px] lg:text-[20px] text-[18px]">Parent Information {index + 1}</h2>
                                        {!editable && <img src="/assets/edit.png" className="w-5" alt="Edit" />}
                                    </div>
                                        {editable && (
                                            <button
                                                onClick={() => handleSaveParent(index)}
                                                aria-label={`Save Parent ${index + 1}`}
                                                className="flex gap-2 items-center"
                                            >
                                                <Save size={20} />
                                            </button>
                                        )}</div>



                                    {index === 0 && (
                                        <button
                                            onClick={handleAddParent}
                                            disabled={editingIndex !== null || parents.length >= 3}
                                            className={`md:flex hidden items-center gap-1 px-4 py-2 font-semibold rounded-lg text-sm bg-[#0DD180] text-white ${editingIndex !== null || parents.length >= 3 ? "cursor-not-allowed" : "cursor-pointer"
                                                }`}
                                        >
                                            <Plus size={17} /> Add Parent
                                        </button>
                                    )}
                                </div>
                            )}


                            <div
                                className={`grid grid-cols-1 md:grid-cols-2 my-3 gap-5 ${parents.length > 1 ? "border-b border-gray-200 pb-5" : ""
                                    }`}
                            >
                                <Input
                                    label="First name"
                                    value={parent.firstName}
                                    editable={editable}
                                    error={errors.firstName}
                                    onChange={(e) => updateParent(index, "firstName", e.target.value)}
                                />

                                <Input
                                    label="Last name"
                                    value={parent.lastName}
                                    editable={editable}
                                    error={errors.lastName}
                                    onChange={(e) => updateParent(index, "lastName", e.target.value)}
                                />

                                <Input
                                    label="Email"
                                    value={parent.email}
                                    editable={editable}
                                    error={errors.email}
                                    onChange={(e) => updateParent(index, "email", e.target.value)}
                                />



                                <div>
                                    <Label>Phone number</Label>
                                    <div className={`w-full flex items-center rounded-lg px-4 py-3 font-semibold outline-none ${editable ? "bg-white border" : "bg-[#F0F5FF]"
                                        } ${errors.phone ? "border-red-500" : "border-gray-300"}`}>
                                        <div className="2xl:w-[6%] lg:w-[14%] w-[18%]">
                                            <PhoneInput
                                                country="us"
                                                value={dialCodes}
                                                disableDropdown={true}
                                                disableCountryCode={true}
                                                countryCodeEditable={false}
                                                inputStyle={{
                                                    display: "none",
                                                }}
                                            />
                                        </div>
                                        <input
                                            value={parent.phone}
                                            onChange={(e) => updateParent(index, "phone", e.target.value)}
                                            disabled={!editable}
                                            className={`poppins 2xl:ps-3 ps-4 text-[14px] border-l border-gray-300 outline-none w-full bg-transparent`}
                                        />
                                    </div>
                                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                                </div>

                                <CustomSelect
                                    label="Relation to child"
                                    value={parent.relation}
                                    editable={editable}
                                    onChange={(e) => updateParent(index, "relation", e.target.value)}
                                    error={errors.relation}
                                />

                                <CustomSelect
                                    label="How did you hear about us?"
                                    value={parent.source}
                                    editable={editable}
                                    onChange={(e) => updateParent(index, "source", e.target.value)}
                                    error={errors.source}
                                />
                            </div>


                        </div>
                    );
                })}

                <button
                    onClick={handleAddParent}
                    className="md:hidden flex items-center gap-1 px-4 py-2 font-semibold rounded-lg text-sm bg-[#0DD180] text-white"
                    disabled={editingIndex !== null}
                >
                    <Plus size={17} /> Add Parent
                </button>
            </div>

            {/* ================= Emergency Contact ================= */}
            <div className="bg-white lg:rounded-[30px] p-6 shadow-sm">
                <div
                    className="flex gap-2 items-center mb-2 cursor-pointer"
                    onClick={() => {
                        if (!sameAsParent && !emergencyEditing) setEmergencyEditing(true);
                        // Don't toggle off edit by clicking again, force Save
                    }}
                >
                    <h2 className="font-bold 2xl:text-[24px] lg:text-[20px] text-[18px]">Emergency Contact Details</h2>
                    {emergencyEditing ? (
                        <button onClick={() => handleSaveEmergency()} aria-label="Save Emergency Contact">
                            <Save size={20} />
                        </button>
                    ) : (
                        <img src="/assets/edit.png" className="w-5" alt="Edit" />
                    )}
                </div>


                <label className="flex items-center gap-2 text-[16px] text-[#717073] font-semibold mb-4 cursor-pointer">
                    <input type="checkbox" checked={sameAsParent} onChange={(e) => setSameAsParent(e.target.checked)} />
                    Fill same as above
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input
                        label="First name"
                        value={emergency.firstName}
                        editable={!sameAsParent && emergencyEditing}
                        error={emergencyErrors.firstName}
                        onChange={(e) => handleEmergencyChange("firstName", e.target.value)}
                    />

                    <Input
                        label="Last name"
                        value={emergency.lastName}
                        editable={!sameAsParent && emergencyEditing}
                        error={emergencyErrors.lastName}
                        onChange={(e) => handleEmergencyChange("lastName", e.target.value)}
                    />

                    <div>
                        <Label>Phone number</Label>
                        <div className={`w-full flex items-center rounded-lg px-4 py-3 font-semibold outline-none ${(!sameAsParent && emergencyEditing) ? "bg-white border" : "bg-[#F0F5FF]"
                            } ${emergencyErrors.phone ? "border-red-500" : "border-gray-300"}`}>
                            <div className="2xl:w-[6%] lg:w-[14%] w-[18%]">
                                <PhoneInput
                                    country="us"
                                    value={dialCodes}
                                    disableDropdown={true}
                                    disableCountryCode={true}
                                    countryCodeEditable={false}
                                    inputStyle={{
                                        display: "none",
                                    }}
                                />
                            </div>
                            <input
                                value={emergency.phone}
                                onChange={(e) => handleEmergencyChange("phone", e.target.value)}
                                disabled={!(!sameAsParent && emergencyEditing)}
                                className={`poppins 2xl:ps-3 ps-4 text-[14px] border-l border-gray-300 outline-none w-full bg-transparent`}
                            />
                        </div>
                        {emergencyErrors.phone && <p className="text-red-500 text-sm mt-1">{emergencyErrors.phone}</p>}
                    </div>

                    <CustomSelect
                        label="Relation to child"
                        value={emergency.relation}
                        editable={!sameAsParent && emergencyEditing}
                        error={emergencyErrors.relation}
                        onChange={(e) => handleEmergencyChange("relation", e.target.value)}
                    />
                </div>


            </div>
        </div>
    );
};

/* ================= Reusable Components ================= */

const Label = ({ children }) => (
    <p className="text-[16px] lg:text-[18px] font-semibold text-[#282829] mb-1">{children}</p>
);

const Input = ({ label, value, onChange, editable, error }) => (
    <div>
        <Label>{label}</Label>
        <input
            value={value}
            onChange={onChange}
            disabled={!editable}
            className={`w-full rounded-lg px-4 py-3 font-semibold outline-none ${editable ? "bg-white border" : "bg-[#F0F5FF]"
                } ${error ? "border-red-500" : "border-gray-300"}`}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
);

const CustomSelect = ({ label, value, onChange, editable, error }) => {
    const selectedOption = options.find((opt) => opt.value === value) || null;

    const handleChange = (selected) => {
        onChange({ target: { value: selected ? selected.value : "" } });
    };

    return (
        <div>
            <Label>{label}</Label>
            <ReactSelect
                value={selectedOption}
                onChange={handleChange}
                options={options}
                isDisabled={!editable}
                classNamePrefix="react-select"
                styles={{
                    control: (provided, state) => ({
                        ...provided,
                        backgroundColor: editable ? "#fff" : "#F0F5FF",
                        borderColor: error ? "#ef4444" : editable ? "#ccc" : "#fff",
                        borderRadius: "0.5rem",
                        minHeight: "48px",
                        fontWeight: "600",
                        fontSize: "1rem",
                        boxShadow: state.isFocused ? "0 0 0 1px #2684FF" : "none",
                        "&:hover": {
                            borderColor: state.isFocused ? "#2684FF" : "#999",
                        },
                    }),

                    singleValue: (provided) => ({
                        ...provided,
                        color: editable ? "#000" : "#999",
                    }),
                    menu: (provided) => ({
                        ...provided,
                        zIndex: 9999,
                    }),
                }}
                placeholder="Select"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
};

export default ParentProfile;
