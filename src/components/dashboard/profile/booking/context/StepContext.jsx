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
  const [errors, setErrors] = useState({});

  // form data for all steps
  const [formData, setFormData] = useState({
    service: "",
    venue: "",
    plan: "",
    student: {},
    parent: {},
    emergency: {},
    payment: {},
  });

  const validateStep = (step = currentStep) => {
    let newErrors = {};
    let isValid = true;

    switch (step) {
      case 1:
        if (!formData.service) newErrors.service = "Required";
        break;
      case 2:
        if (!formData.venue) newErrors.venue = "Required";
        break;
      case 3:
        if (!formData.plan) newErrors.plan = "Required";
        break;
      case 4: // Student
        if (!formData.student?.firstName) newErrors.studentFirstName = "First name is required";
        if (!formData.student?.lastName) newErrors.studentLastName = "Last name is required";
        if (!formData.student?.dob) newErrors.studentDob = "Date of birth is required";
        if (!formData.student?.gender) newErrors.studentGender = "Gender is required";
        break;
      case 5: // Parent
        if (!formData.parent?.firstName) newErrors.parentFirstName = "First name is required";
        if (!formData.parent?.lastName) newErrors.parentLastName = "Last name is required";
        if (!formData.parent?.email) newErrors.parentEmail = "Email is required";
        if (!formData.parent?.phone) newErrors.parentPhone = "Phone is required";
        if (!formData.parent?.relation) newErrors.parentRelation = "Relation is required";
        break;
      case 6: // Emergency
        if (!formData.emergency?.firstName) newErrors.emergencyFirstName = "First name is required";
        if (!formData.emergency?.lastName) newErrors.emergencyLastName = "Last name is required";
        if (!formData.emergency?.phone) newErrors.emergencyPhone = "Phone is required";
        if (!formData.emergency?.relation) newErrors.emergencyRelation = "Relation is required";
        break;
      case 7: // Payment
        if (!formData.payment?.accountHolder) newErrors.accountHolder = "Account holder Name is required";
        if (!formData.payment?.sortCode || formData.payment.sortCode.length !== 6) newErrors.sortCode = "Sort code must be 6 digits";
        if (!formData.payment?.accountNumber || formData.payment.accountNumber.length !== 8) newErrors.accountNumber = "Account number must be 8 digits";
        if (!formData.payment?.agreeTerms) newErrors.agreeTerms = "You must agree to the terms";
        break;
      default:
        break;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      isValid = false;
    } else {
      setErrors({});
      isValid = true;
    }

    return isValid;
  };

  const nextStep = () => {
    if (validateStep() && currentStep < STEPS.length) {
      setErrors({});
      setCurrentStep((s) => s + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setErrors({});
      setCurrentStep((s) => s - 1);
    }
  };

  // Clear specific error on change
  const clearError = (field) => {
    setErrors(prev => {
      const newErr = { ...prev };
      delete newErr[field];
      return newErr;
    });
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
        errors,
        setErrors,
        clearError,
        STEPS,
      }}
    >
      {children}
    </StepContext.Provider>
  );
}
