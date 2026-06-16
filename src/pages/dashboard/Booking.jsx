import { ArrowLeft } from "lucide-react";
import Stepper from "../../components/booking/Stepper";
import StepNavigation from "../../components/booking/steps/StepNavigation";
import StepRenderer from "../../components/booking/steps/StepRendrer";
import BookFreeTrial from "../../components/booking/BookFreeTrial";
import { useNavigate } from "react-router-dom";

export default function Booking() {
   const navigate = useNavigate();
   const handleBack = () => {
        navigate(-1);
    };
  return (
    <div className="md:p-6 p-4 bg-[#F8FAFC] min-h-screen">
      <div className="bg-gradient-to-r from-[#042C89] to-[#0496FF] rounded-[20px] p-5 shadow-md">
          <div className="flex gap-3 items-center"> 
            <button onClick={handleBack} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white">
              <ArrowLeft size={20} />
            </button>
            <h3 className="text-[24px] text-white font-bold tracking-wide poppins">Booking</h3>
          </div>
        </div>
      <div className="md:p-8 p-5 bg-white poppins rounded-[24px] md:mt-6 mt-4 shadow-sm border border-[#E2E1E5] md:space-y-10 space-y-6">
        <Stepper />
        <StepRenderer />
        <StepNavigation />
      </div>
      {/* <BookFreeTrial /> */}

    </div>
  );
}
