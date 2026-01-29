import { Lock } from "lucide-react";
import { useStep } from "../../../context/StepContext";

export default function StepPayment() {
    const { formData, setFormData, errors, clearError, data } = useStep();
    const filteredData = Array.isArray(data)
        ? data.filter((item) => item?.venueId === formData?.venue)
        : [];

    const handlePaymentChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            payment: {
                ...prev.payment,
                [name]: type === 'checkbox' ? checked : value,
            },
        }));

        if (errors[name]) {
            clearError(name);
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
    const inputClass = (hasError) =>
        `w-full mainShadow rounded-lg ${hasError ? 'border border-red-500' : 'border-gray-200'} py-2.5 px-5 text-sm focus:border-[#0496FF] outline-none transition-colors`;


    return (
        <div className="w-full max-w-5xl mx-auto py-4">
            <h2 className="text-[#191919] font-semibold poppins md:text-[24px] text-[18px] mb-8 text-center">
                Payment
            </h2>

            <div className="border border-[#DBCACA] overflow-hidden  rounded-[19px] flex flex-col items-stretch lg:flex-row gap-8">

                {/* Left: Summary Panel */}
                <div className="w-full lg:w-1/3 bg-[#F1F4FC] rounded-[20px] p-6 space-y-4">
                    <h3 className="text-[#042C89] font-bold poppins text-[20px] mt-6">
                        Summary
                    </h3>

                    {/* Plan */}
                    <div>
                        <div className="flex justify-between items-start mb-3">
                            <span className="font-bold poppins text-[#042C89]">
                                {plan?.title} ({plan?.duration} {plan?.interval})
                            </span>
                            <span className="font-bold poppins text-[#191919]">
                                £{planPrice.toFixed(2)}
                            </span>
                        </div>

                        <div className="text-[14px] poppins text-[#5F5F6D] space-y-1">
                            <div className="flex justify-between">
                                <span className="font-medium text-[#34353B]">
                                    {plan?.students} Student
                                </span>
                                <span className="text-[12px] text-[#34353B]">per {plan?.interval?.toLowerCase()}</span>
                            </div>

                            {campDate && (
                                <>
                                    <p>
                                        <span className="font-medium text-[#34353B]">Start Date: </span>
                                        {campDate.startDate}
                                    </p>
                                    <p>
                                        <span className="font-medium text-[#34353B]">End Date: </span>
                                        {campDate.endDate}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Joining Fee */}
                    <div className="border-t border-[#C3C4CC] pt-4">
                        <h4 className="font-semibold poppins text-[#042C89] text-[16px] mb-2">
                            {venue?.venueName}
                        </h4>
                        <div className="flex justify-between text-[14px] font-medium poppins">
                            <span>Joining Fee</span>
                            <span className="font-bold">£{joiningFee.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Pro-rata lessons */}
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

                    {/* Total */}
                    <div className="border-t border-[#C3C4CC] pt-4 flex justify-between items-center text-[#042C89]">
                        <span className="font-bold poppins">Total to pay now</span>
                        <span className="font-bold poppins text-xl">
                            £{totalPayNow.toFixed(2)}
                        </span>
                    </div>
                </div>



                {/* Right: Payment Form */}
                <div className="flex-1 bg-white  rounded-[20px] p-6 lg:ps-0 lg:p-8">
                    <div className="flex justify-between">
                        <div>
                            <h3 className="font-semibold md:text-[22px] text-[18px] poppins  text-[#191919] mb-2">Set up your direct debit</h3>
                            <p className="text-[14px]  poppins text-[#797A88] mb-8 font-normal">
                                Your regular Direct Debit payments will be collected <br className="hidden md:block" /> from this account starting from the 1st of next month.
                            </p>
                        </div>
                        <div className="w-[100px]">
                            <img src="/assets/debit.png" alt="" />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[14px] font-normal poppins text-[#191919] mb-2 block">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={payment.firstName}
                                    onChange={handlePaymentChange}
                                    className={inputClass(errors.firstName)}
                                />
                                {errors.firstName && <p className="text-red-500 text-[14px] font-normal poppins mt-1">{errors.firstName}</p>}
                            </div>
                            <div>
                                <label className="text-[14px] font-normal poppins text-[#191919] mb-2 block">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={payment.lastName}
                                    onChange={handlePaymentChange}
                                    className={inputClass(errors.lastName)}
                                />
                                {errors.lastName && <p className="text-red-500 text-[14px] font-normal poppins mt-1">{errors.lastName}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="text-[14px] font-normal poppins text-[#191919] mb-2 block">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={payment.email}
                                onChange={handlePaymentChange}
                                className={inputClass(errors.email)}
                            />
                            {errors.email && <p className="text-red-500 text-[14px] font-normal poppins mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="text-[14px] font-normal poppins text-[#191919] mb-2 block">Billing Address</label>
                            <input
                                type="text"
                                name="billingAddress"
                                value={payment.billingAddress}
                                onChange={handlePaymentChange}
                                className={inputClass(errors.billingAddress)}
                            />
                            {errors.billingAddress && <p className="text-red-500 text-[14px] font-normal poppins mt-1">{errors.billingAddress}</p>}
                        </div>

                        <div>
                            <label className="text-[14px] font-normal poppins text-[#191919] mb-2 block">Card Number</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="cardNumber"
                                    value={payment.cardNumber}
                                    onChange={handlePaymentChange}
                                    className={`${inputClass(errors.cardNumber)} pr-8`}
                                />
                                <Lock size={14} className="absolute right-3 top-1/2 mt-1.5 -translate-y-1/2 text-gray-300" />
                            </div>
                            {errors.cardNumber && <p className="text-red-500 text-[14px] font-normal poppins mt-1">{errors.cardNumber}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <label className="text-[14px] font-normal poppins text-[#191919] mb-2 block">Expiry Date</label>
                                <input
                                    type="text"
                                    name="expiryDate"
                                    value={payment.expiryDate}
                                    onChange={handlePaymentChange}
                                    className={inputClass(errors.expiryDate)}
                                    placeholder="MM/YY"
                                />
                                {errors.expiryDate && <p className="text-red-500 text-[14px] font-normal poppins mt-1">{errors.expiryDate}</p>}
                            </div>
                            <div>
                                <label className="text-[14px] font-normal poppins text-[#191919] mb-2 block">Security Code</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="securityCode"
                                        value={payment.securityCode}
                                        onChange={handlePaymentChange}
                                        className={`${inputClass(errors.securityCode)} pr-8`}
                                    />
                                    <Lock size={14} className="absolute right-3 top-1/2 mt-1.5 -translate-y-1/2 text-gray-300" />
                                </div>
                                {errors.securityCode && <p className="text-red-500 text-[14px] font-normal poppins mt-1">{errors.securityCode}</p>}
                            </div>
                        </div>

                        <div className="space-y-3 pt-4">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 ${payment.agreeTerms ? 'bg-emerald-400 border-emerald-400' : errors.agreeTerms ? 'border-red-500' : 'border-gray-300 group-hover:border-emerald-400'}`}>
                                    {payment.agreeTerms && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                <input type="checkbox" name="agreeTerms" checked={payment.agreeTerms || false} onChange={handlePaymentChange} className="hidden" />
                                <span className={`text-[14px] font-normal poppins ${errors.agreeTerms ? 'text-red-500' : 'text-[#5F5F6D]'} underline decoration-gray-400 underline-offset-2`}>You agree to the <b>Terms Conditions</b> and Privacy Policy.</span>
                            </label>

                            <label className="flex items-start gap-3 cursor-pointer group">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 ${payment.agreePhotos ? 'bg-emerald-400 border-emerald-400' : 'border-gray-300 group-hover:border-emerald-400'}`}>
                                    {payment.agreePhotos && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                <input type="checkbox" name="agreePhotos" checked={payment.agreePhotos || false} onChange={handlePaymentChange} className="hidden" />
                                <span className="text-[14px] font-normal poppins text-[#5F5F6D] underline decoration-gray-400 underline-offset-2">You provide consent for your child to be included in photos.</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
