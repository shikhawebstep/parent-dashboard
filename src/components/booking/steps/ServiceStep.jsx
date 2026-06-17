import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { useStep } from "../../../context/StepContext";

const serviceOptions = [
  { value: "Holiday Camp Booking", label: "Holiday Camp Booking" },
  { value: "Book A Membership", label: "Book A Membership" },
  { value: "Add To Waiting List", label: "Add To Waiting List" },
  { value: "Book Free Trial", label: "Book Free Trial" },
];

export default function ServiceStep() {
  const { formData, setFormData } = useStep();
  const navigate = useNavigate();

  const handleChange = (selected) => {
    const value = selected?.value;

    setFormData({
      ...formData,
      service: value,
    });

    // Holiday Camp Booking -> existing flow
    if (value === "Book A Membership") {
      navigate("/book-membership");
    } else if (value === "Add To Waiting List") {
      navigate("/waiting-list");
    } else if (value === "Book Free Trial") {
      navigate("/book-free-trial");
    }
  };

  return (
    <div className="max-w-[696px] mx-auto poppins">
      <h2 className="md:text-[24px] text-[18px] font-semibold poppins text-center mb-4">
        Which service do you want to use?
      </h2>

      <label className="text-[#282829] poppins text-[16px] block mb-2">
        Select Service
      </label>

      <Select
        options={serviceOptions}
        value={serviceOptions.find(
          (opt) => opt.value === formData.service
        )}
        onChange={handleChange}
        placeholder="Choose service"
        className="poppins"
        styles={{
          control: (base) => ({
            ...base,
            minHeight: "48px",
            borderRadius: "6px",
            borderColor: "#EBEBEB",
            fontFamily: "poppins",
          }),
          option: (provided) => ({
            ...provided,
            fontFamily: "poppins",
          }),
        }}
      />
    </div>
  );
}