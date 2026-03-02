import { useState, useEffect } from "react";
import { useStep } from "../../../context/StepContext";

export default function StepStudent() {
  const { formData, setFormData, data, errors, clearError } = useStep();
  const [activeTab, setActiveTab] = useState("existing");

  const availableStudents = formData.availableStudents || [];
  const selectedStudents = formData.students || [];

  const filteredData = Array.isArray(data)
    ? data.filter((item) => item?.venueId === formData?.venue)
    : [];
  const handleClassChange = (classId) => {
    const selectedClass = (filteredData?.[0]?.classes ?? []).find(
      (cls) => cls?.classId === Number(classId)
    );

    if (!selectedClass) return;
    console.log('selectedClass', selectedClass)

    setFormData((prev) => ({
      ...prev,
      student: {
        ...prev.student,
        classSchedule: selectedClass,
        classScheduleId: selectedClass?.classId,
        className: selectedClass?.className,
        time: selectedClass?.time || selectedClass?.startTime || "",
      },
    }));
  };
  /* ===============================
     Sync selected existing student
  =============================== */
  const handleExistingClassChange = (studentId, classId) => {
    const selectedClass = (filteredData?.[0]?.classes ?? []).find(
      (cls) => cls?.classId === Number(classId)
    );
    if (!selectedClass) return;

    setFormData(prev => ({
      ...prev,
      students: (prev.students || []).map(s => s.id === studentId ? {
        ...s,
        classSchedule: selectedClass,
        classScheduleId: selectedClass?.classId,
        className: selectedClass?.className,
        time: selectedClass?.time || selectedClass?.startTime || "",
      } : s)
    }));
  };

  const handleToggleStudent = (student) => {
    const isSelected = selectedStudents.some((s) => s.id === student.id);

    if (isSelected) {
      setFormData((prev) => ({
        ...prev,
        students: (prev.students || []).filter((s) => s.id !== student.id)
      }));
    } else {
      const classes = filteredData?.[0]?.classes ?? [];
      const autoClass = classes.length === 1 ? classes[0] : null;

      setFormData((prev) => ({
        ...prev,
        students: [...(prev.students || []), {
          ...student,
          classSchedule: autoClass || student.classSchedule || student?.holidayClassSchedules,
          classScheduleId: autoClass?.classId || student.classScheduleId || student.classSchedule?.classId || student.classSchedule?.id || "",
          className: autoClass?.className || student.className || student?.classSchedule?.className || student?.holidayClassSchedules?.className || "",
          time: autoClass?.time || autoClass?.startTime || student.time || student?.classSchedule?.time || student?.classSchedule?.startTime || "",
          medicalInformation: student.medicalInformation || "",
          type: "existing",
        }]
      }));
    }
  };

  useEffect(() => {

    if (activeTab === "new") {
      setFormData(prev => ({
        ...prev,
        student: {
          studentFirstName: "",
          studentLastName: "",
          dateOfBirth: "",
          age: "",
          gender: "",
          className: "",
          classSchedule: null,
          classScheduleId: "",
          time: "",
          medicalInformation: "",
          type: "new",
        },
      }));
    }
  }, [activeTab]);

  /* ===============================
     Handle field change
  =============================== */
  const handleFieldChange = (field, value) => {
    let updatedStudent = { ...formData.student, [field]: value, type: "new" };

    if (field === "dateOfBirth") {
      const birthYear = new Date(value).getFullYear();
      if (!isNaN(birthYear)) {
        const age = new Date().getFullYear() - birthYear;
        updatedStudent.age = age;
        updatedStudent.className = age <= 7 ? "4–7 years" : "10–12 years";
      }
    }

    setFormData(prev => ({ ...prev, student: updatedStudent }));

    const errorMap = {
      studentFirstName: "studentstudentFirstName",
      studentLastName: "studentLastName",
      dateOfBirth: "studentDob",
      gender: "studentGender",
      medicalInformation: "studentmedicalInformation",
    };
    if (errorMap[field]) clearError(errorMap[field]);
  };

  /* ===============================
     Save new student into formData.students
  =============================== */
  const saveNewStudent = () => {
    const s = formData.student;
    if (!s?.studentFirstName || !s?.dateOfBirth || !s?.gender) return;

    const newStudent = {
      id: Date.now(),
      studentFirstName: s.studentFirstName,
      studentLastName: s.studentLastName,
      dateOfBirth: s.dateOfBirth,
      age: s.age,
      gender: s.gender,
      classSchedule: s.classSchedule,
      classScheduleId: s.classScheduleId,
      className: s.className,
      time: s.time,
      medicalInformation: s.medicalInformation || "",
    };

    setFormData(prev => ({
      ...prev,
      availableStudents: [...(prev.availableStudents || []), newStudent],
      students: [...(prev.students || []), { ...newStudent, type: "existing" }],
      student: {},
    }));

    setActiveTab("existing");
  };

  const inputClass = (hasError) =>
    `mt-1 w-full placeholder:text-[#9C9C9C] bg-white poppins font-normal mainShadow  ${hasError ? "border border-red-500" : ""
    } p-3 rounded-[6px] text-sm focus:ring-2 focus:ring-[#0496FF] outline-none`;

  const student = formData.student || {};

  return (
    <div className="max-w-4xl mx-auto bg-white py-4 px-0 md:px-6">
      <h2 className="text-center md:text-[24px] text-[18px] font-semibold poppins mb-8">
        Student information
      </h2>

      {/* Tabs */}
      {/* Tabs */}
      <div className="flex justify-center items-center gap-6 mb-8">
        <button
          onClick={() => setActiveTab("existing")}
          className={`poppins font-semibold transition-all ${activeTab === "existing"
            ? "bg-[#E8F1FF] text-[#0496FF] md:px-6 px-3 py-2 rounded-lg"
            : "text-[#282829] md:text-[16px] text-[14px]"
            }`}
        >
          Select an existing child
        </button>

        <button
          onClick={() => setActiveTab("new")}
          className={`poppins font-semibold transition-all ${activeTab === "new"
            ? "bg-[#E8F1FF] text-[#0496FF] md:px-6 px-3 py-2 rounded-lg"
            : "text-[#282829] md:text-[16px] text-[14px]"
            }`}
        >
          Add a new child
        </button>
      </div>

      {/* Existing Students */}
      {activeTab === "existing" && (
        <div className="grid sm:grid-cols-2 max-w-[670px] mx-auto gap-6">
          {availableStudents.length === 0 && (
            <div className="col-span-2 text-center py-8">
              <p className="text-[#939395] text-sm poppins">
                No existing children found. Please add a new child.
              </p>
            </div>
          )}

          {availableStudents.map(student => {
            const isSelected = selectedStudents.some(s => s.id === student.id);
            return (
              <div
                key={student.id}
                onClick={() => handleToggleStudent(student)}
                className={`border rounded-xl p-6 cursor-pointer relative transition-all ${isSelected
                  ? "border-[#0496FF] bg-blue-50/30 shadow-sm"
                  : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
              >
                {isSelected && (
                  <div className="absolute top-4 right-4 text-[#0496FF]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <h3 className={`font-semibold text-[18px] mb-4 poppins ${isSelected ? "text-[#0496FF]" : "text-[#282829]"}`}>
                  {student.studentFirstName} {student.studentLastName}
                </h3>

                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                  <div>
                    <label className="text-[12px] text-[#939395] block font-normal mb-1 poppins">Date of birth</label>
                    <p className="text-[14px] text-[#282829] poppins font-medium">{student.dateOfBirth}</p>
                  </div>

                  <div>
                    <label className="text-[12px] text-[#939395] block font-normal mb-1 poppins">Age</label>
                    <p className="text-[14px] text-[#282829] poppins font-medium">{student.age}</p>
                  </div>

                  <div>
                    <label className="text-[12px] text-[#939395] block font-normal mb-1 poppins">Gender</label>
                    <p className="text-[14px] text-[#282829] poppins font-medium">
                      {student.gender === "Male" ? "M" : student.gender === "Female" ? "F" : student.gender}
                    </p>
                  </div>

                  <div onClick={(e) => e.stopPropagation()}>
                    <label className="text-[12px] text-[#939395] block font-normal mb-1 poppins">Class</label>
                    {isSelected ? (
                      <select
                        value={selectedStudents.find(s => s.id === student.id)?.classScheduleId || ""}
                        onChange={(e) => handleExistingClassChange(student.id, e.target.value)}
                        className="bg-white border rounded text-[#282829] text-[14px] poppins p-1 w-[90%] outline-none focus:ring-1 focus:ring-[#0496FF] transition-all"
                      >
                        <option value="">Select Class</option>
                        {(filteredData?.[0]?.classes ?? []).map(cls => (
                          <option key={cls?.classId} value={cls?.classId}>{cls?.className}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-[14px] text-[#282829] poppins font-medium">
                        {student?.classSchedule?.className || student?.className || student?.holidayClassSchedules?.className || "-"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Student */}
      {activeTab === "new" && (
        <div className="grid max-w-[670px] m-auto md:grid-cols-2 gap-4">

          <div>
            <label className="block text-[14px] text-[#282829] poppins font-normal mb-1 capitalize">
              First name
            </label>
            <input
              placeholder="Enter first name"
              value={student.studentFirstName || ""}
              onChange={e => handleFieldChange("studentFirstName", e.target.value)}
              className={inputClass(errors.studentstudentFirstName)}
            />
          </div>

          <div>
            <label className="block text-[14px] text-[#282829] poppins font-normal mb-1 capitalize">
              Last name
            </label>
            <input
              placeholder="Enter last name"
              value={student.studentLastName || ""}
              onChange={e => handleFieldChange("studentLastName", e.target.value)}
              className={inputClass(errors.studentLastName)}
            />
          </div>

          <div>
            <label className="block text-[14px] text-[#282829] poppins font-normal mb-1 capitalize">
              Date of birth
            </label>
            <input
              type="date"
              placeholder="Enter date of birth"
              value={student.dateOfBirth || ""}
              onChange={e => handleFieldChange("dateOfBirth", e.target.value)}
              className={inputClass(errors.studentDob)}
            />
          </div>

          <div>
            <label className="block text-[14px] text-[#282829] poppins font-normal mb-1 capitalize">
              Age:
            </label>
            <input
              readOnly
              placeholder="Automatic entry"
              value={student.age || ""}
              className={`${inputClass()} bg-white text-gray-500`}
            />
          </div>

          <div>
            <label className="block text-[14px] text-[#282829] poppins font-normal mb-1 capitalize">
              Gender:
            </label>
            <select
              value={student.gender || ""}
              onChange={e => handleFieldChange("gender", e.target.value)}
              className={inputClass(errors.studentGender)}
            >
              <option value="">Enter gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-[14px] text-[#282829] poppins font-normal mb-1 capitalize">
              medical information
            </label>
            <div className="relative">
              <input
                placeholder="Enter medical information"
                value={student.medicalInformation || ""}
                onChange={e => handleFieldChange("medicalInformation", e.target.value)}
                className={inputClass(errors.studentmedicalInformation)}
              />
            </div>
          </div>

          <div>
            <label className="block text-[14px] text-[#282829] poppins font-normal mb-1 capitalize">
              Class:
            </label>

            <div className="relative">
              <select
                value={student?.classScheduleId ?? student?.classSchedule?.classId ?? ""}
                onChange={(e) => handleClassChange(e.target.value)}
                className={`${inputClass()} bg-white text-gray-700 appearance-none`}
              >
                <option value="">Select Class</option>

                {(filteredData?.[0]?.classes ?? []).map((cls) => (
                  <option key={cls?.classId} value={cls?.classId}>
                    {cls?.className ?? "Unnamed Class"}
                  </option>
                ))}
              </select>

              {/* Dropdown Icon */}
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-[#939395]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[14px] text-[#282829] poppins font-normal mb-1 capitalize">
              Time:
            </label>
            <div className="relative">
              <input
                readOnly
                value={student?.time}
                placeholder="Automatic entry"
                className={`${inputClass()} bg-white text-gray-500`}
              />
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-[#939395]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinectrokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 flex justify-end mt-4">
            <button
              onClick={saveNewStudent}
              className="bg-[#0496FF] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#037ecc] transition-colors"
            >
              Save Student
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
