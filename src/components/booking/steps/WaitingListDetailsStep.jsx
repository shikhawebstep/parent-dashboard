import { useStep } from "../../../context/StepContext";

export default function WaitingListDetailsStep() {
  const { formData, setFormData } = useStep();

  const handleInterestChange = (level) => {
    setFormData((prev) => ({
      ...prev,
      levelOfInterest: level,
    }));
  };

  const levels = ["Low", "Medium", "High"];

  return (
    <div className="max-w-[696px] mx-auto poppins space-y-6">
      <h2 className="md:text-[24px] text-[18px] font-semibold poppins text-center mb-6">
        Waiting List Details
      </h2>

      <div className="bg-[#FBFBFB] border border-[#E2E1E5] rounded-[15px] p-6 space-y-4">
        <label className="text-[#282829] font-semibold text-[16px] block">
          Level of interest
        </label>

        <div className="flex gap-6 items-center">
          {levels.map((level) => {
            const isChecked = formData.levelOfInterest === level;
            return (
              <label key={level} className="flex items-center gap-3 cursor-pointer select-none">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isChecked ? "border-[#0496FF]" : "border-[#E2E1E5]"
                  }`}
                >
                  {isChecked && (
                    <div className="w-2.5 h-2.5 bg-[#0496FF] rounded-full" />
                  )}
                </div>
                <input
                  type="radio"
                  name="levelOfInterest"
                  value={level}
                  checked={isChecked}
                  onChange={() => handleInterestChange(level)}
                  className="hidden"
                />
                <span className="text-[15px] text-[#282829] font-medium">{level}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
