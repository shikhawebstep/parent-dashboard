import React, { useState } from "react";
import { Bell, Mail, Smartphone, Globe, Check } from "lucide-react";

const NotificationSettings = () => {
    const [settings, setSettings] = useState({
        emailClasses: true,
        emailBookings: true,
        emailNewsletter: false,
        smsBookings: true,
        pushAlerts: true,
    });

    const toggle = (key) => {
        setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const NotificationItem = ({ title, description, icon: Icon, stateKey }) => (
        <label className="flex items-start justify-between gap-4 rounded-2xl border border-[#E7E8EE] bg-white px-4 py-4 shadow-sm transition hover:border-[#00A6E3]/20 hover:shadow-md cursor-pointer">
            <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F3FAFF] ring-1 ring-[#DCEFFD]">
                    <Icon size={19} className="text-[#00A6E3]" />
                </div>

                <div className="min-w-0">
                    <h4 className="text-[15px] font-bold text-[#1F1F24]">{title}</h4>
                    <p className="mt-1 text-[13px] leading-5 text-[#717073]">{description}</p>
                </div>
            </div>

            <input
                type="checkbox"
                checked={settings[stateKey]}
                onChange={() => toggle(stateKey)}
                className="mt-1 h-5 w-5 appearance-none rounded-full border-2 border-[#CBD5E1] bg-white checked:border-[#00D084] checked:bg-[#00D084] focus:ring-4 focus:ring-[#00A6E3]/15 cursor-pointer"
            />
        </label>
    );

    return (
        <div className="space-y-6 rounded-[28px] border border-[#E7E8EE] bg-[#FBFCFE] p-4 sm:p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <div className="rounded-[24px] bg-gradient-to-r from-[#EAF7FF] to-[#F4FFFA] p-5 border border-[#DDEFF7]">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                        <Mail size={20} className="text-[#00A6E3]" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-[#1F1F24]">Notification settings</h3>
                        <p className="text-sm text-[#667085]">
                            Choose how you want to receive updates.
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <Mail size={16} className="text-[#00A6E3]" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#4B5563]">
                        Email notifications
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <NotificationItem
                        title="Class Updates"
                        description="Receive emails about new classes and schedule changes."
                        icon={Globe}
                        stateKey="emailClasses"
                    />
                    <NotificationItem
                        title="Booking Confirmations"
                        description="Instant email confirmation for your bookings."
                        icon={Bell}
                        stateKey="emailBookings"
                    />
                    <NotificationItem
                        title="Newsletter"
                        description="Periodic updates about new features and offers."
                        icon={Mail}
                        stateKey="emailNewsletter"
                    />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <Smartphone size={16} className="text-[#00A6E3]" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#4B5563]">
                        Mobile & app notifications
                    </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <NotificationItem
                        title="SMS Alerts"
                        description="Crucial updates delivered via text message."
                        icon={Smartphone}
                        stateKey="smsBookings"
                    />
                    <NotificationItem
                        title="Push Notifications"
                        description="Real-time alerts directly on your device."
                        icon={Bell}
                        stateKey="pushAlerts"
                    />
                </div>
            </div>

            <div className="flex justify-end pt-2">
                <button className="inline-flex items-center gap-2 rounded-xl bg-[#00A6E3] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-sky-600 active:scale-95">
                    <Check size={18} />
                    Save preferences
                </button>
            </div>
        </div>
    );
};

export default NotificationSettings;