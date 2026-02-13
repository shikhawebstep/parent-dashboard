import React, { useState } from "react";
import ProfileSettings from "../../components/settings/ProfileSettings";
import NotificationSettings from "../../components/settings/NotificationSettings";
import SecuritySettings from "../../components/settings/SecuritySettings";

const tabs = [
    { id: "profile", name: "Profile Settings" },
    { id: "notifications", name: "Notifications" },
    { id: "security", name: "Security" },
];

const Settings = () => {
    const [activeTab, setActiveTab] = useState("profile");

    const renderContent = () => {
        switch (activeTab) {
            case "profile":
                return <ProfileSettings />;
            case "notifications":
                return <NotificationSettings />;
            case "security":
                return <SecuritySettings />;
            default:
                return <ProfileSettings />;
        }
    };

    return (
        <div className="lg:p-6 p-3 relative">
            {/* Header section could be added here if needed, but Layout usually handles it */}

            <div className="flex lg:w-max items-center overflow-x-auto bg-white p-2 gap-1 lg:rounded-[14px] mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-max relative flex-1 whitespace-nowrap md:px-6 px-3 2xl:text-[18px] lg:text-[16px] text-[15px] font-semibold md:py-3 py-2 rounded-[14px] transition-all ${activeTab === tab.id
                                ? "bg-[#042C89] shadow-lg text-white"
                                : "text-[#717073] hover:text-[#282829] hover:bg-gray-50"
                            }`}
                    >
                        {tab.name}
                    </button>
                ))}
            </div>

            <div className="bg-white p-6 lg:p-10 rounded-[28px] border border-[#E2E1E5] shadow-sm">
                {renderContent()}
            </div>
        </div>
    );
};

export default Settings;
