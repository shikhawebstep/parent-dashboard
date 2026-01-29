import { ChevronDown } from "lucide-react";
import { useStep } from "../../../context/StepContext";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useState } from "react";
export default function StepEmergency() {
    const { formData, setFormData, errors, clearError } = useStep();
    const [dialCodes, setDialCodes] = useState("+1");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            emergency: {
                ...prev.emergency,
                [name]: value,
            },
        }));

        const errorMap = {
            emergencyFirstName: 'emergencyFirstName',
            emergencyLastName: 'emergencyLastName',
            emergencyPhoneNumber: 'emergencyPhoneNumber',
            emergencyRelation: 'emergencyRelation'
        };
        if (errorMap[name]) {
            clearError(errorMap[name]);
        }
    };

    const emergency = formData.emergency || {};
    const inputClass = (hasError) =>
        `w-full bg-white mainShadow text-[#494949] font-medium poppins  ${hasError ? 'border-red-500 border' : 'border-gray-200'} rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#0496FF] outline-none`;


    return (
        <div className="w-full max-w-4xl mx-auto py-8">
            <h2 className="text-[#191919] font-semibold md:text-[24px] text-[18px] mb-8 poppins text-center">
                Emergency contact details
            </h2>

            <div className="grid grid-cols-1 max-w-[670px] m-auto md:grid-cols-2 gap-4">
                {/* First Name */}
                <div className="space-y-2">
                    <label className="text-sm font-normal poppins text-[#191919]">First name</label>
                    <input
                        type="text"
                        name="emergencyFirstName"
                        value={emergency.emergencyFirstName || ""}
                        onChange={handleChange}
                        placeholder="Enter first name"
                        className={inputClass(errors.emergencyFirstName)}
                    />
                    {errors.emergencyFirstName && <p className="text-red-500 text-xs">{errors.emergencyFirstName}</p>}
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                    <label className="text-sm font-normal poppins text-[#191919]">Last name</label>
                    <input
                        type="text"
                        name="emergencyLastName"
                        value={emergency.emergencyLastName || ""}
                        onChange={handleChange}
                        placeholder="Enter last name"
                        className={inputClass(errors.emergencyLastName)}
                    />
                    {errors.emergencyLastName && <p className="text-red-500 text-xs">{errors.emergencyLastName}</p>}
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                    <label className="text-sm font-normal poppins text-[#191919]">Phone number</label>
                    <div className={`w-full flex items-center rounded-lg px-4 py-3 font-semibold outline-none bg-white border ${errors.emergencyPhoneNumber ? "border-red-500" : "border-gray-200"}`}>
                        <div className="2xl:w-[12%] lg:w-[14%]">
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
                            name="emergencyPhoneNumber"
                            value={emergency.emergencyPhoneNumber || ""}
                            onChange={handleChange}
                            className={`poppins 2xl:ps-3 ps-4 text-[#494949] font-medium poppins text-[14px] border-l border-gray-300 outline-none w-full bg-transparent`}
                            placeholder="Enter Phone number"
                        />
                    </div>
                    {errors.emergencyPhoneNumber && <p className="text-red-500 text-xs">{errors.emergencyPhoneNumber}</p>}
                </div>

                {/* Relation */}
                <div>
                    <label className="text-sm font-normal poppins text-[#191919] mb-2 block">Relation to child:</label>
                    <div className="relative">
                        <select
                            name="emergencyRelation"
                            value={emergency.emergencyRelation || ""}
                            onChange={handleChange}
                            className={`w-full bg-white text-[#494949] font-medium poppins mainShadow ${errors.emergencyRelation ? 'border border-red-500' : 'border-gray-200'} rounded-lg px-4 py-3 text-sm text-gray-500 appearance-none outline-none focus:ring-2 focus:ring-[#0496FF]`}
                        >
                            <option value="">Select Relation</option>
                            <option value="Father">Father</option>
                            <option value="Mother">Mother</option>
                            <option value="Uncle">Uncle</option>
                            <option value="Aunt">Aunt</option>
                            <option value="Grandparent">Grandparent</option>
                        </select>
                        <ChevronDown
                            size={16}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        />
                    </div>
                    {errors.emergencyRelation && <p className="text-red-500 text-xs">{errors.emergencyRelation}</p>}
                </div>
            </div>
        </div>
    );
}
