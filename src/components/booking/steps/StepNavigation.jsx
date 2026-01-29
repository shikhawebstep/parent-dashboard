import { useState } from "react";
import { useStep } from "../../../context/StepContext";
import Swal from "sweetalert2";

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
      const studentsArray = Array.isArray(formData?.students)
        ? formData.students
        : formData?.student
          ? [formData.student]
          : [];

      const cleanedStudents = studentsArray.map(
        ({
          studentFirstName,
          studentLastName,
          dateOfBirth,
          age,
          gender,
          medicalInformation,
        }) => ({
          studentFirstName,
          studentLastName,
          dateOfBirth,
          age,
          gender,
          medicalInformation,
        })
      );


      const cleanedParents = formData?.parents?.map(
        ({ relationChild, howDidHear, ...rest }) => ({
          ...rest,
          relationToChild: relationChild,
          howDidYouHear: howDidHear,
        })
      );



      const finalParents = cleanedParents.map(
        ({
          parentFirstName,
          parentLastName,
          parentEmail,
          parentPhoneNumber,
          relationToChild,
          howDidYouHear
        }) => ({
          parentFirstName,
          parentLastName,
          parentEmail,
          parentPhoneNumber,
          relationToChild,
          howDidYouHear
        })
      );
      const emergency = formData?.emergency
      const cleanedEmergency = {
        emergencyFirstName: emergency.emergencyFirstName,
        emergencyLastName: emergency.emergencyLastName,
        emergencyPhoneNumber: emergency.emergencyPhoneNumber,
        emergencyRelation: emergency.emergencyRelation,
      }


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
            totalStudents: formData?.student ? 1 : cleanedStudents.length,
            parentAdminId: parentId,
            classScheduleId: filteredData?.[0]?.classes?.[0]?.classId,
            paymentPlanId: formData?.plan,
            holidayCampId: filteredData?.[0]?.holidayCamps[0]?.id,
            students: formData?.student ? [formData?.student] : cleanedStudents,
            parents: finalParents, // ✅ updated here
            emergency: cleanedEmergency,
            payment: formData?.payment,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Something went wrong");
      }

      Swal.fire({
        icon: "success",
        title: "Booking Successful 🎉",
        text: result?.message || "Holiday camp booked successfully",
      });

      console.log(result);
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: error.message || "Failed to book holiday camp",
      });
    } finally {
      setLoading(false);
    }
  };

  console.log('currentStep',currentStep)

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
