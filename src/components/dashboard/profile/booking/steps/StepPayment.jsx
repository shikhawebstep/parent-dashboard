import { Lock } from "lucide-react";
import { useStep } from "../context/StepContext";

export default function StepPayment() {
    const { formData, setFormData, errors, clearError } = useStep();

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

    const payment = formData.payment || {};
    const inputClass = (hasError) =>
        `w-full border-b ${hasError ? 'border-red-500' : 'border-gray-200'} py-2 text-sm focus:border-[#0496FF] outline-none transition-colors`;


    return (
        <div className="w-full max-w-5xl mx-auto py-8">
            <h2 className="text-[#191919] font-bold text-2xl mb-8 text-center">
                Payment
            </h2>

            <div className="flex flex-col lg:flex-row gap-8">

                {/* Left: Summary Panel */}
                <div className="w-full lg:w-1/3 bg-[#F0F4FF] rounded-2xl p-6 space-y-6">
                    <h3 className="text-[#042C89] font-bold text-lg">Summary</h3>

                    <div>
                        <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-[#042C89]">12 Month Plan</span>
                            <span className="font-bold text-[#191919]">£45.00</span>
                        </div>
                        <div className="flex justify-between items-start">
                            <div className="text-xs text-gray-500 space-y-1">
                                <p>2 Student</p>
                                <p>Start Date: 17th Aug 2023</p>
                                <p>First monthly payment: 1st Sep 2023</p>
                            </div>
                            <span className="text-[10px] text-gray-400">per month</span>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                        <h4 className="font-bold text-[#042C89] text-sm mb-2">Samba Soccer Schools</h4>
                        <div className="flex justify-between text-xs">
                            <span>Joining Fee</span>
                            <span className="font-bold">£35.00</span>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                        <h4 className="font-bold text-[#042C89] text-sm mb-2">Pro-rata lessons</h4>
                        <div className="flex justify-between text-xs mb-1">
                            <span>Number of lessons</span>
                            <span className="font-bold">2</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span>Fee</span>
                            <span className="font-bold">£45.00</span>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4 flex justify-between items-center text-[#042C89]">
                        <span className="font-bold">Total to pay now</span>
                        <span className="font-bold text-xl">£42.89</span>
                    </div>
                </div>


                {/* Right: Direct Debit Form */}
                <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-6 lg:p-8">
                    <h3 className="font-bold text-lg text-[#191919] mb-2">Set up your direct debit</h3>
                    <p className="text-xs text-gray-400 mb-8 leading-relaxed">
                        Your regular Direct Debit payments will be collected from this account starting from the 1st of next month.
                    </p>

                    <div className="space-y-6">
                        <div>
                            <label className="text-sm font-bold text-[#191919] mb-2 block">Account Holder Name</label>
                            <input
                                type="text"
                                name="accountHolder"
                                value={payment.accountHolder || ""}
                                onChange={handlePaymentChange}
                                className={inputClass(errors.accountHolder)}
                            />
                            {errors.accountHolder && <p className="text-red-500 text-xs mt-1">{errors.accountHolder}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <label className="text-sm font-bold text-[#191919] mb-2 block">Sort Code</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="sortCode"
                                        value={payment.sortCode || ""}
                                        onChange={handlePaymentChange}
                                        className={`${inputClass(errors.sortCode)} pr-8`}
                                    />
                                    <Lock size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300" />
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">Must be 6 digits long</p>
                                {errors.sortCode && <p className="text-red-500 text-xs mt-1">{errors.sortCode}</p>}
                            </div>
                            <div>
                                <label className="text-sm font-bold text-[#191919] mb-2 block">Account Number</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="accountNumber"
                                        value={payment.accountNumber || ""}
                                        onChange={handlePaymentChange}
                                        className={`${inputClass(errors.accountNumber)} pr-8`}
                                    />
                                    <Lock size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300" />
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">Must be 8 digits long</p>
                                {errors.accountNumber && <p className="text-red-500 text-xs mt-1">{errors.accountNumber}</p>}
                            </div>
                        </div>

                        <div className="space-y-3 pt-4">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 ${payment.agreeTerms ? 'bg-emerald-400 border-emerald-400' : errors.agreeTerms ? 'border-red-500' : 'border-gray-300 group-hover:border-emerald-400'}`}>
                                    {payment.agreeTerms && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                <input type="checkbox" name="agreeTerms" checked={payment.agreeTerms || false} onChange={handlePaymentChange} className="hidden" />
                                <span className={`text-xs ${errors.agreeTerms ? 'text-red-500' : 'text-gray-500'} underline decoration-gray-400 underline-offset-2`}>You agree to the Terms Conditions and Privacy Policy.</span>
                            </label>

                            <label className="flex items-start gap-3 cursor-pointer group">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 ${payment.agreePhotos ? 'bg-emerald-400 border-emerald-400' : 'border-gray-300 group-hover:border-emerald-400'}`}>
                                    {payment.agreePhotos && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                <input type="checkbox" name="agreePhotos" checked={payment.agreePhotos || false} onChange={handlePaymentChange} className="hidden" />
                                <span className="text-xs text-gray-500 underline decoration-gray-400 underline-offset-2">You provide consent for your child to be included in photos.</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
