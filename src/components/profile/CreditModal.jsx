import React from 'react';
import { X } from 'lucide-react';

const CreditModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-[550px] max-h-[90vh] overflow-y-auto rounded-[20px] p-0 relative shadow-xl mx-4">
                {/* Header */}
                <div className="px-6 py-5 flex items-center justify-between relative border-b border-gray-100">
                    <h2 className="text-[20px] font-bold text-[#191919] w-full text-center gilory">
                        Credits
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors absolute right-6"
                    >
                        <X size={20} className="text-[#333]" strokeWidth={1.5} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 text-center">
                    <div className="mb-6">
                        <img src="/assets/points.png" alt="Credits" className="w-20 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-[#042C89]">600 Points</h3>
                        <p className="text-gray-500 mt-2">
                            Total credits collected from your bookings.
                        </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 text-left space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Referral Bonus</span>
                            <span className="font-semibold text-green-600">+100</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Booking Reward</span>
                            <span className="font-semibold text-green-600">+500</span>
                        </div>
                    </div>

                    <div className="mt-8">
                        <button
                            onClick={onClose}
                            className="w-full py-3.5 rounded-xl bg-[#042C89] text-white font-semibold hover:bg-blue-900 transition-colors gilory"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreditModal;
