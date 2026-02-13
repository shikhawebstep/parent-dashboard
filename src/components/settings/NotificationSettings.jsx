import React, { useState } from "react";
import { Bell, Mail, Smartphone, Globe } from "lucide-react";

const NotificationSettings = () => {
    const [settings, setSettings] = useState({
        emailClasses: true,
        emailBookings: true,
        emailNewsletter: false,
        smsBookings: true,
        pushAlerts: true,
    });

    const toggle = (key) => {
        setSettings({ ...settings, [key]: !settings[key] });
    };

    const NotificationItem = ({ title, description, icon: Icon, stateKey }) => (
        <div className="flex items-center justify-between p-4 bg-[#FAFAFA] border border-[#E2E1E5] rounded-[20px] transition-all hover:border-[#00A6E3]/30">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-[#E2E1E5] shadow-sm">
                    <Icon size={20} className="text-[#00A6E3]" />
                </div>
                <div>
                    <h4 className="font-bold text-[#282829]">{title}</h4>
                    <p className="text-[13px] text-[#717073]">{description}</p>
                </div>
            </div>
            <button
                onClick={() => toggle(stateKey)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${settings[stateKey] ? "bg-[#00D084]" : "bg-gray-200"}`}
            >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings[stateKey] ? "translate-x-6" : "translate-x-1"}`} />
            </button>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div>
                <h3 className="text-xl font-bold text-[#282829] mb-6 flex items-center gap-2">
                    <Mail size={20} className="text-[#00A6E3]" />
                    Email Notifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
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

            <div className="pt-4">
                <h3 className="text-xl font-bold text-[#282829] mb-6 flex items-center gap-2">
                    <Smartphone size={20} className="text-[#00A6E3]" />
                    Mobile & App Notifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
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

            <div className="flex justify-end pt-4">
                <button className="bg-[#00A6E3] hover:bg-sky-600 text-white px-8 py-3 rounded-[14px] font-bold transition-all shadow-md active:scale-95">
                    Save Preferences
                </button>
            </div>
        </div>
    );
};

export default NotificationSettings;
