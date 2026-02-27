import PlanStep from "./PlanStep";
import ServiceStep from "./ServiceStep";
import StepStudent from "./StepStudent";
import StepParent from "./StepParent";
import StepEmergency from "./StepEmergency";
import StepPayment from "./StepPayment";
import StepSummary from "./StepSummary";
import VenueStep from "./VenueStep";
import { useStep } from "../../../context/StepContext";
import { useEffect, useMemo } from "react";
import { useProfile } from "../../../context/ProfileContext";
import Loader from "../../Loader";

// import VenueStep, PlanStep, ...

export default function StepRenderer() {
  const { currentStep, fetchData, loading, setLoading, setFormData } = useStep();
  const { fetchProfileData, profile } = useProfile();

  const booking = profile?.combinedBookings;

  const holidayBooking = useMemo(() => {
    return booking?.filter(
      (b) => b?.serviceType === "holiday camp"
    ) || [];
  }, [booking]);
  console.log('holidayBooking', holidayBooking)

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        if (isMounted) setLoading(true);

        await Promise.all([
          fetchData?.(),
          fetchProfileData?.(),
        ]);
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);


  useEffect(() => {
    if (!profile?.uniqueProfiles) return;

    setFormData((prev) => ({
      ...prev,
      parents: Array.isArray(profile.uniqueProfiles.parents)
        ? profile.uniqueProfiles.parents ?? null
        : null,
      emergency: Array.isArray(profile.uniqueProfiles.emergencyContacts)
        ? profile.uniqueProfiles.emergencyContacts[0] ?? null
        : null,
    }));

    if (!holidayBooking.length) return;

    const allStudents = holidayBooking.flatMap(
      (booking) => booking.students || []
    );

    const uniqueStudents = Array.from(
      new Map(allStudents.map((s) => [s.id, s])).values()
    );

    setFormData((prev) => {
      // 🔥 Prevent unnecessary re-render
      if (JSON.stringify(prev.students) === JSON.stringify(uniqueStudents)) {
        return prev;
      }

      return {
        ...prev,
        students: uniqueStudents,
      };
    });
  }, [profile]);
  if (loading) {
    return <Loader />
  }

  switch (currentStep) {
    case 1:
      return <ServiceStep />;
    case 2:
      return <VenueStep />;
    case 3:
      return <PlanStep />;
    case 4:
      return <StepStudent />;
    case 5:
      return <StepParent />;
    case 6:
      return <StepEmergency />;
    case 7:
      return <StepPayment />;
    case 8:
      return <StepSummary />;
    default:
      return <div>Coming soon</div>;
  }
}
