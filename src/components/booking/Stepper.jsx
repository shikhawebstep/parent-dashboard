import { useStep } from "../../context/StepContext";

export default function Stepper() {
  const { currentStep, STEPS } = useStep();

  return (
    <ol className="flex items-center w-max m-auto p-[20px] text-sm font-medium gap-4 bg-[#FBFBFB]  rounded-[10px] overflow-x-auto">
      {STEPS.map((step, index) => {
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;

        return (
          <li key={step.id} className="flex gap-1 items-center">
            <span
              className={`flex items-center poppins justify-center w-6 h-6 text-xs rounded-full
                ${isCompleted
                  ? "bg-green-500 text-white"
                  : isActive
                    ? "border border-green-500 font-semibold text-green-600"
                    : "border border-gray-400 text-gray-500"
                }`}
            >
              {step.id}
            </span>

            <span
              className={`ml-2 hidden sm:inline ${isActive || isCompleted ? "text-[#34353B] poppins font-semibold" : "text-gray-500"
                }`}
            >
              {step.label}
            </span>

            {index !== STEPS.length - 1 && (
              <div className="bg-[#9E9FAA] ms-3 w-[40px] h-[1px]"></div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
