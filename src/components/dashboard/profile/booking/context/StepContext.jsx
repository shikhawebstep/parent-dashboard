import { createContext, useContext, useState } from "react";

const StepContext = createContext();

export const useStep = () => useContext(StepContext);

export const STEPS = [
  { id: 1, label: "Service" },
  { id: 2, label: "Venue" },
  { id: 3, label: "Plan" },
  { id: 4, label: "Students information" },
  { id: 5, label: "Parents information" },
  { id: 6, label: "Emergency contact" },
  { id: 7, label: "Payment" },
  { id: 8, label: "Summary" },
];

export function StepProvider({ children }) {
  const [currentStep, setCurrentStep] = useState(1);

  // form data for all steps
  const [formData, setFormData] = useState({
    service: "",
    venue: "",
    plan: "",
    student: {},
    parent: {},
    emergency: {},
    payment: "",
  });

  // required validation per step
  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return !!formData.service;
      case 2:
        return !!formData.venue;
      case 3:
        return !!formData.plan;
      case 7:
        return !!formData.payment;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (isStepValid() && currentStep < STEPS.length) {
      setCurrentStep((s) => s + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    }
  };

  return (
    <StepContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        nextStep,
        prevStep,
        formData,
        setFormData,
        isStepValid,
        STEPS,
      }}
    >
      {children}
    </StepContext.Provider>
  );
}
