import { createContext, useContext, useState, useEffect } from "react";
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
    // Additional fields for new steps:
    numStudents: "1",
    membershipPlan: "",
    joiningFee: "",
    startDate: new Date(),
    trialDate: new Date(),
    levelOfInterest: "Low",
    oneToOne: {
      location: "",
      address: "",
      date: "",
      time: "",
      students: "1",
      areasToWorkOn: "",
      coach: "",
      package: "",
      discountCode: "",
    },
    birthdayParty: {
      address: "",
      date: "",
      time: "",
      capacity: "10",
      coach: "",
      package: "",
      discountCode: "",
    }
  });

  const getActiveSteps = () => {
    switch (formData.service) {
      case "Holiday Camp Booking":
        return [
          { id: 1, name: "service", label: "Service" },
          { id: 2, name: "venue", label: "Venue" },
          { id: 3, name: "plan", label: "Plan" },
          { id: 4, name: "student", label: "Students information" },
          { id: 5, name: "parent", label: "Parents information" },
          { id: 6, name: "emergency", label: "Emergency contact" },
          { id: 7, name: "payment", label: "Payment" },
          { id: 8, name: "summary", label: "Summary" },
        ];
      case "Weekly Class Membership":
        return [
          { id: 1, name: "service", label: "Service" },
          { id: 2, name: "membership_info", label: "Membership Info" },
          { id: 3, name: "start_date", label: "Start Date" },
          { id: 4, name: "student", label: "Students information" },
          { id: 5, name: "parent", label: "Parents information" },
          { id: 6, name: "emergency", label: "Emergency contact" },
          { id: 7, name: "payment", label: "Direct Debit" },
          { id: 8, name: "summary", label: "Summary" },
        ];
      case "Book Free Trial":
        return [
          { id: 1, name: "service", label: "Service" },
          { id: 2, name: "trial_info", label: "Trial Info" },
          { id: 3, name: "trial_date", label: "Trial Date" },
          { id: 4, name: "student", label: "Students information" },
          { id: 5, name: "parent", label: "Parents information" },
          { id: 6, name: "emergency", label: "Emergency contact" },
          { id: 7, name: "summary", label: "Summary" },
        ];
      case "Add To Waiting List":
        return [
          { id: 1, name: "service", label: "Service" },
          { id: 2, name: "waiting_list_info", label: "Waiting List Info" },
          { id: 3, name: "student", label: "Students information" },
          { id: 4, name: "parent", label: "Parents information" },
          { id: 5, name: "emergency", label: "Emergency contact" },
          { id: 6, name: "waiting_list_details", label: "Interest Level" },
          { id: 7, name: "summary", label: "Summary" },
        ];
      case "One To One":
        return [
          { id: 1, name: "service", label: "Service" },
          { id: 2, name: "one_to_one_info", label: "General Info" },
          { id: 3, name: "student", label: "Students information" },
          { id: 4, name: "parent", label: "Parents information" },
          { id: 5, name: "emergency", label: "Emergency contact" },
          { id: 6, name: "payment", label: "Payment" },
          { id: 7, name: "summary", label: "Summary" },
        ];
      case "Birthday Party":
        return [
          { id: 1, name: "service", label: "Service" },
          { id: 2, name: "birthday_party_info", label: "General Info" },
          { id: 3, name: "student", label: "Students information" },
          { id: 4, name: "parent", label: "Parents information" },
          { id: 5, name: "emergency", label: "Emergency contact" },
          { id: 6, name: "payment", label: "Payment" },
          { id: 7, name: "summary", label: "Summary" },
        ];
      default:
        return [
          { id: 1, name: "service", label: "Service" },
        ];
    }
  };

  const validateStep = (stepIndex = currentStep) => {
    const activeSteps = getActiveSteps();
    const step = activeSteps[stepIndex - 1];
    if (!step) return true;

    let newErrors = {};

    switch (step.name) {
      case "service":
        if (!formData.service) newErrors.service = "Required";
        break;

      case "venue":
        if (!formData.venue) newErrors.venue = "Required";
        break;

      case "plan":
        if (!formData.plan) newErrors.plan = "Required";
        break;

      case "membership_info":
        if (!formData.venue) newErrors.venue = "Required";
        if (!formData.membershipPlan) newErrors.membershipPlan = "Required";
        if (!formData.joiningFee) newErrors.joiningFee = "Required";
        break;

      case "start_date":
        if (!formData.startDate) newErrors.startDate = "Required";
        break;

      case "trial_info":
        if (!formData.venue) newErrors.venue = "Required";
        break;

      case "trial_date":
        if (!formData.trialDate) newErrors.trialDate = "Required";
        break;

      case "waiting_list_info":
        if (!formData.venue) newErrors.venue = "Required";
        break;

      case "one_to_one_info":
        if (!formData.oneToOne?.location) newErrors.location = "Required";
        if (!formData.oneToOne?.address) newErrors.address = "Required";
        if (!formData.oneToOne?.date) newErrors.date = "Required";
        if (!formData.oneToOne?.time) newErrors.time = "Required";
        if (!formData.oneToOne?.coach) newErrors.coach = "Required";
        if (!formData.oneToOne?.package) newErrors.package = "Required";
        break;

      case "birthday_party_info":
        if (!formData.birthdayParty?.address) newErrors.address = "Required";
        if (!formData.birthdayParty?.date) newErrors.date = "Required";
        if (!formData.birthdayParty?.time) newErrors.time = "Required";
        if (!formData.birthdayParty?.coach) newErrors.coach = "Required";
        if (!formData.birthdayParty?.package) newErrors.package = "Required";
        break;

      case "student":
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

      case "parent":
        if (!Array.isArray(formData.parents) || formData.parents.length === 0) {
          newErrors.parents = "At least one parent is required";
          break;
        }

        formData.parents.forEach((parent, index) => {
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

      case "emergency":
        if (!formData.emergency?.emergencyFirstName)
          newErrors.emergencyFirstName = "First name is required";
        if (!formData.emergency?.emergencyLastName)
          newErrors.emergencyLastName = "Last name is required";
        if (!formData.emergency?.emergencyPhoneNumber)
          newErrors.emergencyPhoneNumber = "Phone is required";
        if (!formData.emergency?.emergencyRelation)
          newErrors.emergencyRelation = "Relation is required";
        break;

      case "payment":
        if (formData.service === "Weekly Class Membership") {
          if (!formData.payment?.accountHolderName)
            newErrors.accountHolderName = "Account holder name is required";
          if (!formData.payment?.sortCode || formData.payment.sortCode.replace(/\D/g, '').length !== 6)
            newErrors.sortCode = "Sort code must be 6 digits";
          if (!formData.payment?.accountNumber || formData.payment.accountNumber.length !== 8)
            newErrors.accountNumber = "Account number must be 8 digits";
          if (formData.payment?.agreeTerms === false)
            newErrors.agreeTerms = "You must agree to the terms";
          if (formData.payment?.consentPhotos === false)
            newErrors.consentPhotos = "Consent is required";
        } else {
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
        }
        break;

      default:
        break;
    }

    const isValid = Object.keys(newErrors).length === 0;
    setErrors(isValid ? {} : newErrors);
    return isValid;
  };

  const fetchData = async (service = formData.service) => {
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
      const isClassService =
        service === "Weekly Class Membership" ||
        service === "Book Free Trial" ||
        service === "Add To Waiting List";

      const endpoint = isClassService
        ? "api/open/find-class"
        : "api/parent/holiday/find-a-camp";

      const response = await axios.get(
        `${API_URL}${endpoint}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData(response.data?.data ?? response.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Something went wrong while fetching data.";
      showError("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formData.service) {
      fetchData(formData.service);
    }
  }, [formData.service]);

  const nextStep = () => {
    const activeSteps = getActiveSteps();
    if (validateStep() && currentStep < activeSteps.length) {
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
        getActiveSteps,
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