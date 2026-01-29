import Select from "react-select";
import { useStep } from "../../../context/StepContext";



export default function PlanStep() {
  const { formData, setFormData, data } = useStep();

  const filteredData = Array.isArray(data)
    ? data.filter((item) => item?.venueId === formData?.venue)
    : [];

  const serviceOptions =
    Array.isArray(filteredData) &&
      filteredData.length > 0 &&
      Array.isArray(filteredData[0]?.paymentGroups) &&
      filteredData[0].paymentGroups.length > 0 &&
      Array.isArray(filteredData[0].paymentGroups[0]?.holidayPaymentPlans)
      ? filteredData[0].paymentGroups[0].holidayPaymentPlans.map((item) => ({
        value: item?.id ?? "",
        label: `${item?.title} - (${item?.price})` ?? "",
      }))
      : [];

  return (
    <div className="max-w-[696px] mx-auto poppins">
      <h2 className="md:text-[24px] text-[18px] font-semibold poppins text-center mb-4">
        Which plan do you want to book?
      </h2>

      <label className="text-[#282829] poppins text-[16px] block mb-2">
        Select Plan
      </label>

      <Select
        options={serviceOptions}
        value={serviceOptions.find(
          (opt) => opt.value === formData.plan
        )}
        onChange={(selected) =>
          setFormData({ ...formData, plan: selected?.value })
        }
        placeholder="Choose a plan"
        className="poppins"
        styles={{
          control: (base) => ({
            ...base,
            minHeight: "48px",
            borderRadius: "6px",
            borderColor: "#EBEBEB",
            fontFamily: "poppins",
          }),
          option: (provided, state) => ({
            ...provided,
            fontFamily: "poppins",
          }),
        }}
      />
    </div>
  );
}
