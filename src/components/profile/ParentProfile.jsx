import { useState, useEffect } from "react";
import { Plus, Save } from "lucide-react";
import ReactSelect from "react-select";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useProfile } from "../../context/ProfileContext";
/* ================= DEFAULT MODELS ================= */

const options = [
    { value: "", label: "Select" },
    { value: "Father", label: "Father" },
    { value: "Mother", label: "Mother" },
    { value: "Guardian", label: "Guardian" },
    { value: "Social Media", label: "Social Media" },
    { value: "Google", label: "Google" },
];

const emptyParent = {
    parentFirstName: "",
    parentLastName: "",
    parentEmail: "",
    phoneNumber: "",
    relationChild: "",
    howDidHear: "",

};

const emptyEmergency = {
    emergencyFirstName: "",
    emergencyLastName: "",
    emergencyPhoneNumber: "",
    emergencyRelation: "",

};

const ParentProfile = () => {
    /* ===== 1 PARENT BY DEFAULT ===== */
    const { profile } = useProfile();
    const [parents, setParents] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);
    const [emergencyEditing, setEmergencyEditing] = useState(false);
    const [dialCodes, setDialCodes] = useState("+1");


    const [emergency, setEmergency] = useState(emptyEmergency);

    const [sameAsParent, setSameAsParent] = useState(false);
    const [parentErrors, setParentErrors] = useState([{}]); // one object per parent
    const [emergencyErrors, setEmergencyErrors] = useState({});

    /* ===== COPY ACTIVE PARENT → EMERGENCY ===== */
    useEffect(() => {
        if (
            sameAsParent &&
            Array.isArray(parents) &&
            parents.length > 0 &&
            parents[0]
        ) {
            const parent = parents[0];

            setEmergency({
                emergencyFirstName: parent?.parentFirstName || "",
                emergencyLastName: parent?.parentLastName || "",
                emergencyPhoneNumber: parent?.phoneNumber || "",
                emergencyRelation: parent?.relationChild || "",

            });

            setEmergencyErrors({}); // clear errors if copying from valid parent
        }
    }, [sameAsParent, parents]);


    useEffect(() => {
        if (Array.isArray(profile?.uniqueProfiles?.parents)) {
            setParents(profile.uniqueProfiles.parents);
        } else {
            setParents([emptyParent]); // fallback at least one parent
        }
    }, [profile]);

    useEffect(() => {
        if (profile?.uniqueProfiles?.emergencyContacts?.[0]) {
            setEmergency(profile.uniqueProfiles.emergencyContacts[0]);
        }
    }, [profile]);



    /* ===== CLEAR EMERGENCY WHEN SAMEASPARENT OFF ===== */
    useEffect(() => {
        if (!sameAsParent && !emergency) {
            setEmergency({ ...emptyEmergency });
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
        if (["parentLastName", "parentLastName"].includes(field)) {
            errorMsg = validateText(value, field === "parentLastName" ? "First name" : "Last name");
        } else if (field === "parentEmail") {
            errorMsg = validateEmail(value);
        } else if (field === "phoneNumber") {
            errorMsg = validatePhone(value);
        } else if (field === "relationChild" || field === "howDidHear") {
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

        errors.parentFirstName = validateText(parent.parentFirstName, "First name");
        errors.parentlLastName = validateText(parent.parentlLastName, "Last name");
        errors.parentEmail = validateEmail(parent.parentEmail);
        errors.phoneNumber = validatePhone(parent.phoneNumber);

        // relation and howDidHear optional or validate if needed
        errors.relation = "";
        errors.howDidHear = "";

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

        errors.emergencyFirstName = validateText(emergency.firstName, "First name");
        errors.emergencyLastName = validateText(emergency.lastName, "Last name");
        errors.emergencyPhoneNumber = validatePhone(emergency.phone);
        errors.emergencyRelation = "";


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
                                    value={parent.parentFirstName}
                                    editable={editable}
                                    error={errors.parentFirstName}
                                    onChange={(e) => updateParent(index, "parentFirstName", e.target.value)}
                                />

                                <Input
                                    label="Last name"
                                    value={parent.parentLastName}
                                    editable={editable}
                                    error={errors.parentLastName}
                                    onChange={(e) => updateParent(index, "parentLastName", e.target.value)}
                                />

                                <Input
                                    label="Email"
                                    value={parent.parentEmail}
                                    editable={editable}
                                    error={errors.parentEmail}
                                    onChange={(e) => updateParent(index, "parentEmail", e.target.value)}
                                />



                                <div>
                                    <Label>Phone number</Label>
                                    <div className={`w-full flex items-center rounded-lg px-4 py-3 font-semibold outline-none ${editable ? "bg-white border" : "bg-[#F0F5FF]"
                                        } ${errors.phoneNumber ? "border-red-500" : "border-gray-300"}`}>
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
                                            value={parent.phoneNumber}
                                            onChange={(e) => updateParent(index, "phoneNumber", e.target.value)}
                                            disabled={!editable}
                                            className={`poppins 2xl:ps-3 ps-4 text-[14px] border-l border-gray-300 outline-none w-full bg-transparent`}
                                        />
                                    </div>
                                    {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
                                </div>

                                <CustomSelect
                                    label="Relation to child"
                                    value={parent.relationChild}
                                    editable={editable}
                                    onChange={(e) => updateParent(index, "relationChild", e.target.value)}
                                    error={errors.relationChild}
                                />

                                <CustomSelect
                                    label="How did you hear about us?"
                                    value={parent.howDidHear}
                                    editable={editable}
                                    onChange={(e) => updateParent(index, "howDidHear", e.target.value)}
                                    error={errors.howDidHear}
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
                        value={emergency.emergencyFirstName}
                        editable={!sameAsParent && emergencyEditing}
                        error={emergencyErrors.emergencyFirstName}
                        onChange={(e) => handleEmergencyChange("emergencyFirstName", e.target.value)}
                    />

                    <Input
                        label="Last name"
                        value={emergency.emergencyLastName}
                        editable={!sameAsParent && emergencyEditing}
                        error={emergencyErrors.emergencyLastName}
                        onChange={(e) => handleEmergencyChange("emergencyLastName", e.target.value)}
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
                                value={emergency.emergencyPhoneNumber}
                                onChange={(e) => handleEmergencyChange("emergencyPhoneNumber", e.target.value)}
                                disabled={!(!sameAsParent && emergencyEditing)}
                                className={`poppins 2xl:ps-3 ps-4 text-[14px] border-l border-gray-300 outline-none w-full bg-transparent`}
                            />
                        </div>
                        {emergencyErrors.emergencyPhoneNumber && <p className="text-red-500 text-sm mt-1">{emergencyErrors.emergencyPhoneNumber}</p>}
                    </div>

                    <CustomSelect
                        label="Relation to child"
                        value={emergency.emergencyRelation}
                        editable={!sameAsParent && emergencyEditing}
                        error={emergencyErrors.emergencyRelation}
                        onChange={(e) => handleEmergencyChange("emergencyRelation", e.target.value)}
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
