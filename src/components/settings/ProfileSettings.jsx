import React, { useState, useRef, useEffect } from "react";
import { User, Camera, Mail, Phone, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useProfile } from "../../context/ProfileContext";

const ProfileSettings = () => {
    const API_URL = import.meta.env.VITE_API_BASE_URL;
    const { profile, fetchProfileData } = useProfile();

    // ✅ Safe accessor — avoids crash if profile is null on first render
    const parentData = profile?.accountInfo ?? {};

    // ✅ formData always starts as a proper object — inputs are always controlled
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
    });

    // ✅ profileImage starts with fallback — never reads from possibly-null parentData
    const [profileImage, setProfileImage] = useState("/assets/user.png");

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageUploading, setImageUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState(null);

    const fileInputRef = useRef(null);

    // ✅ Fetch once on mount only
    useEffect(() => {
        fetchProfileData();
    }, []);

    // ✅ Sync form + image when profile loads — [profile] dep prevents infinite loop
    useEffect(() => {
        if (!profile?.accountInfo) return;

        const d = profile.accountInfo;
        setFormData({
            firstName: d.firstName ?? "",
            lastName: d.lastName ?? "",
            email: d.email ?? "",
            phone: d.phoneNumber ?? d.phone ?? "",
        });
        setProfileImage(
            d.profile || d.avatar || d.profileImage || "/assets/user.png"
        );
    }, [profile]);

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleImageSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!allowedTypes.includes(file.type)) {
            setStatus({ type: "error", message: "Please select a valid image (JPG, PNG, WEBP, GIF)." });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setStatus({ type: "error", message: "Image must be smaller than 5MB." });
            return;
        }

        setImageFile(file);
        setStatus(null);

        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        setSaving(true);
        setStatus(null);

        try {
            const token = localStorage.getItem("parentToken") ?? "";

            const payload = new FormData();
            payload.append("firstName", formData.firstName);
            payload.append("lastName", formData.lastName);
            payload.append("phoneNumber", formData.phone);
            if (imageFile) {
                payload.append("profile", imageFile);
            }

            const response = await fetch(`${API_URL}api/parent/account-profile/update`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
                body: payload,
            });

            if (!response.ok) {
                // ✅ Safe JSON parse — avoids crash if error body isn't JSON
                const err = await response.json().catch(() => ({}));
                throw new Error(err.message || "Failed to update profile.");
            }

            const updated = await response.json().catch(() => ({}));

            const savedImage =
                updated?.profile ||
                updated?.profileImage ||
                updated?.imageUrl ||
                updated?.avatar ||
                profileImage;

            setProfileImage(savedImage);
            setImageFile(null);
            setImagePreview(null);

            // ✅ Re-fetch context so header/navbar also reflects new data
            await fetchProfileData();

            setStatus({ type: "success", message: "Profile updated successfully." });
        } catch (err) {
            setStatus({ type: "error", message: err.message || "Something went wrong. Please try again." });
        } finally {
            setSaving(false);
            setImageUploading(false);
        }
    };

    const displayImage = imagePreview || profileImage;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">

            {/* Avatar row */}
            <div className="flex items-center gap-6">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                        <img
                            src={displayImage}
                            alt="Profile"
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = "/assets/user.png"; }}
                        />
                    </div>

                    {imageUploading && (
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                            <Loader2 size={24} className="text-white animate-spin" />
                        </div>
                    )}

                    {!imageUploading && (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-0 right-0 p-2 bg-[#00A6E3] rounded-full text-white border-2 border-white hover:bg-sky-600 transition-colors shadow-md"
                            title="Change profile photo"
                        >
                            <Camera size={16} />
                        </button>
                    )}

                    {!imageUploading && (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                        >
                            <span className="text-white text-xs font-semibold">Change</span>
                        </div>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={handleImageSelect}
                    />
                </div>

                <div>
                    <h3 className="text-xl font-bold text-[#282829]">Profile Image</h3>
                    <p className="text-[#717073] text-sm">Update your photo and personal details.</p>
                    {imagePreview && (
                        <p className="text-xs text-[#00A6E3] mt-1 font-medium">
                            New photo selected — save to apply.
                        </p>
                    )}
                </div>
            </div>

            {/* Form fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[14px] font-semibold text-[#282829]">First Name</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#717073]" size={18} />
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
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#717073]" size={18} />
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
                    <label className="text-[14px] font-semibold text-[#282829]">
                        Email Address
                        <span className="ml-2 text-[11px] font-normal text-[#717073] bg-[#F0F0F0] px-2 py-0.5 rounded-full">
                            Cannot be changed
                        </span>
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#BDBCBF]" size={18} />
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            disabled
                            className="w-full pl-12 pr-4 py-3 bg-[#F5F5F5] border border-[#E2E1E5] rounded-[14px] font-medium text-[#BDBCBF] cursor-not-allowed select-none"
                            placeholder="Email address"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[14px] font-semibold text-[#282829]">Phone Number</label>
                    <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#717073]" size={18} />
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

            {status && (
                <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-[12px] text-sm font-medium ${status.type === "success"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-600 border border-red-200"
                        }`}
                >
                    {status.type === "success"
                        ? <CheckCircle size={16} className="shrink-0" />
                        : <AlertCircle size={16} className="shrink-0" />
                    }
                    {status.message}
                </div>
            )}

            <div className="flex justify-end pt-4">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-[#00A6E3] hover:bg-sky-600 disabled:opacity-60 disabled:cursor-not-allowed text-white px-8 py-3 rounded-[14px] font-bold transition-all shadow-md active:scale-95"
                >
                    {saving && <Loader2 size={16} className="animate-spin" />}
                    {saving ? "Saving…" : "Save Changes"}
                </button>
            </div>
        </div>
    );
};

export default ProfileSettings;