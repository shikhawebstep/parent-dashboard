import Select from "react-select";
import { useStep } from "../../../context/StepContext";

export default function BirthdayPartyInfoStep() {
  const { formData, setFormData, errors, clearError } = useStep();

  const info = formData.birthdayParty || {};

  const coachOptions = [
    { value: "Coach Liam", label: "Coach Liam" },
    { value: "Coach Emma", label: "Coach Emma" },
    { value: "Coach Sophia", label: "Coach Sophia" },
  ];

  const packageOptions = [
    { value: "Birthday Party [Gold]", label: "Birthday Party [Gold] - £39.99" },
    { value: "Birthday Party [Standard]", label: "Birthday Party [Standard] - £29.99" },
    { value: "Birthday Party [Premium]", label: "Birthday Party [Premium] - £49.99" },
  ];

  const discountOptions = [
    { value: "PARTY5", label: "PARTY5 (5% Off)" },
    { value: "WELCOME10", label: "WELCOME10 (10% Off)" },
  ];

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      birthdayParty: {
        ...prev.birthdayParty,
        [field]: value,
      },
    }));
    if (errors[field]) {
      clearError(field);
    }
  };

  const inputClass = (hasError) =>
    `w-full bg-white mainShadow rounded-lg text-[#494949] font-medium placeholder:text-[#ADA8A8] px-4 py-3 text-sm focus:ring-2 focus:ring-[#0496FF] outline-none border ${
      hasError ? "border-red-500" : "border-gray-200"
    }`;

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "48px",
      borderRadius: "8px",
      borderColor: state.isFocused ? "#0496FF" : "#E2E1E5",
      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.02)",
      fontFamily: "poppins",
    }),
    option: (provided) => ({
      ...provided,
      fontFamily: "poppins",
    }),
  };

  return (
    <div className="max-w-[750px] mx-auto poppins space-y-6">
      <h2 className="md:text-[24px] text-[18px] font-semibold poppins text-center mb-6">
        Birthday Party Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-[#FBFBFB] border border-[#E2E1E5] rounded-[20px] p-6">
        
        {/* Address */}
        <div className="space-y-1 md:col-span-2">
          <label className="text-[14px] text-[#282829] font-medium block">Address</label>
          <input
            type="text"
            placeholder="Search address"
            value={info.address || ""}
            onChange={(e) => handleFieldChange("address", e.target.value)}
            className={inputClass(errors.address)}
          />
          {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
        </div>

        {/* Date */}
        <div className="space-y-1">
          <label className="text-[14px] text-[#282829] font-medium block">Date</label>
          <input
            type="date"
            value={info.date || ""}
            onChange={(e) => handleFieldChange("date", e.target.value)}
            className={inputClass(errors.date)}
          />
          {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
        </div>

        {/* Time */}
        <div className="space-y-1">
          <label className="text-[14px] text-[#282829] font-medium block">Time</label>
          <input
            type="time"
            value={info.time || ""}
            onChange={(e) => handleFieldChange("time", e.target.value)}
            className={inputClass(errors.time)}
          />
          {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time}</p>}
        </div>

        {/* Capacity */}
        <div className="space-y-1">
          <label className="text-[14px] text-[#282829] font-medium block">Capacity</label>
          <input
            type="number"
            min="1"
            placeholder="e.g. 15"
            value={info.capacity || ""}
            onChange={(e) => handleFieldChange("capacity", e.target.value)}
            className={inputClass(errors.capacity)}
          />
        </div>

        {/* Coach */}
        <div className="space-y-1">
          <label className="text-[14px] text-[#282829] font-medium block">Select Coach(es)</label>
          <Select
            options={coachOptions}
            value={coachOptions.find((opt) => opt.value === info.coach) || null}
            onChange={(selected) => handleFieldChange("coach", selected?.value)}
            placeholder="Select Coach"
            styles={selectStyles}
          />
          {errors.coach && <p className="text-red-500 text-xs mt-1">{errors.coach}</p>}
        </div>

        {/* Package */}
        <div className="space-y-1">
          <label className="text-[14px] text-[#282829] font-medium block">Package</label>
          <Select
            options={packageOptions}
            value={packageOptions.find((opt) => opt.value === info.package) || null}
            onChange={(selected) => handleFieldChange("package", selected?.value)}
            placeholder="Choose package"
            styles={selectStyles}
          />
          {errors.package && <p className="text-red-500 text-xs mt-1">{errors.package}</p>}
        </div>

        {/* Discount Code */}
        <div className="space-y-1">
          <label className="text-[14px] text-[#282829] font-medium block">Apply discount</label>
          <Select
            options={discountOptions}
            value={discountOptions.find((opt) => opt.value === info.discountCode) || null}
            onChange={(selected) => handleFieldChange("discountCode", selected?.value)}
            placeholder="Select a discount code"
            styles={selectStyles}
            isClearable
          />
        </div>

      </div>
    </div>
  );
}
