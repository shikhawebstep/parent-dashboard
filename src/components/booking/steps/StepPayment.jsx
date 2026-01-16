import { Lock } from "lucide-react";
import { useStep } from "../../../context/StepContext";

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
        `w-full mainShadow rounded-lg ${hasError ? 'border border-red-500' : 'border-gray-200'} py-2.5 px-5 text-sm focus:border-[#0496FF] outline-none transition-colors`;


    return (
        <div className="w-full max-w-5xl mx-auto py-8">
            <h2 className="text-[#191919] font-bold poppins text-2xl mb-8 text-center">
                Payment
            </h2>

            <div className="border border-[#DBCACA] overflow-hidden  rounded-[19px] flex flex-col items-center lg:flex-row gap-8">

                {/* Left: Summary Panel */}
                <div className="w-full lg:w-1/3 bg-[#F1F4FC] rounded-[20px] p-6 space-y-4">
                    <h3 className="text-[#042C89] font-bold poppins text-[20px] mt-6">Summary</h3>

                    <div>
                        <div className="flex justify-between items-start mb-3">
                            <span className="font-bold poppins text-[#042C89]">12 Month Plan</span>
                            <span className="font-bold poppins text-[#191919]">£45.00</span>
                        </div>
                        <div className="">
                            <div className="text-[14px] poppins text-gray-500 space-y-1">
                                <div className="flex justify-between">
                                    <span className="poppins font-medium text-[#34353B]">2 Student</span>
                                    <span className="text-[12px] text-[#34353B] poppins">per month</span>

                                </div>
                                <p className="poppins"><span className="poppins font-medium text-[#34353B]">Start Date: </span>17th Aug 2023</p>
                                <p className="poppins"><span className="poppins font-medium text-[#34353B]">First monthly payment: </span> 1st Sep 2023</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-[#C3C4CC] pt-4">
                        <h4 className="font-semibold poppins text-[#042C89] text-[16px] mb-2">Samba Soccer Schools</h4>
                        <div className="flex justify-between text-[14px] font-medium poppins">
                            <span className="poppins">Joining Fee</span>
                            <span className="font-bold poppins">£35.00</span>
                        </div>
                    </div>

                    <div className="border-t border-[#C3C4CC] pt-4">
                        <h4 className="font-semibold poppins text-[#042C89] text-[16px] mb-2">Pro-rata lessons</h4>
                        <div className="flex justify-between text-[14px] font-medium poppins mb-1">
                            <span className="poppins">Number of lessons</span>
                            <span className="font-bold poppins">2</span>
                        </div>
                        <div className="flex justify-between text-[14px] font-medium poppins">
                            <span className="poppins">Fee</span>
                            <span className="font-bold poppins">£45.00</span>
                        </div>
                    </div>

                    <div className="border-t border-[#C3C4CC] pt-4 flex justify-between items-center text-[#042C89]">
                        <span className="font-bold poppins">Total to pay now</span>
                        <span className="font-bold poppins text-xl">£42.89</span>
                    </div>
                </div>


                {/* Right: Direct Debit Form */}
                <div className="flex-1 bg-white  rounded-[20px] p-6 lg:ps-0 lg:p-8">
                    <div className="flex justify-between">
                        <div>
                            <h3 className="font-bold poppins text-lg text-[#191919] mb-2">Set up your direct debit</h3>
                            <p className="text-[14px]  poppins text-gray-400 mb-8 font-normal">
                                Your regular Direct Debit payments will be collected <br /> from this account starting from the 1st of next month.
                            </p>
                        </div>
                        <div className="w-[100px]">
                            <img src="/assets/debit.png" alt="" />
                        </div>


                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="text-[14px] font-normal poppins text-[#191919] mb-2 block">Account Holder Name</label>
                            <input
                                type="text"
                                name="accountHolder"
                                value={payment.accountHolder || ""}
                                onChange={handlePaymentChange}
                                className={inputClass(errors.accountHolder)}
                            />
                            {errors.accountHolder && <p className="text-red-500 text-[14px] font-medium poppins mt-1">{errors.accountHolder}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <label className="text-[14px] font-normal poppins text-[#191919] mb-2 block">Sort Code</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="sortCode"
                                        value={payment.sortCode || ""}
                                        onChange={handlePaymentChange}
                                        className={`${inputClass(errors.sortCode)} pr-8`}
                                    />
                                    <Lock size={14} className="absolute right-3 top-6.5 -translate-y-1/2 text-gray-300" />
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">Must be 6 digits long</p>
                                {errors.sortCode && <p className="text-red-500 text-[14px] font-medium poppins mt-1">{errors.sortCode}</p>}
                            </div>
                            <div>
                                <label className="text-[14px] font-normal poppins text-[#191919] mb-2 block">Account Number</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="accountNumber"
                                        value={payment.accountNumber || ""}
                                        onChange={handlePaymentChange}
                                        className={`${inputClass(errors.accountNumber)} pr-8`}
                                    />
                                    <Lock size={14} className="absolute right-3 top-6.5 -translate-y-1/2 text-gray-300" />
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">Must be 8 digits long</p>
                                {errors.accountNumber && <p className="text-red-500 text-[14px] font-medium poppins mt-1">{errors.accountNumber}</p>}
                            </div>
                        </div>

                        <div className="space-y-3 pt-4">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 ${payment.agreeTerms ? 'bg-emerald-400 border-emerald-400' : errors.agreeTerms ? 'border-red-500' : 'border-gray-300 group-hover:border-emerald-400'}`}>
                                    {payment.agreeTerms && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                <input type="checkbox" name="agreeTerms" checked={payment.agreeTerms || false} onChange={handlePaymentChange} className="hidden" />
                                <span className={`text-[14px] font-medium poppins ${errors.agreeTerms ? 'text-red-500' : 'text-gray-500'} underline decoration-gray-400 underline-offset-2`}>You agree to the Terms Conditions and Privacy Policy.</span>
                            </label>

                            <label className="flex items-start gap-3 cursor-pointer group">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 ${payment.agreePhotos ? 'bg-emerald-400 border-emerald-400' : 'border-gray-300 group-hover:border-emerald-400'}`}>
                                    {payment.agreePhotos && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                <input type="checkbox" name="agreePhotos" checked={payment.agreePhotos || false} onChange={handlePaymentChange} className="hidden" />
                                <span className="text-[14px] font-medium poppins text-gray-500 underline decoration-gray-400 underline-offset-2">You provide consent for your child to be included in photos.</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
