// components/Credits.jsx

import React from 'react'
import { useNavigate } from 'react-router-dom'

const Credits = ({ booking, details, loading }) => {
  const navigate = useNavigate()
  const cancelledClasses = details?.credits;

  return (
    <div className="min-h-screen">
      <div className="bg-white rounded-[30px] overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-2 px-4 sm:px-5 py-4 border-b border-gray-100">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-700 hover:text-gray-900 transition-colors"
          >
            <img src="/assets/ArrowLeft.png" className='w-6 h-6' alt="" />
          </button>
          <h1 className="text-[20px] sm:text-[24px] font-semibold text-[#282829]">Class Cancelled</h1>
        </div>

        {/* Mobile card view */}
        <div className="block sm:hidden px-4 py-4 space-y-3">
          {cancelledClasses && cancelledClasses.length > 0 ? (
            cancelledClasses.map((row) => (
              <div key={row.id} className="border border-gray-100 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[13px] text-[#717073] font-semibold shrink-0">Status</span>
                  <span className="text-[13px] text-[#282829] font-semibold text-right">{details?.venue?.name + " – " + row.date}</span>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[13px] text-[#717073] font-semibold shrink-0">Reason</span>
                  <span className="text-[13px] text-[#282829] font-semibold text-right">{row.reason}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-[13px] text-[#717073] font-semibold shrink-0">Credit</span>
                  <span className="text-[13px] text-[#282829] font-semibold">{row.credit}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-[#717073] text-[14px] font-medium py-10">No credits available.</p>
          )}
        </div>

        {/* Desktop table view */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left text-[16px] text-[#717073] font-semibold px-4 py-2.5 w-[55%]">Status</th>
                <th className="text-left text-[16px] text-[#717073] font-semibold px-4 py-2.5 w-[30%]">Reason</th>
                <th className="text-left text-[16px] text-[#717073] font-semibold px-4 py-2.5 w-[15%]">Credit</th>
              </tr>
            </thead>
            <tbody>
              {cancelledClasses && cancelledClasses.length > 0 ? (
                cancelledClasses.map((row) => (
                  <tr key={row.id} className="border-t border-gray-100">
                    <td className="px-4 py-4 text-[#282829] text-[16px] font-semibold">{details?.venue?.name + " – " + row.date}</td>
                    <td className="px-4 py-4 text-[#282829] text-[16px] font-semibold">{row.reason}</td>
                    <td className="px-4 py-4 text-[#282829] text-[16px] font-semibold">{row.credit}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-4 py-10 text-center text-[#717073] text-[16px] font-medium">
                    No credits available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}

export default Credits