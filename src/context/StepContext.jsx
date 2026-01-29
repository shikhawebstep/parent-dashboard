import { createContext, useContext, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
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
  const [data, setData] = useState({});

  const [loading, setLoading] = useState(false);

  // form data for all steps
  const [formData, setFormData] = useState({
    service: "",
    venue: "",
    plan: "",
    students: [],   // existing students list
    student: {},
    parents: [],
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

      case 5: // Parent
        if (!Array.isArray(formData.parents) || formData.parents.length === 0) {
          newErrors.parents = "At least one parent is required";
          break;
        }

        formData.parents.forEach((parent, index) => {
          if (!parent?.parentFirstName?.trim()) {
            newErrors[`parents.${index}.parentFirstName`] = "First name is required";
          }

          if (!parent?.parentLastName?.trim()) {
            newErrors[`parents.${index}.parentLastName`] = "Last name is required";
          }

          if (!parent?.parentEmail?.trim()) {
            newErrors[`parents.${index}.parentEmail`] = "Email is required";
          }

          if (!parent?.parentPhoneNumber?.trim()) {
            newErrors[`parents.${index}.parentPhoneNumber`] = "Phone number is required";
          }

          if (!parent?.relationChild) {
            newErrors[`parents.${index}.relationChild`] = "Relation is required";
          }
        });

        break;

      case 6: // Emergency
        if (!formData.emergency?.emergencyFirstName) newErrors.emergencyFirstName = "First name is required";
        if (!formData.emergency?.emergencyLastName) newErrors.emergencyLastName = "Last name is required";
        if (!formData.emergency?.emergencyPhoneNumber) newErrors.emergencyPhoneNumber = "Phone is required";
        if (!formData.emergency?.emergencyRelation) newErrors.emergencyRelation = "Relation is required";
        break;
      case 7: // Payment
        if (!formData.payment?.firstName) newErrors.firstName = "First name is required";
        if (!formData.payment?.lastName) newErrors.lastName = "Last name is required";
        if (!formData.payment?.email) {
          newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.payment.email)) {
          newErrors.email = "Invalid email format";
        }
        if (!formData.payment?.billingAddress) newErrors.billingAddress = "Billing address is required";
        if (!formData.payment?.cardNumber) {
          newErrors.cardNumber = "Card number is required";
        } else if (!/^\d{16}$/.test(formData.payment.cardNumber)) {
          newErrors.cardNumber = "Card number must be 16 digits";
        }
        if (!formData.payment?.expiryDate) {
          newErrors.expiryDate = "Expiry date is required";
        } else if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(formData.payment.expiryDate)) {
          newErrors.expiryDate = "Invalid expiry date (MM/YY)";
        }
        if (!formData.payment?.securityCode) {
          newErrors.securityCode = "Security code is required";
        } else if (!/^\d{3,4}$/.test(formData.payment.securityCode)) {
          newErrors.securityCode = "Security code must be 3 or 4 digits";
        }
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
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setData(response.data?.data ?? response.data)
    } catch (err) {
      console.error("Error fetching profile:", err);

      // ✅ Extract API error message safely
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Something went wrong while fetching profile.";

      // ✅ Show SweetAlert
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });

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
        fetchData,
        loading,
        data, setData, setLoading
      }}
    >
      {children}
    </StepContext.Provider>
  );
}
