import { useState } from "react";
import { useStep } from "../../../context/StepContext";
import { showSuccess, showError } from "../../../../utils/swalHelper";

export default function StepNavigation() {
  const [loading, setLoading] = useState(false);

  const { nextStep, prevStep, currentStep, STEPS, formData, data } = useStep();

  const filteredData = Array.isArray(data)
    ? data.filter((item) => item?.venueId === formData?.venue)
    : [];


  console.log('formData', formData)
 const handleSubmit = async () => {
  try {
    setLoading(true);

    const token = localStorage.getItem("parentToken");
    const parentData = JSON.parse(localStorage.getItem("parentData"));
    const parentId = parentData?.id;
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    // ✅ Students array handling
    const studentsArray =
      Array.isArray(formData?.students) && formData.students.length > 0
        ? formData.students
        : formData?.student && Object.keys(formData.student).length > 0
        ? [formData.student]
        : [];

    // ✅ Clean students properly
    const cleanedStudents = studentsArray.map((student) => ({
      studentFirstName: student.studentFirstName,
      studentLastName: student.studentLastName,
      dateOfBirth: student.dateOfBirth,
      age: student.age,
      gender: student.gender,
      medicalInformation: student.medicalInformation,
      classScheduleId: student.classScheduleId, // ✅ FIXED
    }));

    // ✅ Clean parents
    const finalParents =
      formData?.parents?.map((parent) => ({
        parentFirstName: parent.parentFirstName,
        parentLastName: parent.parentLastName,
        parentEmail: parent.parentEmail,
        parentPhoneNumber: parent.parentPhoneNumber,
        relationToChild: parent.relationChild,
        howDidYouHear: parent.howDidHear,
      })) || [];

    // ✅ Clean emergency safely
    const cleanedEmergency = formData?.emergency
      ? {
          emergencyFirstName: formData.emergency.emergencyFirstName,
          emergencyLastName: formData.emergency.emergencyLastName,
          emergencyPhoneNumber: formData.emergency.emergencyPhoneNumber,
          emergencyRelation: formData.emergency.emergencyRelation,
        }
      : null;

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
    <div className="flex justify-center gap-3 md:mt-8">
      {currentStep > 1 && (
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="md:px-[70px] px-[20px] md:py-4 py-2 text-[#717073] poppins font-semibold md:text-[18px] border border-[#E1E1E1] rounded-[12px] disabled:opacity-40"
        >
          Cancel
        </button>
      )}

      <button
        onClick={currentStep === STEPS.length ? handleSubmit : nextStep}
        disabled={loading}
        className="md:px-[70px] px-[20px] md:py-4 py-2 bg-[#237FEA] text-white poppins rounded-[12px] disabled:opacity-40"
      >
        {currentStep === STEPS.length
          ? loading
            ? "Submitting..."
            : currentStep === 7 ? "confirm payment" : "Finish"
          : "Next"}
      </button>
    </div>
  );
} 
