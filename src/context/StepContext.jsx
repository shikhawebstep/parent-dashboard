import { createContext, useContext, useState } from "react";
import axios from "axios";
import { showError } from "../../utils/swalHelper";

const StepContext = createContext();

// Simplified validations (no Luhn, no expiry range)
const validateCardNumber = (value) => {
  const clean = (value || "").replace(/\s+/g, "");
  return /^\d{13,19}$/.test(clean);
};

const validateExpiryDate = (value) => {
  return /^\d{2}\/\d{2}$/.test(value || "");
};

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
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    service: "",
    venue: "",
    plan: "",
    students: [],
    student: {},
    parents: [],
    emergency: {},
    payment: {},
  });

  const validateStep = (step = currentStep) => {
    let newErrors = {};

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

      case 4:
        if (!Array.isArray(formData?.students) || formData.students.length === 0) {
          if (!formData?.student?.studentFirstName)
            newErrors.studentFirstName = "First name is required";
          if (!formData?.student?.studentLastName)
            newErrors.studentLastName = "Last name is required";
          if (!formData?.student?.dateOfBirth)
            newErrors.dateOfBirth = "Date of birth is required";
          if (!formData?.student?.gender)
            newErrors.gender = "Gender is required";
        }
        break;

      case 5:
        if (!Array.isArray(formData.parents) || formData.parents.length === 0) {
          newErrors.parents = "At least one parent is required";
          break;
        }

        formData.parents.forEach((parent, index) => {
          // FIX: use `fieldName_index` keys to match StepParent component
          if (!parent?.parentFirstName?.trim())
            newErrors[`parentFirstName_${index}`] = "First name is required";

          if (!parent?.parentLastName?.trim())
            newErrors[`parentLastName_${index}`] = "Last name is required";

          if (!parent?.parentEmail?.trim()) {
            newErrors[`parentEmail_${index}`] = "Email is required";
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parent.parentEmail)) {
            newErrors[`parentEmail_${index}`] = "Enter a valid email";
          }

          if (!parent?.parentPhoneNumber?.trim())
            newErrors[`parentPhoneNumber_${index}`] = "Phone number is required";

          if (!parent?.relationChild)
            newErrors[`relationChild_${index}`] = "Relation is required";
        });
        break;

      case 6:
        if (!formData.emergency?.emergencyFirstName)
          newErrors.emergencyFirstName = "First name is required";
        if (!formData.emergency?.emergencyLastName)
          newErrors.emergencyLastName = "Last name is required";
        if (!formData.emergency?.emergencyPhoneNumber)
          newErrors.emergencyPhoneNumber = "Phone is required";
        if (!formData.emergency?.emergencyRelation)
          newErrors.emergencyRelation = "Relation is required";
        break;

      case 7:
        if (!formData.payment?.firstName)
          newErrors.firstName = "First name is required";
        if (!formData.payment?.lastName)
          newErrors.lastName = "Last name is required";
        if (!formData.payment?.email) {
          newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.payment.email)) {
          newErrors.email = "Invalid email format";
        }
        if (!formData.payment?.billingAddress)
          newErrors.billingAddress = "Billing address is required";
        if (!formData.payment?.cardNumber) {
          newErrors.cardNumber = "Card number is required";
        } else if (!validateCardNumber(formData.payment.cardNumber)) {
          newErrors.cardNumber = "Invalid card number";
        }
        if (!formData.payment?.expiryDate) {
          newErrors.expiryDate = "Expiry date is required";
        } else if (!validateExpiryDate(formData.payment.expiryDate)) {
          newErrors.expiryDate = "Invalid expiry date";
        }
        if (!formData.payment?.securityCode) {
          newErrors.securityCode = "Security code is required";
        } else if (!/^\d{3,4}$/.test(formData.payment.securityCode)) {
          newErrors.securityCode = "Security code must be 3 or 4 digits";
        }
        if (!formData.payment?.agreeTerms)
          newErrors.agreeTerms = "You must agree to the terms";
        break;

      default:
        break;
    }

    const isValid = Object.keys(newErrors).length === 0;
    setErrors(isValid ? {} : newErrors);
    return isValid;
  };

  const fetchData = async () => {
    const token = localStorage.getItem("parentToken");
    const parentData = JSON.parse(localStorage.getItem("parentData"));
    const parentId = parentData?.id;
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    if (!token || !parentId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}api/parent/holiday/find-a-camp`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData(response.data?.data ?? response.data);
    } catch (err) {
      console.error("Error fetching profile:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Something went wrong while fetching profile.";
      showError("Error", errorMessage);
    } finally {
      setLoading(false);
    }
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
        fetchData,
        loading,
        data,
        setData,
        setLoading,
      }}
    >
      {children}
    </StepContext.Provider>
  );
}