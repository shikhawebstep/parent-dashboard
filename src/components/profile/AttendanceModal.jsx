import React from 'react';
import { X } from 'lucide-react';

const AttendanceModal = ({ isOpen, onClose, students }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-[550px] max-h-[90vh] overflow-y-auto rounded-[20px] p-0 relative shadow-xl mx-4">
                {/* Header */}
                <div className="px-6 py-5 flex items-center justify-between relative border-b border-gray-100">
                    <h2 className="text-[20px] font-bold text-[#191919] w-full text-center gilory">
                        Attendance
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors absolute right-6"
                    >
                        <X size={20} className="text-[#333]" strokeWidth={1.5} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {students && students.length > 0 ? (
                        <div className="space-y-4">
                            {students.map((student, index) => (
                                <div key={student.id || index} className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[#042C89] font-bold">
                                            {student.studentFirstName?.[0]}{student.studentLastName?.[0]}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-[#191919]">
                                                {student.studentFirstName} {student.studentLastName}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {student.age} years old
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${student.attendance === 'attended' ? 'bg-green-100 text-green-700' :
                                            student.attendance === 'not attended' ? 'bg-red-100 text-red-700' :
                                                'bg-gray-100 text-gray-700'
                                        }`}>
                                        {student.attendance || "No Record"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-gray-500">
                            No attendance records found.
                        </div>
                    )}

                    <div className="mt-6">
                        <button
                            onClick={onClose}
                            className="w-full py-3.5 rounded-xl bg-[#042C89] text-white font-semibold hover:bg-blue-900 transition-colors gilory"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceModal;
