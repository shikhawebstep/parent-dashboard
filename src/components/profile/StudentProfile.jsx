import { Plus, Save } from "lucide-react";
import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useProfile } from "../../context/ProfileContext";
import AddStudentModal from "../modals/AddStudentModal";
import { showSuccess, showError } from "../../../utils/swalHelper";

const genderOptions = [
  { value: "", label: "Select Gender" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const emptyStudent = {
  studentFirstName: "",
  studentLastName: "",
  dateOfBirth: "",
  age: "",
  gender: "",
  medicalInfo: "",
};

const convertToDDMMYYYY = (dateStr) => {
  if (!dateStr) return "";
  if (/^\d{2}[/\-]\d{2}[/\-]\d{4}$/.test(dateStr)) return dateStr.replace(/-/g, "/");
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[3]}/${match[2]}/${match[1]}`;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const convertToYYYYMMDD = (dateStr) => {
  if (!dateStr) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const match = dateStr.match(/^(\d{2})[/\-](\d{2})[/\-](\d{4})$/);
  if (match) return `${match[3]}-${match[2]}-${match[1]}`;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

const handleDobChange = (value, prevValue = "") => {
  if (value.length < prevValue.length) return value;
  const clean = value.replace(/\D/g, "");
  const truncated = clean.substring(0, 8);
  let formatted = "";
  if (truncated.length > 0) {
    formatted += truncated.substring(0, 2);
    if (truncated.length === 2 && value.length >= prevValue.length) formatted += "/";
  }
  if (truncated.length > 2) {
    formatted += "/" + truncated.substring(2, 4);
    if (truncated.length === 4 && value.length >= prevValue.length) formatted += "/";
  }
  if (truncated.length > 4) formatted += "/" + truncated.substring(4, 8);
  return formatted;
};

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return "";
  const birthDate = new Date(convertToYYYYMMDD(dateOfBirth));
  if (isNaN(birthDate.getTime())) return "";
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age < 0 ? "" : age;
}

/* ─── Same inputClass helper as ParentProfile ─── */
const inputClass = (editable, hasError) =>
  `w-full lg:p-3 p-2 border border-[#E2E1E5] rounded-[12px] focus:outline-none focus:border-[#042C89] text-[#383A46] outline-none transition-colors bg-white ${hasError ? "!border-red-500" : ""}`;

/* ─── Field wrapper same as ParentProfile ─── */
const Field = ({ label, error, children }) => (
  <div>
    <p className="text-[16px] font-semibold text-[#282829] mb-1.5">{label}</p>
    {children}
    {error && <p className="text-red-500 text-[12px] mt-1">{error}</p>}
  </div>
);

/* ─── Sidebar row helper ─── */
const SidebarRow = ({ label, value, children }) => (
  <div className="border-b border-[#495362] pb-2">
    <p className="text-white 2xl:text-[20px] xl:text-[18px] text-[16px] font-medium mb-1">{label}</p>
    {children || (
      <p className="font-semibold text-[#BDC0C3] lg:text-[16px] text-[15px]">{value}</p>
    )}
  </div>
);

const StudentProfile = () => {
  const [students, setStudents] = useState([{ ...emptyStudent }]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [errors, setErrors] = useState([{}]);
  const { profile, updateProfile, fetchProfileData } = useProfile();

  /* ===== LOAD DATA FROM PROFILE ===== */
  useEffect(() => {
    if (!profile) {
      setStudents([]);
      setErrors([]);
      return;
    }
    const profileStudents = profile?.adminMeta?.students || [];
    setStudents(profileStudents.map((s) => ({
      ...s,
      dateOfBirth: convertToDDMMYYYY(s.dateOfBirth),
    })));
    setErrors(profileStudents.map(() => ({})));
  }, [profile]);

  const deleteStudent = (index) => {
    setStudents((prev) => prev.filter((_, i) => i !== index));
    setErrors((prev) => prev.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  const updateStudentField = (index, field, value) => {
    const updated = [...students];
    updated[index] = { ...updated[index], [field]: value };
    if (field === "dateOfBirth") updated[index].age = calculateAge(value);
    setStudents(updated);
    const newErrors = [...errors];
    if (newErrors[index]) {
      newErrors[index][field] = "";
      setErrors(newErrors);
    }
  };

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

  const cleanedStudents = students.map(({ id, studentFirstName, studentLastName, dateOfBirth, age, gender, medicalInfo }) => ({
    id,
    studentFirstName,
    studentLastName,
    dateOfBirth: convertToYYYYMMDD(dateOfBirth),
    age,
    gender,
    medicalInfo,
  }));

  const profileParents = profile?.parents || [];
  const cleanedParents = profileParents.map(({ relationChild, howDidHear, ...rest }) => ({
    ...rest,
    relationToChild: relationChild ?? "",
    howDidYouHear: howDidHear ?? "",
  }));

  const emergency = profile?.emergency || {};
  const cleanedEmergency = {
    id: emergency?.id,
    studentId: emergency?.studentId,
    emergencyFirstName: emergency?.emergencyFirstName,
    emergencyLastName: emergency?.emergencyLastName,
    emergencyPhoneNumber: emergency?.emergencyPhoneNumber,
    emergencyRelation: emergency?.emergencyRelation,
  };

  // add import at top

  // add saving state
  const [savingIndex, setSavingIndex] = useState(null);

  const handleSave = async (index) => {
    const student = students[index];
    const validationErrors = validateStudent(student);
    const newErrors = [...errors];
    newErrors[index] = validationErrors;
    setErrors(newErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const token = localStorage.getItem("parentToken");
    setSavingIndex(index);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}api/parent/booking-update/student/${student.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            studentFirstName: student.studentFirstName,
            studentLastName: student.studentLastName,
            dateOfBirth: convertToYYYYMMDD(student.dateOfBirth),
            age: student.age,
            gender: student.gender,
            medicalInformation: student.medicalInfo,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Update failed");
      showSuccess("Saved", data?.message || "Student updated successfully");
      setEditingIndex(null);
      fetchProfileData();
    } catch (err) {
      console.error(err);
      showError("Error", err.message || "Something went wrong");
    } finally {
      setSavingIndex(null);
    }
  };

  /* ===== SIDEBAR DATA ===== */
  const sidebarInfo = profile?.adminMeta || {};
  const parentFirstName = sidebarInfo?.parents?.[0]?.parentFirstName?.trim() || "";
  const parentLastName = sidebarInfo?.parents?.[0]?.parentLastName?.trim() || "";
  const parentDisplayName = `${parentFirstName} ${parentLastName}`.trim();
  const relationToChild = sidebarInfo?.parents?.[0]?.relationToChild?.trim();
  const parentRelation = relationToChild ? ` / ${relationToChild}` : "";
  const profilePhoto = profile?.accountInfo?.profile;

  const allBookings = Array.isArray(profile?.bookings)
    ? profile.bookings
    : profile?.groupedBookings
      ? Object.values(profile.groupedBookings).flat()
      : profile?.combinedBookings || [];

  let displayBooking = null;
  const priorities = [
    "weekly class membership",
    "holiday camp",
    "one to one",
    "birthday party"
  ];

  for (const type of priorities) {
    const found = allBookings?.find(b => b?.serviceType?.toLowerCase() === type);
    if (found) {
      displayBooking = found;
      break;
    }
  }
  if (!displayBooking && allBookings?.length > 0) {
    displayBooking = allBookings[0];
  }

  const serviceType = displayBooking?.serviceType?.toLowerCase() || "weekly class membership";

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${day}-${month}-${year}`;
  };

  return (
    <div className="min-h-screen p-5 md:p-0">
      <div className="flex gap-5 mt-2 items-start md:flex-row flex-col-reverse">

        {/* LEFT — Student Cards */}
        <div className="flex-1 lg:w-9/12 min-w-0 md:py-4 w-full">

          {/* Add Student Button */}
          {students.length <= 3 && (
            <div className="md:text-right px-6 lg:p-0 lg:bg-white md:bg-transparent xl:absolute top-7 right-5 mb-6">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-2 font-medium md:text-[18px] text-[15px] px-4 py-2 bg-[#0DD180] text-white rounded-lg hover:bg-green-700"
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
              <div key={index} className="bg-white rounded-[30px] mt-4 md:mt-0 md:p-6 md:mb-6 shadow-sm">

                {/* Card Header */}
                <div className="flex justify-between items-center mb-5">
                  <h2 className="font-bold text-[18px] text-[#282829]">
                    Student {index + 1} information
                  </h2>
                  <button
                    onClick={() => { if (isEditing) handleSave(index); else setEditingIndex(index); }}
                    title={isEditing ? "Save" : "Edit"}
                    className="text-gray-400 hover:text-black"
                  >
                    {isEditing
                      ? <Save size={18} />
                      : <img src="/assets/edit.png" className="w-5" alt="Edit" />}
                  </button>
                </div>

                {/* Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                  {/* First Name */}
                  <Field label="First name" error={err.studentFirstName}>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={student.studentFirstName}
                      onChange={(e) => updateStudentField(index, "studentFirstName", e.target.value)}
                      className={inputClass(isEditing, !!err.studentFirstName)}
                    />
                  </Field>

                  {/* Last Name */}
                  <Field label="Last name" error={err.studentLastName}>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={student.studentLastName}
                      onChange={(e) => updateStudentField(index, "studentLastName", e.target.value)}
                      className={inputClass(isEditing, !!err.studentLastName)}
                    />
                  </Field>

                  {/* Date of Birth */}
                  <Field label="Date of birth" error={err.dateOfBirth}>
                    <input
                      type="text"
                      placeholder="DD/MM/YYYY"
                      disabled={!isEditing}
                      value={student.dateOfBirth}
                      onChange={(e) => {
                        const formatted = handleDobChange(e.target.value, student.dateOfBirth);
                        updateStudentField(index, "dateOfBirth", formatted);
                      }}
                      className={inputClass(isEditing, !!err.dateOfBirth)}
                    />
                  </Field>

                  {/* Age — always disabled */}
                  <Field label="Age">
                    <input
                      type="number"
                      disabled
                      value={student.age}
                      className={inputClass(false, false) + " cursor-not-allowed"}
                    />
                  </Field>

                  {/* Gender */}
                  <Field label="Gender" error={err.gender}>
                    <Select
                      isDisabled={!isEditing}
                      value={genderOptions.find((o) => o.value?.toLowerCase() === student.gender?.toLowerCase()) || null}
                      onChange={(selected) => updateStudentField(index, "gender", selected ? selected.value : "")}
                      options={genderOptions}
                      classNamePrefix="react-select"
                      styles={{
                        control: (provided, state) => ({
                          ...provided,
                          backgroundColor: "#fff",
                          borderColor: err.gender ? "#ef4444" : "#E2E1E5",
                          borderRadius: "12px",
                          minHeight: "52px",
                          fontWeight: "600",
                          fontSize: "14px",
                          boxShadow: "none",
                          "&:hover": { borderColor: state.isFocused ? "#042C89" : "#9CA3AF" },
                        }),
                        singleValue: (provided) => ({ ...provided, color: "#383A46" }),
                        indicatorSeparator: () => ({ display: "none" }),
                        dropdownIndicator: (provided) => ({ ...provided, color: isEditing ? "#6B7280" : "#9CA3AF" }),
                        menu: (provided) => ({ ...provided, zIndex: 9999 }),
                      }}
                      placeholder="Select"
                    />
                  </Field>

                  {/* Medical Info */}
                  <Field label="Medical information">
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={student.medicalInfo}
                      onChange={(e) => updateStudentField(index, "medicalInfo", e.target.value)}
                      className={inputClass(isEditing, false)}
                    />
                  </Field>

                </div>

                {/* Delete / Save Buttons */}
                {isEditing && index > 0 && (
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
            selectedBooking={profile}
          />
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="xl:w-[30%] md:w-[40%]  m-auto mt-5 md:mt-0 w-full">
          <div className="bg-[#363E49] rounded-[30px] overflow-hidden text-white shadow-lg flex flex-col lg:p-4 p-3 h-fit">

            {/* Header banner */}
            <div
              style={{ backgroundImage: "url('/assets/Frame.png')" }}
              className="bg-cover bg-center px-6 rounded-[20px] md:py-4 py-2 flex justify-between items-center relative overflow-hidden"
            >
              <div className="flex flex-col">
                <h3 className="text-black font-bold 2xl:text-[20px] text-[18px] leading-tight">
                  Account Status
                </h3>
                <span className="text-black/80 lg:text-[16px] text-[14px] text-[#282829] font-semibold">
                  {displayBooking?.status || sidebarInfo?.status || "Active"}
                </span>
              </div>
            </div>

            <div className="md:px-5 py-4 space-y-4">
              {/* Avatar + name */}
              <div className="flex items-center gap-4">
                <img src={profilePhoto || "/assets/dummy-avatar.png"} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
                <div>
                  <h4 className="md:text-[24px] 2xl:text-[20px] text-[18px] font-bold leading-tight">
                    Account Holder
                  </h4>
                  <p className="lg:text-[16px] text-[14px] text-[#BDC0C3] font-medium">
                    {parentDisplayName}{parentRelation}
                  </p>
                </div>
              </div>

              <hr className="border-white/10" />

              <SidebarRow label="Venue">
                <span className="px-2.5 py-0.5 rounded-[6px] bg-[#042C89] text-white text-[12px] font-semibold">
                  {displayBooking?.classSchedule?.venue?.name || displayBooking?.venue?.name || displayBooking?.holidayVenue?.name || displayBooking?.location || (typeof sidebarInfo.venue === "object"
                    ? sidebarInfo.venue?.name || sidebarInfo.venue?.area || "London"
                    : sidebarInfo.venue || "London")}
                </span>
              </SidebarRow>

              {serviceType === "weekly class membership" && (
                <>
                  <SidebarRow label="Membership Plan" value={sidebarInfo.membershipPlan || displayBooking?.paymentPlan?.title || "—"} />
                  <SidebarRow label="Membership Start Date" value={sidebarInfo.startDate || formatDate(displayBooking?.startDate || displayBooking?.createdAt)} />
                  <SidebarRow label="Membership Tenure" value={sidebarInfo.tenure || "0 days"} />
                  <SidebarRow label="ID" value={sidebarInfo.id || displayBooking?.id || "—"} />

                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-white 2xl:text-[20px] xl:text-[18px] lg:text-[16px] text-[14px] font-medium">Progress</span>
                      <span className="font-semibold text-[#BDC0C3] lg:text-[16px] text-[15px]">{sidebarInfo.progress || 0}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[#0DD180] rounded-full" style={{ width: `${sidebarInfo.progress || 0}%` }} />
                    </div>
                  </div>
                  <hr className="border-white/10" />
                  <SidebarRow label="Price" value={sidebarInfo.price ? `£${sidebarInfo.price}` : displayBooking?.paymentPlan?.price ? `£${displayBooking.paymentPlan.price}` : "—"} />
                </>
              )}

              {serviceType === "holiday camp" && (
                <>
                  <SidebarRow label="Camp Name" value={displayBooking?.holidayCamp?.name || "—"} />
                  <SidebarRow label="Camp Date(s)" value={formatDate(displayBooking?.holidayCamp?.holidayCampDates?.[0]?.startDate || displayBooking?.createdAt)} />
                  <SidebarRow label="Number of Students" value={displayBooking?.students?.length || 0} />
                  <SidebarRow label="ID" value={displayBooking?.id || "—"} />
                  <hr className="border-white/10" />
                  <SidebarRow label="Price" value={displayBooking?.payments?.[0]?.amount ? `£${displayBooking.payments[0].amount}` : "—"} />
                </>
              )}

              {serviceType === "one to one" && (
                <>
                  <SidebarRow label="Coach Name" value={`${displayBooking?.coach?.firstName || ""} ${displayBooking?.coach?.lastName || ""}`.trim() || "—"} />
                  <SidebarRow label="Package" value={displayBooking?.package?.packageName || "—"} />
                  <SidebarRow label="Number of Lessons" value={displayBooking?.package?.noOfSessions || displayBooking?.package?.noOfLessons || "—"} />
                  <SidebarRow label="Lessons Remaining" value={displayBooking?.lessonsRemaining ?? "—"} />
                  <SidebarRow label="ID" value={displayBooking?.id || "—"} />
                  <hr className="border-white/10" />
                  <SidebarRow label="Price" value={displayBooking?.payment?.amount ? `£${displayBooking.payment.amount}` : "—"} />

                  <div className="mt-4">
                    <button className="w-full py-2 rounded-[8px] bg-[#0DD180] text-white text-[16px] font-semibold hover:bg-green-600 transition">
                      Renew Package
                    </button>
                  </div>
                </>
              )}

              {serviceType === "birthday party" && (
                <>
                  <SidebarRow label="Coach Name" value={`${displayBooking?.coach?.firstName || ""} ${displayBooking?.coach?.lastName || ""}`.trim() || "—"} />
                  <SidebarRow label="Party Package" value={displayBooking?.package?.packageName || "—"} />
                  <SidebarRow label="Party Date" value={formatDate(displayBooking?.leads?.partyDate || displayBooking?.date)} />
                  <SidebarRow label="No of Children" value={displayBooking?.students?.length || displayBooking?.noOfChildren || "—"} />
                  <SidebarRow label="ID" value={displayBooking?.id || "—"} />
                  <hr className="border-white/10" />
                  <SidebarRow label="Price Paid" value={displayBooking?.payment?.amount ? `£${displayBooking.payment.amount}` : "—"} />
                </>
              )}
            </div>
          </div>

          {/* Action buttons */}

        </div>

      </div>
    </div>
  );
};

export default StudentProfile;