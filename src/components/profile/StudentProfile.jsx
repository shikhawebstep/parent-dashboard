import { Plus, Save } from "lucide-react";
import React, { useState } from "react";
import Select from "react-select";

const genderOptions = [
  { value: "", label: "Select Gender" },
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

const medicalOptions = [
  { value: "", label: "Enter medical information" },
  { value: "None", label: "None" },
  { value: "Asthma", label: "Asthma" },
  { value: "Diabetes", label: "Diabetes" },
  { value: "Allergy", label: "Allergy" },
];

const emptyStudent = {
  firstName: "",
  lastName: "",
  dob: "",
  age: "",
  gender: "",
  medical: "",
};

function calculateAge(dob) {
  if (!dob) return "";
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return "";
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age < 0 ? "" : age;
}

const StudentProfile = () => {
  const [students, setStudents] = useState([{ ...emptyStudent }]);
  const [editingIndex, setEditingIndex] = useState(null);

  // Validation errors: array of objects per student
  const [errors, setErrors] = useState([{}]);

  const addStudent = () => {
    setStudents((prev) => [...prev, { ...emptyStudent }]);
    setErrors((prev) => [...prev, {}]);
    setEditingIndex(students.length); // auto-edit new student
  };

  const deleteStudent = (index) => {
    setStudents((prev) => prev.filter((_, i) => i !== index));
    setErrors((prev) => prev.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  const updateStudentField = (index, field, value) => {
    const updated = [...students];
    updated[index] = { ...updated[index], [field]: value };

    // Update age on dob change
    if (field === "dob") {
      updated[index].age = calculateAge(value);
    }
    setStudents(updated);

    // Clear error for that field as user types
    const newErrors = [...errors];
    if (newErrors[index]) {
      newErrors[index][field] = "";
      setErrors(newErrors);
    }
  };

  // Validate student fields, return error object
  const validateStudent = (student) => {
    const err = {};
    if (!student.firstName.trim()) err.firstName = "First name is required";
    if (!student.lastName.trim()) err.lastName = "Last name is required";

    if (!student.dob) {
      err.dob = "Date of birth is required";
    } else if (isNaN(new Date(student.dob).getTime())) {
      err.dob = "Invalid date of birth";
    }

    if (!student.gender) err.gender = "Gender is required";

    return err;
  };

  const handleSave = (index) => {
    const student = students[index];
    const validationErrors = validateStudent(student);

    const newErrors = [...errors];
    newErrors[index] = validationErrors;
    setErrors(newErrors);

    // If no errors, close edit mode
    if (Object.keys(validationErrors).length === 0) {
      setEditingIndex(null);
    }
  };

  return (
    <div className="py-4 ">

      {/* Add Student Button */}
      <div className="text-right absolute top-7 right-5 mb-6">
        <button
          onClick={addStudent}
          className="inline-flex items-center gap-2 font-semibold text-[18px] px-4 py-2 bg-[#0DD180] text-white rounded-lg hover:bg-green-700"
        >
          <Plus size={20} className="text-white font-bold" />
          Add New Student
        </button>
      </div>

      {students.map((student, index) => {
        const isEditing = editingIndex === index;
        const err = errors[index] || {};

        return (
          <div
            key={index}
            className="bg-white rounded-[30px] p-6 mb-6"
          >
            <div className="flex gap-2 items-center mb-4">
              <h2 className="font-bold text-[24px]">
                Student {index + 1} information
              </h2>
              <button
                className="text-gray-600 hover:text-[#042C89]"
                onClick={() => {
                  if (isEditing) handleSave(index);
                  else setEditingIndex(index);
                }}
                title={isEditing ? "Save" : "Edit"}
              >
                {isEditing ? <Save size={20} /> : <img src="/assets/edit.png" className="w-5" alt="Edit" />}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="text-[16px] lg:text-[18px] font-semibold text-[#282829] mb-1 block">
                  First name
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={student.firstName}
                  onChange={(e) => updateStudentField(index, "firstName", e.target.value)}
                  className={`w-full rounded-md px-3 py-3 border 
  ${isEditing ? (err.firstName ? "border-red-500 bg-white" : "border-gray-300 bg-white") : "bg-[#F0F5FF] border-transparent"} 
  text-gray-800`}

                />
                {err.firstName && <p className="text-red-600 mt-1 text-sm">{err.firstName}</p>}
              </div>

              {/* Last Name */}
              <div>
                <label className="text-[16px] lg:text-[18px] font-semibold text-[#282829] mb-1 block">
                  Last name
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={student.lastName}
                  onChange={(e) => updateStudentField(index, "lastName", e.target.value)}
                  className={`w-full rounded-md px-3 py-3 border 
  ${isEditing ? (err.lastName ? "border-red-500 bg-white" : "border-gray-300 bg-white") : "bg-[#F0F5FF] border-transparent"} 
  text-gray-800`}

                />
                {err.lastName && <p className="text-red-600 mt-1 text-sm">{err.lastName}</p>}
              </div>

              {/* DOB */}
              <div>
                <label className="text-[16px] lg:text-[18px] font-semibold text-[#282829] mb-1 block">
                  Date of birth
                </label>
                <input
                  type="date"
                  disabled={!isEditing}
                  value={student.dob}
                  onChange={(e) => updateStudentField(index, "dob", e.target.value)}
                  className={`w-full rounded-md px-3 py-3 border 
  ${isEditing ? (err.dob ? "border-red-500 bg-white" : "border-gray-300 bg-white") : "bg-[#F0F5FF] border-transparent"} 
  text-gray-800`}

                />
                {err.dob && <p className="text-red-600 mt-1 text-sm">{err.dob}</p>}
              </div>

              {/* Age */}
              <div>
                <label className="text-[16px] lg:text-[18px] font-semibold text-[#282829] mb-1 block">
                  Age
                </label>
                <input
                  type="number"
                  disabled
                  value={student.age}
                  className="w-full rounded-md px-3 py-3 bg-[#F0F5FF] border-transparent text-gray-800 cursor-not-allowed"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="text-[16px] lg:text-[18px] font-semibold text-[#282829] mb-1 block">
                  Gender
                </label>
                <Select
                  isDisabled={!isEditing}
                  value={genderOptions.find((o) => o.value === student.gender)}
                  onChange={(selected) =>
                    updateStudentField(index, "gender", selected ? selected.value : "")
                  }
                  styles={{
                    control: (provided, state) => ({
                      ...provided,
                      backgroundColor: isEditing ? "#fff" : "#F0F5FF",
                      borderColor: err.gender ? "#ef4444" : isEditing ? "#ccc" : "#fff",
                      borderRadius: "0.5rem",
                      minHeight: "48px",
                      fontWeight: "600",
                      fontSize: "1rem",
                      boxShadow: state.isFocused ? "0 0 0 1px #2684FF" : "none",
                      "&:hover": {
                        borderColor: state.isFocused ? "#2684FF" : "#999",
                      },
                    }),
                    singleValue: (provided) => ({
                      ...provided,
                      color: isEditing ? "#000" : "#999",
                    }),
                    menu: (provided) => ({
                      ...provided,
                      zIndex: 9999,
                    }),
                  }}
                  options={genderOptions}
                  classNamePrefix="react-select"
                />
                {err.gender && <p className="text-red-600 mt-1 text-sm">{err.gender}</p>}


              </div>

              {/* Medical Info */}
              <div>
                <label className="text-[16px] lg:text-[18px] font-semibold text-[#282829] mb-1 block">
                  Medical information
                </label>

                <input
                  type="text"
                  disabled={!isEditing}
                  value={student.medical}
                  onChange={(e) => updateStudentField(index, "medical", e.target.value)}
                  className={`w-full rounded-md px-3 py-3 border 
  ${isEditing ? (err.firstName ? "border-red-500 bg-white" : "border-gray-300 bg-white") : "bg-[#F0F5FF] border-transparent"} 
  text-gray-800`}

                />
              </div>
            </div>

            {/* Save / Delete Buttons */}
            {(isEditing && index > 0) && (
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => deleteStudent(index)}
                  className="px-4 py-2 text-[17px] rounded-lg bg-blue-50 font-bold text-[#8DC2FF] hover:bg-[#466abe]"
                >
                  Delete
                </button>
                <button
                  onClick={() => handleSave(index)}
                  className="px-4 py-2 text-[17px] rounded-lg bg-[#8DC2FF] text-white hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StudentProfile;
