import { useState, useEffect } from "react";
import { useStep } from "../context/StepContext";

const students = [
  {
    id: 1,
    name: "Ben Johnson",
    dob: "2018-07-15",
    age: 7,
    gender: "M",
    classRange: "4–7 years",
  },
  {
    id: 2,
    name: "Steve Johnson",
    dob: "2014-07-15",
    age: 10,
    gender: "M",
    classRange: "10–12 years",
  },
];

export default function StepStudent() {
  const { formData, setFormData, errors, clearError } = useStep();
  const [activeTab, setActiveTab] = useState("existing");
  const [selectedStudentId, setSelectedStudentId] = useState(1);

  // Initialize form data if empty when switching to existing student
  useEffect(() => {
    if (activeTab === "existing" && selectedStudentId) {
      const student = students.find(s => s.id === selectedStudentId);
      if (student) {
        setFormData(prev => ({
          ...prev,
          student: {
            firstName: student.name.split(" ")[0], // Mock split
            lastName: student.name.split(" ")[1] || "",
            dob: student.dob,
            age: student.age,
            gender: student.gender === "M" ? "Male" : "Female",
            class: student.classRange,
            medical: "None", // Mock default
            type: "existing"
          }
        }));
      }
    } else if (activeTab === "new") {
      // Clear if switching to new and it was existing
      if (formData.student?.type === "existing") {
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
            type: "new"
          }
        }));
      }
    }
  }, [activeTab, selectedStudentId, setFormData]);


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

    setFormData(prev => ({
      ...prev,
      student: updatedStudent
    }));

    // Convert field name to error key mapping if needed, or stick to simple
    const errorMap = {
      firstName: 'studentFirstName',
      lastName: 'studentLastName',
      dob: 'studentDob',
      gender: 'studentGender'
    };
    if (errorMap[field]) {
      clearError(errorMap[field]);
    }
  };

  const inputClass = (hasError) =>
    `mt-1 w-full bg-white border ${hasError ? 'border-red-500' : 'border-gray-200'} p-3 placeholder:text-[#494949] placeholder:text-[14px] rounded-lg capitalize text-sm focus:ring-2 focus:ring-[#0496FF] outline-none`;

  const data = formData.student || {};

  return (
    <div className="max-w-4xl mx-auto bg-white py-6 px-0 md:px-6 font-poppins">
      <h2 className="text-center text-[20px] poppins font-bold mb-8 text-[#191919]">
        Student information
      </h2>

      {/* Tabs */}
      <div className="flex justify-center gap-6 mb-8">
        <button
          onClick={() => setActiveTab("existing")}
          className={`px-4 py-2 rounded-lg poppins text-sm font-bold transition-colors ${activeTab === "existing"
              ? "bg-[#E8F1FF] text-[#0496FF]"
              : "text-gray-400 hover:text-gray-600"
            }`}
        >
          Select an existing child
        </button>

        <button
          onClick={() => setActiveTab("new")}
          className={`px-4 py-2 rounded-lg poppins text-sm font-bold transition-colors ${activeTab === "new"
              ? "bg-[#E8F1FF] text-[#0496FF]"
              : "text-gray-400 hover:text-gray-600"
            }`}
        >
          Add a new child
        </button>
      </div>

      {activeTab === "existing" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {students.map((student) => (
            <div
              key={student.id}
              onClick={() => setSelectedStudentId(student.id)}
              className={`cursor-pointer rounded-xl border p-4 transition-all hover:bg-gray-50
                ${selectedStudentId === student.id
                  ? "border-[#0496FF] bg-blue-50/20 shadow-sm"
                  : "border-[#E5E7EB]"
                }`}
            >
              <h3 className="text-[#0496FF] poppins font-bold mb-3 text-lg">
                {student.name}
              </h3>

              <div className="grid poppins grid-cols-2 gap-y-3 text-sm text-gray-600">
                <div>
                  <p className="text-xs text-gray-400 font-bold mb-1">Date of birth</p>
                  <p className="font-medium">{student.dob}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold mb-1">Age</p>
                  <p className="font-medium">{student.age}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold mb-1">Gender</p>
                  <p className="font-medium">{student.gender}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold mb-1">Class</p>
                  <p className="font-medium">{student.classRange}</p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedStudentId === student.id ? 'border-[#0496FF] bg-[#0496FF]' : 'border-gray-300'}`}>
                  {selectedStudentId === student.id && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "new" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 animate-fadeIn">
          <div>
            <label className="text-sm poppins font-bold text-[#191919]"> First name</label>
            <input
              value={data.firstName || ''}
              onChange={(e) => handleFieldChange("firstName", e.target.value)}
              placeholder="Enter first name"
              className={inputClass(errors.studentFirstName)}
            />
            {errors.studentFirstName && <p className="text-red-500 text-xs mt-1">{errors.studentFirstName}</p>}
          </div>

          <div>
            <label className="text-sm poppins font-bold text-[#191919]"> Last name</label>
            <input
              value={data.lastName || ''}
              onChange={(e) => handleFieldChange("lastName", e.target.value)}
              placeholder="Enter last name"
              className={inputClass(errors.studentLastName)}
            />
            {errors.studentLastName && <p className="text-red-500 text-xs mt-1">{errors.studentLastName}</p>}
          </div>

          <div>
            <label className="text-sm poppins font-bold text-[#191919]"> Date of birth</label>
            <input
              type="date"
              value={data.dob || ''}
              onChange={(e) => handleFieldChange("dob", e.target.value)}
              className={inputClass(errors.studentDob)}
            />
            {errors.studentDob && <p className="text-red-500 text-xs mt-1">{errors.studentDob}</p>}
          </div>

          <div>
            <label className="text-sm poppins font-bold text-[#191919]"> Age</label>
            <input readOnly value={data.age || ''} className={`${inputClass()} bg-gray-50`} />
          </div>

          <div>
            <label className="text-sm poppins font-bold text-[#191919]"> Gender</label>
            <div className="relative">
              <select
                value={data.gender || ''}
                onChange={(e) => handleFieldChange("gender", e.target.value)}
                className={`${inputClass(errors.studentGender)} appearance-none`}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="others">Others</option>
              </select>
              {errors.studentGender && <p className="text-red-500 text-xs mt-1">{errors.studentGender}</p>}
            </div>
          </div>

          <div>
            <label className="text-sm poppins font-bold text-[#191919]"> Medical information</label>
            <input
              value={data.medical || ''}
              onChange={(e) => handleFieldChange("medical", e.target.value)}
              placeholder="Enter medical information"
              className={inputClass()}
            />
          </div>

          <div>
            <label className="text-sm poppins font-bold text-[#191919]"> Class</label>
            <input readOnly value={data.class || ''} className={`${inputClass()} bg-gray-50`} />
          </div>
          <div>
            <label className="text-sm poppins font-bold text-[#191919]"> Time</label>
            <input readOnly value="10:00 AM - 12:00 PM" className={`${inputClass()} bg-gray-50`} />
          </div>
        </div>
      )}
    </div>
  );
}
