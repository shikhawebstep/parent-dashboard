import { ChevronDown } from "lucide-react";
import { useStep } from "../context/StepContext";

export default function StepParent() {
    const { formData, setFormData, errors, clearError } = useStep();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            parent: {
                ...prev.parent,
                [name]: value,
            },
        }));

        // Mapping for clearing errors
        const errorMap = {
            firstName: 'parentFirstName',
            lastName: 'parentLastName',
            email: 'parentEmail',
            phone: 'parentPhone',
            relation: 'parentRelation'
        };
        if (errorMap[name]) {
            clearError(errorMap[name]);
        }
    };

    const parent = formData.parent || {};

    const inputClass = (hasError) =>
        `w-full bg-white border ${hasError ? 'border-red-500' : 'border-gray-200'} rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#0496FF] outline-none`;

    return (
        <div className="w-full max-w-4xl mx-auto py-8">
            <h2 className="text-[#191919] font-bold text-2xl mb-8 text-center">
                Parents information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* First Name */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-[#191919]">First name</label>
                    <input
                        type="text"
                        name="firstName"
                        value={parent.firstName || ""}
                        onChange={handleChange}
                        placeholder="Enter first name"
                        className={inputClass(errors.parentFirstName)}
                    />
                    {errors.parentFirstName && <p className="text-red-500 text-xs">{errors.parentFirstName}</p>}
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-[#191919]">Last name</label>
                    <input
                        type="text"
                        name="lastName"
                        value={parent.lastName || ""}
                        onChange={handleChange}
                        placeholder="Enter last name"
                        className={inputClass(errors.parentLastName)}
                    />
                    {errors.parentLastName && <p className="text-red-500 text-xs">{errors.parentLastName}</p>}
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-[#191919]">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={parent.email || ""}
                        onChange={handleChange}
                        placeholder="Enter email address"
                        className={inputClass(errors.parentEmail)}
                    />
                    {errors.parentEmail && <p className="text-red-500 text-xs">{errors.parentEmail}</p>}
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-[#191919]">Phone number</label>
                    <div className="flex gap-2">
                        <div className="relative w-20">
                            <select className="w-full bg-white border border-gray-200 rounded-lg pl-3 pr-6 py-3 text-sm text-gray-500 appearance-none outline-none">
                                <option>🇬🇧</option>
                            </select>
                            <ChevronDown
                                size={14}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                            />
                        </div>
                        <input
                            type="tel"
                            name="phone"
                            value={parent.phone || ""}
                            onChange={handleChange}
                            placeholder="+44 1234568"
                            className={`flex-1 ${inputClass(errors.parentPhone)}`}
                        />
                    </div>
                    {errors.parentPhone && <p className="text-red-500 text-xs">{errors.parentPhone}</p>}
                </div>

                {/* Relation */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-[#191919]">Relation to child:</label>
                    <div className="relative">
                        <select
                            name="relation"
                            value={parent.relation || ""}
                            onChange={handleChange}
                            className={`w-full bg-white border ${errors.parentRelation ? 'border-red-500' : 'border-gray-200'} rounded-lg px-4 py-3 text-sm text-gray-500 appearance-none outline-none focus:ring-2 focus:ring-[#0496FF]`}
                        >
                            <option value="">Select relation</option>
                            <option value="Father">Father</option>
                            <option value="Mother">Mother</option>
                            <option value="Guardian">Guardian</option>
                        </select>
                        <ChevronDown
                            size={16}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        />
                    </div>
                    {errors.parentRelation && <p className="text-red-500 text-xs">{errors.parentRelation}</p>}
                </div>

                {/* Heared About Us */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-[#191919]">
                        How did you hear about us?:
                    </label>
                    <div className="relative">
                        <select
                            name="hearAbout"
                            value={parent.hearAbout || ""}
                            onChange={handleChange}
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-500 appearance-none outline-none focus:ring-2 focus:ring-[#0496FF]"
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
