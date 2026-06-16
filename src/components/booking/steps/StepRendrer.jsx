import PlanStep from "./PlanStep";
import ServiceStep from "./ServiceStep";
import StepStudent from "./StepStudent";
import StepParent from "./StepParent";
import StepEmergency from "./StepEmergency";
import StepPayment from "./StepPayment";
import StepSummary from "./StepSummary";
import VenueStep from "./VenueStep";
import MembershipInfoStep from "./MembershipInfoStep";
import TrialInfoStep from "./TrialInfoStep";
import WaitingListInfoStep from "./WaitingListInfoStep";
import WaitingListDetailsStep from "./WaitingListDetailsStep";
import OneToOneInfoStep from "./OneToOneInfoStep";
import BirthdayPartyInfoStep from "./BirthdayPartyInfoStep";
import DateStep from "./DateStep";
import { useStep } from "../../../context/StepContext";
import { useEffect, useMemo } from "react";
import { useProfile } from "../../../context/ProfileContext";
import Loader from "../../Loader";

export default function StepRenderer() {
  const { currentStep, fetchData, loading, setLoading, setFormData, getActiveSteps, formData } = useStep();
  const { fetchProfileData, profile } = useProfile();

  // Flatten all bookings from groupedBookings or fall back to combinedBookings
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

  // Determine serviceTypeKey for filtering profile data
  const serviceTypeKey = useMemo(() => {
    if (formData.service === "Holiday Camp Booking") return "holiday camp";
    if (formData.service === "Weekly Class Membership") return "weekly class";
    return null;
  }, [formData.service]);

  // Filter bookings based on selected service or fallback to all bookings
  const bookingsToProcess = useMemo(() => {
    const serviceBookings = serviceTypeKey
      ? booking.filter((b) => b?.serviceType === serviceTypeKey)
      : [];
    return serviceBookings.length > 0 ? serviceBookings : booking;
  }, [booking, serviceTypeKey]);

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
    if (!profile?.adminMeta) return;

    const uniqueParents = profile.adminMeta.parents || [];
    const emergency = profile.adminMeta.emergency || null;
    const uniqueStudents = profile.adminMeta.students || [];

    setFormData((prev) => {
      const mappedParents = uniqueParents.map((p) => ({
        ...p,
        relationChild: p.relationChild || p.relationToChild || "",
        howDidHear: p.howDidHear || p.howDidYouHear || "",
      }));

      const mappedEmergency = emergency ? {
        ...emergency,
        emergencyPhoneNumber: emergency.emergencyPhoneNumber || emergency.emergencyPhone || "",
      } : null;

      const mappedStudents = uniqueStudents.map((s) => ({
        ...s,
        medicalInformation: s.medicalInformation || s.medicalInfo || "",
      }));

      const parentsChanged =
        JSON.stringify(prev.parents) !== JSON.stringify(mappedParents);
      const emergencyChanged =
        JSON.stringify(prev.emergency) !== JSON.stringify(mappedEmergency);
      const studentsChanged =
        JSON.stringify(prev.availableStudents) !== JSON.stringify(mappedStudents);

      // Only update if something actually changed
      if (!parentsChanged && !emergencyChanged && !studentsChanged) return prev;

      return {
        ...prev,
        ...(parentsChanged && { parents: mappedParents }),
        ...(emergencyChanged && { emergency: mappedEmergency }),
        ...(studentsChanged && { availableStudents: mappedStudents }),
      };
    });
  }, [profile]);

  if (loading) {
    return <Loader />;
  }

  const activeSteps = getActiveSteps();
  const step = activeSteps[currentStep - 1];

  if (!step) {
    return <div>Coming soon</div>;
  }

  switch (step.name) {
    case "service":
      return <ServiceStep />;
    case "venue":
      return <VenueStep />;
    case "plan":
      return <PlanStep />;
    case "membership_info":
      return <MembershipInfoStep />;
    case "start_date":
    case "trial_date":
      return <DateStep />;
    case "trial_info":
      return <TrialInfoStep />;
    case "waiting_list_info":
      return <WaitingListInfoStep />;
    case "waiting_list_details":
      return <WaitingListDetailsStep />;
    case "one_to_one_info":
      return <OneToOneInfoStep />;
    case "birthday_party_info":
      return <BirthdayPartyInfoStep />;
    case "student":
      return <StepStudent />;
    case "parent":
      return <StepParent />;
    case "emergency":
      return <StepEmergency />;
    case "payment":
      return <StepPayment />;
    case "summary":
      return <StepSummary />;
    default:
      return <div>Coming soon</div>;
  }
}