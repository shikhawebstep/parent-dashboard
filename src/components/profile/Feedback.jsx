import React, { useEffect, useState } from 'react'
import { Plus } from "lucide-react";
import AddFeedbackModal from './AddFeedbackModal';
import Loader from '../Loader';
import { useFeedback } from '../../context/FeedbackContext';
import { useSearchParams } from 'react-router-dom';
import Select from 'react-select';
const Feedback = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const serviceType = searchParams.get("serviceType");
  const [openResolve, setOpenResolve] = useState(false);
  const [resolveData, setResolveData] = useState({});

  const [showAgentModal, setShowAgentModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState({
    id: resolveData?.assignedAgent?.id || null,
    name: resolveData?.assignedAgent
      ? `${resolveData.assignedAgent.firstName || ''} ${resolveData.assignedAgent.lastName || ''}`.trim()
      : "",
  });
  const { feedback, fetchFeedbackData, loading } = useFeedback();
  useEffect(() => {
    fetchFeedbackData()
  }, []);
  const handleResolve = (id, item) => {
    setOpenResolve(true)
    setResolveData(item)
  }
  const serviceParam = searchParams.get("serviceType");

  // Helpers for safe data rendering
  const renderValue = (val) => {
    if (val === null || val === undefined || val === '') return "-";
    return val;
  };

  const renderAgentName = (agent) => {
    if (!agent || !agent.firstName) return "-";
    return `${agent.firstName} ${agent.lastName || ''}`.trim();
  };

  // Safe handlers/dummies for missing definitions
  const agentOptions = [];
  const handleSave = (id) => console.log("Resolve logic not implemented", id);


  const formatDate = (dateString, withTime = false) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const options = {
      year: "numeric",
      month: "short",
      day: "2-digit",
    };
    if (withTime) {
      return (
        date.toLocaleDateString("en-US", options) +
        ", " +
        date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      );
    }
    return date.toLocaleDateString("en-US", options);
  };
  if (loading) {
    return <Loader />
  }

  return (
    <>
      <div className={`p-4 lg:p-0 ${openResolve ? 'hidden' : 'block'}`}>
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
                <th className="p-4 text-sm font-semibold text-[#717073] gilory md:w-[25%]">Notes</th>
                <th className="p-6 text-sm font-semibold text-[#717073] gilory"></th>
                <th className="p-6 text-sm font-semibold text-[#717073] gilory"></th>
                <th className="p-6 text-sm font-semibold text-[#717073] gilory "></th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(feedback?.["holiday camp"]) && feedback["holiday camp"].length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-gray-500 font-medium gilory">
                    No feedback found.
                  </td>
                </tr>
              )}
              {Array.isArray(feedback?.["holiday camp"]) &&
                feedback["holiday camp"].map((item, idx) => (
                  <tr key={idx} className="border-t font-semibold text-[#282829] border-[#EFEEF2] hover:bg-gray-50">

                    <td className="p-4 text-sm text-[#282829] font-medium gilory"> <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />{formatDate(item?.createdAt)}</div></td>
                    <td className="p-4 text-sm text-[#282829] font-medium gilory">{renderValue(item?.feedbackType)}</td>
                    <td className="p-4 text-sm text-[#282829] font-medium gilory">{renderValue(item?.holidayVenue?.name)}</td>
                    <td className="p-4 text-sm text-[#282829] font-medium gilory">{renderValue(item?.category)}</td>
                    <td className="p-4 text-sm text-[#282829] font-medium gilory max-w-xs truncate" title={item?.notes}>{renderValue(item?.notes)}</td>
                    <td className="p-4 text-sm text-[#282829] font-medium gilory whitespace-nowrap">
                      {item?.assignedAgent ? (
                        <div className="flex items-center gap-1 w-full">
                          <img src="/assets/Ethan-test1.png" className='w-7' alt="" /><span>{renderAgentName(item.assignedAgent)}</span></div>
                      ) : "-"}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="2xl:px-4 px-2 py-1.5 bg-[#FDF6E5] text-[#EDA600] rounded-[8px]  text-sm font-semibold gilory">
                        {item?.status ? item.status.replace("_", " ") : "-"}
                      </span>
                    </td>
                    <td className="2xl:p-4 p-2 text-right">
                      <button onClick={() => handleResolve(item?.id, item)} className="2xl:px-6 px-4 py-2 bg-[#237FEA] text-white rounded-[8px] text-sm font-semibold gilory hover:bg-blue-600 transition-colors">
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
          {Array.isArray(feedback?.["holiday camp"]) && feedback["holiday camp"].length === 0 && (
            <div className="text-center py-10 text-gray-500 font-medium gilory">
              No feedback found.
            </div>
          )}
          {Array.isArray(feedback?.["holiday camp"]) &&
            feedback["holiday camp"].map((item, idx) => (
              <div key={idx} className="bg-white rounded-[20px] p-3.5 shadow-sm border border-[#EFEEF2]">
                <div className="space-y-4">
                  {/* Rows mapping label to value */}
                  <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                    <span className="text-[#878787] font-semibold text-[15px]">Date summmited</span>
                    <span className="text-[#282829] font-semibold text-[15px]">{formatDate(item?.createdAt)}</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                    <span className="text-[#878787] font-semibold text-[15px]">Type of feedback</span>
                    <span className="text-[#282829] font-semibold text-[15px]">{renderValue(item?.feedbackType)}</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                    <span className="text-[#878787] font-semibold text-[15px]">Venue</span>
                    <span className="text-[#282829] font-semibold text-[15px]">{renderValue(item?.holidayVenue?.name)}</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                    <span className="text-[#878787] font-semibold text-[15px]">Category</span>
                    <span className="text-[#282829] font-semibold text-[15px]">{renderValue(item?.category)}</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] gap-4 items-start">
                    <span className="text-[#878787] font-semibold text-[15px]">Notes</span>
                    <span className="text-[#282829] font-semibold text-[15px]">{renderValue(item?.notes)}</span>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-100">
                  {item?.assignedAgent ? (
                    <div className="flex items-center gap-2">
                      <img src="/assets/Ethan-test1.png" className='w-9 h-9 rounded-full object-cover' alt="" />
                      <span className="font-semibold text-[#282829] text-[15px]">{renderAgentName(item?.assignedAgent)}</span>
                    </div>
                  ) : <div />}

                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1.5 bg-[#FDF6E5] text-[#EDA600] rounded-[8px] text-[13px] ">
                      {item?.status || "-"}
                    </span>
                    <button onClick={() => handleResolve(item?.id, item)} className="px-3 py-1.5 bg-[#237FEA] text-white rounded-[8px] text-[14px] hover:bg-blue-600 transition-colors">
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
      <div className={`min-h-screen  flex flex-col  p-4  ${openResolve ? 'flex' : 'hidden'}`}>
        {/* Main Card */}
        <div className="bg-white rounded-2xl w-full max-w-4xl shadow-sm p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">


            <h2
              className='text-lg font-semibold text-gray-800 flex items-center gap-2 '
              onClick={() => {
                setOpenResolve(false);
                setResolveData('');
              }}>
              <img
                src="/assets/arrow-left.png"
                alt="Back"
                className="w-5 h-5 md:w-6 md:h-6"
              />
              Feedback
            </h2>
          </div>

          {/* Feedback Info Table */}
          <div className="divide-y divide-gray-200">
            <div className="flex justify-between py-3 text-sm md:text-base">
              <span className="text-gray-500">Agent</span>
              <span className="text-gray-800 font-semibold">{renderAgentName(resolveData?.assignedAgent)}</span>
            </div>
            <div className="flex justify-between py-3 text-sm md:text-base">
              <span className="text-gray-500">Date submitted</span>
              <span className="text-gray-800 font-semibold">{formatDate(resolveData?.createdAt, true)}</span>
            </div>
            <div className="flex justify-between py-3 text-sm md:text-base">
              <span className="text-gray-500">Venue</span>
              <span className="text-gray-800 font-semibold">{resolveData?.holidayVenue?.name || resolveData?.venue?.name || "-"}</span>
            </div>
            <div className="flex justify-between py-3 text-sm md:text-base">
              <span className="text-gray-500">Class details</span>
              <span className="text-gray-800 font-semibold">
                {resolveData?.holidayClassSchedule
                  ? `${renderValue(resolveData.holidayClassSchedule.className)} (${renderValue(resolveData.holidayClassSchedule.startTime)} - ${renderValue(resolveData.holidayClassSchedule.endTime)})`
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between py-3 text-sm md:text-base">
              <span className="text-gray-500">Feedback type</span>
              <span className="text-gray-800 font-semibold capitalize">{renderValue(resolveData?.feedbackType)}</span>
            </div>
            <div className="flex justify-between py-3 text-sm md:text-base">
              <span className="text-gray-500">Category</span>
              <span className="text-gray-800 font-semibold capitalize">{renderValue(resolveData?.category)}</span>
            </div>
            <div className="flex justify-between py-3 text-sm md:text-base">
              <span className="text-gray-500">Notes</span>
              <span className="text-gray-800 font-semibold max-w-[60%] text-right">
                {renderValue(resolveData?.notes)}
              </span>
            </div>
          </div>
        </div>

        {/* Assigned To Card */}
        <div className="bg-white rounded-2xl w-full max-w-4xl shadow-sm mt-6 p-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-gray-800 font-semibold mb-3">Assigned to</h3>
            <div className="flex items-center gap-3">
              <img
                src={resolveData?.assignedAgent?.profile || '/members/dummyuser.png'}
                alt="Profile"
                className="w-10 h-10 rounded-full"
              />
              <span className="text-gray-800 font-semibold">{renderAgentName(resolveData?.assignedAgent)}</span>
            </div>
          </div>
          <button onClick={() => setShowAgentModal(true)} className="text-[#237FEA] font-semibold mt-3 md:mt-0 hover:underline">
            Change
          </button>
        </div>
        {showAgentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-gray-800 font-semibold mb-4">Assign Agent</h3>
              <Select
                options={agentOptions}
                placeholder="Select Agent"
                isClearable
                isSearchable
                value={agentOptions.find((opt) => opt.value === selectedAgent.id) || null}
                onChange={(selected) => {
                  setSelectedAgent({
                    id: selected?.value || null,
                    name: selected?.label || "",
                  });
                }}
                className="w-full"
                classNamePrefix="react-select"
              />
              <div className="flex justify-end gap-3 mt-6">
                <button
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                  onClick={() => setShowAgentModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => handleSave(resolveData.id)}                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="w-full max-w-4xl flex justify-end mt-6">
          <button onClick={() => handleSave(resolveData.id)} className="bg-[#237FEA] hover:bg-blue-700 text-white font-semibold px-8 py-2 rounded-xl">
            Resolve
          </button>
        </div>
      </div>
    </>
  )
}

export default Feedback





