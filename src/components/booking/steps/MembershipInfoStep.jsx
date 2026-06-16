import Select from "react-select";
import { useStep } from "../../../context/StepContext";

export default function MembershipInfoStep() {
  const { formData, setFormData, data, errors, clearError } = useStep();

  const venueOptions = Array.isArray(data) ? data.map((item) => ({
    value: item.venueId,
    label: item.address
  })) : [];

  const studentCountOptions = [
    { value: "1", label: "1 Student" },
    { value: "2", label: "2 Students" },
    { value: "3", label: "3 Students" },
    { value: "4", label: "4 Students" },
  ];

  const planOptions = [
    { value: "Weekly Class Gold", label: "Weekly Class [Gold] - £39.99 p/m" },
    { value: "Weekly Class Standard", label: "Weekly Class [Standard] - £29.99 p/m" },
    { value: "Weekly Class Premium", label: "Weekly Class [Premium] - £49.99 p/m" },
  ];

  const feeOptions = [
    { value: "Standard Joining Fee", label: "Standard Joining Fee - £35.00" },
    { value: "Discounted Joining Fee", label: "Discounted Joining Fee - £15.00" },
    { value: "No Joining Fee", label: "No Joining Fee - £0.00" },
  ];

  const handleSelectChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      clearError(field);
    }
  };

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
    <div className="max-w-[696px] mx-auto poppins space-y-6">
      <h2 className="md:text-[24px] text-[18px] font-semibold poppins text-center mb-6">
        Membership Information
      </h2>

      {/* Select Venue */}
      <div>
        <label className="text-[#282829] poppins text-[15px] font-medium block mb-2">
          Select Venue
        </label>
        <Select
          options={venueOptions}
          value={venueOptions.find((opt) => opt.value === formData.venue) || null}
          onChange={(selected) => handleSelectChange("venue", selected?.value)}
          placeholder="Choose venue"
          className="poppins"
          styles={selectStyles}
        />
        {errors.venue && <p className="text-red-500 text-xs mt-1">{errors.venue}</p>}
      </div>

      {/* Select Number of Students */}
      <div>
        <label className="text-[#282829] poppins text-[15px] font-medium block mb-2">
          Number of Students
        </label>
        <Select
          options={studentCountOptions}
          value={studentCountOptions.find((opt) => opt.value === formData.numStudents) || studentCountOptions[0]}
          onChange={(selected) => handleSelectChange("numStudents", selected?.value)}
          placeholder="Select students count"
          className="poppins"
          styles={selectStyles}
        />
      </div>

      {/* Choose Membership Plan */}
      <div>
        <label className="text-[#282829] poppins text-[15px] font-medium block mb-2">
          Membership Plan
        </label>
        <Select
          options={planOptions}
          value={planOptions.find((opt) => opt.value === formData.membershipPlan) || null}
          onChange={(selected) => handleSelectChange("membershipPlan", selected?.value)}
          placeholder="Choose plan"
          className="poppins"
          styles={selectStyles}
        />
        {errors.membershipPlan && <p className="text-red-500 text-xs mt-1">{errors.membershipPlan}</p>}
      </div>

      {/* Choose Joining Fee */}
      <div>
        <label className="text-[#282829] poppins text-[15px] font-medium block mb-2">
          Joining Fee
        </label>
        <Select
          options={feeOptions}
          value={feeOptions.find((opt) => opt.value === formData.joiningFee) || null}
          onChange={(selected) => handleSelectChange("joiningFee", selected?.value)}
          placeholder="Choose joining fee"
          className="poppins"
          styles={selectStyles}
        />
        {errors.joiningFee && <p className="text-red-500 text-xs mt-1">{errors.joiningFee}</p>}
      </div>
    </div>
  );
}
