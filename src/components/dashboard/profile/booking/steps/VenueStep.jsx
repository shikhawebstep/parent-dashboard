import Select from "react-select";
import { useStep } from "../context/StepContext";

const serviceOptions = [
  { value: "Yoga", label: "Yoga" },
  { value: "Dance", label: "Dance" },
];

export default function VenueStep() {
  const { formData, setFormData } = useStep();

  return (
    <div className="max-w-[696px] mx-auto poppins">
      <h2 className="text-[24px] font-semibold poppins text-center mb-4">
       In which venue do you want to book?
      </h2>

      <label className="text-[#282829] poppins text-[16px] block mb-2">
       Select venue
      </label>

      <Select
        options={serviceOptions}
        value={serviceOptions.find(
          (opt) => opt.value === formData.venue
        )}
        onChange={(selected) =>
          setFormData({ ...formData, venue: selected?.value })
        }
        placeholder="Choose a venue"
        className="poppins"
        styles={{
          control: (base) => ({
            ...base,
            minHeight: "48px",
            borderRadius: "6px",
            borderColor: "#EBEBEB",
            fontFamily: "poppins",
          }),
        }}
      />
    </div>
  );
}
