import Stepper from "./Stepper";
import StepNavigation from "./steps/StepNavigation";
import StepRenderer from "./steps/StepRendrer";

export default function Booking() {
  return (
      <div className="p-6 bg-white poppins border rounded-[20px] m-6 border-[#D3D3D3] space-y-8">
        <Stepper />
        <StepRenderer />
        <StepNavigation />
      </div>
  );
}
