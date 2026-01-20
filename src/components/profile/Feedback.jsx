import React, { useState } from 'react'
import { Plus } from "lucide-react";
import AddFeedbackModal from './AddFeedbackModal';

const Feedback = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const feedbackData = Array(12).fill({
    date: '01/06/2023',
    type: 'Negative', // Will map to index to alternate
    venue: 'Acton',
    category: 'Time',
    notes: 'I think is too much time for my kid',
    staff: 'Jaffar',
    status: 'In process'
  }).map((item, index) => ({
    ...item,
    id: index,
    type: index > 3 ? 'Positive' : 'Negative'
  }));

  return (
    <div className='p-4 lg:p-0'>
      <div className="flex justify-end md:justify-between items-center mb-4 md:mb-6 lg:absolute md:top-10 md:right-5">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 px-4 py-2.5 font-semibold rounded-[12px] text-[16px] md:text-[18px] bg-[#0DD180] text-white hover:bg-[#0bb36d] transition-colors"
        >
          <Plus size={17} /> Add Feedback
        </button>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block overflow-auto rounded-[30px] border border-[#EFEEF2] bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-[#F5F5F5] text-left ">
            <tr className="font-semibold text-[#717073]">
              <th className="p-4 text-sm font-semibold text-[#717073] gilory">Date submitted</th>
              <th className="p-4 text-sm font-semibold text-[#717073] gilory whitespace-nowrap">Type of feedback</th>
              <th className="p-4 text-sm font-semibold text-[#717073] gilory">Venue</th>
              <th className="p-4 text-sm font-semibold text-[#717073] gilory">Category</th>
              <th className="p-4 text-sm font-semibold text-[#717073] gilory md:w-[30%]">Notes</th>
              <th className="p-6 text-sm font-semibold text-[#717073] gilory"></th>
              <th className="p-6 text-sm font-semibold text-[#717073] gilory"></th>
              <th className="p-6 text-sm font-semibold text-[#717073] gilory "></th>
            </tr>
          </thead>
          <tbody>
            {feedbackData.map((item, idx) => (
              <tr key={idx} className="border-t font-semibold text-[#282829] border-[#EFEEF2] hover:bg-gray-50">

                <td className="p-4 text-sm text-[#282829] font-medium gilory"> <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />{item.date}</div></td>
                <td className="p-4 text-sm text-[#282829] font-medium gilory">{item.type}</td>
                <td className="p-4 text-sm text-[#282829] font-medium gilory">{item.venue}</td>
                <td className="p-4 text-sm text-[#282829] font-medium gilory">{item.category}</td>
                <td className="p-4 text-sm text-[#282829] font-medium gilory whitespace-nowrap">{item.notes}</td>
                <td className="p-4 text-sm text-[#282829] font-medium gilory whitespace-nowrap">
                  <div className="flex items-center gap-1 w-full"><img src="/assets/Ethan-test1.png" className='w-7' alt="" /><span>{item.staff}</span></div>
                  </td>
                <td className="p-4 whitespace-nowrap">
                  <span className="2xl:px-4 px-2 py-1.5 bg-[#FDF6E5] text-[#EDA600] rounded-[8px]  text-sm font-semibold gilory">
                    {item.status}
                  </span>
                </td>
                <td className="2xl:p-4 p-2 text-right">
                  <button className="2xl:px-6 px-4 py-2 bg-[#237FEA] text-white rounded-[8px] text-sm font-semibold gilory hover:bg-blue-600 transition-colors">
                    Resolve
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {feedbackData.map((item, idx) => (
          <div key={idx} className="bg-white rounded-[20px] p-3.5 shadow-sm border border-[#EFEEF2]">
            <div className="space-y-4">
              {/* Rows mapping label to value */}
              <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                <span className="text-[#878787] font-semibold text-[15px]">Date summmited</span>
                <span className="text-[#282829] font-semibold text-[15px]">{item.date}</span>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                <span className="text-[#878787] font-semibold text-[15px]">Type of feedback</span>
                <span className="text-[#282829] font-semibold text-[15px]">{item.type}</span>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                <span className="text-[#878787] font-semibold text-[15px]">Venue</span>
                <span className="text-[#282829] font-semibold text-[15px]">{item.venue}</span>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                <span className="text-[#878787] font-semibold text-[15px]">Category</span>
                <span className="text-[#282829] font-semibold text-[15px]">{item.category}</span>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-4 items-start">
                <span className="text-[#878787] font-semibold text-[15px]">Notes</span>
                <span className="text-[#282829] font-semibold text-[15px]">{item.notes}</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <img src="/assets/Ethan-test1.png" className='w-9 h-9 rounded-full object-cover' alt="" />
                <span className="font-semibold text-[#282829] text-[15px]">{item.staff}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1.5 bg-[#FDF6E5] text-[#EDA600] rounded-[8px] text-[13px] ">
                  {item.status}
                </span>
                <button className="px-3 py-1.5 bg-[#237FEA] text-white rounded-[8px] text-[14px] hover:bg-blue-600 transition-colors">
                  Resolve
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AddFeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}

export default Feedback
