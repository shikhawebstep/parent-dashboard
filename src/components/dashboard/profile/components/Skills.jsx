import React, { useState } from "react";
import { Clock, Award, BarChart3 } from "lucide-react";
import SkillDetail from "./SkillDetail";

const Skills = () => {
  const [selectedStudent, setSelectedStudent] = useState("John Smith");
  const [currentFilter, setCurrentFilter] = useState("Beginners");
  const [selectedSkill, setSelectedSkill] = useState(null);

  const students = ["John Smith", "Michael Smith"];

  const filterTabs = [
    { id: "beginners", label: "Beginners" },
    { id: "medium", label: "Medium" },
    { id: "advanced", label: "Advanced" },
  ];

  const generateSkills = (count) =>
    Array(count)
      .fill(null)
      .map((_, i) => {
        const levels = ["Beginners", "Medium", "Advanced"];
        const levelIndex = i % 3;

        return {
          id: i,
          title: "Six ways to manipulate the ball with a left foot or you know",
          time: "45 mins",
          skillsCount: "10 Skills",
          level: levels[levelIndex],
          status: i % 4 === 1 ? "Pending" : "Complete",
          progress: i % 4 === 1 ? 78 : 100,
          completed: i % 4 !== 1,
        };
      });

  const allSkills = generateSkills(12);

  const filteredSkills = allSkills.filter(
    (skill) => skill.level === currentFilter
  );

  if (selectedSkill) {
    return <SkillDetail skill={selectedSkill} onBack={() => setSelectedSkill(null)} />;
  }

  return (
    <div className="space-y-6">
      {/* Student Selector */}
      <div className="flex flex-col gap-2">
        <h2 className="text-[18px] font-bold text-[#191919]">
          Student
        </h2>

        <div className="flex gap-3">
          {students.map((student) => (
            <button
              key={student}
              onClick={() => setSelectedStudent(student)}
              className={`px-6 py-2 rounded-full text-[16px] font-semibold transition-colors ${selectedStudent === student
                ? "bg-[#1B7AF9] text-white"
                : "bg-[#F5F5F5] text-[#787878] hover:bg-gray-200"
                }`}
            >
              {student}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 pb-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCurrentFilter(tab.label)}
            className={`px-8 py-2.5 rounded-lg text-[16px] font-semibold transition-colors ${currentFilter === tab.label
              ? "bg-[#193B67] text-white"
              : "bg-[#F9F9F9] text-[#191919] hover:bg-gray-100"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSkills.map((skill) => (
          <div
            key={skill.id}
            onClick={() => setSelectedSkill(skill)}
            className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
          >
            {/* Banner */}
            <div className="h-[140px] w-full rounded-[15px] relative overflow-hidden mb-4  flex items-center">
              <img src="/assets/skill.png" alt="" srcset="" />
            </div>

            {/* Title */}
            <h4 className="font-bold text-[#191919] text-[15px] mb-4 leading-snug">
              {skill.title}
            </h4>

            {/* Metadata */}
            <div className="flex items-center gap-4 text-[11px] text-[#5B6572] mb-4 font-medium">
              <div className="flex items-center gap-1.5">
                <Clock size={14} />
                {skill.time}
              </div>
              <div className="flex items-center gap-1.5">
                <Award size={14} />
                {skill.skillsCount}
              </div>
              <div className="flex items-center gap-1.5">
                <BarChart3 size={14} />
                {skill.level}
              </div>
            </div>

            {/* Status */}
            <div className="flex justify-end mb-2">
              <span
                className={`px-3 py-1 rounded text-[10px] font-bold uppercase ${skill.status === "Complete"
                  ? "bg-[#E3F6EB] text-[#0CAA57]"
                  : "bg-[#FFF8DD] text-[#DFA800]"
                  }`}
              >
                {skill.status}
              </span>
            </div>

            {/* Progress */}
            <div className="space-y-1">
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full ${skill.status === "Complete"
                    ? "bg-[#0DD180]"
                    : "bg-[#FFC107]"
                    }`}
                  style={{ width: `${skill.progress}%` }}
                />
              </div>
              <p className="text-right text-[10px] text-[#5B6572] font-semibold">
                {skill.progress}% completed
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Skills;
