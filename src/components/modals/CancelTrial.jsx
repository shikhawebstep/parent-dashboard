// components/CancelTrial.jsx

import React, { useState } from 'react'
import Select from 'react-select'

const CANCELLATION_REASONS = [
  { value: 'Schedule conflict', label: 'Schedule conflict' },
  { value: 'Not interested anymore', label: 'Not interested anymore' },
  { value: 'Found another provider', label: 'Found another provider' },
  { value: 'Medical reasons', label: 'Medical reasons' },
  { value: 'Financial reasons', label: 'Financial reasons' },
  { value: 'Other', label: 'Other' },
]

const selectStyles = {
  control: (base, state) => ({
    ...base,
    borderRadius: '12px',
    borderColor: state.isFocused ? '#042C89' : '#E5E7EB',
    boxShadow: 'none',
    padding: '2px 4px',
    fontSize: '14px',
    '&:hover': { borderColor: '#042C89' },
  }),
  option: (base, state) => ({
    ...base,
    fontSize: '14px',
    backgroundColor: state.isSelected
      ? '#042C89'
      : state.isFocused
      ? '#EAF0FF'
      : 'white',
    color: state.isSelected ? 'white' : '#282829',
    cursor: 'pointer',
  }),
  placeholder: (base) => ({ ...base, color: '#9E9FAA' }),
  indicatorSeparator: () => ({ display: 'none' }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
}

const CancelTrial = ({ isOpen, onClose, onConfirm, booking }) => {
  const [reason, setReason] = useState(null)
  const [notes, setNotes] = useState('')

  if (!isOpen) return null

  const handleConfirm = () => {
    if (!reason) return
    onConfirm({ reason: reason.value, notes, booking })
    setReason(null)
    setNotes('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-[24px] w-[90%] max-w-md p-6 relative">

        {/* Header */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-500 hover:text-gray-800 text-xl font-semibold"
        >
          ✕
        </button>
        <h2 className="text-center text-[18px] font-bold text-[#282829] mb-6">
          Cancel Free Trial
        </h2>

        {/* Reason Dropdown */}
        <div className="mb-4">
          <label className="block text-[14px] font-semibold text-[#282829] mb-2">
            Reason for Cancellation
          </label>
          <Select
            options={CANCELLATION_REASONS}
            value={reason}
            onChange={setReason}
            placeholder=""
            styles={selectStyles}
            menuPortalTarget={document.body}
            menuPosition="fixed"
          />
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-[14px] font-semibold text-[#282829] mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full border border-gray-200 rounded-[12px] px-4 py-3 text-[14px] text-[#282829] resize-none focus:outline-none focus:border-[#042C89]"
          />
        </div>

        {/* Button */}
        <div className="flex justify-end">
          <button
            onClick={handleConfirm}
            disabled={!reason}
            className="bg-[#FF5C5C] disabled:opacity-50 text-white px-8 py-3 rounded-[12px] text-[14px] font-bold border-b-4 border-[#e04040] hover:bg-[#e84d4d] transition-colors"
          >
            Cancel Trial
          </button>
        </div>

      </div>
    </div>
  )
}

export default CancelTrial