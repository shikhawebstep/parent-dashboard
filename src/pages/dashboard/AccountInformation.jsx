import React, { useEffect, useState } from "react";
import Loader from "../../components/Loader";
import ParentProfile from "../../components/profile/ParentProfile";
import StudentProfile from "../../components/profile/StudentProfile";
import Skills from "../../components/profile/Skills";
import Feedback from "../../components/profile/Feedback";
import ServiceHistory from "../../components/profile/ServiceHistory";
import { useProfile } from "../../context/ProfileContext";
const tabs = [
  { name: "Parent Profile", component: <ParentProfile /> },
  { name: "Childs Profile", component: <StudentProfile /> },
  { name: "Service History", component: <ServiceHistory /> },
  { name: "Feedback", component: <Feedback /> },
  { name: "Skills tracker", component: <Skills /> },
];

const AccountInformation = () => {

  const { fetchProfileData, loading, } = useProfile();
  const [activeTab, setActiveTab] = useState(() => {
    const storedTab = localStorage.getItem("activeAccountTab");
    return storedTab && tabs.some(tab => tab.name === storedTab) ? storedTab : tabs[0].name;
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  useEffect(() => {
    localStorage.setItem("activeAccountTab", activeTab);
  }, [activeTab]);


  if (loading) {
    return <Loader />
  }

  return (
    <div className=" lg:p-6 relative">

      <div className="flex lg:w-max items-center overflow-x-auto bg-white p-2 gap-1 lg:rounded-[14px] ">

        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`w-max relative flex-1 whitespace-nowrap md:px-4 px-2 2xl:text-[18px] lg:text-[16px] text-[16px] font-semibold md:py-3 py-1.5 rounded-[14px] transition-all ${activeTab === tab.name
              ? "bg-[#042C89] shadow text-white "
              : "text-[#282829] hover:text-[#282829]"
              }`}
          >
            {tab.name}

          </button>
        ))}
      </div>

      <div className="lg:mt-6">
        {tabs.find((tab) => tab.name === activeTab)?.component}
      </div>
    </div>
  );
};

export default AccountInformation;
