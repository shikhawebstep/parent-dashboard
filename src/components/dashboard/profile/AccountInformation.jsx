import React, {  useState } from "react";

import ParentProfile from "./components/ParentProfile";
import StudentProfile from "./components/StudentProfile";
import Skills from "./components/Skills";
import Feedback from "./components/Feedback";
import ServiceHistory from "./components/ServiceHistory";


const tabs = [
  { name: "Parent Profile", component: <ParentProfile /> },
  { name: "Childs Profile", component: <StudentProfile /> },
  { name: "Service History", component: <ServiceHistory /> },
  { name: "Feedback", component: <Feedback /> },
  { name: "Skills tracker", component: <Skills/> },
];

const AccountInformation = () => {
  const [activeTab, setActiveTab] = useState(tabs[0].name);

  return (
    <div className=" p-6 relative">

      <div className="flex w-max items-center bg-white p-3 gap-1 rounded-2xl ">
        
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`w-max relative flex-1 whitespace-nowrap px-4 text-[18px] font-semibold py-3 rounded-xl transition-all ${activeTab === tab.name
              ? "bg-[#042C89] shadow text-white "
              : "text-[#282829] hover:text-[#282829]"
              }`}
          >
            {tab.name}

          </button>
        ))}
      </div>

      <div className="mt-6">
        {tabs.find((tab) => tab.name === activeTab)?.component}
      </div>
    </div>
  );
};

export default AccountInformation;
