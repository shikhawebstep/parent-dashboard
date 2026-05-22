import { useState, useEffect } from "react";
import { useStep } from "../../../context/StepContext";

export default function StepStudent() {
  const { formData, setFormData, data, errors, clearError } = useStep();
  const [activeTab, setActiveTab] = useState("existing");
  const [dobError, setDobError] = useState("");

  const availableStudents = formData.availableStudents || [];
  const selectedStudents = formData.students || [];
  const MAX_STUDENTS = 4;

  const filteredData = Array.isArray(data)
    ? data.filter((item) => item?.venueId === formData?.venue)
    : [];

  const handleClassChange = (classId) => {
    const selectedClass = (filteredData?.[0]?.classes ?? []).find(
      (cls) => cls?.classId === Number(classId)
    );
    if (!selectedClass) return;

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

  const handleToggleStudent = (student) => {
    const isSelected = selectedStudents.some((s) => s.id === student.id);

    if (isSelected) {
      setFormData((prev) => ({
        ...prev,
        students: (prev.students || []).filter((s) => s.id !== student.id),
      }));
    } else {
      // Block if already 4 selected
      if (selectedStudents.length >= MAX_STUDENTS) return;

      const classes = filteredData?.[0]?.classes ?? [];
      const autoClass = classes.length === 1 ? classes[0] : null;

      setFormData((prev) => ({
        ...prev,
        students: [
          ...(prev.students || []),
          {
            ...student,
            classSchedule: autoClass || student.classSchedule || student?.holidayClassSchedules,
            classScheduleId:
              autoClass?.classId ||
              student.classScheduleId ||
              student.classSchedule?.classId ||
              student.classSchedule?.id ||
              "",
            className:
              autoClass?.className ||
              student.className ||
              student?.classSchedule?.className ||
              student?.holidayClassSchedules?.className ||
              "",
            time:
              autoClass?.time ||
              autoClass?.startTime ||
              student.time ||
              student?.classSchedule?.time ||
              student?.classSchedule?.startTime ||
              "",
            medicalInformation: student.medicalInformation || "",
            type: "existing",
          },
        ],
      }));
    }
  };

  useEffect(() => {
    if (activeTab === "new") {
      setFormData((prev) => ({
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
      setDobError("");
    }
  }, [activeTab]);

  // ── DOB helpers ──────────────────────────────────────────────
  const parseDob = (raw) => {
    // accepts DD-MM-YYYY
    const parts = raw.split("-");
    if (parts.length !== 3) return null;
    const [dd, mm, yyyy] = parts.map(Number);
    if (!dd || !mm || !yyyy) return null;
    if (mm < 1 || mm > 12) return null;
    if (dd < 1 || dd > 31) return null;
    if (yyyy < 1900 || yyyy > new Date().getFullYear()) return null;
    const date = new Date(yyyy, mm - 1, dd);
    if (
      date.getFullYear() !== yyyy ||
      date.getMonth() !== mm - 1 ||
      date.getDate() !== dd
    )
      return null;
    return date;
  };

  const handleDobInput = (raw) => {
    // Strip everything except digits
    let digits = raw.replace(/\D/g, "");
    if (digits.length > 8) digits = digits.slice(0, 8);

    // Auto-insert dashes: DD-MM-YYYY
    let formatted = digits;
    if (digits.length > 2) formatted = digits.slice(0, 2) + "-" + digits.slice(2);
    if (digits.length > 4)
      formatted = digits.slice(0, 2) + "-" + digits.slice(2, 4) + "-" + digits.slice(4);

    let age = "";
    let className = "";
    let dobErr = "";

    if (formatted.length === 10) {
      const date = parseDob(formatted);
      if (!date) {
        dobErr = "Invalid date. Use DD-MM-YYYY.";
      } else if (date > new Date()) {
        dobErr = "Date of birth cannot be in the future.";
      } else {
        age = new Date().getFullYear() - date.getFullYear();
        className = age <= 7 ? "4–7 years" : "10–12 years";
      }
    }

    setDobError(dobErr);
    setFormData((prev) => ({
      ...prev,
      student: {
        ...prev.student,
        dateOfBirth: formatted,
        age: dobErr ? "" : age,
        className: dobErr ? "" : className,
        type: "new",
      },
    }));

    clearError("studentDob");
  };

  const handleFieldChange = (field, value) => {
    const updatedStudent = { ...formData.student, [field]: value, type: "new" };
    setFormData((prev) => ({ ...prev, student: updatedStudent }));

    const errorMap = {
      studentFirstName: "studentstudentFirstName",
      studentLastName: "studentLastName",
      gender: "studentGender",
      medicalInformation: "studentmedicalInformation",
    };
    if (errorMap[field]) clearError(errorMap[field]);
  };

  const saveNewStudent = () => {
    const s = formData.student;
    if (!s?.studentFirstName || !s?.dateOfBirth || !s?.gender) return;
    if (dobError || s.dateOfBirth.length < 10) return;

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

    setFormData((prev) => ({
      ...prev,
      availableStudents: [...(prev.availableStudents || []), newStudent],
      students: [...(prev.students || []), { ...newStudent, type: "existing" }],
      student: {},
    }));
    setDobError("");
    setActiveTab("existing");
  };

  const inputClass = (hasError) =>
    `mt-1 w-full placeholder:text-[#9C9C9C] bg-white poppins font-normal mainShadow ${
      hasError ? "border border-red-500" : ""
    } p-3 rounded-[6px] text-sm focus:ring-2 focus:ring-[#0496FF] outline-none`;

  const student = formData.student || {};
  const atLimit = selectedStudents.length >= MAX_STUDENTS;

  return (
    <div className="max-w-4xl mx-auto bg-white py-4 px-0 md:px-6">
      <h2 className="text-center md:text-[24px] text-[18px] font-semibold poppins mb-2">
        Student information
      </h2>

      {/* Selection counter */}
      <p className="text-center text-sm poppins text-[#939395] mb-6">
        {selectedStudents.length} / {MAX_STUDENTS} children selected
      </p>

      {/* Limit banner */}
      {atLimit && (
        <div className="max-w-[670px] mx-auto mb-4 flex items-center gap-2 bg-amber-50 border border-amber-300 text-amber-700 text-sm poppins px-4 py-2.5 rounded-lg">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
          </svg>
          Maximum of {MAX_STUDENTS} children reached. Deselect one to change your selection.
        </div>
      )}

      {/* Tabs */}
      <div className="flex justify-center items-center gap-6 mb-8">
        <button
          onClick={() => setActiveTab("existing")}
          className={`poppins font-semibold transition-all ${
            activeTab === "existing"
              ? "bg-[#E8F1FF] text-[#0496FF] md:px-6 px-3 py-2 rounded-lg"
              : "text-[#282829] md:text-[16px] text-[14px]"
          }`}
        >
          Select an existing child
        </button>

        <button
          onClick={() => setActiveTab("new")}
          className={`poppins font-semibold transition-all ${
            activeTab === "new"
              ? "bg-[#E8F1FF] text-[#0496FF] md:px-6 px-3 py-2 rounded-lg"
              : "text-[#282829] md:text-[16px] text-[14px]"
          }`}
        >
          Add a new child
        </button>
      </div>

      {/* ── Existing Students ── */}
      {activeTab === "existing" && (
        <div className="grid max-h-[600px] overflow-auto sm:grid-cols-2 max-w-[670px] mx-auto gap-6">
          {availableStudents.length === 0 && (
            <div className="col-span-2 text-center py-8">
              <p className="text-[#939395] text-sm poppins">
                No existing children found. Please add a new child.
              </p>
            </div>
          )}

          {availableStudents.map((s) => {
            const isSelected = selectedStudents.some((sel) => sel.id === s.id);
            const isDisabled = !isSelected && atLimit;

            return (
              <div
                key={s.id}
                onClick={() => !isDisabled && handleToggleStudent(s)}
                className={`border rounded-xl p-6 relative transition-all ${
                  isDisabled
                    ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                    : isSelected
                    ? "border-[#0496FF] bg-blue-50/30 shadow-sm cursor-pointer"
                    : "border-gray-200 bg-white hover:border-gray-300 cursor-pointer"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-4 right-4 text-[#0496FF]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                      viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                <h3 className={`font-semibold text-[18px] mb-4 poppins ${
                  isSelected ? "text-[#0496FF]" : "text-[#282829]"
                }`}>
                  {s.studentFirstName} {s.studentLastName}
                </h3>

                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                  <div>
                    <label className="text-[12px] text-[#939395] block font-normal mb-1 poppins">
                      Date of birth
                    </label>
                    <p className="text-[14px] text-[#282829] poppins font-medium">{s.dateOfBirth}</p>
                  </div>
                  <div>
                    <label className="text-[12px] text-[#939395] block font-normal mb-1 poppins">Age</label>
                    <p className="text-[14px] text-[#282829] poppins font-medium">{s.age}</p>
                  </div>
                  <div>
                    <label className="text-[12px] text-[#939395] block font-normal mb-1 poppins">Gender</label>
                    <p className="text-[14px] text-[#282829] poppins font-medium">
                      {s.gender === "Male" ? "M" : s.gender === "Female" ? "F" : s.gender}
                    </p>
                  </div>
                  <div>
                    <label className="text-[12px] text-[#939395] block font-normal mb-1 poppins">
                      Class / Level
                    </label>
                    <p className="text-[14px] text-[#282829] poppins font-medium">
                      {s?.classSchedule?.className || s?.className || s?.holidayClassSchedules?.className || "-"}{" "}
                      {s?.classSchedule?.level || s?.level || s?.holidayClassSchedules?.level || ""}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── New Student ── */}
      {activeTab === "new" && (
        <div className="grid max-w-[670px] m-auto md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[14px] text-[#282829] poppins font-normal mb-1 capitalize">
              First name
            </label>
            <input
              placeholder="Enter first name"
              value={student.studentFirstName || ""}
              onChange={(e) => handleFieldChange("studentFirstName", e.target.value)}
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
              onChange={(e) => handleFieldChange("studentLastName", e.target.value)}
              className={inputClass(errors.studentLastName)}
            />
          </div>

          {/* DOB — plain text, auto-dash */}
          <div>
            <label className="block text-[14px] text-[#282829] poppins font-normal mb-1 capitalize">
              Date of birth
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="DD-MM-YYYY"
              maxLength={10}
              value={student.dateOfBirth || ""}
              onChange={(e) => handleDobInput(e.target.value)}
              className={inputClass(errors.studentDob || dobError)}
            />
            {dobError && (
              <p className="text-red-500 text-xs poppins mt-1">{dobError}</p>
            )}
          </div>

          <div>
            <label className="block text-[14px] text-[#282829] poppins font-normal mb-1 capitalize">
              Age
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
              Gender
            </label>
            <select
              value={student.gender || ""}
              onChange={(e) => handleFieldChange("gender", e.target.value)}
              className={inputClass(errors.studentGender)}
            >
              <option value="">Enter gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-[14px] text-[#282829] poppins font-normal mb-1 capitalize">
              Medical information
            </label>
            <input
              placeholder="Enter medical information"
              value={student.medicalInformation || ""}
              onChange={(e) => handleFieldChange("medicalInformation", e.target.value)}
              className={inputClass(errors.studentmedicalInformation)}
            />
          </div>

          <div>
            <label className="block text-[14px] text-[#282829] poppins font-normal mb-1 capitalize">
              Class
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
                    {cls?.className}{cls?.level ? ` (${cls.level})` : ""}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-[#939395]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[14px] text-[#282829] poppins font-normal mb-1 capitalize">
              Time
            </label>
            <div className="relative">
              <input
                readOnly
                value={student?.time || ""}
                placeholder="Automatic entry"
                className={`${inputClass()} bg-white text-gray-500`}
              />
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-[#939395]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
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