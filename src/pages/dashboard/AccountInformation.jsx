import React, { useState } from "react";

import ParentProfile from "../../components/profile/ParentProfile";
import StudentProfile from "../../components/profile/StudentProfile";
import Skills from "../../components/profile/Skills";
import Feedback from "../../components/profile/Feedback";
import ServiceHistory from "../../components/profile/ServiceHistory";


const tabs = [
  { name: "Parent Profile", component: <ParentProfile /> },
  { name: "Childs Profile", component: <StudentProfile /> },
  { name: "Service History", component: <ServiceHistory /> },
  { name: "Feedback", component: <Feedback /> },
  { name: "Skills tracker", component: <Skills /> },
];

const AccountInformation = () => {
  const [activeTab, setActiveTab] = useState(tabs[0].name);

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
