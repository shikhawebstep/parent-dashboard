import React, { useEffect, useState } from 'react';
import { Plus } from "lucide-react";
import AddFeedbackModal from '../modals/AddFeedbackModal';
import Loader from '../Loader';
import { useFeedback } from '../../context/FeedbackContext';

// ── helpers ────────────────────────────────────────────────────────────────

const renderValue = (val, fallback = "-") => {
  if (val === null || val === undefined || val === "") return fallback;
  return val;
};

const renderAgentName = (agent) => {
  if (!agent || typeof agent !== "object") return "Not Assigned Yet";
  const first = agent?.firstName;
  const last = agent?.lastName;
  if (!first) return "Not Assigned Yet";
  return last ? `${first} ${last}`.trim() : first;
};

const safeVenueName = (item) =>
  renderValue(item?.venue?.name || item?.holidayVenue?.name || item?.holidayVenue?.area || item?.venue?.area || item?.oneToOneBooking?.address ||item?.birthdayPartyBooking?.address);

const safeStatus = (status) => {
  if (!status) return "-";
  return String(status).replace(/_/g, " ");
};

const formatDate = (dateString, withTime = false) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";
  const options = { year: "numeric", month: "short", day: "2-digit" };
  if (withTime) {
    return (
      date.toLocaleDateString("en-US", options) +
      ", " +
      date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    );
  }
  return date.toLocaleDateString("en-US", options);
};

// Safely build "ClassName (level) (startTime - endTime)" or "-"
const safeClassDetails = (item) => {
  const schedule = item?.holidayClassSchedule || item?.holidayClassSchedules || item?.classSchedule;
  if (!schedule) return "-";

  const rawName = renderValue(schedule?.className, "");
  const levelName = schedule?.level?.name || schedule?.level || "";
  const name = levelName ? (rawName ? `${rawName} (${levelName})` : `(${levelName})`) : rawName;

  const start = renderValue(schedule?.startTime, "");
  const end = renderValue(schedule?.endTime, "");
  if (!name && !start && !end) return "-";

  const timeRange = start && end ? ` (${start} - ${end})` : "";
  return `${name}${timeRange}`.trim() || "-";
};

// ── component ──────────────────────────────────────────────────────────────

