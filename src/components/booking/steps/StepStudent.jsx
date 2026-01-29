import { useState, useEffect } from "react";
import { useStep } from "../../../context/StepContext";

export default function StepStudent() {
  const { formData, setFormData, errors, clearError } = useStep();

  const [activeTab, setActiveTab] = useState("existing");
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const students = formData.students || [];

  /* ===============================
     Sync selected existing student
  =============================== */
  /* ===============================
     Sync selected existing student
  =============================== */
  useEffect(() => {
    if (activeTab === "existing" && selectedStudentId && students.length > 0) {
      const student = students.find(s => s.id === selectedStudentId);
      if (!student) return;

      setFormData(prev => ({
        ...prev,
        student: {
          studentFirstName: student.studentFirstName,
          studentLastName: student.studentLastName,
          dateOfBirth: student.dateOfBirth,
          age: student.age,
          gender: student.gender,
          className: student.className,
          medicalInformation: student.medicalInformation || "",
          type: "existing",
        },
      }));
    }

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
          medicalInformation: "",
          type: "new",
        },
      }));
    }
  }, [activeTab, selectedStudentId, students]);

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
      class: s.class,
      medicalInformation: s.medicalInformation || "",
    };

    setFormData(prev => ({
      ...prev,
      students: [...(prev.students || []), newStudent],
      student: { ...newStudent, type: "existing" },
    }));

    setSelectedStudentId(newStudent.id);
    setActiveTab("existing");
  };

  const inputClass = (hasError) =>
    `mt-1 w-full placeholder:text-[#9C9C9C] bg-white poppins font-normal mainShadow  ${hasError ? "border border-red-500" : ""
    } p-3 rounded-[6px] text-sm focus:ring-2 focus:ring-[#0496FF] outline-none`;

  const data = formData.student || {};

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
        <div className="grid sm:grid-cols-2 max-w-[500px] mx-auto gap-6">
          {students.length === 0 && (
            <div className="col-span-2 text-center py-8">
              <p className="text-[#939395] text-sm poppins">
                No students added yet
              </p>
            </div>
          )}

          {students.map(student => (
            <div
              key={student.id}
              onClick={() => setSelectedStudentId(student.id)}
              className={`border rounded-xl p-6 cursor-pointer relative transition-all ${selectedStudentId === student.id
                ? "border-[#0496FF] bg-white shadow-sm"
                : "border-gray-200 bg-white hover:border-gray-300"
                }`}
            >
              <h3 className={`font-medium text-[16px] mb-4 poppins ${selectedStudentId === student.id ? "text-[#0496FF]" : "text-[#0496FF]"}`}>
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

                <div>
                  <label className="text-[12px] text-[#939395] block font-normal mb-1 poppins">Class</label>
                  <p className="text-[14px] text-[#282829] poppins font-medium">{student.className}</p>
                </div>
              </div>
            </div>
          ))}
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
              value={data.studentFirstName || ""}
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
              value={data.studentLastName || ""}
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
              value={data.dateOfBirth || ""}
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
              value={data.age || ""}
              className={`${inputClass()} bg-white text-gray-500`}
            />
          </div>

          <div>
            <label className="block text-[14px] text-[#282829] poppins font-normal mb-1 capitalize">
              Gender:
            </label>
            <select
              value={data.gender || ""}
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
                value={data.medicalInformation || ""}
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
              <input
                readOnly
                value={data.class || ""}
                placeholder="4-7 years"
                className={`${inputClass()} bg-white text-gray-700`}
              />
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-[#939395]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinectrokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
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
