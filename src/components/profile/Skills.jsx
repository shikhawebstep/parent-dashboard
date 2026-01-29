import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SkillDetail from "./SkillDetail";
import { useSkill } from "../../context/SkillContext";
import Loader from "../Loader";
import { useProfile } from "../../context/ProfileContext";

const Skills = () => {
  const [currentFilter, setCurrentFilter] = useState("Beginner");
  const { skill, fetchSkillData, loading } = useSkill();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const students = profile?.uniqueProfiles?.students;
  const [selectedStudent, setSelectedStudent] = useState(students[0]?.studentFirstName + ' ' + students[0]?.studentLastName);

  const filterTabs = [
    { id: "Beginner", label: "Beginners" },
    { id: "Intermediate", label: "Medium" },
    { id: "Advanced", label: "Advanced" },
  ];

  useEffect(() => {
    fetchSkillData();
  }, []);

  // Removed conditional return

  if (loading) {
    return <Loader />
  }

  return (
    <div className="space-y-6">
      {/* Student Selector */}
      <div className="flex flex-col gap-2 p-6 pb-0 md:p-0">
        <h2 className="text-[24px] font-bold text-[#191919]">
          Student
        </h2>

        <div className="flex gap-3">
          {students.map((student) => (
            <button
              key={student?.id}
              onClick={() => setSelectedStudent(student?.studentFirstName + ' ' + student?.studentLastName)}
              className={`px-4 py-2 rounded-[12px] text-[16px] font-semibold transition-colors ${selectedStudent === student?.studentFirstName + ' ' + student?.studentLastName
                ? "bg-[#237FEA] text-white"
                : "border-[#E2E1E5] border text-black "
                }`}
            >
              {student?.studentFirstName + ' ' + student?.studentLastName}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white xl:max-w-[1410px] rounded-[18px] p-6 py-0 md:py-6">
        {/* Filter Tabs */}
        <div className="flex gap-2 bg-[#F9F9FB] w-full overflow-auto rounded-[14px] md:w-max p-2 mb-4">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentFilter(tab.id)}
              className={`px-5 py-2.5 rounded-[14px] text-[16px] font-medium transition-colors ${currentFilter === tab.id
                ? "bg-[#042C89] text-white"
                : "bg-[#F9F9F9] text-[#191919] hover:bg-gray-100"
                }`}
            >
              {tab.id}
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {Array.isArray(skill?.[currentFilter]) &&
            skill[currentFilter].length > 0 &&
            skill[currentFilter].map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/parent/skills/${item.id}`, { state: { skill: item } })}
                className="bg-white rounded-[20px] p-4 shadow-sm border border-[#E1E2E6] cursor-pointer hover:shadow-md transition-shadow"
              >
                {/* Banner */}
                <div className="xl:max-h-[210px] w-full rounded-[20px] relative overflow-hidden mb-4  flex items-center">
                  <img src={item.coverImage} alt="" srcset="" />
                </div>

                {/* Title */}
                <h4 className="font-bold text-[#191919] 2xl:text-[20px] text-[16px] mb-4 leading-snug">
                  {item.courseName}
                </h4>

                {/* Metadata */}
                <div className="flex items-center flex-wrap gap-4 2xl:text-[13px] md:text-[11px] text-[12px] text-[#34353B] mb-4 font-semibold">
                  <div className="flex items-center font-semibold gap-1">
                    <img src="/assets/clock1.png" alt="" className='2xl:w-4 w-3' />
                    {item.duration + ' ' + item?.durationType}
                  </div>
                  <div className="flex items-center font-semibold gap-1.5">
                    <img src="/assets/ability.png" alt="" className='2xl:w-4 w-3' />
                    {item.skillsCount || 0} Skills
                  </div>
                  <div className="flex items-center font-semibold gap-1.5">
                    <img src="/assets/easy.png" alt="" className='2xl:w-4 w-3' />
                    {item.level}
                  </div>
                  <div className="flex justify-end">
                    <span
                      className={`px-3 py-1 rounded-[6px] 2xl:text-[12px] md:text-[10px] text-[12px] font-bold ${item.status === "Complete"
                        ? "bg-[#D9F2DC] text-[#000]"
                        : "bg-[#FFF8DD] text-[#000]"
                        }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>

                {/* Status */}

                {/* Progress */}
                <div className=" flex gap-3 items-center">
                  <div className="w-[75%] bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${item.status === "Complete"
                        ? "bg-[#0DD180]"
                        : "bg-[#FFC107]"
                        }`}
                      style={{ width: `${item.progress || 0}%` }}
                    />
                  </div>
                  <p className="text-right 2xl:text-[12px] md:text-[10px] text-[12px] truncate text-[#34353B] font-bold">
                    {item.progress || 0}% completed
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Skills;
