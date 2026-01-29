import { Plus, Save } from "lucide-react";
import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useProfile } from "../../context/ProfileContext";

const genderOptions = [
  { value: "", label: "Select Gender" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "Other", label: "Other" },
];


const emptyStudent = {
  studentFirstName: "",
  studentLastName: "",
  dateOfBirth: "",
  age: "",
  gender: "",
  medicalInformation: "",
};

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return "";
  const birthDate = new Date(dateOfBirth);
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
  const { profile, updateProfile } = useProfile();

  // Validation errors: array of objects per student
  const [errors, setErrors] = useState([{}]);
  useEffect(() => {
    if (Array.isArray(profile?.uniqueProfiles?.students)) {
      setStudents(profile.uniqueProfiles.students);
    } else {
      setStudents([emptyStudent]); // fallback at least one parent
    }
  }, [profile]);
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

    // Update age on dateOfBirth change
    if (field === "dateOfBirth") {
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
    if (!student.studentFirstName.trim()) err.studentFirstName = "First name is required";
    if (!student.studentLastName.trim()) err.studentLastName = "Last name is required";

    if (!student.dateOfBirth) {
      err.dateOfBirth = "Date of birth is required";
    } else if (isNaN(new Date(student.dateOfBirth).getTime())) {
      err.dateOfBirth = "Invalid date of birth";
    }

    if (!student.gender) err.gender = "Gender is required";

    return err;
  };




  const parentData = JSON.parse(localStorage.getItem("parentData"));
  const parentId = parentData?.id;


  const cleanedStudents = students.map(
    ({
      id,
      studentFirstName,
      studentLastName,
      dateOfBirth,
      age,
      gender,
      medicalInformation,
    }) => ({
      id,

      studentFirstName,
      studentLastName,
      dateOfBirth,
      age,
      gender,
      medicalInformation,
    })
  );

  const emergency = profile?.uniqueProfiles.emergencyContacts[0];
  const cleanedEmergency = {
    id: emergency?.id,
    studentId: emergency?.studentId,
    emergencyFirstName: emergency?.emergencyFirstName,
    emergencyLastName: emergency?.emergencyLastName,
    emergencyPhoneNumber: emergency?.emergencyPhoneNumber,
    emergencyRelation: emergency?.emergencyRelation,
  }

  const parents = profile?.uniqueProfiles.parents;
  const cleanedParents = parents?.map(
    ({ relationChild, howDidHear, ...rest }) => ({
      ...rest,
      relationToChild: relationChild,
      howDidYouHear: howDidHear,
    })
  );



  const handleSave = (index) => {
    const student = students[index];
    const validationErrors = validateStudent(student);

    const newErrors = [...errors];
    newErrors[index] = validationErrors;
    setErrors(newErrors);

    // If no errors, close edit mode
    if (Object.keys(validationErrors).length === 0) {
      setEditingIndex(null);

      const finalDataToSend = {
        parentAdminId: parentId,
        students: cleanedStudents,
        parents: cleanedParents,
        emergencyContacts: [cleanedEmergency]
      };

      updateProfile(finalDataToSend);
    }
  };

  return (
    <div className="md:py-4 ">

      {/* Add Student Button */}
      <div className="md:text-right px-6 lg:p-0 bg-white md:bg-transparent xl:absolute top-7 right-5 md:mb-6">
        <button
          onClick={addStudent}
          className="inline-flex items-center gap-2 font-medium text-[18px] px-4 py-2 bg-[#0DD180] text-white rounded-lg hover:bg-green-700"
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
            className="bg-white lg:rounded-[30px] p-6 md:mb-6"
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
                title={isEditing ? " text-black Save" : "Edit"}
              >
                {isEditing ? <Save size={20} /> : <img src="/assets/edit.png" className="w-5" alt="Edit" />}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="text-[16px] lg:text-[18px] font-medium text-[#282829] mb-1 block capitalize">
                  First name
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={student.studentFirstName}
                  onChange={(e) => updateStudentField(index, "studentFirstName", e.target.value)}
                  className={`w-full rounded-md px-3 py-3 border 
  ${isEditing ? (err.studentFirstName ? " text-black placeholder:text-black  border-red-500 bg-white" : "border-gray-300 bg-white text-black") : "bg-[#F0F5FF] border-transparent text-[#9E9FAA] placeholder:text-[#9E9FAA]"} 
  `}

                />
                {err.studentFirstName && <p className="text-red-600 mt-1 text-sm">{err.studentFirstName}</p>}
              </div>

              {/* Last Name */}
              <div>
                <label className="text-[16px] lg:text-[18px] font-medium text-[#282829] mb-1 block capitalize">
                  Last name
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={student.studentLastName}
                  onChange={(e) => updateStudentField(index, "studentLastName", e.target.value)}
                  className={`w-full rounded-md px-3 py-3 border 
  ${isEditing ? (err.studentLastName ? " text-black placeholder:text-black  border-red-500 bg-white" : "border-gray-300 bg-white text-black") : "bg-[#F0F5FF] border-transparent text-[#9E9FAA] placeholder:text-[#9E9FAA]"} 
  `}

                />
                {err.studentLastName && <p className="text-red-600 mt-1 text-sm">{err.studentLastName}</p>}
              </div>

              {/* dateOfBirth */}
              <div>
                <label className="text-[16px] lg:text-[18px] font-medium text-[#282829] mb-1 block capitalize">
                  Date of birth
                </label>
                <input
                  type="date"
                  disabled={!isEditing}
                  value={student.dateOfBirth}
                  onChange={(e) => updateStudentField(index, "dateOfBirth", e.target.value)}
                  className={`w-full rounded-md px-3 py-3 border 
  ${isEditing ? (err.dateOfBirth ? " text-black placeholder:text-black  border-red-500 bg-white" : "border-gray-300 bg-white text-black") : "bg-[#F0F5FF] border-transparent text-[#9E9FAA] placeholder:text-[#9E9FAA]"} 
  `}

                />
                {err.dateOfBirth && <p className="text-red-600 mt-1 text-sm">{err.dateOfBirth}</p>}
              </div>

              {/* Age */}
              <div>
                <label className="text-[16px] lg:text-[18px] font-medium text-[#282829] mb-1 block capitalize">
                  Age
                </label>
                <input
                  type="number"
                  disabled
                  value={student.age}
                  className="w-full rounded-md px-3 py-3 bg-[#F0F5FF] border-transparent  cursor-not-allowed text-[#9E9FAA] placeholder:text-[#9E9FAA]"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="text-[16px] lg:text-[18px] font-medium text-[#282829] mb-1 block capitalize">
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
                      backgroundColor: isEditing ? " text-black #fff" : "#F0F5FF",
                      borderColor: err.gender ? "#ef4444" : isEditing ? " text-black #ccc" : "#fff",
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
                      color: isEditing ? " text-black #000" : "#999",
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
                <label className="text-[16px] lg:text-[18px] font-medium text-[#282829] mb-1 block capitalize">
                  Medical information
                </label>

                <input
                  type="text"
                  disabled={!isEditing}
                  value={student.medicalInformation}
                  onChange={(e) => updateStudentField(index, "medicalInformation", e.target.value)}
                  className={`w-full rounded-md px-3 py-3 border 
  ${isEditing ? " text-black " : "bg-[#F0F5FF] border-transparent text-[#9E9FAA] placeholder:text-[#9E9FAA]"} 
  `}

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
