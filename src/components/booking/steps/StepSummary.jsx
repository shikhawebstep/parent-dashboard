import { MapPin, User, Calendar, Clock } from "lucide-react";
import { useStep } from "../../../context/StepContext";

export default function StepSummary() {
  const { formData, data } = useStep();

  const filteredData = Array.isArray(data)
    ? data.filter((item) => item?.venueId === formData?.venue)
    : [];

  const isOneToOne = formData.service === "One To One";
  const isBirthday = formData.service === "Birthday Party";

  // Derive venue info
  const venueAddress = isOneToOne
    ? formData.oneToOne?.address
    : isBirthday
    ? formData.birthdayParty?.address
    : filteredData?.[0]?.address || "Selected Venue";

  const venueArea = isOneToOne
    ? formData.oneToOne?.location
    : isBirthday
    ? "Birthday Venue"
    : filteredData?.[0]?.area || "Venue";

  const venueDay = isOneToOne
    ? (formData.oneToOne?.date ? new Date(formData.oneToOne.date).toLocaleDateString("en-US", { weekday: "long" }) : "—")
    : isBirthday
    ? (formData.birthdayParty?.date ? new Date(formData.birthdayParty.date).toLocaleDateString("en-US", { weekday: "long" }) : "—")
    : filteredData?.[0]?.day || "—";

  const venueFacility = isOneToOne
    ? "One to One Session"
    : isBirthday
    ? "Birthday Party"
    : filteredData?.[0]?.facility || "Outdoor/Indoor";

  const rawDate = isOneToOne
    ? formData.oneToOne?.date
    : isBirthday
    ? formData.birthdayParty?.date
    : formData.service === "Weekly Class Membership"
    ? formData.startDate
    : formData.service === "Book Free Trial"
    ? formData.trialDate
    : filteredData?.[0]?.date || filteredData?.[0]?.createdAt;

  const formatDate = (dateObjOrStr) => {
    if (!dateObjOrStr) return "--/--/----";
    const date = new Date(dateObjOrStr);
    if (isNaN(date.getTime())) return String(dateObjOrStr);
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const studentsArray =
    Array.isArray(formData?.students) && formData.students.length > 0
      ? formData.students
      : formData?.student && Object.keys(formData.student).length > 0
        ? [formData.student]
        : [];

  return (
    <div className="poppins max-w-3xl mx-auto text-center py-6 px-4 md:px-0">
      {/* Heading */}
      <h2 className="text-center md:text-[24px] text-[22px] font-semibold poppins mb-8 text-[#191919]">
        Summary
      </h2>
      <p className="poppins text-[18px] text-[#191919] font-semibold mb-2">
        Thanks, your all set!
      </p>
      <p className="poppins text-[#717073] text-[15px] mb-8 mt-1 font-medium">
        Please see below for a summary of your booking
      </p>

      {/* Card */}
      <div className="poppins bg-white max-w-[672px] mx-auto rounded-3xl border border-[#E2E1E5] p-3.5 shadow-sm">
        {/* Venue Bar */}
        <div className="poppins bg-[#00A6E3] text-white rounded-2xl px-6 py-4.5 flex items-center gap-3 mb-3.5">
          <MapPin size={22} className="shrink-0" />
          <p className="poppins font-bold text-[16px] text-left leading-snug">
            Venue: <span className="poppins font-semibold">{venueAddress}</span>
          </p>
        </div>

        {/* Details Wrapper */}
        <div className="poppins bg-[#F6F6F7] rounded-2xl p-6">
          {/* 3-Column Info */}
          <div className="poppins grid grid-cols-3 items-center justify-center mb-6 text-center">
            {/* Area */}
            <div className="poppins px-2">
              <p className="poppins font-semibold text-[18px] text-[#191919] capitalize">{venueArea}</p>
            </div>

            {/* Day / Facility */}
            <div className="poppins border-x-2 border-white px-2">
              <p className="poppins font-semibold text-[18px] text-[#191919] capitalize">{venueDay}</p>
              <p className="poppins text-[13px] text-[#717073] font-medium mt-0.5">{venueFacility}</p>
            </div>

            {/* Date */}
            <div className="poppins px-2">
              <p className="poppins text-[13px] text-[#717073] font-medium">Date</p>
              <p className="poppins font-semibold text-[16px] text-[#191919] mt-0.5">{formatDate(rawDate)}</p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#E2E1E5] my-5" />

          {/* Student List */}
          <div className="poppins space-y-4">
            {studentsArray.length > 0 ? (
              studentsArray.map((student, index) => {
                const sName = student?.studentFirstName
                  ? `${student.studentFirstName} ${student.studentLastName || ""}`.trim()
                  : "Unnamed Student";

                const sClass = isOneToOne
                  ? (formData.oneToOne?.package || "One to One Package")
                  : isBirthday
                  ? (formData.birthdayParty?.package || "Birthday Party Package")
                  : student?.className || student?.holidayClassSchedules?.className || filteredData?.[0]?.ageGroup || "4-7 years";

                const sTime = isOneToOne
                  ? (formData.oneToOne?.time || "Selected Time")
                  : isBirthday
                  ? (formData.birthdayParty?.time || "Selected Time")
                  : student?.time ||
                    (student?.startTime && student?.endTime
                      ? `${student.startTime} - ${student.endTime}`
                      : student?.holidayClassSchedules?.startTime && student?.holidayClassSchedules?.endTime
                        ? `${student.holidayClassSchedules.startTime} - ${student.holidayClassSchedules.endTime}`
                        : filteredData?.[0]?.time || "9:30 am - 10:30 am");

                return (
                  <div
                    key={index}
                    className="poppins grid grid-cols-3 gap-4 items-center text-[15px] font-semibold text-[#5F5F6D]"
                  >
                    {/* Student Name */}
                    <div className="poppins flex items-center gap-2 truncate">
                      <User size={18} className="text-[#00A6E3] shrink-0" />
                      <span className="poppins truncate text-[#5F5F6D] text-left">{sName}</span>
                    </div>

                    {/* Class */}
                    <div className="poppins flex items-center gap-2 truncate justify-center">
                      <Calendar size={18} className="text-[#00A6E3] shrink-0" />
                      <span className="poppins truncate text-[#5F5F6D]">{sClass}</span>
                    </div>

                    {/* Time */}
                    <div className="poppins flex items-center gap-2 truncate justify-end">
                      <Clock size={18} className="text-[#00A6E3] shrink-0" />
                      <span className="poppins truncate text-[#5F5F6D] text-right">{sTime}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="poppins text-sm text-[#717073] font-medium">No students added yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
