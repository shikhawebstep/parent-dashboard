import React, { useState } from 'react';
import { X, Info } from 'lucide-react';

export default function CancelMembershipModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl relative overflow-hidden max-h-[85vh] flex flex-col">
                {/* Header */}
                <div className="p-6 pb-2 shrink-0 border-b border-[#EBEBEB]">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Request to cancel membership</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="px-8 pb-8 space-y-6 mt-7 overflow-y-auto">
                    {/* Warning Card */}
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 text-red-500">
                                <Info size={20} className="fill-red-500 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">You currently have 6 more months left on your membership</h3>
                            </div>
                        </div>

                        <div className="">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>6 of 12 Months</span>
                                <span className="font-semibold">75%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 w-[75%]" />
                            </div>
                        </div>

                        <div className=" text-xs text-gray-500">
                            Cancellations are not permitted during the term of your membership.
                            <br />
                            <a href="#" className="underline">Please see full terms and conditions here.</a>
                        </div>
                    </div>

                    {/* Exceptional Circumstances */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-900">Exceptional Circumstances</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Cancellations with one months notices are permitted under exceptional circumstances.
                        </p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            If your reason is unexceptional, you still may cancel your membership however this would involve a payout of the remaining 6 months of your membership.
                        </p>
                    </div>

                    {/* Form */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-[#1B1B1E]">Please provide details of your request</label>
                        <textarea
                            className="w-full bg-[#F9FAFB] h-32 p-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder:text-gray-400"
                            placeholder="Enter a description..."
                        ></textarea>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center pt-2">
                        <p className="text-sm text-[#4B4B56] font-semibold">Our team will get in touch shortly.</p>
                        <button className="bg-[#237FEA] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                            Send request
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
