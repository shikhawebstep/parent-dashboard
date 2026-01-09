import { useStep } from "../context/StepContext";
import PlanStep from "./PlanStep";
import ServiceStep from "./ServiceStep";
import StepStudent from "./StepStudent";
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
      return <PlanStep/>;
    case 4:
      return <StepStudent/>;
    case 8:
      return <div>Summary Component</div>;
    default:
      return <div>Coming soon</div>;
  }
}
