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
          firstName: student.firstName,
          lastName: student.lastName,
          dob: student.dob,
          age: student.age,
          gender: student.gender,
          class: student.class,
          medical: student.medical || "",
          type: "existing",
        },
      }));
    }

    if (activeTab === "new") {
      setFormData(prev => ({
        ...prev,
        student: {
          firstName: "",
          lastName: "",
          dob: "",
          age: "",
          gender: "",
          class: "",
          medical: "",
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

    if (field === "dob") {
      const birthYear = new Date(value).getFullYear();
      if (!isNaN(birthYear)) {
        const age = new Date().getFullYear() - birthYear;
        updatedStudent.age = age;
        updatedStudent.class = age <= 7 ? "4–7 years" : "10–12 years";
      }
    }

    setFormData(prev => ({ ...prev, student: updatedStudent }));

    const errorMap = {
      firstName: "studentFirstName",
      lastName: "studentLastName",
      dob: "studentDob",
      gender: "studentGender",
      medical: "studentMedical",
    };
    if (errorMap[field]) clearError(errorMap[field]);
  };

  /* ===============================
     Save new student into formData.students
  =============================== */
  const saveNewStudent = () => {
    const s = formData.student;
    if (!s?.firstName || !s?.dob || !s?.gender) return;

    const newStudent = {
      id: Date.now(),
      firstName: s.firstName,
      lastName: s.lastName,
      dob: s.dob,
      age: s.age,
      gender: s.gender,
      class: s.class,
      medical: s.medical || "",
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
    `mt-1 w-full bg-white mainShadow  ${hasError ? "border border-red-500" : ""
    } p-3 rounded-lg text-sm focus:ring-2 focus:ring-[#0496FF] outline-none`;

  const data = formData.student || {};

  return (
    <div className="max-w-4xl mx-auto bg-white py-6 px-0 md:px-6">
      <h2 className="text-center text-[20px] font-bold mb-8">
        Student information
      </h2>

      {/* Tabs */}
      {/* Tabs */}
      <div className="flex justify-center items-center gap-6 mb-8">
        <button
          onClick={() => setActiveTab("existing")}
          className={`poppins font-semibold transition-all ${activeTab === "existing"
            ? "bg-[#E8F1FF] text-[#0496FF] px-6 py-2 rounded-lg"
            : "text-[#282829] text-[16px]"
            }`}
        >
          Select an existing child
        </button>

        <button
          onClick={() => setActiveTab("new")}
          className={`poppins font-semibold transition-all ${activeTab === "new"
            ? "bg-[#E8F1FF] text-[#0496FF] px-6 py-2 rounded-lg"
            : "text-[#282829] text-[16px]"
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
              <p className="text-gray-400 text-sm poppins">
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
              <h3 className={`font-semibold text-lg mb-4 poppins ${selectedStudentId === student.id ? "text-[#0496FF]" : "text-[#0496FF]"}`}>
                {student.firstName} {student.lastName}
              </h3>

              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                <div>
                  <label className="text-[12px] text-gray-400 block mb-1 poppins">Date of birth</label>
                  <p className="text-[14px] font-medium text-[#282829] poppins">{student.dob}</p>
                </div>

                <div>
                  <label className="text-[12px] text-gray-400 block mb-1 poppins">Age</label>
                  <p className="text-[14px] font-medium text-[#282829] poppins">{student.age}</p>
                </div>

                <div>
                  <label className="text-[12px] text-gray-400 block mb-1 poppins">Gender</label>
                  <p className="text-[14px] font-medium text-[#282829] poppins">
                    {student.gender === "Male" ? "M" : student.gender === "Female" ? "F" : student.gender}
                  </p>
                </div>

                <div>
                  <label className="text-[12px] text-gray-400 block mb-1 poppins">Class</label>
                  <p className="text-[14px] font-medium text-[#282829] poppins">{student.class}</p>
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
            <label className="block text-[14px] text-[#282829] poppins mb-1">
              First name
            </label>
            <input
              placeholder="Enter first name"
              value={data.firstName || ""}
              onChange={e => handleFieldChange("firstName", e.target.value)}
              className={inputClass(errors.studentFirstName)}
            />
          </div>

          <div>
            <label className="block text-[14px] text-[#282829] poppins mb-1">
              Last name
            </label>
            <input
              placeholder="Enter last name"
              value={data.lastName || ""}
              onChange={e => handleFieldChange("lastName", e.target.value)}
              className={inputClass(errors.studentLastName)}
            />
          </div>

          <div>
            <label className="block text-[14px] text-[#282829] poppins mb-1">
              Date of birth
            </label>
            <input
              type="date"
              placeholder="Enter date of birth"
              value={data.dob || ""}
              onChange={e => handleFieldChange("dob", e.target.value)}
              className={inputClass(errors.studentDob)}
            />
          </div>

          <div>
            <label className="block text-[14px] text-[#282829] poppins mb-1">
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
            <label className="block text-[14px] text-[#282829] poppins mb-1">
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
            <label className="block text-[14px] text-[#282829] poppins mb-1">
              Medical information
            </label>
            <div className="relative">
              <input
                placeholder="Enter medical information"
                value={data.medical || ""}
                onChange={e => handleFieldChange("medical", e.target.value)}
                className={inputClass(errors.studentMedical)}
              />
            </div>
          </div>

          <div>
            <label className="block text-[14px] text-[#282829] poppins mb-1">
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
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[14px] text-[#282829] poppins mb-1">
              Time:
            </label>
            <div className="relative">
              <input
                readOnly
                placeholder="Automatic entry"
                className={`${inputClass()} bg-white text-gray-500`}
              />
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
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
