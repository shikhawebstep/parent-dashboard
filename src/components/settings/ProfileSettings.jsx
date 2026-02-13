import React, { useState } from "react";
import { User, Camera, Mail, Phone } from "lucide-react";

const ProfileSettings = () => {
    const parentData = JSON.parse(localStorage.getItem("parentData")) || {};
    const [formData, setFormData] = useState({
        firstName: parentData.firstName || "",
        lastName: parentData.lastName || "",
        email: parentData.email || "",
        phone: parentData.phone || "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-6">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                        <img
                            src="/assets/user.png"
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <button className="absolute bottom-0 right-0 p-2 bg-[#00A6E3] rounded-full text-white border-2 border-white hover:bg-sky-600 transition-colors shadow-md">
                        <Camera size={16} />
                    </button>
                    <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <span className="text-white text-xs font-semibold">Change</span>
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-[#282829]">Profile Image</h3>
                    <p className="text-[#717073] text-sm">Update your photo and personal details.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[14px] font-semibold text-[#282829]">First Name</label>
                    <div className="relative">
                        <User className="absolute left-4 top-8/12 -translate-y-1/2 text-[#717073]" size={18} />
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-3 bg-[#FAFAFA] border border-[#E2E1E5] rounded-[14px] focus:outline-none focus:border-[#00A6E3] transition-colors font-medium text-[#282829]"
                            placeholder="Enter first name"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[14px] font-semibold text-[#282829]">Last Name</label>
                    <div className="relative">
                        <User className="absolute left-4 top-8/12 -translate-y-1/2 text-[#717073]" size={18} />
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-3 bg-[#FAFAFA] border border-[#E2E1E5] rounded-[14px] focus:outline-none focus:border-[#00A6E3] transition-colors font-medium text-[#282829]"
                            placeholder="Enter last name"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[14px] font-semibold text-[#282829]">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-8/12 -translate-y-1/2 text-[#717073]" size={18} />
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-3 bg-[#FAFAFA] border border-[#E2E1E5] rounded-[14px] focus:outline-none focus:border-[#00A6E3] transition-colors font-medium text-[#282829]"
                            placeholder="Enter email"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[14px] font-semibold text-[#282829]">Phone Number</label>
                    <div className="relative">
                        <Phone className="absolute left-4 top-8/12 -translate-y-1/2 text-[#717073]" size={18} />
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-3 bg-[#FAFAFA] border border-[#E2E1E5] rounded-[14px] focus:outline-none focus:border-[#00A6E3] transition-colors font-medium text-[#282829]"
                            placeholder="Enter phone number"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button className="bg-[#00A6E3] hover:bg-sky-600 text-white px-8 py-3 rounded-[14px] font-bold transition-all shadow-md active:scale-95">
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default ProfileSettings;
