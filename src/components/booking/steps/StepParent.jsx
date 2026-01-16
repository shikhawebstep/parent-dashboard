import { ChevronDown } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useStep } from "../../../context/StepContext";
import { useState } from "react";

export default function StepParent() {
    const { formData, setFormData, errors, clearError } = useStep();
    const [dialCodes, setDialCodes] = useState("+1");

    const parent = formData.parent || {};

    /* ===============================
       Handle normal inputs
    =============================== */
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            parent: {
                ...prev.parent,
                [name]: value,
            },
        }));

        const errorMap = {
            firstName: "parentFirstName",
            lastName: "parentLastName",
            email: "parentEmail",
            phone: "parentPhone",
            relation: "parentRelation",
        };
        if (errorMap[name]) clearError(errorMap[name]);
    };

    /* ===============================
       Handle phone input
    =============================== */
    const handlePhoneChange = (value) => {
        setFormData(prev => ({
            ...prev,
            parent: {
                ...prev.parent,
                phone: value,
            },
        }));

        clearError("parentPhone");
    };

    const inputClass = (hasError) =>
        `w-full bg-white mainShadow  rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#0496FF] outline-none ${hasError ? "border border-red-500" : ""
        } `;

    return (
        <div className="w-full max-w-4xl mx-auto py-6 px-0 md:px-6">
            <h2 className="text-[#191919] font-bold text-[20px] mb-8 text-center poppins">
                Parents information
            </h2>

            <div className="grid grid-cols-1 max-w-[670px] m-auto md:grid-cols-2 gap-4">

                {/* First Name */}
                <div>
                    <label className="text-[14px] text-[#282829] poppins block mb-1">
                        First name
                    </label>
                    <input
                        type="text"
                        name="firstName"
                        value={parent.firstName || ""}
                        onChange={handleChange}
                        placeholder="Enter First Name"
                        className={`poppins ${inputClass(errors.parentFirstName)}`}
                    />
                    {errors.parentFirstName && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors.parentFirstName}
                        </p>
                    )}
                </div>

                {/* Last Name */}
                <div>
                    <label className="text-[14px] text-[#282829] poppins block mb-1">
                        Last name
                    </label>
                    <input
                        type="text"
                        name="lastName"
                        placeholder="Enter Last Name"
                        value={parent.lastName || ""}
                        onChange={handleChange}
                        className={`poppins ${inputClass(errors.parentLastName)}`}
                    />
                    {errors.parentLastName && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors.parentLastName}
                        </p>
                    )}
                </div>

                {/* Email */}
                <div>
                    <label className="text-[14px] text-[#282829] poppins block mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={parent.email || ""}
                        placeholder="Enter email address"
                        onChange={handleChange}
                        className={`poppins ${inputClass(errors.parentEmail)}`}
                    />
                    {errors.parentEmail && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors.parentEmail}
                        </p>
                    )}
                </div>

                {/* Phone */}
                <div>
                    <label className="text-[14px] text-[#282829] poppins block mb-1">
                        Phone number
                    </label>


                    <div className={`poppins flex items-center ${inputClass(errors.parentPhone)}`}>
                        <div className="w-[13%]">
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
                            type="tel"
                            name="phone"
                            value={parent.phone || ""}
                            onChange={handleChange}
                            className={`poppins ps-3 text-[14px] border-l border-gray-300 outline-none w-full`}
                            placeholder="Enter phone number"
                        />
                    </div>

                    {errors.parentPhone && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors.parentPhone}
                        </p>
                    )}
                </div>

                {/* Relation */}
                <div>
                    <label className="text-[14px] text-[#282829] poppins block mb-1">
                        Relation to child
                    </label>
                    <div className="relative">
                        <select
                            name="relation"
                            value={parent.relation || ""}
                            onChange={handleChange}
                            className={`w-full mainShadow bg-white ${errors.parentRelation
                                ? "border border-red-500"
                                : ""
                                } rounded-lg px-4 py-3 text-sm appearance-none outline-none focus:ring-2 focus:ring-[#0496FF] poppins`}
                        >
                            <option value="">Select from drop down</option>
                            <option value="Father">Father</option>
                            <option value="Mother">Mother</option>
                            <option value="Guardian">Guardian</option>
                        </select>
                        <ChevronDown
                            size={16}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        />
                    </div>
                    {errors.parentRelation && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors.parentRelation}
                        </p>
                    )}
                </div>

                {/* Heard About Us */}
                <div>
                    <label className="text-[14px] text-[#282829] poppins block mb-1">
                        How did you hear about us?
                    </label>
                    <div className="relative">
                        <select
                            name="hearAbout"
                            value={parent.hearAbout || ""}
                            onChange={handleChange}
                            className="w-full mainShadow bg-white  rounded-lg px-4 py-3 text-sm appearance-none outline-none focus:ring-2 focus:ring-[#0496FF] poppins"
                        >
                            <option value="">Select from drop down</option>
                            <option value="Google">Google</option>
                            <option value="Friend">Friend</option>
                            <option value="Social Media">Social Media</option>
                        </select>
                        <ChevronDown
                            size={16}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}
