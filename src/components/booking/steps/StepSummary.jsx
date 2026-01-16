import { useState } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStep } from "../../../context/StepContext";

export default function StepSummary() {
    const { formData } = useStep();

    const navigate = useNavigate();

    const { venue, students = [], parent = {} } = formData;

    // Derived session info (using defaults for missing context fields)
    const sessionInfo = {
        area: venue || "Venue not selected",
        day: "Saturday", // Placeholder as Day is not in formData
        type: formData.service || "Service",
        date: "09/09/2023", // Placeholder
        time: "9:30 am - 10:30 am", // Placeholder
        ageGroup: "4-7 Years" // Placeholder
    };



    return (
        <div className="poppins max-w-3xl mx-auto text-center mt-16 px-4 md:px-0">
            {/* Heading */}
            <p className="poppins text-[18px] text-[#282829] font-semibold mb-2">
                Thanks, you're all set!
            </p>
            <p className="poppins text-[#5F5F6D] text-[14px] mb-7 mt-1">
                Please see below for a summary of your booking
            </p>

            {/* Card */}
            <div className="poppins bg-white max-w-[672px] mx-auto rounded-2xl border border-[#E2E1E5] p-3">
                {/* Venue Bar */}
                <div className="poppins bg-[#00A6E3] text-white rounded-xl px-6 py-4 flex items-center justify-center gap-3 mb-3">
                    <img src="/assets/location-01.png" className="poppins w-5 h-5" alt="location" />
                    <p className="poppins font-semibold text-left">
                        Venue: <span className="poppins font-normal">{sessionInfo.area}</span>
                    </p>
                </div>

                {/* Session Info */}
                <div className="poppins bg-[#F6F6F7] border border-[#FCF9F6] rounded-xl md:p-6 p-3 mb-1">
                    <div className="poppins grid grid-cols-3 items-center mb-4 max-w-[370px] mx-auto">
                        <div className="poppins text-left ps-4">
                            <p className="poppins font-semibold">{sessionInfo.area}</p>
                        </div>

                        <div className="poppins border-x-4 border-white">
                            <p className="poppins font-semibold">{sessionInfo.day}</p>
                            <p className="poppins text-sm text-gray-500">{sessionInfo.type}</p>
                        </div>

                        <div className="poppins text-left ps-8">
                            <p className="poppins font-semibold">Date</p>
                            <p className="poppins text-sm text-gray-500">{sessionInfo.date}</p>
                        </div>
                    </div>

                    <div className="poppins border-t-4 border-[#FDFDFF] pt-4 space-y-3">
                        <div className="poppins md:max-w-[88%] mx-auto">
                            {students.length > 0 ? (
                                students.map((student, index) => (
                                    <div
                                        key={index}
                                        className="poppins grid grid-cols-3 items-center justify-between text-sm text-gray-700 gap-4"
                                    >
                                        <div className="poppins flex flex-col md:flex-row items-center md:text-left justify-center gap-2 truncate">
                                            <img src="/assets/UserMain.png" alt="user" className="poppins w-4 h-4 text-sky-500" />
                                            <span className="poppins truncate">
                                                {student?.firstName
                                                    ? `${student.firstName} ${student.lastName || ""}`.trim()
                                                    : "Unnamed Student"}
                                            </span>
                                        </div>

                                        <div className="poppins flex flex-col md:flex-row items-center md:text-left justify-center gap-2 truncate">
                                            <img src="/assets/content.png" alt="content" className="poppins w-4 h-4 text-sky-500" />
                                            <span className="poppins truncate">{student.class || sessionInfo.ageGroup}</span>
                                        </div>

                                        <div className="poppins flex flex-col md:flex-row items-center md:text-left justify-center gap-2 truncate">
                                            <img src="/assets/clock.png" alt="clock" className="poppins w-4 h-4 text-sky-500" />
                                            <span className="poppins text-left truncate">{sessionInfo.time}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="poppins text-sm text-gray-500">No students added yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>



        </div>
    );
}
