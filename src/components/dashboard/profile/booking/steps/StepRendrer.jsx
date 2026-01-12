import { useStep } from "../context/StepContext";
import PlanStep from "./PlanStep";
import ServiceStep from "./ServiceStep";
import StepStudent from "./StepStudent";
import StepParent from "./StepParent";
import StepEmergency from "./StepEmergency";
import StepPayment from "./StepPayment";
import StepSummary from "./StepSummary";
import VenueStep from "./VenueStep";
// import VenueStep, PlanStep, ...

export default function StepRenderer() {
  const { currentStep } = useStep();

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
