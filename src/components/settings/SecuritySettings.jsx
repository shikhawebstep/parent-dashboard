import React, { useState } from "react";
import { Lock, Shield, Eye, EyeOff } from "lucide-react";

const SecuritySettings = () => {
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const togglePassword = (key) => {
        setShowPassword({ ...showPassword, [key]: !showPassword[key] });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="max-w-2xl">
                <h3 className="text-xl font-bold text-[#282829] mb-6 flex items-center gap-2">
                    <Lock size={20} className="text-[#00A6E3]" />
                    Change Password
                </h3>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[14px] font-semibold text-[#282829]">Current Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-8/12 -translate-y-1/2 text-[#717073]" size={18} />
                            <input
                                type={showPassword.current ? "text" : "password"}
                                className="w-full pl-12 pr-12 py-3 bg-[#FAFAFA] border border-[#E2E1E5] rounded-[14px] focus:outline-none focus:border-[#00A6E3] transition-colors font-medium text-[#282829]"
                                placeholder="Enter current password"
                            />
                            <button
                                onClick={() => togglePassword('current')}
                                className="absolute right-4 top-8/12 -translate-y-1/2 text-[#717073] hover:text-[#282829]"
                            >
                                {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[14px] font-semibold text-[#282829]">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-8/12 -translate-y-1/2 text-[#717073]" size={18} />
                                <input
                                    type={showPassword.new ? "text" : "password"}
                                    className="w-full pl-12 pr-12 py-3 bg-[#FAFAFA] border border-[#E2E1E5] rounded-[14px] focus:outline-none focus:border-[#00A6E3] transition-colors font-medium text-[#282829]"
                                    placeholder="Enter new password"
                                />
                                <button
                                    onClick={() => togglePassword('new')}
                                    className="absolute right-4 top-8/12 -translate-y-1/2 text-[#717073] hover:text-[#282829]"
                                >
                                    {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[14px] font-semibold text-[#282829]">Confirm New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-8/12 -translate-y-1/2 text-[#717073]" size={18} />
                                <input
                                    type={showPassword.confirm ? "text" : "password"}
                                    className="w-full pl-12 pr-12 py-3 bg-[#FAFAFA] border border-[#E2E1E5] rounded-[14px] focus:outline-none focus:border-[#00A6E3] transition-colors font-medium text-[#282829]"
                                    placeholder="Confirm new password"
                                />
                                <button
                                    onClick={() => togglePassword('confirm')}
                                    className="absolute right-4 top-8/12 -translate-y-1/2 text-[#717073] hover:text-[#282829]"
                                >
                                    {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between p-4 bg-[#EBF2FF] border border-[#4B84FF]/20 rounded-[20px]">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-[#4B84FF]/20 shadow-sm text-[#4B84FF]">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-[#282829]">Two-Factor Authentication</h4>
                            <p className="text-[13px] text-[#717073]">Add an extra layer of security to your account.</p>
                        </div>
                    </div>
                    <button className="bg-[#4B84FF] hover:bg-[#3D71E6] text-white px-6 py-2 rounded-full font-bold transition-all text-sm">
                        Enable
                    </button>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button className="bg-[#00A6E3] hover:bg-sky-600 text-white px-8 py-3 rounded-[14px] font-bold transition-all shadow-md active:scale-95">
                    Update Security
                </button>
            </div>
        </div>
    );
};

export default SecuritySettings;
