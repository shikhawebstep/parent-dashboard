import { ArrowLeft } from "lucide-react";
import Stepper from "../../components/booking/Stepper";
import StepNavigation from "../../components/booking/steps/StepNavigation";
import StepRenderer from "../../components/booking/steps/StepRendrer";
import BookFreeTrial from "../../components/booking/BookFreeTrial";

export default function Booking() {
  return (
    <div className="p-6">
      {/* <div className="bg-[#125294] rounded-[20px] p-4">
          <div className="flex gap-2 items-center"> <ArrowLeft size={20}  className="text-white"/>
            <h3 className="text-[24px] text-white font-bold">Booking</h3></div>
        </div>
      <div className="p-6 bg-white poppins border rounded-[20px] mt-6 border-[#D3D3D3] space-y-8">
        <Stepper />
        <StepRenderer />
        <StepNavigation />
      </div> */}
      <BookFreeTrial />

    </div>
  );
}
