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

];
const howDidHearOptions = [
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
    parentEmail:parent[0]?.parentEmail||  "",
    parentPhoneNumber: "",
    relationChild: "",
    howDidHear: "",
    studentId: parent[0]?.studentId ||  "",
};

const emptyEmergency = {
    emergencyFirstName: "",
    emergencyLastName: "",
    emergencyPhoneNumber: "",
    emergencyRelation: "",

};

const getBookingLabel = (booking) => {
    if (!booking) return "Booking";
    const dateStr = booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : "";

    let title = "";
    if (booking.serviceType === "weekly class membership") {
        title = booking?.paymentPlan?.title || "Weekly Class Membership";
    } else if (booking.serviceType === "holiday camp") {
        title = booking?.holidayCamp?.name || "Holiday Camp";
    } else if (booking.serviceType === "birthday party") {
        title = booking?.leads?.packageInterest || "Birthday Party";
    } else if (booking.serviceType === "one to one") {
        title = booking?.leads?.packageInterest || "One to One";
    } else {
        title = booking?.serviceType || "Booking";
    }

    const venue = booking?.classSchedule?.venue?.name || booking?.venue?.name || booking?.holidayVenue?.name || booking?.location || "";

    return [title, venue, dateStr].filter(Boolean).join(" - ");
};

