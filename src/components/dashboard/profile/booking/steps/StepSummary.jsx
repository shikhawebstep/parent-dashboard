import { MapPin, Calendar, Clock, User, ClipboardList, CheckCircle } from "lucide-react";
import { useStep } from "../context/StepContext";

export default function StepSummary() {
    const { prevStep } = useStep();

    return (
        <div className="w-full max-w-4xl mx-auto py-8">
            <h2 className="text-[#191919] font-bold text-2xl mb-8 text-center">
                Summary
            </h2>

            <div className="text-center mb-8">
                <h3 className="text-lg font-bold text-[#191919] mb-2">Thanks, your all set!</h3>
                <p className="text-sm text-gray-500">Please see below for a summary of your booking</p>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 max-w-3xl mx-auto">
                {/* Header */}
                <div className="bg-[#00A1E0] p-6 flex items-center gap-3 text-white">
                    <MapPin className="fill-current" />
                    <div className="font-bold">
                        Venue: <span className="font-normal">The King Fahad Academy, East Acton Lane, London W3 7HD</span>
                    </div>
                </div>

                <div className="p-8 bg-[#FAFAFA]">
                    <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-200 mb-8 w-fit mx-auto">
                        <div className="px-8 py-2 text-center">
                            <h4 className="font-bold text-[#191919]">Acton</h4>
                        </div>
                        <div className="px-8 py-2 text-center">
                            <h4 className="font-bold text-[#191919]">Saturday</h4>
                            <span className="text-xs text-gray-500">Outdoor</span>
                        </div>
                        <div className="px-8 py-2 text-center">
                            <h4 className="font-bold text-[#191919]">Date</h4>
                            <span className="text-xs text-gray-500">09/09/2023</span>
                        </div>
                    </div>

                    <div className="space-y-4 max-w-lg mx-auto">
                        <div className="flex items-center justify-between text-[#191919] text-sm">
                            <div className="flex items-center gap-2 w-1/3">
                                <User size={18} className="text-[#00A1E0]" />
                                <span>Bob Jones</span>
                            </div>
                            <div className="flex items-center gap-2 w-1/3">
                                <ClipboardList size={18} className="text-[#00A1E0]" />
                                <span>4-7 Years</span>
                            </div>
                            <div className="flex items-center gap-2 w-1/3 justify-end">
                                <Clock size={18} className="text-[#00A1E0]" />
                                <span>9:30 am - 10:30 am</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-[#191919] text-sm">
                            <div className="flex items-center gap-2 w-1/3">
                                <User size={18} className="text-[#00A1E0]" />
                                <span>Tim Jones</span>
                            </div>
                            <div className="flex items-center gap-2 w-1/3">
                                <ClipboardList size={18} className="text-[#00A1E0]" />
                                <span>4-7 Years</span>
                            </div>
                            <div className="flex items-center gap-2 w-1/3 justify-end">
                                <Clock size={18} className="text-[#00A1E0]" />
                                <span>9:30 am - 10:30 am</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
}
