// components/Attendance.jsx

import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'

const Attendance = () => {
  const { state } = useLocation()
  const booking = state?.booking
  const attendanceDataMain = booking?.students || []

  const [activeTab, setActiveTab] = useState(attendanceDataMain[0]?.id || null)

  if (!booking) {
    return (
      <div className="animate-fadeIn p-6 text-center bg-white rounded-[30px] shadow-sm">
        <p className="text-[#3c3c3d] font-medium">No booking details available.</p>
      </div>
    )
  }

  const activeStudent = attendanceDataMain.find((s) => s.id === activeTab) || attendanceDataMain[0];
  const schedule = activeStudent?.classSchedule || activeStudent?.holidayClassSchedules;

  const venue = schedule?.className || (schedule?.venueId ? `Venue ${schedule.venueId}` : '-');
  
  const dateStr = booking?.createdAt ? new Date(booking.createdAt).toLocaleDateString('en-GB') : '-';
  const timeStr = schedule?.startTime && schedule?.endTime ? `${schedule.startTime} – ${schedule.endTime}` : '';
  const date = timeStr ? `${dateStr} ${timeStr}` : dateStr;

  const renderAttendanceBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'attended':
        return <span className="inline-block px-3 py-1 rounded text-[14px] font-medium capitalize bg-green-100 text-green-600">Attended</span>;
      case 'absent':
        return <span className="inline-block px-3 py-1 rounded text-[14px] font-medium capitalize bg-red-100 text-red-500">Absent</span>;
      case 'pending':
        return <span className="inline-block px-3 py-1 rounded text-[14px] font-medium capitalize bg-yellow-100 text-yellow-600">Pending</span>;
      default:
        return <span className="inline-block px-3 py-1 rounded text-[14px] font-medium capitalize bg-gray-100 text-gray-600">{status || "Not Attended"}</span>;
    }
  };

  return (
    <div className="py-6 bg-white rounded-[30px] min-h-screen">
      <h1 className="text-xl px-6 font-semibold text-gray-800 mb-4">Attendance</h1>

      {/* Tab Buttons */}
      <div className="flex px-6 gap-2 mb-5 flex-wrap">
        {attendanceDataMain.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveTab(s.id)}
            className={`px-4 py-2 rounded-[12px] text-[16px] font-semibold transition-colors ${(activeTab === s.id) || (!activeTab && attendanceDataMain[0]?.id === s.id)
                ? 'bg-[#042C89] text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
          >
            {s.studentFirstName} {s.studentLastName}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden">
        <table className="w-full text-sm table-fixed">
          <thead>
            <tr className="bg-[#F5F5F5] border-t border-b">
              <th className="text-left text-[14px] text-gray-500 font-semibold px-4 py-4 w-1/3">Class Venue</th>
              <th className="text-left text-[14px] text-gray-500 font-semibold px-4 py-4 w-1/2">Date</th>
              <th className="text-left text-[14px] text-gray-500 font-semibold px-4 py-4 w-1/4">Attendance</th>
            </tr>
          </thead>
          <tbody>
            {activeStudent ? (
              <tr className="border-t border-gray-100">
                <td className="px-4 py-3 text-[14px] font-semibold text-gray-800">{venue}</td>
                <td className="px-4 py-3 text-[14px] font-semibold text-gray-800">{date}</td>
                <td className="px-4 py-3 text-[14px] font-semibold">
                  {renderAttendanceBadge(activeStudent.attendance)}
                </td>
              </tr>
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-400 text-sm">
                  No data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Attendance