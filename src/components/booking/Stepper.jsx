import { useStep } from "../../context/StepContext";

export default function Stepper() {
  const { currentStep, getActiveSteps } = useStep();
  const activeSteps = getActiveSteps();

  return (
    <ol className="flex items-center m-auto p-[20px] text-sm font-medium gap-4 bg-[#FBFBFB] rounded-[10px] overflow-x-auto">
      {activeSteps.map((step, index) => {
        const stepNum = index + 1;
        const isActive = currentStep === stepNum;
        const isCompleted = currentStep > stepNum;

        return (
          <li key={step.name || stepNum} className="flex gap-1 items-center">
            <span
              className={`flex items-center poppins justify-center w-6 h-6 text-xs rounded-full
                ${isCompleted
                  ? "bg-green-500 text-white"
                  : isActive
                    ? "border border-green-500 font-semibold text-green-600"
                    : "border border-gray-400 text-gray-500"
                }`}
            >
              {stepNum}
            </span>

            <span
              className={`ml-2 hidden sm:inline ${isActive || isCompleted ? "text-[#34353B] poppins font-semibold" : "text-gray-500"
                }`}
            >
              {step.label}
            </span>

            {index !== activeSteps.length - 1 && (
              <div className="bg-[#9E9FAA] ms-3 w-[40px] h-[1px]"></div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