const Feedback = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openResolve, setOpenResolve] = useState(false);
  const [resolveData, setResolveData] = useState({});

  const { feedback, fetchFeedbackData, loading } = useFeedback();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchFeedbackData();
  }, []);

  const safeFeedback = Array.isArray(feedback) ? feedback : [];

  const totalPages = Math.max(1, Math.ceil(safeFeedback.length / itemsPerPage));

  const currentItems = safeFeedback.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleResolve = (item) => {
    setOpenResolve(true);
    setResolveData(item || {});
  };

  if (loading) return <Loader />;

  return (
    <>
      {/* ── List View ── */}
      <div className={`p-4 lg:p-0 ${openResolve ? "hidden" : "block"}`}>
        <div className="flex justify-end md:justify-between items-center mb-4 md:mb-6 lg:absolute md:top-10 md:right-5">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1 px-4 py-2.5 font-semibold rounded-[12px] text-[16px] md:text-[18px] bg-[#0DD180] text-white hover:bg-[#0bb36d] transition-colors"
          >
            <Plus size={17} /> Add Feedback
          </button>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-auto rounded-[30px] border border-[#EFEEF2] bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-[#F5F5F5] text-left">
              <tr className="font-semibold text-[#717073]">
                <th className="p-4 text-sm font-semibold text-[#717073] gilory">Date submitted</th>
                <th className="p-4 text-sm font-semibold text-[#717073] gilory whitespace-nowrap">Type of feedback</th>
                <th className="p-4 text-sm font-semibold text-[#717073] gilory">Venue / Address</th>
                <th className="p-4 text-sm font-semibold text-[#717073] gilory">Category</th>
                <th className="p-4 text-sm font-semibold text-[#717073] gilory md:w-[25%]">Notes</th>
                <th className="p-6 text-sm font-semibold text-[#717073] gilory"></th>
                <th className="p-6 text-sm font-semibold text-[#717073] gilory"></th>
                <th className="p-6 text-sm font-semibold text-[#717073] gilory"></th>
              </tr>
            </thead>
            <tbody>
              {safeFeedback.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-gray-500 font-medium gilory">
                    No feedback found.
                  </td>
                </tr>
              )}
              {currentItems.map((item, idx) => (
                <tr
                  key={item?.id ?? idx}
                  className="border-t font-semibold text-[#282829] border-[#EFEEF2] hover:bg-gray-50"
                >
                  <td className="p-4 text-sm text-[#282829] font-medium gilory">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      {formatDate(item?.createdAt)}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-[#282829] font-medium gilory capitalize">
                    {renderValue(item?.feedbackType)}
                  </td>
                  <td className="p-4 text-sm text-[#282829] font-medium gilory capitalize">
                    {safeVenueName(item)}
                  </td>
                  <td className="p-4 text-sm text-[#282829] font-medium gilory capitalize">
                    {renderValue(item?.category)}
                  </td>
                  <td
                    className="p-4 text-sm text-[#282829] font-medium gilory max-w-xs truncate"
                    title={item?.notes || ""}
                  >
                    {renderValue(item?.notes)}
                  </td>
                  <td className="p-4 text-sm text-[#282829] font-medium gilory whitespace-nowrap">
                    {item?.assignedAgent ? (
                      <div className="flex items-center gap-1 w-full">
                        <img src="/assets/Ethan-test1.png" className="w-7" alt="" />
                        <span>{renderAgentName(item.assignedAgent)}</span>
                      </div>
                    ) : (
                      "Not Assigned Yet"
                    )}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span className="2xl:px-4 px-2 py-1.5 bg-[#FDF6E5] capitalize text-[#EDA600] rounded-[8px] text-sm font-semibold gilory">
                      {safeStatus(item?.status)}
                    </span>
                  </td>
                  <td className="2xl:p-4 p-2 text-right">
                    <button
                      onClick={() => handleResolve(item)}
                      className="2xl:px-6 px-4 py-2 bg-[#237FEA] text-white rounded-[8px] text-sm font-semibold gilory hover:bg-blue-600 transition-colors"
                    >
                      Resolve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4 mt-4">
          {safeFeedback.length === 0 && (
            <div className="text-center py-10 text-gray-500 font-medium gilory">
              No feedback found.
            </div>
          )}
          {currentItems.map((item, idx) => (
            <div
              key={item?.id ?? idx}
              className="bg-white rounded-[20px] p-3.5 shadow-sm border border-[#EFEEF2]"
            >
              <div className="space-y-4">
                <MobileRow label="Date submitted" value={formatDate(item?.createdAt)} />
                <MobileRow label="Type of feedback" value={renderValue(item?.feedbackType)} />
                <MobileRow label="Venue / Address" value={safeVenueName(item)} />
                <MobileRow label="Category" value={renderValue(item?.category)} />
                <MobileRow label="Notes" value={renderValue(item?.notes)} align="start" />
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-100">
                {item?.assignedAgent ? (
                  <div className="flex items-center gap-2">
                    <img
                      src="/assets/Ethan-test1.png"
                      className="w-9 h-9 rounded-full object-cover"
                      alt=""
                    />
                    <span className="font-semibold text-[#282829] text-[15px]">
                      {renderAgentName(item.assignedAgent)}
                    </span>
                  </div>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1.5 bg-[#FDF6E5] capitalize text-[#EDA600] rounded-[8px] text-[13px]">
                    {safeStatus(item?.status)}
                  </span>
                  <button
                    onClick={() => handleResolve(item)}
                    className="px-3 py-1.5 bg-[#237FEA] text-white rounded-[8px] text-[14px] hover:bg-blue-600 transition-colors"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between md:justify-end md:gap-3 items-center mt-6 w-full px-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-4 py-2 border border-[#E2E1E5] rounded-[10px] text-[14px] font-semibold text-[#717073] hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <span className="text-[14px] font-bold text-[#282829]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-4 py-2 border border-[#E2E1E5] rounded-[10px] text-[14px] font-semibold text-[#717073] hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}

        <AddFeedbackModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>

      {/* ── Resolve Detail View ── */}
      <div className={`min-h-screen flex flex-col p-4 ${openResolve ? "flex" : "hidden"}`}>
        {/* Main Card */}
        <div className="bg-white rounded-2xl w-full max-w-4xl shadow-sm p-6 md:p-8">
          <div className="flex items-center gap-2 mb-6">
            <h2
              className="text-lg font-semibold text-gray-800 flex items-center gap-2 cursor-pointer"
              onClick={() => {
                setOpenResolve(false);
                setResolveData({});
              }}
            >
              <img
                src="/assets/arrow-left.png"
                alt="Back"
                className="w-5 h-5 md:w-6 md:h-6"
              />
              Feedback
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            <ResolveRow label="Agent" value={renderAgentName(resolveData?.assignedAgent)} />
            <ResolveRow label="Date submitted" value={formatDate(resolveData?.createdAt, true)} />
            <ResolveRow label="Venue" value={safeVenueName(resolveData)} />
            <ResolveRow label="Class details" value={safeClassDetails(resolveData)} />
            <ResolveRow
              label="Feedback type"
              value={renderValue(resolveData?.feedbackType)}
              capitalize
            />
            <ResolveRow
              label="Category"
              value={renderValue(resolveData?.category)}
              capitalize
            />
            <div className="flex justify-between py-3 text-sm md:text-base">
              <span className="text-gray-500">Notes</span>
              <span className="text-gray-800 font-semibold max-w-[60%] text-right">
                {renderValue(resolveData?.notes)}
              </span>
            </div>
          </div>
        </div>

      
      </div>
    </>
  );
};

// ── small sub-components ───────────────────────────────────────────────────

function MobileRow({ label, value, align = "center" }) {
  return (
    <div className={`grid grid-cols-[140px_1fr] gap-4 items-${align}`}>
      <span className="text-[#878787] font-semibold text-[15px]">{label}</span>
      <span className="text-[#282829] font-semibold text-[15px]">{value}</span>
    </div>
  );
}

function ResolveRow({ label, value, capitalize = false }) {
  return (
    <div className="flex justify-between py-3 text-sm md:text-base">
      <span className="text-gray-500">{label}</span>
      <span className={`text-gray-800 font-semibold${capitalize ? " capitalize" : ""}`}>
        {value}
      </span>
    </div>
  );
}

export default Feedback;