const ParentProfile = ({ activeServiceType }) => {
    /* ===== 1 PARENT BY DEFAULT ===== */
    const { profile, updateProfile } = useProfile();
    const [parents, setParents] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);
    const [emergencyEditing, setEmergencyEditing] = useState(false);
    const [dialCodes, setDialCodes] = useState("+44");
    const [emergency, setEmergency] = useState(emptyEmergency);
    const [sameAsParent, setSameAsParent] = useState(false);
    const [parentErrors, setParentErrors] = useState([{}]); // one object per parent
    const [emergencyErrors, setEmergencyErrors] = useState({});
    const [hasEmergencyContact, setHasEmergencyContact] = useState(false);

    const [selectedBookingId, setSelectedBookingId] = useState(() => {
        return localStorage.getItem(`selectedBookingId_${activeServiceType}`) || "";
    });

    const getBookingId = (booking, index) => {
        return booking?.id ? String(booking.id) : String(index);
    };

    const allBookingsList = profile?.combinedBookings
        || (profile?.groupedBookings ? Object.values(profile.groupedBookings).flat() : [])
        || (Array.isArray(profile) ? profile : []);

    const activeBookings = allBookingsList.filter((booking) => {
        if (!activeServiceType) return true;
        return booking?.serviceType === activeServiceType;
    });

    useEffect(() => {
        if (activeBookings.length > 0) {
            const hasSelected = activeBookings.some((b, idx) => getBookingId(b, idx) === selectedBookingId);
            if (!hasSelected) {
                const initialId = getBookingId(activeBookings[0], 0);
                setSelectedBookingId(initialId);
                localStorage.setItem(`selectedBookingId_${activeServiceType}`, initialId);
            }
        } else {
            setSelectedBookingId("");
        }
    }, [activeBookings, activeServiceType, selectedBookingId]);

    const selectedBooking = activeBookings.find((b, idx) => getBookingId(b, idx) === selectedBookingId) || activeBookings[0];

    const handleBookingChange = (bookingId) => {
        setSelectedBookingId(bookingId);
        localStorage.setItem(`selectedBookingId_${activeServiceType}`, bookingId);
        setEditingIndex(null);
        setEmergencyEditing(false);
    };

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
                id: emergency?.id,
                emergencyFirstName: parent?.parentFirstName || "",
                emergencyLastName: parent?.parentLastName || "",
                emergencyPhoneNumber: parent?.parentPhoneNumber || "",
                emergencyRelation: parent?.relationChild || "",

            });

            setEmergencyErrors({}); // clear errors if copying from valid parent
        }
    }, [sameAsParent, parents]);


    useEffect(() => {
        if (!selectedBooking) {
            setParents([]);
            setEmergency(emptyEmergency);
            setSameAsParent(false);
            setHasEmergencyContact(false);
            return;
        }

        const bookingParents = selectedBooking.parents || [];
        setParents(bookingParents);
        setParentErrors(bookingParents.map(() => ({})));

        const emergencyContact = selectedBooking.emergency;
        if (emergencyContact) {
            setEmergency(emergencyContact);
            setHasEmergencyContact(true);

            const activeParent = bookingParents[0];
            const activeEmergency = emergencyContact;
            const isSame = activeParent && activeEmergency &&
                activeParent.parentFirstName?.trim() === activeEmergency.emergencyFirstName?.trim() &&
                activeParent.parentLastName?.trim() === activeEmergency.emergencyLastName?.trim() &&
                activeParent.parentPhoneNumber?.trim() === activeEmergency.emergencyPhoneNumber?.trim();
            setSameAsParent(!!isSame);
        } else {
            setEmergency(emptyEmergency);
            setSameAsParent(false);
            setHasEmergencyContact(false);
        }
    }, [selectedBooking]);



    /* ===== CLEAR EMERGENCY WHEN SAMEASPARENT OFF ===== */
    useEffect(() => {
        if (!sameAsParent && !emergency) {
            setEmergency({ ...emptyEmergency });
            setEmergencyErrors({});
        }
    }, [sameAsParent]);

    /* ===== ADD PARENT ===== */
    const handleAddParent = () => {
        const firstParentEmail = parents.length > 0 ? parents[0].parentEmail : "";
        const firststudentId = parents.length > 0 ? parents[0].studentId : "";
        setParents((prev) => [...prev, { ...emptyParent,studentId:firststudentId, parentEmail: firstParentEmail }]);
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
        if (!email) return "";
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
        } else if (field === "parentPhoneNumber") {
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
        errors.parentLastName = validateText(parent.parentLastName, "Last name");
        errors.parentEmail = validateEmail(parent.parentEmail);
        errors.parentPhoneNumber = validatePhone(parent.parentPhoneNumber);

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

    console.log('parentErrors',parentErrors)

    /* ===== VALIDATE EMERGENCY FIELD (single) ===== */
    const validateEmergencyField = (field, value) => {
        let errorMsg = "";
        if (["emergencyFirstName", "emergencyLastName"].includes(field)) {
            errorMsg = validateText(value, field === "emergencyFirstName" ? "First name" : "Last name");
        } else if (field === "emergencyPhoneNumber") {
            errorMsg = validatePhone(value);
        } else if (field === "emergencyRelation") {

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

        errors.emergencyFirstName = validateText(emergency.emergencyFirstName, "First name");
        errors.emergencyLastName = validateText(emergency.emergencyLastName, "Last name");
        errors.emergencyPhoneNumber = validatePhone(emergency.emergencyPhoneNumber);
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

    const parentData = JSON.parse(localStorage.getItem("parentData"));
    const parentId = parentData?.id;

    const selectedBookingStudents = selectedBooking?.students || [];

    const cleanedStudents = selectedBookingStudents.map(
        ({
            id = "",
            studentFirstName = "",
            studentLastName = "",
            dateOfBirth = "",
            age = "",
            gender = "",
            medicalInformation = "",
        }) => ({
            id: id ?? "",

            studentFirstName: studentFirstName ?? "",
            studentLastName: studentLastName ?? "",
            dateOfBirth: dateOfBirth ?? "",
            age: age ?? "",
            gender: gender ?? "",
            medicalInformation: medicalInformation ?? "",
        })
    );
    const cleanedEmergency = {
        id: emergency?.id,
        studentId: emergency?.studentId,
        emergencyFirstName: emergency?.emergencyFirstName,
        emergencyLastName: emergency?.emergencyLastName,
        emergencyPhoneNumber: emergency?.emergencyPhoneNumber?.startsWith("+") ? emergency?.emergencyPhoneNumber : emergency?.emergencyPhoneNumber ? `${dialCodes}${emergency?.emergencyPhoneNumber}` : emergency?.emergencyPhoneNumber,
        emergencyRelation: emergency?.emergencyRelation,
    }


    const cleanedParents = parents?.map(
        ({ relationChild, howDidHear, ...rest }) => ({
            ...rest,
            parentPhoneNumber: rest.parentPhoneNumber?.startsWith("+") ? rest.parentPhoneNumber : rest.parentPhoneNumber ? `${dialCodes}${rest.parentPhoneNumber}` : rest.parentPhoneNumber,
            relationToChild: relationChild,
            howDidYouHear: howDidHear,
        })
    );
    console.log('emergency', emergency)

    /* ===== HANDLE SAVE PARENT ===== */

    console.log('parents',parents)
    const handleSaveParent = (index) => {
        const isValid = validateParent(index);
        if (isValid) {
            setEditingIndex(null);

            let finalDataToSend;
            if (activeServiceType === "weekly class membership" || activeServiceType === "holiday camp") {
                const mappedParents = parents.map((p) => ({
                    id: p.id,
                    studentId: p.studentId || (selectedBookingStudents?.length > 0 ? selectedBookingStudents[0].id : null),
                    parentFirstName: p.parentFirstName,
                    parentLastName: p.parentLastName,
                    parentEmail: p.parentEmail,
                    parentPhoneNumber: p.parentPhoneNumber?.startsWith("+") ? p.parentPhoneNumber : p.parentPhoneNumber ? `${dialCodes}${p.parentPhoneNumber}` : p.parentPhoneNumber,
                    relationChild: p.relationChild || p.relationToChild || "",
                    howDidHear: p.howDidHear || p.howDidYouHear || "",
                }));

                const mappedEmergency = {
                    id: emergency?.id,
                    studentId: emergency?.studentId || (selectedBookingStudents?.length > 0 ? selectedBookingStudents[0].id : null),
                    emergencyFirstName: emergency?.emergencyFirstName,
                    emergencyLastName: emergency?.emergencyLastName,
                    emergencyPhoneNumber: emergency?.emergencyPhoneNumber?.startsWith("+") ? emergency?.emergencyPhoneNumber : emergency?.emergencyPhoneNumber ? `${dialCodes}${emergency?.emergencyPhoneNumber}` : emergency?.emergencyPhoneNumber,
                    emergencyRelation: emergency?.emergencyRelation,
                };

                finalDataToSend = {
                    serviceType: activeServiceType === "weekly class membership" ? "weekly class" : "holiday camp",
                    bookingId: selectedBooking?.id,
                    students: cleanedStudents,
                    parents: mappedParents,
                    emergency: mappedEmergency,
                    ...(activeServiceType === "holiday camp" ? {
                        paymentPlanId: selectedBooking?.paymentPlan?.id,
                        holidayCampId: selectedBooking?.holidayCamp?.id,
                        payment: selectedBooking?.payment
                    } : {})
                };
            } else {
                finalDataToSend = {
                    parentAdminId: parentId,
                    students: cleanedStudents,
                    parents: cleanedParents,
                    emergencyContacts: [cleanedEmergency]
                };
            }

            updateProfile(finalDataToSend);
        } else {
        }
    };

    /* ===== HANDLE SAVE EMERGENCY ===== */
    const handleSaveEmergency = () => {
        if (validateEmergency()) {
            setEmergencyEditing(false);

            let finalDataToSend;
            if (activeServiceType === "weekly class membership" || activeServiceType === "holiday camp") {
                const mappedParents = parents.map((p) => ({
                    id: p.id,
                    studentId: p.studentId || (selectedBookingStudents?.length > 0 ? selectedBookingStudents[0].id : null),
                    parentFirstName: p.parentFirstName,
                    parentLastName: p.parentLastName,
                    parentEmail: p.parentEmail,
                    parentPhoneNumber: p.parentPhoneNumber?.startsWith("+") ? p.parentPhoneNumber : p.parentPhoneNumber ? `${dialCodes}${p.parentPhoneNumber}` : p.parentPhoneNumber,
                    relationChild: p.relationChild || p.relationToChild || "",
                    howDidHear: p.howDidHear || p.howDidYouHear || "",
                }));

                const mappedEmergency = {
                    id: emergency?.id,
                    studentId: emergency?.studentId || (selectedBookingStudents?.length > 0 ? selectedBookingStudents[0].id : null),
                    emergencyFirstName: emergency?.emergencyFirstName,
                    emergencyLastName: emergency?.emergencyLastName,
                    emergencyPhoneNumber: emergency?.emergencyPhoneNumber?.startsWith("+") ? emergency?.emergencyPhoneNumber : emergency?.emergencyPhoneNumber ? `${dialCodes}${emergency?.emergencyPhoneNumber}` : emergency?.emergencyPhoneNumber,
                    emergencyRelation: emergency?.emergencyRelation,
                };

                finalDataToSend = {
                    serviceType: activeServiceType === "weekly class membership" ? "weekly class" : "holiday camp",
                    bookingId: selectedBooking?.id,
                    students: cleanedStudents,
                    parents: mappedParents,
                    emergency: mappedEmergency,
                    ...(activeServiceType === "holiday camp" ? {
                        paymentPlanId: selectedBooking?.paymentPlan?.id,
                        holidayCampId: selectedBooking?.holidayCamp?.id,
                        payment: selectedBooking?.payment
                    } : {})
                };
            } else {
                finalDataToSend = {
                    parentAdminId: parentId,
                    students: cleanedStudents,
                    parents: cleanedParents,
                    emergencyContacts: [cleanedEmergency]
                };
            }

            updateProfile(finalDataToSend);
        } else {
        }
    };

    return (
        <div className="lg:space-y-6">
            {/* ================= Booking Selector ================= */}
            {activeBookings.length > 0 && (
                <div className="bg-white lg:rounded-[30px] p-6 mb-6 flex flex-col gap-2 shadow-sm">
                    <label className="text-[15px] font-semibold text-[#111827]">
                        Select Booking
                    </label>
                    <div className="relative w-full">
                        <select
                            value={selectedBookingId}
                            onChange={(e) => handleBookingChange(e.target.value)}
                            className="w-full appearance-none rounded-2xl border border-[#E5EAF2] bg-[#F9FAFB] hover:bg-white px-5 py-4 pr-12 text-[15px] font-medium text-[#111827] shadow-sm outline-none transition-all duration-300 focus:border-[#042C89] focus:ring-4 focus:ring-[#042C89]/10"
                        >
                            {activeBookings.map((b, idx) => (
                                <option key={getBookingId(b, idx)} value={getBookingId(b, idx)}>
                                    {getBookingLabel(b)}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M6 9L12 15L18 9"
                                    stroke="#6B7280"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= Parent Info ================= */}
            <div className="bg-white lg:rounded-[30px] p-6">
                {parents.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 font-medium mb-4 text-[18px]">No parent information found.</p>
                        {activeServiceType === "holiday camp" && (
                            <button
                                onClick={handleAddParent}
                                className="inline-flex items-center gap-2 px-6 py-2.5 font-semibold rounded-[12px] text-[16px] bg-[#0DD180] text-white hover:bg-green-700 transition"
                            >
                                <Plus size={18} /> Add Parent
                            </button>
                        )}
                    </div>
                )}
                {parents.length === 1 && (
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex gap-2 items-center cursor-pointer">
                            <h2 className="font-bold 2xl:text-[24px] text-[#282829] lg:text-[20px] text-[18px]">Parent information</h2>
                            {(activeServiceType === "weekly class membership" || activeServiceType === "holiday camp") && (
                                editingIndex !== 0 ? (
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
                                )
                            )}
                        </div>
                        {activeServiceType === "holiday camp" && (
                            <button
                                onClick={handleAddParent}
                                className="md:flex hidden items-center gap-1 px-4 py-2 font-semibold rounded-[8px] text-sm bg-[#0DD180] text-white"
                                disabled={editingIndex !== null}
                            >
                                <Plus size={17} /> Add Parent
                            </button>
                        )}

                    </div>
                )}


                {parents.map((parent, index) => {
                    const editable = editingIndex === index;
                    const errors = parentErrors[index] || {};

                    return (
                        <div key={index} className="rounded-xl mb-6">
                            {parents.length > 1 && (
                                <div className="flex mb-2 justify-between">
                                    <div className="flex gap-2"> <div
                                        onClick={(e) => {
                                            if (activeServiceType !== "weekly class membership" && activeServiceType !== "holiday camp") return;
                                            e.stopPropagation();
                                            if (editingIndex === null) setEditingIndex(index);
                                            // Don't toggle off if editing, force Save button
                                        }}
                                        className="text-sm font-semibold cursor-pointer flex gap-2 items-center"
                                    >
                                        <h2 className="font-bold 2xl:text-[24px] text-[#282829] lg:text-[20px] text-[18px]">Parent Information {index + 1}</h2>
                                        {(activeServiceType === "weekly class membership" || activeServiceType === "holiday camp") && !editable && <img src="/assets/edit.png" className="w-5" alt="Edit" />}
                                    </div>
                                        {(activeServiceType === "weekly class membership" || activeServiceType === "holiday camp") && editable && (
                                            <button
                                                onClick={() => handleSaveParent(index)}
                                                aria-label={`Save Parent ${index + 1}`}
                                                className="flex gap-2 items-center"
                                            >
                                                <Save size={20} />
                                            </button>
                                        )}</div>



                                    {activeServiceType === "holiday camp" && index === 0 && (
                                        <button
                                            onClick={handleAddParent}
                                            disabled={editingIndex !== null || parents.length >= 3}
                                            className={`md:flex hidden items-center gap-1 px-4 py-2.5 font-semibold rounded-[8px] text-sm md:text-[18px] bg-[#0DD180] text-white ${editingIndex !== null || parents.length >= 3 ? "cursor-not-allowed" : "cursor-pointer"
                                                }`}
                                        >
                                            <Plus className="text-xl md:text-[20px]" /> Add Parent
                                        </button>
                                    )}
                                </div>
                            )}


                            <div
                                className={`grid grid-cols-1 md:grid-cols-2 my-3 gap-5 ${parents.length > 1 && index !== parents.length - 1
                                        ? "border-b border-gray-200 pb-5"
                                        : ""
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
                                    error={errors.parentEmail}
                                    onChange={(e) => updateParent(index, "parentEmail", e.target.value)}
                                />



                                <div>
                                    <Label>Phone number</Label>
                                    <div className={`w-full flex items-center rounded-lg px-4 py-3 font-semibold outline-none ${editable ? "bg-white border" : "bg-[#F0F5FF]"
                                        } ${errors.parentPhoneNumber ? "border-red-500" : "border-gray-300"}`}>
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
                                            value={parent.parentPhoneNumber}
                                            onChange={(e) => updateParent(index, "parentPhoneNumber", e.target.value)}
                                            disabled={!editable}
                                            className={`poppins placeholder:text-[#9E9FAA] 2xl:ps-3 ps-4 text-[14px] border-l border-gray-300 outline-none w-full bg-transparent ${editable ? "text-[#282829]" : "text-[#9E9FAA]"}`}
                                        />
                                    </div>
                                    {errors.parentPhoneNumber && <p className="text-red-500 text-sm mt-1">{errors.parentPhoneNumber}</p>}
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

                {activeServiceType === "holiday camp" && parents.length > 0 && (
                    <button
                        onClick={handleAddParent}
                        className="md:hidden flex items-center gap-1 px-4 py-2 font-semibold rounded-lg text-sm bg-[#0DD180] text-white"
                        disabled={editingIndex !== null}
                    >
                        <Plus size={17} /> Add Parent
                    </button>
                )}
            </div>

            {/* ================= Emergency Contact ================= */}
            {hasEmergencyContact && (
                <div className="bg-white lg:rounded-[30px] p-6 shadow-sm">
                    <div
                        className="flex gap-2 items-center mb-2"
                        onClick={() => {
                            if (activeServiceType !== "weekly class membership" && activeServiceType !== "holiday camp") return;
                            if (!sameAsParent && !emergencyEditing) setEmergencyEditing(true);
                            // Don't toggle off edit by clicking again, force Save
                        }}
                    >
                        <h2 className="font-bold 2xl:text-[24px] text-[#282829] lg:text-[20px] text-[18px]">Emergency contact details</h2>
                        {(activeServiceType === "weekly class membership" || activeServiceType === "holiday camp") && (
                            emergencyEditing ? (
                                <button onClick={() => handleSaveEmergency()} aria-label="Save Emergency Contact">
                                    <Save size={20} />
                                </button>
                            ) : (
                                <img src="/assets/edit.png" className="w-5 cursor-pointer" alt="Edit" />
                            )
                        )}
                    </div>


                    <label className="flex items-center gap-2 text-[16px] text-[#717073] font-semibold mb-4 cursor-pointer">
                        <input type="checkbox" checked={sameAsParent} disabled={activeServiceType !== "weekly class membership" && activeServiceType !== "holiday camp"} onChange={(e) => setSameAsParent(e.target.checked)} />
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
            )}
        </div>
    );
};

/* ================= Reusable Components ================= */

const Label = ({ children }) => (
    <p className="text-[16px] lg:text-[18px] font-medium text-[#282829] mb-1">{children}</p>
);

const Input = ({ label, value, onChange, editable, error }) => (
    <div>
        <Label>{label}</Label>
        <input
            value={value}
            onChange={onChange}
            disabled={!editable}
            className={`w-full rounded-lg px-4 py-3 font-semibold outline-none ${editable ? "bg-white border" : "text-[#9E9FAA] placeholder:text-[#9E9FAA] bg-[#F0F5FF]"
                } ${error ? "border-red-500" : "border-gray-300"}`}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
);

const CustomSelect = ({ label, value, onChange, editable, error }) => {
    const isHearAboutUs = label === "How did you hear about us?";
    const currentOptions = isHearAboutUs ? howDidHearOptions : options;
    const selectedOption = currentOptions.find((opt) => opt.value?.toLowerCase() === value?.toLowerCase()) || null;

    const handleChange = (selected) => {
        onChange({ target: { value: selected ? selected.value : "" } });
    };

    return (
        <div>
            <Label>{label}</Label>
            <ReactSelect
                value={selectedOption}
                onChange={handleChange}
                options={currentOptions}
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
