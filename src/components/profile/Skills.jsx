import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSkill } from "../../context/SkillContext";
import Loader from "../Loader";
import { useProfile } from "../../context/ProfileContext";

const Skills = ({ activeServiceType }) => {
  const [currentFilter, setCurrentFilter] = useState("Beginner");
  const { skill, fetchSkillData, loading } = useSkill();
  const navigate = useNavigate();
  const { profile } = useProfile();

const students = useMemo(() => {
  const allBookingsList = profile?.adminMeta?.students;
  if (!Array.isArray(allBookingsList) || allBookingsList.length === 0) return [];

  const uniqueMap = new Map();
  allBookingsList.forEach(s => { if (s?.id) uniqueMap.set(s.id, s); });
  return Array.from(uniqueMap.values());
}, [profile, activeServiceType]);

  const getFullName = (student) =>
    `${student?.studentFirstName || ''} ${student?.studentLastName || ''}`.trim() || 'Unknown Student';

  const [selectedStudent, setSelectedStudent] = useState('');

  useEffect(() => {
    if (!selectedStudent && students.length > 0) {
      setSelectedStudent(getFullName(students[0]));
    }
  }, [students]);

  const filterTabs = [
    { id: "Beginner", label: "Beginners" },
    { id: "Intermediate", label: "Medium" },
    { id: "Advanced", label: "Advanced" },
  ];

  useEffect(() => {
    fetchSkillData();
  }, []);

  if (loading) return <Loader />;

  const currentSkills = Array.isArray(skill?.[currentFilter]) ? skill[currentFilter] : [];

  return (
    <div className="space-y-6">
      {/* Student Selector */}
      <div className="flex flex-col gap-2 p-6 pb-0 md:p-0">
        <h2 className="text-[24px] font-bold text-[#191919]">Student</h2>

        <div className="flex gap-3 flex-wrap">
          {students.length > 0 ? students.map((student) => {
            const fullName = getFullName(student);
            return (
              <button
                key={student.id}
                onClick={() => setSelectedStudent(fullName)}
                className={`px-4 py-2 rounded-[12px] text-[16px] font-semibold transition-colors ${
                  selectedStudent === fullName
                    ? "bg-[#237FEA] text-white"
                    : "border-[#E2E1E5] border text-black"
                }`}
              >
                {fullName}
              </button>
            );
          }) : (
            <p className="text-gray-500 text-sm">No students available.</p>
          )}
        </div>
      </div>

      <div className="bg-white xl:max-w-[1410px] rounded-[18px] p-6 py-0 md:py-6">
        {/* Filter Tabs */}
        <div className="flex gap-2 bg-[#F9F9FB] w-full overflow-auto rounded-[14px] md:w-max p-2 mb-4">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentFilter(tab.id)}
              className={`px-5 py-2.5 rounded-[14px] text-[16px] font-medium transition-colors ${
                currentFilter === tab.id
                  ? "bg-[#042C89] text-white"
                  : "bg-[#F9F9F9] text-[#191919] hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {currentSkills.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500 font-medium">
              No skills found for this level.
            </div>
          ) : (
            currentSkills.map((item) => {
              if (!item?.id) return null;
              const progress = item.progress ?? 0;
              const isComplete = item.status === "Complete";

              return (
                <div
                  key={item.id}
                  onClick={() => navigate(`/skills/${item.id}`, { state: { skill: item } })}
                  className="bg-white rounded-[20px] p-4 shadow-sm border border-[#E1E2E6] cursor-pointer hover:shadow-md transition-shadow"
                >
                  {/* Banner */}
                  {item.coverImage ? (
                    <div className="xl:max-h-[210px] w-full rounded-[20px] overflow-hidden mb-4 flex items-center">
                      <img src={item.coverImage} alt={item.courseName || ''} />
                    </div>
                  ) : null}

                  {/* Title */}
                  <h4 className="font-bold text-[#191919] 2xl:text-[20px] text-[16px] mb-4 leading-snug">
                    {item.courseName || 'Untitled'}
                  </h4>

                  {/* Metadata */}
                  <div className="flex items-center flex-wrap gap-4 2xl:text-[13px] md:text-[11px] text-[12px] text-[#34353B] mb-4 font-semibold">
                    {(item.duration || item.durationType) && (
                      <div className="flex items-center gap-1">
                        <img src="/assets/clock1.png" alt="" className="2xl:w-4 w-3" />
                        {[item.duration, item.durationType].filter(Boolean).join(' ')}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <img src="/assets/ability.png" alt="" className="2xl:w-4 w-3" />
                      {item.skillsCount ?? 0} Skills
                    </div>
                    {item.level && (
                      <div className="flex items-center gap-1.5">
                        <img src="/assets/easy.png" alt="" className="2xl:w-4 w-3" />
                        {item.level}
                      </div>
                    )}
                    {item.status && (
                      <div className="flex justify-end">
                        <span className={`px-3 py-1 rounded-[6px] 2xl:text-[12px] md:text-[10px] text-[12px] font-bold ${
                          isComplete ? "bg-[#D9F2DC] text-[#000]" : "bg-[#FFF8DD] text-[#000]"
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="flex gap-3 items-center">
                    <div className="w-[75%] bg-gray-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${isComplete ? "bg-[#0DD180]" : "bg-[#FFC107]"}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-right 2xl:text-[12px] md:text-[10px] text-[12px] truncate text-[#34353B] font-bold">
                      {progress}% completed
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Skills;