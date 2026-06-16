import { useStep } from "../../../context/StepContext";
import CalendarWidget from "../CalendarWidget";

export default function DateStep() {
  const { formData, setFormData } = useStep();

  const isMembership = formData.service === "Weekly Class Membership";
  const selectedDate = isMembership ? formData.startDate : formData.trialDate;
  const title = isMembership ? "Select start date" : "Select trial date";

  const handleSelectDate = (date) => {
    setFormData((prev) => ({
      ...prev,
      [isMembership ? "startDate" : "trialDate"]: date,
    }));
  };

  return (
    <div className="max-w-[450px] mx-auto poppins">
      <CalendarWidget
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
        title={title}
      />
    </div>
  );
}
