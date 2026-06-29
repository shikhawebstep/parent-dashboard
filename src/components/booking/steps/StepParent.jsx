import { Trash2 } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useStep } from "../../../context/StepContext";
import { useRef } from "react";

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

export default function StepParent() {
    const { formData, setFormData, errors, clearError } = useStep();
    const sectionRefs = useRef([]);
    const parents = formData.parents || [];

    console.log('errors',errors)

    const handleChange = (index, field, value) => {
        setFormData(prev => {
            const updatedParents = [...prev.parents];
            updatedParents[index] = { ...updatedParents[index], [field]: value };
            return { ...prev, parents: updatedParents };
        });
        const errorKey = `${field}_${index}`;
        if (errors[errorKey]) clearError(errorKey);
    };

    const handleRemoveParent = (index) => {
        setFormData(prev => ({
            ...prev,
            parents: prev.parents.filter((_, i) => i !== index),
        }));
    };

    const inputClass = (field, index) => {
        const hasError = field && index !== undefined ? !!errors[`${field}_${index}`] : false;
        return `mt-1 w-full placeholder:text-[#9C9C9C] bg-white poppins font-normal mainShadow ${
            hasError ? "border border-red-500" : ""
        } p-3 rounded-[6px] text-sm focus:ring-2 focus:ring-[#0496FF] outline-none`;
    };

    const selectClass = (field, index) => {
        const hasError = field && index !== undefined ? !!errors[`${field}_${index}`] : false;
        return `mt-1 w-full placeholder:text-[#9C9C9C] bg-white poppins font-normal mainShadow ${
            hasError ? "border border-red-500" : ""
        } p-3 rounded-[6px] text-sm focus:ring-2 focus:ring-[#0496FF] outline-none appearance-none text-[#494949]`;
    };

    return (
        <div className="w-full max-w-4xl max-h-[500px] overflow-auto scroll-smooth mx-auto py-6 px-0 md:px-6 h-auto">
            {parents.length <= 1 && (
                <h2 className="text-[#191919] font-semibold md:text-[24px] text-[18px] mb-8 text-center poppins">
                    Parents information
                </h2>
            )}

            {parents.map((parent, index) => (
                <div
                    key={index}
                    ref={(el) => (sectionRefs.current[index] = el)}
                    className="max-w-[670px] m-auto mb-6"
                >
                    {/* Header */}
                    <div className="flex justify-between items-center pb-2 border-b border-gray-200 mb-5">
                        <h3 className="text-[#191919] font-semibold md:text-[20px] text-[16px] poppins">
                            {index === 0 ? "Parent information" : `Parent information ${index + 1}`}
                        </h3>
                        {index > 0 && (
                            <button
                                type="button"
                                onClick={() => handleRemoveParent(index)}
                                className="flex items-center gap-1 text-red-500 hover:text-red-700 text-sm font-medium poppins"
                            >
                                <Trash2 size={15} /> Remove
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                        {/* First Name */}
                        <div>
                            <label className="text-[14px] text-[#282829] poppins block font-normal">First name</label>
                            <input
                                type="text"
                                value={parent.parentFirstName || ""}
                                onChange={(e) => handleChange(index, "parentFirstName", e.target.value)}
                                className={inputClass("parentFirstName", index)}
                                placeholder="Enter first name"
                            />
                            {errors[`parentFirstName_${index}`] && (
                                <p className="text-red-500 text-xs mt-1 poppins">{errors[`parentFirstName_${index}`]}</p>
                            )}
                        </div>

                        {/* Last Name */}
                        <div>
                            <label className="text-[14px] text-[#282829] poppins block font-normal">Last name</label>
                            <input
                                type="text"
                                value={parent.parentLastName || ""}
                                onChange={(e) => handleChange(index, "parentLastName", e.target.value)}
                                className={inputClass("parentLastName", index)}
                                placeholder="Enter last name"
                            />
                            {errors[`parentLastName_${index}`] && (
                                <p className="text-red-500 text-xs mt-1 poppins">{errors[`parentLastName_${index}`]}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="text-[14px] text-[#282829] poppins block font-normal">Email</label>
                            <input
                                type="email"
                                value={parent.parentEmail || ""}
                                onChange={(e) => handleChange(index, "parentEmail", e.target.value)}
                                className={inputClass("parentEmail", index)}
                                placeholder="Enter email"
                            />
                            {errors[`parentEmail_${index}`] && (
                                <p className="text-red-500 text-xs mt-1 poppins">{errors[`parentEmail_${index}`]}</p>
                            )}
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="text-[14px] text-[#282829] poppins block font-normal">Phone number</label>
                            <div className={`flex items-center ${inputClass("parentPhoneNumber", index)}`}>
                                <div className="w-[13%]">
                                    <PhoneInput
                                        country="gb"
                                        value="+44"
                                        disableDropdown
                                        disableCountryCode
                                        countryCodeEditable={false}
                                        inputStyle={{ display: "none" }}
                                    />
                                </div>
                                <input
                                    type="tel"
                                    value={parent.parentPhoneNumber || ""}
                                    onChange={(e) => handleChange(index, "parentPhoneNumber", e.target.value)}
                                    className="ps-3 text-[14px] border-l poppins border-gray-300 text-[#494949] font-medium placeholder:text-[#ADA8A8] outline-none w-full"
                                    placeholder="Enter phone number"
                                />
                            </div>
                            {errors[`parentPhoneNumber_${index}`] && (
                                <p className="text-red-500 text-xs mt-1 poppins">{errors[`parentPhoneNumber_${index}`]}</p>
                            )}
                        </div>

                        {/* Relation to child */}
                        <div>
                            <label className="text-[14px] text-[#282829] poppins block font-normal">Relation to child</label>
                            <div className="relative">
                                <select
                                    value={parent.relationToChild || ""}
                                    onChange={(e) => handleChange(index, "relationToChild", e.target.value)}
                                    className={selectClass("relationToChild", index)}
                                >
                                    <option value="">Select</option>
                                    <option value="Father">Father</option>
                                    <option value="Mother">Mother</option>
                                    <option value="Guardian">Guardian</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                                    <svg className="w-4 h-4 text-[#939395]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                            {errors[`relationToChild_${index}`] && (
                                <p className="text-red-500 text-xs mt-1 poppins">{errors[`relationToChild_${index}`]}</p>
                            )}
                        </div>

                        {/* How did you hear */}
                        <div>
                            <label className="text-[14px] text-[#282829] poppins block font-normal">How did you hear about us?</label>
                            <div className="relative">
                                <select
                                    value={parent.howDidYouHear || ""}
                                    onChange={(e) => handleChange(index, "howDidYouHear", e.target.value)}
                                    className={selectClass("howDidYouHear", index)}
                                >
                                    <option value="">Select</option>
                                    <option value="Google">Google</option>
                                    <option value="Friend">Friend</option>
                                    <option value="Facebook">Facebook</option>
                                    <option value="Instagram">Instagram</option>
                                    <option value="Referral">Referral</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                                    <svg className="w-4 h-4 text-[#939395]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Interest Reason - full width */}
                        <div className="md:col-span-2">
                            <label className="text-[14px] text-[#282829] poppins block font-normal">
                                What's the main reason you're interested in Samba Soccer Schools?
                            </label>
                            {parent.isCustomReason ? (
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={parent.interestReason || ""}
                                        onChange={(e) => handleChange(index, "interestReason", e.target.value)}
                                        className={inputClass("interestReason", index)}
                                        placeholder="Please specify your reason"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            handleChange(index, "interestReason", "");
                                            handleChange(index, "isCustomReason", false);
                                        }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-600 font-semibold poppins"
                                    >
                                        ← Back
                                    </button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <select
                                        value={parent.interestReason || ""}
                                        onChange={(e) => {
                                            if (e.target.value === "Other") {
                                                handleChange(index, "isCustomReason", true);
                                                handleChange(index, "interestReason", "");
                                            } else {
                                                handleChange(index, "interestReason", e.target.value);
                                                handleChange(index, "isCustomReason", false);
                                            }
                                        }}
                                        className={selectClass("interestReason", index)}
                                    >
                                        {interestReasonOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                                        <svg className="w-4 h-4 text-[#939395]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Interest Reason Other - full width */}
                        <div className="md:col-span-2">
                            <label className="text-[14px] text-[#282829] poppins block font-normal">
                                Tell us a bit more (optional)
                            </label>
                            <input
                                type="text"
                                value={parent.interestReasonOther || ""}
                                onChange={(e) => handleChange(index, "interestReasonOther", e.target.value)}
                                className={inputClass("interestReasonOther", index)}
                                placeholder="Anything else you'd like to share?"
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}