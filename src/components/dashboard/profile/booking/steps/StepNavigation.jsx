import { useStep } from "../context/StepContext";

export default function StepNavigation() {
  const { nextStep, prevStep, currentStep, STEPS, isStepValid } = useStep();

  return (
    <div className="flex justify-center gap-3 mt-8">
      {currentStep > 1 && (
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="px-[70px] py-4 text-[#717073] poppins font-semibold text-[18px] border border-[#E1E1E1] rounded-[12px] disabled:opacity-40"
        >
          Cancel
        </button>

      )}

      <button
        onClick={nextStep}
        className="px-[70px] py-4 bg-[#237FEA] text-white poppins rounded-[12px] disabled:opacity-40"
      >
        {currentStep === STEPS.length ? "Finish" : "Next"}
      </button>
    </div>
  );
}
