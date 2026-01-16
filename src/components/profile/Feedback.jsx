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
    <>
      <div className="flex justify-between items-center mb-6 absolute top-10 right-5">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 px-4 py-2.5 font-semibold rounded-[12px] text-[18px] bg-[#0DD180] text-white hover:bg-[#0bb36d] transition-colors"
        >
          <Plus size={17} /> Add Feedback
        </button>
      </div>

      <div className="overflow-auto rounded-[30px] border border-[#EFEEF2] bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-[#F5F5F5] text-left ">
            <tr className="font-semibold text-[#717073]">
              <th className="p-4 text-sm font-semibold text-[#717073] gilory">Date submitted</th>
              <th className="p-4 text-sm font-semibold text-[#717073] gilory whitespace-nowrap">Type of feedback</th>
              <th className="p-4 text-sm font-semibold text-[#717073] gilory">Venue</th>
              <th className="p-4 text-sm font-semibold text-[#717073] gilory">Category</th>
              <th className="p-4 text-sm font-semibold text-[#717073] gilory 2xl:w-[30%]">Notes</th>
              <th className="p-4 text-sm font-semibold text-[#717073] gilory"></th>
              <th className="p-4 text-sm font-semibold text-[#717073] gilory"></th>
              <th className="p-4 text-sm font-semibold text-[#717073] gilory "></th>
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
                <td className="p-4 text-sm text-[#282829] font-medium gilory">{item.notes}</td>
                <td className="p-4 text-sm text-[#282829] font-medium gilory"> <div className="flex items-center gap-1"><img src="/assets/Ethan-test1.png" className='w-7' alt="" />{item.staff}</div></td>
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

      <AddFeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}

export default Feedback
