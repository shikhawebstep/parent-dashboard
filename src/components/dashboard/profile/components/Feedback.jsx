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
    <div className="w-full bg-white rounded-[20px] p-6 shadow-sm overflow-x-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold text-[24px]">Feedback</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 px-4 py-2 font-semibold rounded-lg text-sm bg-[#0DD180] text-white hover:bg-[#0bb36d] transition-colors"
        >
          <Plus size={17} /> Add Feedback
        </button>
      </div>

      <div className="overflow-auto rounded-2xl bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-[#F5F5F5] text-left border border-[#EFEEF2]">
            <tr className="font-semibold text-[#717073]">
              <th className="p-4 rounded-l-lg w-[50px]">
                {/* Checkbox space in header if needed, or just padding */}
              </th>
              <th className="p-4 text-sm font-medium text-[#5B6572] gilory">Date submitted</th>
              <th className="p-4 text-sm font-medium text-[#5B6572] gilory">Type of feedback</th>
              <th className="p-4 text-sm font-medium text-[#5B6572] gilory">Venue</th>
              <th className="p-4 text-sm font-medium text-[#5B6572] gilory">Category</th>
              <th className="p-4 text-sm font-medium text-[#5B6572] gilory w-[30%]">Notes</th>
              <th className="p-4 text-sm font-medium text-[#5B6572] gilory"></th>
              <th className="p-4 text-sm font-medium text-[#5B6572] gilory"></th>
              <th className="p-4 text-sm font-medium text-[#5B6572] gilory rounded-r-lg"></th>
            </tr>
          </thead>
          <tbody>
            {feedbackData.map((item, idx) => (
              <tr key={idx} className="border-t font-semibold text-[#282829] border-[#EFEEF2] hover:bg-gray-50">
                <td className="p-4">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </td>
                <td className="p-4 text-sm text-[#333333] font-medium gilory">{item.date}</td>
                <td className="p-4 text-sm text-[#333333] font-medium gilory">{item.type}</td>
                <td className="p-4 text-sm text-[#333333] font-medium gilory">{item.venue}</td>
                <td className="p-4 text-sm text-[#333333] font-medium gilory">{item.category}</td>
                <td className="p-4 text-sm text-[#5B6572] font-medium gilory">{item.notes}</td>
                <td className="p-4 text-sm text-[#333333] font-medium gilory">{item.staff}</td>
                <td className="p-4">
                  <span className="px-4 py-1.5 bg-[#FFF8E7] text-[#DFA800] rounded-lg text-sm font-medium gilory">
                    {item.status}
                  </span>
                </td>
                <td className="p-4">
                  <button className="px-6 py-2 bg-[#1B7AF9] text-white rounded-lg text-sm font-medium gilory hover:bg-blue-600 transition-colors">
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
    </div>
  )
}

export default Feedback
