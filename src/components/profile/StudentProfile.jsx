import { Plus, Save } from "lucide-react";
import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useProfile } from "../../context/ProfileContext";
import AddStudentModal from "./AddStudentModal";

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

const convertToDDMMYYYY = (dateStr) => {
  if (!dateStr) return "";
  if (/^\d{2}[/\-]\d{2}[/\-]\d{4}$/.test(dateStr)) {
    return dateStr.replace(/-/g, "/");
  }
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const convertToYYYYMMDD = (dateStr) => {
  if (!dateStr) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  const match = dateStr.match(/^(\d{2})[/\-](\d{2})[/\-](\d{4})$/);
  if (match) {
    return `${match[3]}-${match[2]}-${match[1]}`;
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
};

const isValidDate = (dateStr) => {
  if (!dateStr) return false;
  const match = dateStr.match(/^(\d{2})[/\-](\d{2})[/\-](\d{4})$/);
  if (!match) return false;
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1900 || year > new Date().getFullYear()) return false;

  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

const handleDobChange = (value, prevValue = "") => {
  if (value.length < prevValue.length) {
    return value;
  }
  const clean = value.replace(/\D/g, "");
  const truncated = clean.substring(0, 8);
  let formatted = "";
  if (truncated.length > 0) {
    formatted += truncated.substring(0, 2);
    if (truncated.length === 2 && value.length >= prevValue.length) {
      formatted += "/";
    }
  }
  if (truncated.length > 2) {
    formatted += "/" + truncated.substring(2, 4);
    if (truncated.length === 4 && value.length >= prevValue.length) {
      formatted += "/";
    }
  }
  if (truncated.length > 4) {
    formatted += "/" + truncated.substring(4, 8);
  }
  return formatted;
};

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return "";
  const yyyymmdd = convertToYYYYMMDD(dateOfBirth);
  const birthDate = new Date(yyyymmdd);
  if (isNaN(birthDate.getTime())) return "";
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age < 0 ? "" : age;
}

const getBookingLabel = (booking) => {
  if (!booking) return "Booking";
  const dateStr = booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : "";

  let title = "";
  if (booking.serviceType === "weekly class membership") {
    title = booking?.paymentPlan?.title || "Weekly Class Membership";
  } else if (booking.serviceType === "holiday camp") {
    title = booking?.holidayCamp?.name || "Holiday Camp";
  } else if (booking.serviceType === "birthday party") {
    title = booking?.leads?.packageInterest || "Birthday Party";
  } else if (booking.serviceType === "one to one") {
    title = booking?.leads?.packageInterest || "One to One";
  } else {
    title = booking?.serviceType || "Booking";
  }

  const venue = booking?.classSchedule?.venue?.name || booking?.venue?.name || booking?.holidayVenue?.name || booking?.location || "";

  return [title, venue, dateStr].filter(Boolean).join(" - ");
};

const StudentProfile = ({ activeServiceType }) => {
  const [students, setStudents] = useState([{ ...emptyStudent }]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { profile, updateProfile } = useProfile();

  // Validation errors: array of objects per student
  const [errors, setErrors] = useState([{}]);

  const [selectedBookingId, setSelectedBookingId] = useState(() => {
    return localStorage.getItem(`selectedBookingId_${activeServiceType}`) || "";
  });

  const getBookingId = (booking, index) => {
    return booking?.id ? String(booking.id) : String(index);
  };

  const allBookingsList = profile?.combinedBookings
    || (profile?.groupedBookings ? Object.values(profile.groupedBookings).flat() : [])
    || (Array.isArray(profile) ? profile : []);

  const activeBookings = allBookingsList.filter((booking) => {
    if (!activeServiceType) return true;
    return booking?.serviceType === activeServiceType;
  });

  useEffect(() => {
    if (activeBookings.length > 0) {
      const hasSelected = activeBookings.some((b, idx) => getBookingId(b, idx) === selectedBookingId);
      if (!hasSelected) {
        const initialId = getBookingId(activeBookings[0], 0);
        setSelectedBookingId(initialId);
        localStorage.setItem(`selectedBookingId_${activeServiceType}`, initialId);
      }
    } else {
      setSelectedBookingId("");
    }
  }, [activeBookings, activeServiceType, selectedBookingId]);

  const selectedBooking = activeBookings.find((b, idx) => getBookingId(b, idx) === selectedBookingId) || activeBookings[0];

  const handleBookingChange = (bookingId) => {
    setSelectedBookingId(bookingId);
    localStorage.setItem(`selectedBookingId_${activeServiceType}`, bookingId);
    setEditingIndex(null);
  };

  useEffect(() => {
    if (!selectedBooking) {
      setStudents([]);
      setErrors([]);
      return;
    }
    const bookingStudents = selectedBooking.students || [];
    setStudents(bookingStudents.map(s => ({
      ...s,
      dateOfBirth: convertToDDMMYYYY(s.dateOfBirth)
    })));
    setErrors(bookingStudents.map(() => ({})));
  }, [selectedBooking]);

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
    } else if (!isValidDate(student.dateOfBirth)) {
      err.dateOfBirth = "Invalid date of birth (use DD/MM/YYYY)";
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
      dateOfBirth: convertToYYYYMMDD(dateOfBirth),
      age,
      gender,
      medicalInformation,
    })
  );

  const bookingParents = selectedBooking?.parents || [];
  const cleanedParents = bookingParents.map(
    ({ relationChild, howDidHear, ...rest }) => ({
      ...rest,
      relationToChild: relationChild ?? "",
      howDidYouHear: howDidHear ?? "",
    })
  );

  const emergency = selectedBooking?.emergency || {};
  const cleanedEmergency = {
    id: emergency?.id,
    studentId: emergency?.studentId,
    emergencyFirstName: emergency?.emergencyFirstName,
    emergencyLastName: emergency?.emergencyLastName,
    emergencyPhoneNumber: emergency?.emergencyPhoneNumber,
    emergencyRelation: emergency?.emergencyRelation,
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

      let finalDataToSend;
      if (activeServiceType === "weekly class membership" || activeServiceType === "holiday camp") {
        const mappedParents = bookingParents.map((p) => ({
          id: p.id,
          parentFirstName: p.parentFirstName,
          parentLastName: p.parentLastName,
          parentEmail: p.parentEmail,
          parentPhoneNumber: p.parentPhoneNumber,
          relationChild: p.relationChild || p.relationToChild || "",
          howDidHear: p.howDidHear || p.howDidYouHear || "",
        }));

        const mappedEmergency = {
          id: emergency?.id,
          emergencyFirstName: emergency?.emergencyFirstName,
          emergencyLastName: emergency?.emergencyLastName,
          emergencyPhoneNumber: emergency?.emergencyPhoneNumber,
          emergencyRelation: emergency?.emergencyRelation,
        };

        finalDataToSend = {
          serviceType: activeServiceType === "weekly class membership" ? "weekly class" : "holiday camp",
          bookingId: selectedBooking?.id,
          students: cleanedStudents,
          parents: mappedParents,
          emergency: mappedEmergency,
          ...(activeServiceType === "holiday camp" ? {
            paymentPlanId: selectedBooking?.paymentPlan?.id,
            holidayCampId: selectedBooking?.holidayCamp?.id,
            payment: selectedBooking?.payment
          } : {})
        };
      } else {
        finalDataToSend = {
          parentAdminId: parentId,
          students: cleanedStudents,
          parents: cleanedParents,
          emergencyContacts: [cleanedEmergency]
        };
      }

      updateProfile(finalDataToSend);
    }
  };

  return (
    <div className="md:py-4 ">
      {/* ================= Booking Selector ================= */}
      {activeBookings.length > 0 && (
        <div className="bg-white lg:rounded-[30px] p-6 mb-6 flex flex-col gap-2 shadow-sm">
          <label className="text-[15px] font-semibold text-[#111827]">
            Select Booking
          </label>
          <div className="relative w-full">
            <select
              value={selectedBookingId}
              onChange={(e) => handleBookingChange(e.target.value)}
              className="w-full appearance-none rounded-2xl border border-[#E5EAF2] bg-[#F9FAFB] hover:bg-white px-5 py-4 pr-12 text-[15px] font-medium text-[#111827] shadow-sm outline-none transition-all duration-300 focus:border-[#042C89] focus:ring-4 focus:ring-[#042C89]/10"
            >
              {activeBookings.map((b, idx) => (
                <option key={getBookingId(b, idx)} value={getBookingId(b, idx)}>
                  {getBookingLabel(b)}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 9L12 15L18 9"
                  stroke="#6B7280"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Button */}
{activeServiceType === "holiday camp" && students.length <= 3 && (
        <div className="md:text-right px-6 lg:p-0 bg-white md:bg-transparent xl:absolute top-7 right-5 md:mb-6">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 font-medium text-[18px] px-4 py-2 bg-[#0DD180] text-white rounded-lg hover:bg-green-700"
          >
            <Plus size={20} className="text-white font-bold" />
            Add New Student
          </button>
        </div>
      )}

      {students.length === 0 && (
        <div className="bg-white lg:rounded-[30px] p-6 py-16 md:mb-6 text-center text-gray-500 text-[18px] font-medium border border-gray-100 shadow-sm">
          No students found.
        </div>
      )}

      {students.map((student, index) => {
        const isEditing = editingIndex === index;
        const err = errors[index] || {};

        return (
          <div
            key={index}
            className="bg-white lg:rounded-[30px] p-6 md:mb-6"
          >
            <div className="flex gap-2 items-center mb-4">
              <h2 className="font-bold text-[24px] text-[#282829]">
                Student {index + 1} information
              </h2>
              {(activeServiceType === "weekly class membership" || activeServiceType === "holiday camp") && (
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
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="text-[16px] lg:text-[18px] font-medium text-[#282829] mb-1 block ">
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
                <label className="text-[16px] lg:text-[18px] font-medium text-[#282829] mb-1 block ">
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
                <label className="text-[16px] lg:text-[18px] font-medium text-[#282829] mb-1 block ">
                  Date of birth
                </label>
                <input
                  type="text"
                  placeholder="DD/MM/YYYY"
                  disabled={!isEditing}
                  value={student.dateOfBirth}
                  onChange={(e) => {
                    const formatted = handleDobChange(e.target.value, student.dateOfBirth);
                    updateStudentField(index, "dateOfBirth", formatted);
                  }}
                  className={`w-full rounded-md px-3 py-3 border 
  ${isEditing ? (err.dateOfBirth ? " text-black placeholder:text-black  border-red-500 bg-white" : "border-gray-300 bg-white text-black") : "bg-[#F0F5FF] border-transparent text-[#9E9FAA] placeholder:text-[#9E9FAA]"} 
  `}

                />
                {err.dateOfBirth && <p className="text-red-600 mt-1 text-sm">{err.dateOfBirth}</p>}
              </div>

              {/* Age */}
              <div>
                <label className="text-[16px] lg:text-[18px] font-medium text-[#282829] mb-1 block ">
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
                <label className="text-[16px] lg:text-[18px] font-medium text-[#282829] mb-1 block ">
                  Gender
                </label>
                <Select
                  isDisabled={!isEditing}
                  value={genderOptions.find((o) => o.value?.toLowerCase() === student.gender?.toLowerCase()) || null}
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
                <label className="text-[16px] lg:text-[18px] font-medium text-[#282829] mb-1 block ">
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

      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        selectedBooking={selectedBooking}
        activeServiceType={activeServiceType}
      />
    </div>
  );
};

export default StudentProfile;
