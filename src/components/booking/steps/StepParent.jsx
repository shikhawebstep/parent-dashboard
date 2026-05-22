import { ChevronDown } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useStep } from "../../../context/StepContext";
import { useState, useRef } from "react";

export default function StepParent() {
    const { formData, setFormData, errors, clearError } = useStep();
    const [dialCodes] = useState("+1");
    const sectionRefs = useRef([]);

    const parents = formData.parents || [];

    const handleChange = (index, e) => {
        const { name, value } = e.target;

        setFormData(prev => {
            const updatedParents = [...prev.parents];
            updatedParents[index] = {
                ...updatedParents[index],
                [name]: value,
            };
            return { ...prev, parents: updatedParents };
        });

        const errorKey = `${name}_${index}`;
        if (errors[errorKey]) clearError(errorKey);
    };

    const inputClass = (field, index) => {
        const hasError = !!errors[`${field}_${index}`];
        return `w-full bg-white mainShadow rounded-lg text-[#494949] font-medium placeholder:text-[#ADA8A8] px-4 py-3 text-sm focus:ring-2 focus:ring-[#0496FF] outline-none ${
            hasError ? "border border-red-500" : ""
        }`;
    };

    return (
        <div className="w-full max-w-4xl max-h-[500px] overflow-auto scroll-smooth mx-auto py-6 px-0 md:px-6 h-auto">
            {/* Show global heading only when single parent */}
            {parents.length <= 1 && (
                <h2 className="text-[#191919] font-semibold md:text-[24px] text-[18px] mb-8 text-center poppins">
                    Parents information
                </h2>
            )}

            {parents.map((parent, index) => (
                <div
                    key={index}
                    ref={(el) => (sectionRefs.current[index] = el)}
                    className="max-w-[670px]  m-auto mb-6"
                >
                    {/* Per-parent heading when multiple */}
                    {parents.length > 1 && (
                        <h3 className="text-[#191919] font-semibold md:text-[20px] text-[16px] mb-5 poppins pb-2 border-b border-gray-200">
                            {index === 0
                                ? "Parent information"
                                : `Parent information ${index + 1}`}
                        </h3>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* First Name */}
                        <div>
                            <label className="text-[14px] text-[#282829] poppins block mb-1 font-normal">
                                First name
                            </label>
                            <input
                                type="text"
                                name="parentFirstName"
                                value={parent.parentFirstName || ""}
                                onChange={(e) => handleChange(index, e)}
                                className={`poppins ${inputClass("parentFirstName", index)}`}
                            />
                            {errors[`parentFirstName_${index}`] && (
                                <p className="text-red-500 text-xs mt-1 poppins">
                                    {errors[`parentFirstName_${index}`]}
                                </p>
                            )}
                        </div>

                        {/* Last Name */}
                        <div>
                            <label className="text-[14px] text-[#282829] poppins block mb-1 font-normal">
                                Last name
                            </label>
                            <input
                                type="text"
                                name="parentLastName"
                                value={parent.parentLastName || ""}
                                onChange={(e) => handleChange(index, e)}
                                className={`poppins ${inputClass("parentLastName", index)}`}
                            />
                            {errors[`parentLastName_${index}`] && (
                                <p className="text-red-500 text-xs mt-1 poppins">
                                    {errors[`parentLastName_${index}`]}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="text-[14px] text-[#282829] poppins block mb-1 font-normal">
                                Email
                            </label>
                            <input
                                type="email"
                                name="parentEmail"
                                value={parent.parentEmail || ""}
                                onChange={(e) => handleChange(index, e)}
                                className={`poppins ${inputClass("parentEmail", index)}`}
                            />
                            {errors[`parentEmail_${index}`] && (
                                <p className="text-red-500 text-xs mt-1 poppins">
                                    {errors[`parentEmail_${index}`]}
                                </p>
                            )}
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="text-[14px] text-[#282829] poppins block mb-1 font-normal">
                                Phone number
                            </label>
                            <div className={`flex items-center ${inputClass("parentPhoneNumber", index)}`}>
                                <div className="w-[13%]">
                                    <PhoneInput
                                        country="us"
                                        value={dialCodes}
                                        disableDropdown
                                        disableCountryCode
                                        countryCodeEditable={false}
                                        inputStyle={{ display: "none" }}
                                    />
                                </div>
                                <input
                                    type="tel"
                                    name="parentPhoneNumber"
                                    value={parent.parentPhoneNumber || ""}
                                    onChange={(e) => handleChange(index, e)}
                                    className="ps-3 text-[14px] border-l poppins border-gray-300 text-[#494949] font-medium placeholder:text-[#ADA8A8] outline-none w-full"
                                    placeholder="Enter phone number"
                                />
                            </div>
                            {errors[`parentPhoneNumber_${index}`] && (
                                <p className="text-red-500 text-xs mt-1 poppins">
                                    {errors[`parentPhoneNumber_${index}`]}
                                </p>
                            )}
                        </div>

                        {/* Relation */}
                        <div>
                            <label className="text-[14px] text-[#282829] poppins block mb-1 font-normal">
                                Relation to child
                            </label>
                            <div className="relative">
                                <select
                                    name="relationChild"
                                    value={parent.relationChild || ""}
                                    onChange={(e) => handleChange(index, e)}
                                    className={`w-full mainShadow bg-white text-[#494949] font-medium rounded-lg px-4 py-3 text-sm appearance-none outline-none focus:ring-2 focus:ring-[#0496FF] poppins ${
                                        errors[`relationChild_${index}`] ? "border border-red-500" : ""
                                    }`}
                                >
                                    <option value="">Select</option>
                                    <option value="Father">Father</option>
                                    <option value="Mother">Mother</option>
                                    <option value="Guardian">Guardian</option>
                                    <option value="Website">Website</option>
                                    <option value="Referral">Referral</option>
                                </select>
                                <ChevronDown
                                    size={16}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                />
                            </div>
                            {errors[`relationChild_${index}`] && (
                                <p className="text-red-500 text-xs mt-1 poppins">
                                    {errors[`relationChild_${index}`]}
                                </p>
                            )}
                        </div>

                        {/* Heard About */}
                        <div>
                            <label className="text-[14px] text-[#282829] poppins block mb-1 font-normal">
                                How did you hear about us?
                            </label>
                            <div className="relative">
                                <select
                                    name="howDidHear"
                                    value={parent.howDidHear || ""}
                                    onChange={(e) => handleChange(index, e)}
                                    className="w-full mainShadow bg-white rounded-lg px-4 py-3 text-sm text-[#494949] font-medium appearance-none outline-none focus:ring-2 focus:ring-[#0496FF] poppins"
                                >
                                    <option value="">Select</option>
                                    <option value="Google">Google</option>
                                    <option value="Friend">Friend</option>
                                    <option value="Facebook">Facebook</option>
                                    <option value="Instagram">Instagram</option>
                                    <option value="Referral">Referral</option>
                                </select>
                                <ChevronDown
                                    size={16}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}