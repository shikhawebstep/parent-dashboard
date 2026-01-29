import React from 'react';
import { X } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, payments, payment }) => {
    if (!isOpen) return null;

    // Combine single payment and payments array into one list for display
    const allPayments = [];
    if (payments && Array.isArray(payments)) {
        allPayments.push(...payments);
    }
    if (payment && !Array.isArray(payment)) {
        allPayments.push(payment);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-[650px] max-h-[90vh] overflow-y-auto rounded-[20px] p-0 relative shadow-xl mx-4">
                {/* Header */}
                <div className="px-6 py-5 flex items-center justify-between relative border-b border-gray-100">
                    <h2 className="text-[20px] font-bold text-[#191919] w-full text-center gilory">
                        Payment History
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors absolute right-6"
                    >
                        <X size={20} className="text-[#333]" strokeWidth={1.5} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {allPayments.length > 0 ? (
                        <div className="space-y-4">
                            {allPayments.map((p, index) => (
                                <div key={p.id || index} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-bold text-[#191919] text-sm">
                                                {p.description || "Payment"}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {p.createdAt ? new Date(p.createdAt).toLocaleString("en-IN") :
                                                    p.paymentDate ? new Date(p.paymentDate).toLocaleString("en-IN") : "-"}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${(p.paymentStatus === 'paid' || p.paymentStatus === 'active' || p.status === 'succeeded')
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {p.paymentStatus || p.status || "Unknown"}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <p className="text-gray-500 text-xs">Amount</p>
                                            <p className="font-semibold text-[#191919]">
                                                {p.currency?.toUpperCase()} {p.amount || p.price}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs">Transaction ID</p>
                                            <p className="font-semibold text-[#191919] break-all">
                                                {p.gatewayResponse?.id || p.stripePaymentIntentId || p.merchantRef || "-"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-gray-500">
                            No payment records found.
                        </div>
                    )}

                    <div className="mt-6">
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

export default PaymentModal;
