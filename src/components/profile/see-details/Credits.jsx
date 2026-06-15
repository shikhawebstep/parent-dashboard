// components/Credits.jsx

import React from 'react'
import { useNavigate } from 'react-router-dom'

const cancelledClasses = [
  { id: 1, status: 'Acton – 01/06/2023 11:00 – 12:00', reason: 'Injured at home', credit: '04' },
  { id: 2, status: 'Acton – 01/06/2023 11:00 – 12:00', reason: 'Injured at home', credit: '04' },
  { id: 3, status: 'Acton – 01/06/2023 11:00 – 12:00', reason: 'Injured at home', credit: '-' },
  { id: 4, status: 'Acton – 01/06/2023 11:00 – 12:00', reason: 'Weather', credit: '04' },
  { id: 5, status: 'Acton – 01/06/2023 11:00 – 12:00', reason: 'Weather', credit: '-' },
]

const Credits = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen">
      <div className="bg-white  rounded-[30px] overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-700 hover:text-gray-900 transition-colors"
          >
           <img src="/assets/ArrowLeft.png" className='w-6 h-6' alt="" />
          </button>
          <h1 className="text-[24px] font-semibold text-[#282829]">Class Cancelled</h1>
        </div>

        {/* Table */}
        <table className="w-full text-sm table-fixed">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left text-[16px] text-[#717073] font-semibold px-4 py-2.5 w-[55%]">Status</th>
              <th className="text-left text-[16px] text-[#717073] font-semibold px-4 py-2.5 w-[30%]">Reason</th>
              <th className="text-left text-[16px] text-[#717073] font-semibold px-4 py-2.5 w-[15%]">Credit</th>
            </tr>
          </thead>
          <tbody>
            {cancelledClasses.map((row) => (
              <tr key={row.id} className="border-t border-gray-100">
                <td className="px-4 py-4 text-[#282829] text-[16px] font-semibold">{row.status}</td>
                <td className="px-4 py-4 text-[#282829] text-[16px] font-semibold">{row.reason}</td>
                <td className="px-4 py-4 text-[#282829] text-[16px] font-semibold">{row.credit}</td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  )
}

export default Credits