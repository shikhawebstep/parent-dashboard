import React, { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import Select from 'react-select';
import { showError, showSuccess } from '../../../utils/swalHelper';

const RenewPackage = ({ isOpen, onClose, booking, onSuccess }) => {
    const [packages, setPackages] = useState([]);
    const [loadingPackages, setLoadingPackages] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        packageId: null,
        firstName: '',
        lastName: '',
        email: '',
        billingAddress: '',
        cardNumber: '',
        expiryDate: '',
        securityCode: '',
    });

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const resetForm = () => {
        setFormData({
            packageId: null,
            firstName: '',
            lastName: '',
            email: '',
            billingAddress: '',
            cardNumber: '',
            expiryDate: '',
            securityCode: '',
        });
    };

    // ✅ Fetch packages when modal opens
    useEffect(() => {
        if (!isOpen) return;

        const fetchPackages = async () => {
            setLoadingPackages(true);
            try {
                const token = localStorage.getItem("parentToken");

                const response = await fetch(`${API_URL}api/open/one-to-one/packages`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                const data = await response.json();

                if (!response.ok || data?.status === false) {
                    throw new Error(data?.message || "Failed to fetch packages");
                }

                setPackages(data?.data || []);
            } catch (error) {
                showError(error?.message || "Unable to fetch packages");
            } finally {
                setLoadingPackages(false);
            }
        };

        fetchPackages();
    }, [isOpen, API_URL]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const formatCardNumber = (val) => val.replace(/\D/g, "").slice(0, 16);
    const formatExpiry = (val) => {
        const digits = val.replace(/\D/g, "").slice(0, 4);
        if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
        return digits;
    };
    const formatCvc = (val) => val.replace(/\D/g, "").slice(0, 4);

    const isFormValid =
        formData.packageId &&
        formData.firstName.trim() &&
        formData.lastName.trim() &&
        formData.email.trim() &&
        formData.billingAddress.trim() &&
        formData.cardNumber.replace(/\D/g, "").length === 16 &&
        formData.expiryDate.length === 5 &&
        formData.securityCode.length >= 3;

    const handleSubmit = async () => {
        if (!isFormValid || !booking) return;

        setSubmitting(true);
        try {
            const token = localStorage.getItem("parentToken");

            const payload = {
                bookingId: booking?.id,
                packageId: formData.packageId,
                payment: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    billingAddress: formData.billingAddress,
                    cardNumber: formData.cardNumber.replace(/\s+/g, ""),
                    expiryDate: formData.expiryDate.replace("/", ""), // "12/26" -> "1226"
                    securityCode: formData.securityCode,
                },
            };

            const response = await fetch(`${API_URL}api/parent/one-to-one/renew`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok || data?.status === false) {
                throw new Error(data?.message || "Failed to renew package");
            }

            showSuccess(data?.message || "Package renewed successfully.");
            resetForm();
            onSuccess?.();
            onClose?.();
        } catch (error) {
            showError(error?.message || "Unable to renew the package.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const packageOptions = packages.map((pkg) => ({
        value: pkg.id,
        label: pkg.packageName || pkg.name,
    }));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="relative flex items-center justify-center border-b border-gray-100 px-6 py-5">
                    <button
                        type="button"
                        onClick={() => { resetForm(); onClose?.(); }}
                        className="absolute left-6 text-gray-700 hover:opacity-70"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                    <h2 className="text-lg font-semibold text-[#1E1E1E] md:text-xl">
                        Renew Package
                    </h2>
                </div>

                <div className="px-6 py-6 space-y-4">
                    <div>
                        <label className="block text-[15px] font-medium text-[#1E1E1E] mb-2">
                            Select Package
                        </label>
                        <div className="relative">
                            <select
                                value={formData.packageId || ""}
                                onChange={(e) => handleChange("packageId", e.target.value ? Number(e.target.value) : null)}
                                disabled={loadingPackages}
                                className="w-full appearance-none rounded-xl border border-gray-200 px-4 py-2.5 pr-10 text-[15px] text-gray-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#237FEA] disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                <option value="">
                                    {loadingPackages ? "Loading packages..." : "Select a package"}
                                </option>

                                {packages.map((pkg) => (
                                    <option key={pkg.id} value={pkg.id}>
                                        {pkg.packageName || pkg.name}
                                    </option>
                                ))}
                            </select>

                          
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[15px] font-medium text-[#1E1E1E] mb-1">First Name</label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => handleChange("firstName", e.target.value)}
                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-[15px] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#237FEA]"
                                placeholder="Enter first name"
                            />
                        </div>
                        <div>
                            <label className="block text-[15px] font-medium text-[#1E1E1E] mb-1">Last Name</label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => handleChange("lastName", e.target.value)}
                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-[15px] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#237FEA]"
                                placeholder="Enter last name"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[15px] font-medium text-[#1E1E1E] mb-1">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-[15px] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#237FEA]"
                            placeholder="Enter email"
                        />
                    </div>

                    <div>
                        <label className="block text-[15px] font-medium text-[#1E1E1E] mb-1">Billing Address</label>
                        <input
                            type="text"
                            value={formData.billingAddress}
                            onChange={(e) => handleChange("billingAddress", e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-[15px] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#237FEA]"
                            placeholder="Enter billing address"
                        />
                    </div>

                    <div>
                        <label className="block text-[15px] font-medium text-[#1E1E1E] mb-1">Card Number</label>
                        <input
                            type="text"
                            value={formData.cardNumber}
                            onChange={(e) => handleChange("cardNumber", formatCardNumber(e.target.value))}
                            maxLength={16}
                            inputMode="numeric"
                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-[15px] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#237FEA]"
                            placeholder="4242424242424242"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[15px] font-medium text-[#1E1E1E] mb-1">Expiry Date</label>
                            <input
                                type="text"
                                value={formData.expiryDate}
                                onChange={(e) => handleChange("expiryDate", formatExpiry(e.target.value))}
                                maxLength={5}
                                inputMode="numeric"
                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-[15px] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#237FEA]"
                                placeholder="MM/YY"
                            />
                        </div>
                        <div>
                            <label className="block text-[15px] font-medium text-[#1E1E1E] mb-1">Security Code</label>
                            <input
                                type="text"
                                value={formData.securityCode}
                                onChange={(e) => handleChange("securityCode", formatCvc(e.target.value))}
                                maxLength={4}
                                inputMode="numeric"
                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-[15px] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#237FEA]"
                                placeholder="CVC"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => { resetForm(); onClose?.(); }}
                            className="rounded-xl px-6 py-3 text-[15px] font-semibold text-[#717073] border border-[#717073] hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!isFormValid || submitting}
                            className={`flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-[15px] font-semibold text-white transition
                                ${isFormValid && !submitting
                                    ? "bg-[#237FEA] hover:bg-blue-700"
                                    : "cursor-not-allowed bg-[#237FEA]/50"
                                }`}
                        >
                            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {submitting ? "Processing..." : "Renew Package"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RenewPackage;