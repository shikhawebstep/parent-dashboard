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

  // Flatten all bookings from groupedBookings or fall back to adminMeta
  const booking = useMemo(() => {
    if (Array.isArray(profile?.adminMeta)) {
      return profile.adminMeta;
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
  if (!profile) return;

  const adminMeta = profile?.adminMeta;

  // --- From adminMeta (always available) ---
  const metaParents = Array.isArray(adminMeta?.parents) ? adminMeta.parents : [];
  const metaStudents = Array.isArray(adminMeta?.students) ? adminMeta.students : [];
  const metaEmergency = adminMeta?.emergency ?? null;

  // --- From holiday bookings (optional, overrides if present) ---
  const allParents = holidayBooking.flatMap((b) =>
    Array.isArray(b?.parents) ? b.parents : []
  );
  const uniqueParents = allParents.length
    ? Array.from(
        new Map(
          allParents
            .filter((p) => p?.id != null)
            .map((p) => [p.id, p])
        ).values()
      )
    : metaParents;

  const emergency =
    holidayBooking.map((b) => b?.emergency).find((e) => e != null) ??
    metaEmergency;

  const allStudents = holidayBooking.flatMap((b) =>
    Array.isArray(b?.students) ? b.students : []
  );
  const uniqueStudents = allStudents.length
    ? Array.from(
        new Map(
          allStudents
            .filter((s) => s?.id != null)
            .map((s) => [s.id, s])
        ).values()
      )
    : metaStudents;

  setFormData((prev) => {
    const parentsChanged =
      JSON.stringify(prev.parents) !== JSON.stringify(uniqueParents);
    const emergencyChanged =
      JSON.stringify(prev.emergency) !== JSON.stringify(emergency);
    const studentsChanged =
      JSON.stringify(prev.availableStudents) !== JSON.stringify(uniqueStudents);

    if (!parentsChanged && !emergencyChanged && !studentsChanged) return prev;

    return {
      ...prev,
      ...(parentsChanged && { parents: uniqueParents }),
      ...(emergencyChanged && { emergency }),
      ...(studentsChanged && { availableStudents: uniqueStudents }),
    };
  });
}, [profile, holidayBooking]);  // ← added profile as dependency
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