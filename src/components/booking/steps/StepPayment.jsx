import { Lock, X } from "lucide-react";
import { useStep } from "../../../context/StepContext";

export default function StepPayment() {
  const { formData, setFormData, errors, clearError, data, prevStep, nextStep } = useStep();

  const filteredData = Array.isArray(data)
    ? data.filter((item) => item?.venueId === formData?.venue)
    : [];

  const validateCardNumber = (value) => {
    const clean = value.replace(/\s+/g, "");
    if (!/^\d{13,19}$/.test(clean)) {
      return false;
    }
    let sum = 0;
    let shouldDouble = false;
    for (let i = clean.length - 1; i >= 0; i--) {
      let digit = parseInt(clean.charAt(i), 10);
      if (shouldDouble) {
        if ((digit *= 2) > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

  const formatCardNumber = (value = "") => {
    const clean = value.replace(/\D/g, "");
    const truncated = clean.substring(0, 19);
    const parts = [];
    for (let i = 0; i < truncated.length; i += 4) {
      parts.push(truncated.substring(i, i + 4));
    }
    return parts.join(" ");
  };

  const formatExpiry = (value = "") => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const isValidExpiry = (value = "") => {
    const [mm, yy] = value.split("/");
    if (!mm || !yy || mm.length !== 2 || yy.length !== 2) return false;
    const month = parseInt(mm, 10);
    if (month < 1 || month > 12) return false;
    const now = new Date();
    const expDate = new Date(2000 + parseInt(yy, 10), month - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return expDate >= thisMonth;
  };

  const handlePaymentChange = (e) => {
    const { name, value, type, checked } = e.target;
    let processedValue = type === "checkbox" ? checked : value;

    if (name === "cardNumber") {
      processedValue = formatCardNumber(value);
    }
    if (name === "expiryDate") {
      processedValue = formatExpiry(value);
    }
    if (name === "securityCode") {
      processedValue = value.replace(/\D/g, "").slice(0, 4);
    }
    if (name === "sortCode") {
      const clean = value.replace(/\D/g, "").slice(0, 6);
      let formatted = clean;
      if (clean.length > 2) formatted = `${clean.slice(0, 2)}-${clean.slice(2)}`;
      if (clean.length > 4) formatted = `${clean.slice(0, 2)}-${clean.slice(2, 4)}-${clean.slice(4)}`;
      processedValue = formatted;
    }
    if (name === "accountNumber") {
      processedValue = value.replace(/\D/g, "").slice(0, 8);
    }

    setFormData((prev) => ({
      ...prev,
      payment: {
        ...prev.payment,
        [name]: processedValue,
      },
    }));

    if (errors[name]) clearError(name);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    if (name === "cardNumber") {
      const raw = (value || "").replace(/\s/g, "");
      if (!raw) return;
      if (!/^\d{13,19}$/.test(raw)) {
        setFormData((prev) => ({
          ...prev,
          _errors: { ...prev._errors, cardNumber: "Card number must be 13–19 digits." },
        }));
      } else if (!validateCardNumber(raw)) {
        setFormData((prev) => ({
          ...prev,
          _errors: { ...prev._errors, cardNumber: "Invalid card number." },
        }));
      } else {
        setFormData((prev) => {
          const nextErrors = { ...prev._errors };
          delete nextErrors.cardNumber;
          return { ...prev, _errors: nextErrors };
        });
      }
    }

    if (name === "expiryDate") {
      if (!value) return;
      if (!isValidExpiry(value)) {
        setFormData((prev) => ({
          ...prev,
          _errors: { ...prev._errors, expiryDate: "Enter a valid future date (MM/YY)." },
        }));
      } else {
        setFormData((prev) => {
          const nextErrors = { ...prev._errors };
          delete nextErrors.expiryDate;
          return { ...prev, _errors: nextErrors };
        });
      }
    }

    if (name === "securityCode") {
      if (!value) return;
      if (value.length < 3) {
        setFormData((prev) => ({
          ...prev,
          _errors: { ...prev._errors, securityCode: "CVV must be 3 or 4 digits." },
        }));
      } else {
        setFormData((prev) => {
          const nextErrors = { ...prev._errors };
          delete nextErrors.securityCode;
          return { ...prev, _errors: nextErrors };
        });
      }
    }
  };

  const venue = filteredData?.[0];
  const plan = venue?.paymentGroups?.[0]?.holidayPaymentPlans?.[0];

  const getServiceDetails = () => {
    switch (formData.service) {
      case "Holiday Camp Booking":
        return {
          title: plan?.title || "Holiday Camp Booking",
          price: plan?.price || 39.99,
        };
      case "Weekly Class Membership":
        const isStandard = formData.membershipPlan === "Weekly Class Standard" || formData.membershipPlan?.includes("Standard");
        const isPremium = formData.membershipPlan === "Weekly Class Premium" || formData.membershipPlan?.includes("Premium");
        return {
          title: formData.membershipPlan || "Weekly Class [Gold]",
          price: isStandard ? 29.99 : isPremium ? 49.99 : 39.99,
        };
      case "One To One":
        const isOtoStandard = formData.oneToOne?.package?.includes("Standard");
        return {
          title: formData.oneToOne?.package || "One to One Package [Gold]",
          price: isOtoStandard ? 29.99 : 39.99,
        };
      case "Birthday Party":
        const isBdayStandard = formData.birthdayParty?.package?.includes("Standard");
        const isBdayPremium = formData.birthdayParty?.package?.includes("Premium");
        return {
          title: formData.birthdayParty?.package || "Birthday Party [Gold]",
          price: isBdayStandard ? 29.99 : isBdayPremium ? 49.99 : 39.99,
        };
      default:
        return {
          title: "Booking Deposit",
          price: 39.99,
        };
    }
  };

  const serviceInfo = getServiceDetails();
  const payment = formData.payment || {};
  const allErrors = { ...errors, ...(formData._errors || {}) };

  const inputClass = (hasError) =>
    `w-full bg-[#FBFBFB] rounded-xl border ${
      hasError ? "border-red-500" : "border-[#E2E1E5]"
    } py-3 px-4 text-[15px] font-medium poppins focus:border-[#237FEA] focus:bg-white outline-none transition-colors`;

  const isMembership = formData.service === "Weekly Class Membership";

  return (
    <div className="w-full max-w-5xl mx-auto py-2 px-4 md:px-0 poppins">
      {isMembership ? (
        <div className="bg-white overflow-hidden rounded-[20px] shadow-sm border border-[#E2E1E5] flex flex-col md:flex-row items-stretch min-h-[600px]">
          
          {/* Left: Summary Sidebar */}
          <div className="flex-1 md:max-w-[320px] bg-[#F4F7FB] p-8">
             <h3 className="text-[22px] font-bold text-[#042C89] mb-6 poppins">Summary</h3>
             
             <div className="mb-5">
               <div className="flex justify-between items-start mb-2">
                 <span className="font-bold text-[#042C89] text-[15px]">{formData.membershipPlan || "12 Month Plan"}</span>
                 <div className="text-right">
                   <span className="font-bold text-[#282829] text-[15px] block">£{serviceInfo.price.toFixed(2)}</span>
                   <span className="text-[11px] text-[#6B7280]">per month</span>
                 </div>
               </div>
               <p className="text-[13px] text-[#282829] mb-1">{formData.students?.length || 1} Student</p>
               <p className="text-[13px] text-[#282829] mb-1">
                 Start Date: {formData.startDate ? new Date(formData.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "17th Aug 2023"}
               </p>
               <p className="text-[13px] text-[#282829]">First monthly payment: 1st Sep 2023</p>
             </div>
             
             <hr className="border-[#D1D5DB] my-5" />
             
             <div className="mb-5">
               <h4 className="font-bold text-[#042C89] text-[15px] mb-2">Samba Soccer Schools</h4>
               <div className="flex justify-between text-[13px] text-[#282829]">
                 <span>Joining Fee</span>
                 <span className="font-bold">£{formData.joiningFee || "35.00"}</span>
               </div>
             </div>

             <hr className="border-[#D1D5DB] my-5" />

             <div className="mb-5">
               <h4 className="font-bold text-[#042C89] text-[15px] mb-2">Pro-rata lessons</h4>
               <div className="flex justify-between text-[13px] text-[#282829] mb-1">
                 <span>Number of lessons</span>
                 <span className="font-bold">2</span>
               </div>
               <div className="flex justify-between text-[13px] text-[#282829]">
                 <span>Fee</span>
                 <span className="font-bold">£45.00</span>
               </div>
             </div>

             <hr className="border-[#D1D5DB] my-5" />

             <div className="flex justify-between items-center mt-6">
               <span className="font-bold text-[#042C89] text-[16px]">Total to pay now</span>
               <span className="font-bold text-[#042C89] text-[20px]">£42.89</span>
             </div>
          </div>

          {/* Right: Direct Debit Form */}
          <div className="flex-1 p-8 md:p-10 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6 relative">
                <div>
                  <h2 className="text-[24px] font-bold text-[#282829] mb-2">Set up your direct debit</h2>
                  <p className="text-[#6B7280] text-[14px] max-w-[350px] leading-relaxed">
                    Your regular Direct Debit payments will be collected from this account starting from the 1st of next month.
                  </p>
                </div>
                <div className="flex items-center text-black font-black text-lg italic tracking-tighter absolute right-0 top-0">
                   <span className="w-6 h-6 rounded-full bg-black flex items-center justify-center text-white mr-1 text-[10px] not-italic leading-none">O</span>
                   <div className="leading-tight">
                     DIRECT<br/><span className="text-[14px]">Debit</span>
                   </div>
                </div>
              </div>

              <div className="space-y-6 mt-8">
                <div>
                  <label className="text-[13px] font-semibold text-[#34353B] mb-2 block">Account Holder Name</label>
                  <input
                    type="text"
                    name="accountHolderName"
                    value={payment.accountHolderName || ""}
                    onChange={handlePaymentChange}
                    className={`w-full rounded-[10px] border ${allErrors.accountHolderName ? "border-red-500" : "border-[#E2E1E5]"} py-3 px-4 text-[14px] outline-none focus:border-[#237FEA]`}
                  />
                  {allErrors.accountHolderName && <p className="text-red-500 text-xs mt-1">{allErrors.accountHolderName}</p>}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[13px] font-semibold text-[#34353B] mb-2 block">Sort Code</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="sortCode"
                        value={payment.sortCode || ""}
                        onChange={handlePaymentChange}
                        maxLength={8}
                        className={`w-full rounded-[10px] border ${allErrors.sortCode ? "border-red-500" : "border-[#E2E1E5]"} py-3 px-4 text-[14px] outline-none focus:border-[#237FEA]`}
                      />
                      <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                    </div>
                    <p className="text-[11px] text-[#9CA3AF] mt-1.5 font-medium">Must be 6 digits long</p>
                    {allErrors.sortCode && <p className="text-red-500 text-xs mt-1">{allErrors.sortCode}</p>}
                  </div>

                  <div>
                    <label className="text-[13px] font-semibold text-[#34353B] mb-2 block">Account Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="accountNumber"
                        value={payment.accountNumber || ""}
                        onChange={handlePaymentChange}
                        maxLength={8}
                        className={`w-full rounded-[10px] border ${allErrors.accountNumber ? "border-red-500" : "border-[#E2E1E5]"} py-3 px-4 text-[14px] outline-none focus:border-[#237FEA]`}
                      />
                      <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                    </div>
                    <p className="text-[11px] text-[#9CA3AF] mt-1.5 font-medium">Must be 8 digits long</p>
                    {allErrors.accountNumber && <p className="text-red-500 text-xs mt-1">{allErrors.accountNumber}</p>}
                  </div>
                </div>

                <div className="space-y-4 pt-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className="pt-0.5">
                      <input
                        type="checkbox"
                        name="agreeTerms"
                        checked={payment.agreeTerms ?? true}
                        onChange={handlePaymentChange}
                        className="w-4 h-4 rounded border-[#0DD180] text-[#0DD180] focus:ring-[#0DD180] accent-[#0DD180]"
                      />
                    </div>
                    <span className="text-[13px] text-[#6B7280]">
                      You agree to the <span className="underline font-semibold text-[#282829]">Terms Conditions and Privacy Policy.</span>
                    </span>
                  </label>
                  {allErrors.agreeTerms && <p className="text-red-500 text-xs mt-1 ml-7">{allErrors.agreeTerms}</p>}

                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className="pt-0.5">
                      <input
                        type="checkbox"
                        name="consentPhotos"
                        checked={payment.consentPhotos ?? true}
                        onChange={handlePaymentChange}
                        className="w-4 h-4 rounded border-[#0DD180] text-[#0DD180] focus:ring-[#0DD180] accent-[#0DD180]"
                      />
                    </div>
                    <span className="text-[13px] text-[#6B7280]">
                      You provide consent for your child to be included in photos.
                    </span>
                  </label>
                  {allErrors.consentPhotos && <p className="text-red-500 text-xs mt-1 ml-7">{allErrors.consentPhotos}</p>}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={nextStep}
                className="w-full bg-[#042C89] hover:bg-[#031d5c] text-white py-3.5 rounded-xl font-bold text-[15px] transition-colors poppins shadow-sm"
              >
                Set Up Direct Debit
              </button>
            </div>
          </div>

        </div>
      ) : (
        <div className="bg-[#1a1a1a] overflow-hidden rounded-[30px] shadow-lg flex flex-col md:flex-row items-stretch">
          
          {/* Left: Dimmed background with red stripes (Zebra pattern) */}
          <div className="flex-1 hidden md:flex bg-[#1E1E1E] relative overflow-hidden items-center justify-center min-h-[600px] p-8">
            
            {/* Top-Left Red Stripe Patterns */}
            <div className="absolute top-12 left-12 opacity-80 flex flex-col gap-1.5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex gap-1">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="w-3.5 h-1.5 bg-red-600 rounded-sm" />
                  ))}
                </div>
              ))}
            </div>

            {/* Bottom-Right Red Stripe Patterns */}
            <div className="absolute bottom-12 right-12 opacity-80 flex flex-col gap-1.5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex gap-1">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="w-3.5 h-1.5 bg-red-600 rounded-sm" />
                  ))}
                </div>
              ))}
            </div>

            <div className="text-white text-center poppins max-w-xs z-10 space-y-4">
              <h3 className="text-3xl font-extrabold tracking-wide mb-2">Make Payment</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Secure payment portal. Please fill in your card details on the right to proceed with your booking.
              </p>
            </div>
          </div>

          {/* Right: Drawer Payment Card */}
          <div className="w-full md:w-[480px] bg-white p-8 flex flex-col justify-between">
            
            {/* Header */}
            <div className="flex items-center mb-6 relative">
              <button onClick={prevStep} className="text-[#9CA3AF] hover:text-gray-600 absolute left-0">
                <X size={24} />
              </button>
              <h3 className="text-[20px] font-bold poppins text-center w-full text-[#1E1E1E]">Payment</h3>
            </div>

            {/* Blue Service Price Banner */}
            <div className="bg-gradient-to-r from-[#237FEA] to-[#0496FF] rounded-2xl p-6 text-white mb-6 relative overflow-hidden shadow-md">
              <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-white/10 rounded-full" />
              <p className="text-sm font-semibold opacity-90 mb-1.5 poppins tracking-wide">
                {serviceInfo.title}
              </p>
              <p className="text-3xl font-black poppins">
                £{serviceInfo.price.toFixed(2)}
              </p>
            </div>

            {/* Form */}
            <div className="space-y-5 flex-1">
              
              {/* Personal Details Section */}
              <div>
                <p className="text-[12px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-3 poppins">
                  Personal Details
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-[13px] font-semibold text-[#34353B] mb-1.5 block">First name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={payment.firstName || ""}
                      onChange={handlePaymentChange}
                      className={inputClass(allErrors.firstName)}
                      placeholder="Enter first name"
                    />
                    {allErrors.firstName && (
                      <p className="text-red-500 text-[11px] mt-1">{allErrors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[13px] font-semibold text-[#34353B] mb-1.5 block">Last name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={payment.lastName || ""}
                      onChange={handlePaymentChange}
                      className={inputClass(allErrors.lastName)}
                      placeholder="Enter last name"
                    />
                    {allErrors.lastName && (
                      <p className="text-red-500 text-[11px] mt-1">{allErrors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-[13px] font-semibold text-[#34353B] mb-1.5 block">Email address</label>
                  <input
                    type="email"
                    name="email"
                    value={payment.email || ""}
                    onChange={handlePaymentChange}
                    className={inputClass(allErrors.email)}
                    placeholder="Enter email address"
                  />
                  {allErrors.email && (
                    <p className="text-red-500 text-[11px] mt-1">{allErrors.email}</p>
                  )}
                </div>

                <div className="mb-5">
                  <label className="text-[13px] font-semibold text-[#34353B] mb-1.5 block">Billing address</label>
                  <input
                    type="text"
                    name="billingAddress"
                    value={payment.billingAddress || ""}
                    onChange={handlePaymentChange}
                    className={inputClass(allErrors.billingAddress)}
                    placeholder="Enter billing address"
                  />
                  {allErrors.billingAddress && (
                    <p className="text-red-500 text-[11px] mt-1">{allErrors.billingAddress}</p>
                  )}
                </div>
              </div>

              {/* Bank Details Section */}
              <div>
                <p className="text-[12px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-3 poppins">
                  Bank Details
                </p>

                <div className="mb-4">
                  <label className="text-[13px] font-semibold text-[#34353B] mb-1.5 block">Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="cardNumber"
                      value={payment.cardNumber || ""}
                      onChange={handlePaymentChange}
                      onBlur={handleBlur}
                      className={`${inputClass(allErrors.cardNumber)} pr-10`}
                      placeholder="Enter card number"
                      maxLength={23}
                      inputMode="numeric"
                    />
                    <Lock size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  </div>
                  {allErrors.cardNumber && (
                    <p className="text-red-500 text-[11px] mt-1">{allErrors.cardNumber}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[13px] font-semibold text-[#34353B] mb-1.5 block">Expiry Date</label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={payment.expiryDate || ""}
                      onChange={handlePaymentChange}
                      onBlur={handleBlur}
                      className={inputClass(allErrors.expiryDate)}
                      placeholder="MM/YY"
                      maxLength={5}
                      inputMode="numeric"
                    />
                    {allErrors.expiryDate && (
                      <p className="text-red-500 text-[11px] mt-1">{allErrors.expiryDate}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[13px] font-semibold text-[#34353B] mb-1.5 block">Security code</label>
                    <input
                      type="text"
                      name="securityCode"
                      value={payment.securityCode || ""}
                      onChange={handlePaymentChange}
                      onBlur={handleBlur}
                      className={inputClass(allErrors.securityCode)}
                      placeholder="CVV"
                      maxLength={4}
                      inputMode="numeric"
                    />
                    {allErrors.securityCode && (
                      <p className="text-red-500 text-[11px] mt-1">{allErrors.securityCode}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Terms Consent (Hidden inputs with pre-accept, or auto accept on submit) */}
              <div className="hidden">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={true}
                  onChange={() => {}}
                />
              </div>

            </div>

            {/* Submit Button */}
            <div className="mt-8">
              <button
                onClick={nextStep}
                className="w-full bg-[#237FEA] hover:bg-[#037ecc] text-white py-4 rounded-2xl font-bold text-[16px] transition-colors poppins shadow-sm"
              >
                Make Payment
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}