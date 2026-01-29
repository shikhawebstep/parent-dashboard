import { ChevronDown } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useStep } from "../../../context/StepContext";
import { useState } from "react";
export default function StepParent() {
    const { formData, setFormData, errors, clearError } = useStep();
    const [dialCodes] = useState("+1");

    const parents = formData.parents || [];

    /* ===============================
       Handle normal inputs (indexed)
    =============================== */
    const handleChange = (index, e) => {
        const { name, value } = e.target;

        setFormData(prev => {
            const updatedParents = [...prev.parents];
            updatedParents[index] = {
                ...updatedParents[index],
                [name]: value,
            };

            return {
                ...prev,
                parents: updatedParents,
            };
        });

        if (errors[name]) clearError(name);
    };

    const inputClass = (hasError) =>
        `w-full bg-white mainShadow rounded-lg text-[#494949] font-medium placeholder:text-[#ADA8A8] px-4 py-3 text-sm focus:ring-2 focus:ring-[#0496FF] outline-none ${hasError ? "border border-red-500" : ""
        }`;

    return (
        <div className="w-full max-w-4xl mx-auto py-6 px-0 md:px-6">
            <h2 className="text-[#191919] font-semibold md:text-[24px] text-[18px] mb-8 text-center poppins">
                Parents information
            </h2>

            {parents.map((parent, index) => (
                <div
                    key={index}
                    className={`grid grid-cols-1 max-w-[670px] m-auto ${index >= 1 ? "pt-6 border-t border-gray-200" : ""} md:grid-cols-2 gap-4 mb-6`}
                >
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
                            className={`poppins ${inputClass(errors.parentFirstName)}`}
                        />
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
                            className={`poppins ${inputClass(errors.parentLastName)}`}
                        />
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
                            className={`poppins ${inputClass(errors.parentEmail)}`}
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="text-[14px] text-[#282829] poppins block mb-1 font-normal">
                            Phone number
                        </label>

                        <div className={`flex items-center ${inputClass(errors.parentPhoneNumber)}`}>
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
                                className="w-full mainShadow bg-white text-[#494949] font-medium placeholder:text-[#ADA8A8] rounded-lg px-4 py-3 text-sm appearance-none outline-none focus:ring-2 focus:ring-[#0496FF] poppins"
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
                                className="w-full mainShadow bg-white rounded-lg px-4 py-3 text-sm text-[#494949] font-medium placeholder:text-[#ADA8A8] appearance-none outline-none focus:ring-2 focus:ring-[#0496FF] poppins"
                            >
                                <option value="">Select</option>
                                <option value="Google">Google</option>
                                <option value="Friend">Friend</option>
                                <option value="Website">Website</option>
                                <option value="Social Media">Social Media</option>
                                <option value="Referral">Referral</option>
                            </select>
                            <ChevronDown
                                size={16}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
