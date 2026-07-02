import React, { useState, useRef, useEffect } from 'react';
import Select from 'react-select';
import { ChevronLeft, ChevronRight, Loader2, X, Calendar as CalendarIcon, CreditCard, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { showError, showSuccess } from '../../../utils/swalHelper';

const ChangePlanModal = ({ isOpen, onClose, booking, onSuccess }) => {
  const [membershipPlan, setMembershipPlan] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [step, setStep] = useState(0);
  const [currentDate, setCurrentDate] = useState(new Date());

  const [payment, setPayment] = useState({
    email: '',
    account_holder_name: '',
    firstName: '',
    lastName: '',
    line1: '',
    city: '',
    postalCode: '',
    branch_code: '',
    account_number: ''
  });
  const [authorised, setAuthorised] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingPayment, setExistingPayment] = useState({});

  const emailRef = useRef(null);
  const accountHolderNameRef = useRef(null);
  const line1Ref = useRef(null);
  const cityRef = useRef(null);
  const postalCodeRef = useRef(null);
  const branchCodeRef = useRef(null);
  const accountNumberRef = useRef(null);

  useEffect(() => {
    if (isOpen && booking) {
      const parent = booking.parents?.[0] || {};
      const fullName = `${parent.parentFirstName || ''} ${parent.parentLastName || ''}`.trim();

      console.log("Booking Data:", booking);
      const existingPayment = booking.payments[0] || booking.directDebit || booking.paymentMethod || {};

      console.log("Existing Payment:", existingPayment);
      setExistingPayment(existingPayment);

      setPayment(prev => ({
        ...prev,
        email: parent.parentEmail || prev.email,
        account_holder_name: fullName || prev.account_holder_name,
        firstName: parent.parentFirstName || prev.firstName,
        lastName: parent.parentLastName || prev.lastName,
      }));

      if (booking.paymentPlan && !membershipPlan) {
        setMembershipPlan({
          value: booking.paymentPlan.id,
          label: booking.paymentPlan.title,
          all: booking.paymentPlan
        });

      }
    }
  }, [isOpen, booking]);

  if (!isOpen) return null;

  const setIsPopupOpen = (open) => {
    if (!open) onClose();
  };

  const handlePlanChange = (plan) => {
    setMembershipPlan(plan);
    if (errors.membershipPlan) setErrors((e) => ({ ...e, membershipPlan: "" }));
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const formatLocalDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const handleDateClick = (date) => {
    setSelectedDate(formatLocalDate(date));
    if (errors.selectedDate) setErrors((e) => ({ ...e, selectedDate: "" }));
  };

  const handlePaymentChange = (field, val) => {
    setPayment(prev => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
  };

  // ── Validation helpers ───────────────────────────────────────────────
  const validateField = (field, value) => {
    if (!value || !String(value).trim()) return "Required";

    if (field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Enter a valid email address";
    }
    if (field === "branch_code" && value.replace(/\D/g, "").length !== 6) {
      return "Enter a valid 6-digit sort code";
    }
    if (field === "account_number" && value.replace(/\D/g, "").length !== 8) {
      return "Enter a valid 8-digit account number";
    }
    return "";
  };

  const validateStep0 = () => {
    const errs = {};
    if (!membershipPlan) errs.membershipPlan = "Please select a plan";
    if (!selectedDate) errs.selectedDate = "Please select a start date";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep1 = () => {
    const errs = {};
    errs.email = validateField("email", payment.email);
    errs.account_holder_name = validateField("account_holder_name", payment.account_holder_name);

    if (!isFranchisee) {
      errs.line1 = validateField("line1", payment.line1);
      errs.city = validateField("city", payment.city);
      errs.postalCode = validateField("postalCode", payment.postalCode);
    }

    errs.branch_code = validateField("branch_code", payment.branch_code);
    errs.account_number = validateField("account_number", payment.account_number);

    if (!authorised) errs.authorise = "You must confirm authorisation to continue";

    Object.keys(errs).forEach((k) => { if (!errs[k]) delete errs[k]; });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep1()) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("parentToken");
      const API_URL = import.meta.env.VITE_API_BASE_URL;

      const payload = {
        newPaymentPlanId: membershipPlan?.value,
        startDate: selectedDate,
        payment: {
          paymentType: existingPayment?.paymentType !== "stripe" ? existingPayment?.paymentType : "bank",
          price: pricingBreakdown.nextMonthPayment,
          proRataAmount: pricingBreakdown.finalProRataCost,
          account_number: payment.account_number,
          branch_code: payment.branch_code,
          account_holder_name: payment.account_holder_name,
          firstName: payment.firstName,
          lastName: payment.lastName,
          email: payment.email,
          address_line1: payment.line1,
          city: payment.city,
          postcode: payment.postalCode
        }
      };

      const response = await fetch(`${API_URL}api/parent/booking-update/upgrade-downgrade/${booking.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to update plan");
      }

      showSuccess("Plan Updated Successfully");
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      showError(error.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Number of students on this booking
  const studentCount = booking?.students?.length || 1;

  // All available session dates across all terms for this venue
  const sessionDates = (() => {
    const terms = booking?.venuePlans?.terms || [];
    const dates = [];
    terms.forEach(term => {
      (term.sessionsMap || []).forEach(session => {
        if (session.sessionDate) dates.push(session.sessionDate);
      });
    });
    return dates;
  })();

  const paymentPlanOptions = (() => {
    const groups = booking?.venuePlans?.paymentGroups || [];
    const currentPlanId = booking?.paymentPlan?.id;
    const options = [];

    groups.forEach(group => {
      (group.paymentPlans || []).forEach(plan => {
        if (plan.students !== studentCount) return;

        const isCurrent = plan.id === currentPlanId;
        options.push({
          value: plan.id,
          label: `${plan.title} — £${plan.price} (${plan.duration} ${plan.interval}${plan.duration > 1 ? 's' : ''})${isCurrent ? ' (Current Plan)' : ''}`,
          all: plan,
          isCurrent,
          isDisabled: isCurrent
        });
      });
    });

    return options;
  })();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getDaysArray = () => {
    const startDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    const offset = startDay === 0 ? 6 : startDay - 1;
    for (let i = 0; i < offset; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const calendarDays = getDaysArray();

  const sessionDatesSet = new Set(sessionDates);

  const isOpenMembership = true;
  const isFranchisee = false;

  const price = membershipPlan?.all?.price || 0;
  const priceLesson = membershipPlan?.all?.priceLesson || 0;

  let numberOfLessonsProRated = 0;
  let finalProRataCost = 0;
  let isFullMonthCharge = false;
  let totalAmountToday = 0;

  if (selectedDate && membershipPlan) {
    const parse = (s) => {
      const parts = s.split("-");
      if (parts.length === 3) {
        const [y, m, d] = parts.map(Number);
        return new Date(y, m - 1, d);
      }
      return new Date(s);
    };

    const selected = parse(selectedDate);
    selected.setHours(0, 0, 0, 0);

    const allS = Array.from(sessionDatesSet).map((d) => {
      const x = parse(d);
      x.setHours(0, 0, 0, 0);
      return x;
    });

    const inMonth = allS.filter((d) => d.getMonth() === selected.getMonth() && d.getFullYear() === selected.getFullYear()).sort((a, b) => a - b);
    const first = inMonth[0];
    const isFirstSelected = first && selected.getTime() === first.getTime();
    const remaining = inMonth.filter((d) => d.getTime() >= selected.getTime());

    numberOfLessonsProRated = remaining.length;
    const monthlyPrice = Number(price);
    const ppl = Number(priceLesson);

    const calculatedProRataCost = Math.min(Number((numberOfLessonsProRated * ppl).toFixed(2)), monthlyPrice);
    isFullMonthCharge = (isFirstSelected && numberOfLessonsProRated >= 3) || calculatedProRataCost >= monthlyPrice;

    finalProRataCost = isFullMonthCharge ? monthlyPrice : calculatedProRataCost;
    totalAmountToday = finalProRataCost;
  }

  const pricingBreakdown = {
    nextMonthPayment: price,
    pricePerClassPerChild: priceLesson,
    isFullMonthCharge,
    numberOfLessonsProRated,
    finalProRataCost,
    totalAmountToday,
    starterPack: 0
  };

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[24px] shadow-2xl custom-scrollbar"
      >
        <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-8 py-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Change Plan</h2>
            <p className="text-sm text-gray-500 mt-1 font-medium">Select a new plan and pick your start date.</p>
          </div>
          <button
            onClick={() => setIsPopupOpen(false)}
            className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8">
          <div className="mb-8">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
              <CheckCircle2 className="w-4 h-4 text-[#042C89]" />
              1. Choose Membership Plan
            </label>
            <Select
              options={paymentPlanOptions}
              value={membershipPlan}
              onChange={handlePlanChange}
              placeholder="Select a plan..."
              classNamePrefix="react-select"
              isClearable
              isOptionDisabled={(option) => option.isDisabled}
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: '12px',
                  padding: '4px',
                  borderColor: errors.membershipPlan ? '#ef4444' : '#E5E7EB',
                  boxShadow: errors.membershipPlan ? '0 0 0 2px rgba(239,68,68,0.2)' : 'none',
                  backgroundColor: errors.membershipPlan ? '#fef2f2' : '#fff',
                  '&:hover': { borderColor: errors.membershipPlan ? '#ef4444' : '#D1D5DB' }
                }),
                option: (base, state) => ({
                  ...base,
                  opacity: state.isDisabled ? 0.5 : 1,
                  cursor: state.isDisabled ? 'not-allowed' : 'pointer',
                })
              }}
            />
            {errors.membershipPlan && <p className="text-red-500 text-xs mt-2 font-medium">{errors.membershipPlan}</p>}
          </div>

          {membershipPlan && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-8"
            >
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                <CalendarIcon className="w-4 h-4 text-[#042C89]" />
                2. Select Start Date
              </label>

              <div className={`bg-gray-50/50 border rounded-[20px] p-6 w-full mx-auto shadow-sm ${errors.selectedDate ? "border-red-300" : "border-gray-100"}`}>
                <div className="flex justify-between items-center mb-6">
                  <button
                    onClick={goToPreviousMonth}
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <p className="font-bold text-lg text-gray-800">
                    {currentDate.toLocaleString("default", { month: "long" })} {year}
                  </p>
                  <button
                    onClick={goToNextMonth}
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-7 text-xs gap-2 text-gray-400 mb-3 font-semibold uppercase tracking-wider">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
                    <div key={i} className="text-center">{day}</div>
                  ))}
                </div>

                <div className="flex flex-col gap-2">
                  {Array.from({ length: Math.ceil(calendarDays.length / 7) }).map((_, weekIndex) => {
                    const week = calendarDays.slice(weekIndex * 7, weekIndex * 7 + 7);
                    return (
                      <div key={weekIndex} className="grid grid-cols-7 gap-2">
                        {week.map((date, i) => {
                          if (!date) return <div key={i} />;

                          const formattedDate = formatLocalDate(date);
                          const isAvailable = sessionDatesSet.has(formattedDate);
                          const isSelected = selectedDate === formattedDate;
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const current = new Date(date);
                          current.setHours(0, 0, 0, 0);
                          const isPastAvailable = isAvailable && current < today;

                          return (
                            <div key={i} className="relative flex justify-center">
                              <button
                                disabled={!isAvailable || isPastAvailable}
                                onClick={() => isAvailable && !isPastAvailable && handleDateClick(date)}
                                className={`w-10 h-10 flex text-sm font-semibold items-center justify-center rounded-full transition-all duration-200
                                  ${isPastAvailable
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : isAvailable
                                      ? "bg-[#EAF0FF] text-[#042C89] hover:bg-[#D4E0FF] cursor-pointer"
                                      : "bg-transparent text-gray-300 cursor-not-allowed"}
                                  ${isSelected ? "!bg-[#042C89] text-white shadow-md scale-110" : ""}`}
                              >
                                {date.getDate()}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
              {errors.selectedDate && <p className="text-red-500 text-xs mt-2 font-medium">{errors.selectedDate}</p>}
            </motion.div>
          )}

          <AnimatePresence>
            {membershipPlan && selectedDate && isOpenMembership && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
              >
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                  <CreditCard className="w-4 h-4 text-[#042C89]" />
                  3. Payment Details
                </label>

                {step === 0 && (
                  <div className="bg-[#F8F9FA] rounded-[20px] p-6 border border-gray-100">
                    <div className="space-y-4 text-[15px] font-medium">
                      <div className="flex justify-between items-center text-gray-700 pb-4 border-b border-gray-200/60">
                        <span className="text-gray-500">Membership Plan</span>
                        <span className="font-semibold text-gray-900 bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm">
                          {membershipPlan?.all?.duration}{" "}
                          {membershipPlan?.all?.interval}
                          {membershipPlan?.all?.duration > 1 ? "s" : ""}
                        </span>
                      </div>

                      {membershipPlan?.all?.duration > 1 && (
                        <div className="flex justify-between items-center text-gray-700 pb-4 border-b border-gray-200/60">
                          <span className="text-gray-500">Monthly Payment</span>
                          <span className="font-semibold text-gray-900">£{pricingBreakdown?.nextMonthPayment?.toFixed(2)} p/m</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-gray-700">
                        <span className="text-gray-500">Price Per Lesson</span>
                        <span className="font-semibold text-gray-900">£{pricingBreakdown.pricePerClassPerChild?.toFixed(2)}</span>
                      </div>

                      {pricingBreakdown.isFullMonthCharge ? (
                        <div className="flex justify-between items-center text-gray-700 pb-4 border-b border-gray-200/60">
                          <span className="text-gray-500">Full Monthly Charge</span>
                          <span className="font-semibold text-gray-900">£{pricingBreakdown.nextMonthPayment?.toFixed(2)}</span>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center text-gray-700 pb-4 border-b border-gray-200/60">
                          <span className="text-gray-500">Pro-Rata ({pricingBreakdown.numberOfLessonsProRated} lessons)</span>
                          <span className="font-semibold text-gray-900">£{pricingBreakdown.finalProRataCost?.toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-5 border-t-2 border-gray-200/80">
                      <div className="flex justify-between items-end">
                        <div>
                          <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total Due Today</div>
                          {membershipPlan?.all?.duration > 1 && (
                            <div className="text-xs text-gray-400 mt-1">Then £{pricingBreakdown.nextMonthPayment?.toFixed(2)} / month</div>
                          )}
                        </div>
                        <span className="text-3xl font-bold text-[#042C89]">£{pricingBreakdown.totalAmountToday?.toFixed(2)}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => { if (validateStep0()) setStep(1); }}
                      className="mt-8 w-full bg-[#042C89] hover:bg-[#032066] text-white rounded-xl px-6 py-4 font-bold text-[16px] shadow-lg transition-all duration-200 block"
                      style={{ minHeight: '56px', backgroundColor: '#042C89', color: 'white', display: 'block', visibility: 'visible' }}
                    >
                      Continue to Payment
                    </button>
                  </div>
                )}

                {step === 1 && (
                  <div className="bg-white rounded-[20px] p-8 border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Set up your direct debit</h3>

                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email address</label>
                        <input
                          ref={emailRef}
                          type="email"
                          placeholder="your@email.com"
                          value={payment.email}
                          onChange={(e) => handlePaymentChange("email", e.target.value)}
                          className={`w-full bg-gray-50 border ${errors.email ? "border-red-400 bg-red-50 focus:ring-red-500" : "border-gray-200 focus:ring-[#042C89]"} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>}
                      </div>

                      <div className="bg-[#F8F9FA] p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-600">Payment Method</span>
                        <span className="text-sm font-bold capitalize text-gray-900 px-3 py-1 bg-white rounded-md shadow-sm border border-gray-100">
                          {existingPayment?.paymentType !== "stripe" ? existingPayment?.paymentType : "Bank Transfer"}
                        </span>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Account Holder Name</label>
                        <input
                          ref={accountHolderNameRef}
                          type="text"
                          placeholder="Full Name on Account"
                          value={payment.account_holder_name}
                          onChange={(e) => {
                            const fullName = e.target.value;
                            setPayment(prev => {
                              const parts = fullName.trim().split(" ");
                              return {
                                ...prev,
                                account_holder_name: fullName,
                                firstName: parts[0] || "",
                                lastName: parts.slice(1).join(" ")
                              };
                            });
                            if (errors.account_holder_name) setErrors((e) => ({ ...e, account_holder_name: "" }));
                          }}
                          className={`w-full bg-gray-50 border ${errors.account_holder_name ? "border-red-400 bg-red-50 focus:ring-red-500" : "border-gray-200 focus:ring-[#042C89]"} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                        />
                        {errors.account_holder_name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.account_holder_name}</p>}
                      </div>

                      {!isFranchisee && (
                        <>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Address Line 1</label>
                            <input
                              ref={line1Ref}
                              type="text"
                              value={payment.line1}
                              onChange={(e) => handlePaymentChange("line1", e.target.value)}
                              className={`w-full bg-gray-50 border ${errors.line1 ? "border-red-400 bg-red-50 focus:ring-red-500" : "border-gray-200 focus:ring-[#042C89]"} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                            />
                            {errors.line1 && <p className="text-red-500 text-xs mt-1 font-medium">{errors.line1}</p>}
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                              <input
                                ref={cityRef}
                                type="text"
                                value={payment.city}
                                onChange={(e) => handlePaymentChange("city", e.target.value)}
                                className={`w-full bg-gray-50 border ${errors.city ? "border-red-400 bg-red-50 focus:ring-red-500" : "border-gray-200 focus:ring-[#042C89]"} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                              />
                              {errors.city && <p className="text-red-500 text-xs mt-1 font-medium">{errors.city}</p>}
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Postal Code</label>
                              <input
                                ref={postalCodeRef}
                                type="text"
                                value={payment.postalCode}
                                onChange={(e) => handlePaymentChange("postalCode", e.target.value)}
                                className={`w-full bg-gray-50 border ${errors.postalCode ? "border-red-400 bg-red-50 focus:ring-red-500" : "border-gray-200 focus:ring-[#042C89]"} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                              />
                              {errors.postalCode && <p className="text-red-500 text-xs mt-1 font-medium">{errors.postalCode}</p>}
                            </div>
                          </div>
                        </>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Sort Code</label>
                          <input
                            ref={branchCodeRef}
                            type="text"
                            placeholder="00-00-00"
                            value={payment.branch_code}
                            onChange={(e) => handlePaymentChange("branch_code", e.target.value.replace(/\D/g, "").slice(0, 6))}
                            className={`w-full bg-gray-50 border ${errors.branch_code ? "border-red-400 bg-red-50 focus:ring-red-500" : "border-gray-200 focus:ring-[#042C89]"} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:border-transparent transition-all font-mono tracking-wider`}
                          />
                          {errors.branch_code && <p className="text-red-500 text-xs mt-1 font-medium">{errors.branch_code}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Account Number</label>
                          <input
                            ref={accountNumberRef}
                            type="text"
                            placeholder="8 digits"
                            value={payment.account_number}
                            onChange={(e) => handlePaymentChange("account_number", e.target.value.replace(/\D/g, "").slice(0, 8))}
                            className={`w-full bg-gray-50 border ${errors.account_number ? "border-red-400 bg-red-50 focus:ring-red-500" : "border-gray-200 focus:ring-[#042C89]"} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:border-transparent transition-all font-mono tracking-wider`}
                          />
                          {errors.account_number && <p className="text-red-500 text-xs mt-1 font-medium">{errors.account_number}</p>}
                        </div>
                      </div>
                    </div>

                    <label className={`flex items-center gap-3 mt-6 p-4 rounded-xl border cursor-pointer group transition-colors ${errors.authorise ? "bg-red-50 border-red-300" : "bg-blue-50/50 border-blue-100"}`}>
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          checked={authorised}
                          onChange={(e) => {
                            setAuthorised(e.target.checked);
                            if (errors.authorise) setErrors((er) => ({ ...er, authorise: "" }));
                          }}
                          className="w-5 h-5 rounded border-gray-300 text-[#042C89] focus:ring-[#042C89] transition-all cursor-pointer"
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                        I can authorise Direct Debits on this account myself
                      </span>
                    </label>
                    {errors.authorise && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.authorise}</p>}

                    <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100">
                      <button
                        onClick={() => setStep(0)}
                        className="w-1/3 py-3.5 px-4 font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-2/3 py-3.5 px-4 font-bold text-white bg-[#027A48] hover:bg-[#026038] rounded-xl flex items-center justify-center gap-2 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                        style={{ backgroundColor: '#027A48', color: 'white', display: 'flex' }}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Confirm & Pay"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default ChangePlanModal;