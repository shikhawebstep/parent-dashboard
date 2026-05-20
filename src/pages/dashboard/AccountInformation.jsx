import React, { useEffect, useState } from "react";
import Loader from "../../components/Loader";
import ParentProfile from "../../components/profile/ParentProfile";
import StudentProfile from "../../components/profile/StudentProfile";
import Skills from "../../components/profile/Skills";
import Feedback from "../../components/profile/Feedback";
import ServiceHistory from "../../components/profile/ServiceHistory";
import { useProfile } from "../../context/ProfileContext";

const serviceTabs = [
  { name: "Weekly Classes", serviceType: "weekly class membership" },
  { name: "Holiday Camps", serviceType: "holiday camp" },
  { name: "One-to-One", serviceType: "one to one" },
  { name: "Birthday Party", serviceType: "birthday party" },
];

const subTabs = [
  { name: "Parent Profile" },
  { name: "Child's Profile" },
  { name: "Service History" },
  { name: "Feedback" },
  { name: "Skills tracker" },
];

const AccountInformation = () => {
  const { fetchProfileData, loading } = useProfile();

  const [activeServiceTab, setActiveServiceTab] = useState(() => {
    return localStorage.getItem("activeServiceTab") || "Weekly Classes";
  });

  const [activeSubTab, setActiveSubTab] = useState(() => {
    return localStorage.getItem("activeAccountTab") || "Parent Profile";
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  useEffect(() => {
    localStorage.setItem("activeServiceTab", activeServiceTab);
  }, [activeServiceTab]);

  useEffect(() => {
    localStorage.setItem("activeAccountTab", activeSubTab);
  }, [activeSubTab]);

  if (loading) {
    return <Loader />;
  }

  const currentServiceType = serviceTabs.find(
    (t) => t.name === activeServiceTab
  )?.serviceType;

  const renderSubComponent = () => {
    switch (activeSubTab) {
      case "Parent Profile":
        return <ParentProfile activeServiceType={currentServiceType} />;

      case "Child's Profile":
        return <StudentProfile activeServiceType={currentServiceType} />;

      case "Service History":
        return <ServiceHistory activeServiceType={currentServiceType} />;

      case "Feedback":
        return <Feedback activeServiceType={currentServiceType} />;

      case "Skills tracker":
        return <Skills activeServiceType={currentServiceType} />;

      default:
        return null;
    }
  };

  return (
    <div className="relative space-y-6 lg:p-6 p-4">

      {/* Service Dropdown */}
      <div className="flex flex-col gap-2">

        <label className="text-[15px] font-semibold text-[#111827]">
          Select Service
        </label>

        <div className="relative w-full lg:w-[320px]">

          <select
            value={activeServiceTab}
            onChange={(e) => setActiveServiceTab(e.target.value)}
            className="w-full appearance-none rounded-2xl border border-[#E5EAF2] bg-white px-5 py-4 pr-12 text-[15px] font-medium text-[#111827] shadow-sm outline-none transition-all duration-300 focus:border-[#042C89] focus:ring-4 focus:ring-[#042C89]/10"
          >
            {serviceTabs.map((tab) => (
              <option key={tab.name} value={tab.name}>
                {tab.name}
              </option>
            ))}
          </select>

          {/* Custom Arrow */}
          <div className="pointer-events-none absolute right-4 top-9  -translate-y-1/2">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 9L12 15L18 9"
                stroke="#6B7280"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="overflow-x-auto scrollbar-hide border-b border-[#E5EAF2]">
        <div className="flex w-max items-center gap-8 px-1">

          {subTabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveSubTab(tab.name)}
              className={`relative whitespace-nowrap py-3 text-[15px] font-medium transition-all duration-300
              
              ${activeSubTab === tab.name
                  ? "text-[#042C89]"
                  : "text-[#6B7280] hover:text-[#042C89]"
                }`}
            >
              {tab.name}

              {activeSubTab === tab.name && (
                <span className="absolute bottom-0 left-0 h-[3px] w-full rounded-full bg-[#042C89]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="lg:mt-6">
        {renderSubComponent()}
      </div>
    </div>
  );
};

export default AccountInformation;