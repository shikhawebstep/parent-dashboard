import React from 'react';
import { X } from 'lucide-react';

const AddFeedbackModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-[550px] max-h-[90vh] overflow-y-auto rounded-[20px] p-0 relative shadow-xl mx-4">
                {/* Header */}
                <div className="px-6 py-5 flex items-center justify-between relative border-b border-gray-100">
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors absolute left-6"
                    >
                        <X size={20} className="text-[#333]" strokeWidth={1.5} />
                    </button>
                    <h2 className="text-[20px] font-bold text-[#191919] w-full text-center gilory">
                        Add Feedback
                    </h2>
                </div>

                {/* Body */}
                <div className="p-8 space-y-5">
                    <div>
                        <label className="block text-[15px] font-medium text-[#191919] mb-2.5 gilory">
                            Please select the classes you wish to add feedback for
                        </label>
                        <div className="relative">
                            <select className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-gray-500 focus:outline-none focus:border-blue-500 bg-white appearance-none cursor-pointer text-sm font-medium gilory shadow-sm">
                                <option>Select</option>
                                <option>Mathematics</option>
                                <option>Science</option>
                                <option>English</option>
                            </select>
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[15px] font-medium text-[#191919] mb-2.5 gilory">
                            Did you have a positive or negative experience?
                        </label>
                        <div className="relative">
                            <select className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-gray-500 focus:outline-none focus:border-blue-500 bg-white appearance-none cursor-pointer text-sm font-medium gilory shadow-sm">
                                <option>Select</option>
                                <option>Positive</option>
                                <option>Negative</option>
                            </select>
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[15px] font-medium text-[#191919] mb-2.5 gilory">
                            Please select a category your feedback falls into
                        </label>
                        <div className="relative">
                            <select className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-gray-500 focus:outline-none focus:border-blue-500 bg-white appearance-none cursor-pointer text-sm font-medium gilory shadow-sm">
                                <option>Select</option>
                                <option>Teaching</option>
                                <option>Facilities</option>
                                <option>Other</option>
                            </select>
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[15px] font-medium text-[#191919] mb-2.5 gilory">
                            Notes
                        </label>
                        <textarea
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#333] focus:outline-none focus:border-blue-500 bg-[#F9FAFB] min-h-[120px] resize-none text-sm font-medium gilory shadow-sm"
                            placeholder=""
                        />
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3.5 rounded-xl border border-gray-200 text-[#5B6572] font-semibold hover:bg-gray-50 transition-colors gilory"
                        >
                            Cancel
                        </button>
                        <button
                            className="flex-1 py-3.5 rounded-xl bg-[#1B7AF9] text-white font-semibold hover:bg-blue-600 transition-colors shadow-blue-200 shadow-lg gilory"
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddFeedbackModal;
