import { Lock } from "lucide-react";
import { useStep } from "../../../context/StepContext";

export default function StepPayment() {
    const { formData, setFormData, errors, clearError, data } = useStep();
    const filteredData = Array.isArray(data)
        ? data.filter((item) => item?.venueId === formData?.venue)
        : [];

    // ── card number: groups of 4 digits separated by spaces ──────────────
    // ── validate card number using Luhn algorithm ─────────────────────────
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

    // ── card number: groups of 4 digits separated by spaces ──────────────
    const formatCardNumber = (value = "") => {
        const clean = value.replace(/\D/g, "");
        const truncated = clean.substring(0, 19);
        const parts = [];
        for (let i = 0; i < truncated.length; i += 4) {
            parts.push(truncated.substring(i, i + 4));
        }
        return parts.join(" ");
    };

    // ── expiry: auto-inserts "/" after MM ─────────────────────────────────
    const formatExpiry = (value = "") => {
        const digits = value.replace(/\D/g, "").slice(0, 4);
        if (digits.length <= 2) return digits;
        return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    };

    // ── validate expiry MM/YY ─────────────────────────────────────────────
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

        setFormData((prev) => ({
            ...prev,
            payment: {
                ...prev.payment,
                [name]: processedValue,
            },
        }));

        if (errors[name]) clearError(name);
    };

    // ── inline validation on blur ─────────────────────────────────────────
    const handleBlur = (e) => {
        const { name, value } = e.target;
        const payment = formData.payment || {};

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
    const campDate = venue?.holidayCampDates?.[0];

    const totalSessions = campDate?.sessionsMap?.length || 0;
    const planPrice = plan?.price || 0;
    const joiningFee = plan?.joiningFee || 0;
    const totalPayNow = planPrice + joiningFee;

    const payment = formData.payment || {};

    // Merge context errors with inline _errors
    const allErrors = { ...errors, ...(formData._errors || {}) };

    const inputClass = (hasError) =>
        `w-full mainShadow rounded-lg ${hasError ? "border border-red-500" : "border-gray-200"
        } py-3.5 px-4 text-[15px] focus:border-[#0496FF] outline-none transition-colors`;

    const cvvMaxLength = 4;

    return (
        <div className="w-full max-w-5xl mx-auto py-4">
            <h2 className="text-[#191919] font-semibold poppins md:text-[24px] text-[18px] mb-8 text-center">
                Payment
            </h2>

            <div className="border border-[#DBCACA] overflow-hidden rounded-[19px] flex flex-col items-stretch lg:flex-row gap-8">

                {/* ── Left: Summary Panel ── */}
                <div className="w-full lg:w-1/3 bg-[#F1F4FC] rounded-[20px] p-6 space-y-4">
                    <h3 className="text-[#042C89] font-bold poppins text-[20px] mt-6">Summary</h3>

                    <div>
                        <div className="flex justify-between items-start mb-3">
                            <span className="font-bold poppins text-[#042C89]">
                                {plan?.title || "-"} ({plan?.duration || "-"} {plan?.interval || ""})
                            </span>
                            <span className="font-bold poppins text-[#191919]">
                                £{planPrice.toFixed(2)}
                            </span>
                        </div>
                        <div className="text-[14px] poppins text-[#5F5F6D] space-y-1">
                            <div className="flex justify-between">
                                <span className="font-medium text-[#34353B]">
                                    {plan?.students || "-"} Student
                                </span>
                                <span className="text-[12px] text-[#34353B]">
                                    per {plan?.interval?.toLowerCase() || "-"}
                                </span>
                            </div>
                            {campDate && (
                                <>
                                    <p>
                                        <span className="font-medium text-[#34353B]">Start Date: </span>
                                        {campDate.startDate || "-"}
                                    </p>
                                    <p>
                                        <span className="font-medium text-[#34353B]">End Date: </span>
                                        {campDate.endDate || "-"}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-[#C3C4CC] pt-4">
                        <h4 className="font-semibold poppins text-[#042C89] text-[16px] mb-2">
                            {venue?.venueName || venue?.name || ""}
                        </h4>
                        <div className="flex justify-between text-[14px] font-medium poppins">
                            <span>Joining Fee</span>
                            <span className="font-bold">£{joiningFee.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="border-t border-[#C3C4CC] pt-4">
                        <h4 className="font-semibold poppins text-[#042C89] text-[16px] mb-2">
                            Pro-rata lessons
                        </h4>
                        <div className="flex justify-between text-[14px] font-medium poppins mb-1">
                            <span>Number of lessons</span>
                            <span className="font-bold">{totalSessions}</span>
                        </div>
                        <div className="flex justify-between text-[14px] font-medium poppins">
                            <span>Fee</span>
                            <span className="font-bold">£{planPrice.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="border-t border-[#C3C4CC] pt-4 flex justify-between items-center text-[#042C89]">
                        <span className="font-bold poppins">Total to pay now</span>
                        <span className="font-bold poppins text-xl">£{totalPayNow.toFixed(2)}</span>
                    </div>
                </div>

                {/* ── Right: Payment Form ── */}
                <div className="flex-1 bg-white rounded-[20px] p-6 lg:ps-0 lg:p-8">
                    <div className="flex justify-between">
                        <div>
                            <h3 className="font-semibold md:text-[22px] text-[18px] poppins text-[#191919] mb-2">
                                Set up your direct debit
                            </h3>
                            <p className="text-[14px] poppins text-[#797A88] mb-8 font-normal">
                                Your regular Direct Debit payments will be collected{" "}
                                <br className="hidden md:block" />
                                from this account starting from the 1st of next month.
                            </p>
                        </div>
                        <div className="w-[100px]">
                            <img src="/assets/debit.png" alt="" />
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Name Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[15px] font-normal poppins text-[#191919] mb-2 block">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={payment.firstName || ""}
                                    onChange={handlePaymentChange}
                                    className={inputClass(allErrors.firstName)}
                                    placeholder="John"
                                />
                                {allErrors.firstName && (
                                    <p className="text-red-500 text-[13px] poppins mt-1">{allErrors.firstName}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-[15px] font-normal poppins text-[#191919] mb-2 block">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={payment.lastName || ""}
                                    onChange={handlePaymentChange}
                                    className={inputClass(allErrors.lastName)}
                                    placeholder="Smith"
                                />
                                {allErrors.lastName && (
                                    <p className="text-red-500 text-[13px] poppins mt-1">{allErrors.lastName}</p>
                                )}
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="text-[15px] font-normal poppins text-[#191919] mb-2 block">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={payment.email || ""}
                                onChange={handlePaymentChange}
                                className={inputClass(allErrors.email)}
                                placeholder="john@example.com"
                            />
                            {allErrors.email && (
                                <p className="text-red-500 text-[13px] poppins mt-1">{allErrors.email}</p>
                            )}
                        </div>

                        {/* Billing Address */}
                        <div>
                            <label className="text-[15px] font-normal poppins text-[#191919] mb-2 block">
                                Billing Address
                            </label>
                            <input
                                type="text"
                                name="billingAddress"
                                value={payment.billingAddress || ""}
                                onChange={handlePaymentChange}
                                className={inputClass(allErrors.billingAddress)}
                                placeholder="123 Main Street, London"
                            />
                            {allErrors.billingAddress && (
                                <p className="text-red-500 text-[13px] poppins mt-1">{allErrors.billingAddress}</p>
                            )}
                        </div>

                        {/* Card Number */}
                        <div>
                            <label className="text-[15px] font-normal poppins text-[#191919] mb-2 block">
                                Card Number
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="cardNumber"
                                    value={payment.cardNumber || ""}
                                    onChange={handlePaymentChange}
                                    onBlur={handleBlur}
                                    className={`${inputClass(allErrors.cardNumber)} pr-16`}
                                    placeholder="1234 5678 9012 3456"
                                    maxLength={23}
                                    inputMode="numeric"
                                    autoComplete="cc-number"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                                    <Lock size={14} className="text-gray-300" />
                                </div>
                            </div>
                            {allErrors.cardNumber && (
                                <p className="text-red-500 text-[13px] poppins mt-1">{allErrors.cardNumber}</p>
                            )}
                        </div>

                        {/* Expiry + CVV */}
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <label className="text-[15px] font-normal poppins text-[#191919] mb-2 block">
                                    Expiry Date
                                </label>
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
                                    autoComplete="cc-exp"
                                />
                                {allErrors.expiryDate && (
                                    <p className="text-red-500 text-[13px] poppins mt-1">{allErrors.expiryDate}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-[15px] font-normal poppins text-[#191919] mb-2 block">
                                    Security Code
                                    <span className="text-[#797A88] text-[13px] ml-1">
                                        (3 or 4 digits)
                                    </span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="securityCode"
                                        value={payment.securityCode || ""}
                                        onChange={handlePaymentChange}
                                        onBlur={handleBlur}
                                        className={`${inputClass(allErrors.securityCode)} pr-8`}
                                        placeholder="123"
                                        maxLength={cvvMaxLength}
                                        inputMode="numeric"
                                        autoComplete="cc-csc"
                                    />
                                    <Lock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" />
                                </div>
                                {allErrors.securityCode && (
                                    <p className="text-red-500 text-[13px] poppins mt-1">{allErrors.securityCode}</p>
                                )}
                            </div>
                        </div>

                        {/* Checkboxes */}
                        <div className="space-y-3 pt-4">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <div
                                    className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 ${payment.agreeTerms
                                        ? "bg-emerald-400 border-emerald-400"
                                        : allErrors.agreeTerms
                                            ? "border-red-500"
                                            : "border-gray-300 group-hover:border-emerald-400"
                                        }`}
                                >
                                    {payment.agreeTerms && (
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <input
                                    type="checkbox"
                                    name="agreeTerms"
                                    checked={payment.agreeTerms || false}
                                    onChange={handlePaymentChange}
                                    className="hidden"
                                />
                                <span
                                    className={`text-[14px] font-normal poppins ${allErrors.agreeTerms ? "text-red-500" : "text-[#5F5F6D]"
                                        } underline decoration-gray-400 underline-offset-2`}
                                >
                                    You agree to the <b>Terms &amp; Conditions</b> and Privacy Policy.
                                </span>
                            </label>

                            <label className="flex items-start gap-3 cursor-pointer group">
                                <div
                                    className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 ${payment.agreePhotos
                                        ? "bg-emerald-400 border-emerald-400"
                                        : "border-gray-300 group-hover:border-emerald-400"
                                        }`}
                                >
                                    {payment.agreePhotos && (
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <input
                                    type="checkbox"
                                    name="agreePhotos"
                                    checked={payment.agreePhotos || false}
                                    onChange={handlePaymentChange}
                                    className="hidden"
                                />
                                <span className="text-[14px] font-normal poppins text-[#5F5F6D] underline decoration-gray-400 underline-offset-2">
                                    You provide consent for your child to be included in photos.
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}