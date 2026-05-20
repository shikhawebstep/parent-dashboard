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

export default function StepRenderer() {
  const { currentStep, fetchData, loading, setLoading, setFormData } = useStep();
  const { fetchProfileData, profile } = useProfile();

  // Flatten all bookings from groupedBookings (weeklyClass, holidayCamp, oneToOne, birthdayParty, etc.)
  // or fall back to combinedBookings if present
  const booking = useMemo(() => {
    if (Array.isArray(profile?.combinedBookings)) {
      return profile.combinedBookings;
    }
    if (profile?.groupedBookings && typeof profile.groupedBookings === "object") {
      return Object.values(profile.groupedBookings)
        .filter(Array.isArray)
        .flat();
    }
    return [];
  }, [profile]);


  const holidayBooking = useMemo(() => {
    return booking.filter((b) => b?.serviceType === "holiday camp");
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

    const parents = Array.isArray(profile.uniqueProfiles.parents)
      ? profile.uniqueProfiles.parents
      : null;

    const emergency = Array.isArray(profile.uniqueProfiles.emergencyContacts)
      ? (profile.uniqueProfiles.emergencyContacts[0] ?? null)
      : null;

    setFormData((prev) => ({
      ...prev,
      parents,
      emergency,
    }));

    if (!holidayBooking.length) return;

    const allStudents = holidayBooking.flatMap(
      (b) => (Array.isArray(b?.students) ? b.students : [])
    );

    // Deduplicate students by id
    const uniqueStudents = Array.from(
      new Map(
        allStudents
          .filter((s) => s?.id !== undefined && s?.id !== null)
          .map((s) => [s.id, s])
      ).values()
    );

    setFormData((prev) => {
      if (
        JSON.stringify(prev.availableStudents) ===
        JSON.stringify(uniqueStudents)
      ) {
        return prev;
      }
      return {
        ...prev,
        availableStudents: uniqueStudents,
      };
    });
  }, [profile]);

  if (loading) {
    return <Loader />;
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