import { useState } from "react";
import { useStep } from "../../../context/StepContext";
import { showSuccess, showError } from "../../../../utils/swalHelper";

export default function StepNavigation() {
  const [loading, setLoading] = useState(false);

  const { nextStep, prevStep, currentStep, getActiveSteps, formData, data } = useStep();
  const activeSteps = getActiveSteps();

  const filteredData = Array.isArray(data)
    ? data.filter((item) => item?.venueId === formData?.venue)
    : [];

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("parentToken");
      const parentData = JSON.parse(localStorage.getItem("parentData"));
      const parentId = parentData?.id;
      const API_URL = import.meta.env.VITE_API_BASE_URL;

      // Students array handling
      const studentsArray =
        Array.isArray(formData?.students) && formData.students.length > 0
          ? formData.students
          : formData?.student && Object.keys(formData.student).length > 0
            ? [formData.student]
            : [];

      const cleanedStudents = studentsArray.map((student) => ({
        studentFirstName: student.studentFirstName,
        studentLastName: student.studentLastName,
        dateOfBirth: student.dateOfBirth,
        age: student.age,
        gender: student.gender,
        medicalInformation: student.medicalInformation,
        classScheduleId: student.classScheduleId,
      }));

      const finalParents =
        formData?.parents?.map((parent) => ({
          parentFirstName: parent.parentFirstName,
          parentLastName: parent.parentLastName,
          parentEmail: parent.parentEmail,
          parentPhoneNumber: parent.parentPhoneNumber,
          relationToChild: parent.relationChild,
          howDidYouHear: parent.howDidHear,
        })) || [];

      const cleanedEmergency = formData?.emergency
        ? {
          emergencyFirstName: formData.emergency.emergencyFirstName,
          emergencyLastName: formData.emergency.emergencyLastName,
          emergencyPhoneNumber: formData.emergency.emergencyPhoneNumber,
          emergencyRelation: formData.emergency.emergencyRelation,
        }
        : null;

      // Handle custom services locally with a success popup
      if (formData.service !== "Holiday Camp Booking") {
        let msg = `${formData.service} has been booked successfully!`;
        if (formData.service === "Weekly Class Membership") {
          msg = `Your Weekly Class Membership (${formData.membershipPlan || "Gold"}) has been set up successfully for ${cleanedStudents.length} student(s) at ${filteredData?.[0]?.address || "the selected venue"}.`;
        } else if (formData.service === "Book Free Trial") {
          msg = `Your Free Trial has been booked for ${cleanedStudents.length} student(s) on ${formData.trialDate ? new Date(formData.trialDate).toLocaleDateString() : "the selected date"}.`;
        } else if (formData.service === "Add To Waiting List") {
          msg = `Successfully added to the Waiting List with a ${formData.levelOfInterest || "Low"} level of interest.`;
        } else if (formData.service === "One To One") {
          msg = `Your One to One session has been booked with ${formData.oneToOne?.coach || "your coach"} on ${formData.oneToOne?.date || "selected date"} at ${formData.oneToOne?.time || "selected time"}.`;
        } else if (formData.service === "Birthday Party") {
          msg = `Your Birthday Party package (${formData.birthdayParty?.package || "Gold"}) has been booked successfully for ${formData.birthdayParty?.date || "selected date"} at ${formData.birthdayParty?.time || "selected time"}.`;
        }

        showSuccess("Booking Successful 🎉", msg);
        setLoading(false);
        return;
      }

      // Holiday Camp Booking submission
      const response = await fetch(
        `${API_URL}api/parent/holiday/book-a-camp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            venueId: formData?.venue,
            totalStudents: cleanedStudents.length,
            parentAdminId: parentId,
            paymentPlanId: formData?.plan,
            holidayCampId: filteredData?.[0]?.holidayCamps?.[0]?.id,
            students: cleanedStudents,
            parents: finalParents,
            emergency: cleanedEmergency,
            payment: formData?.payment,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Something went wrong");
      }

      showSuccess(
        "Booking Successful 🎉",
        result?.message || "Holiday camp booked successfully"
      );

      console.log(result);
    } catch (error) {
      console.error(error);
      showError("Oops!", error.message || "Failed to book holiday camp");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center gap-4 md:mt-10 mt-6 pt-6 border-t border-[#F1F1F1]">
      {currentStep > 1 && (
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="md:px-[70px] px-[30px] md:py-4 py-3 text-[#6B7280] poppins font-bold md:text-[16px] text-[15px] border-2 border-[#E5E7EB] hover:border-[#D1D5DB] hover:text-[#374151] rounded-[16px] disabled:opacity-40 transition-all active:scale-[0.98] shadow-sm"
        >
          Back
        </button>
      )}

      <button
        onClick={currentStep === activeSteps.length ? handleSubmit : nextStep}
        disabled={loading}
        className="md:px-[70px] px-[30px] md:py-4 py-3 bg-[#042C89] hover:bg-[#031d5c] text-white poppins font-bold md:text-[16px] text-[15px] rounded-[16px] disabled:opacity-50 transition-all active:scale-[0.98] shadow-md hover:shadow-lg"
      >
        {currentStep === activeSteps.length
          ? loading
            ? "Submitting..."
            : activeSteps[currentStep - 1]?.name === "payment" ? "Confirm payment" : "Finish"
          : "Next"}
      </button>
    </div>
  );
} 
