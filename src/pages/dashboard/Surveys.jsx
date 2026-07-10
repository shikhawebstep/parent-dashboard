import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ─── Normalize the /parent/survey/list-with-response payload into what this
// screen renders. The exact field the API uses to say "parent has already
// responded" isn't confirmed yet — this checks a few likely candidates
// (response / hasResponded / responseStatus / status) and falls back to
// "Incompleted". Adjust once the real field name is confirmed.
const normalizeSurvey = (s) => {
  const isCompleted = Boolean(
    s.response ||
    s.hasResponded ||
    s.responseStatus === "completed" ||
    s.status === "completed",
  );

  return {
    id: s.id,
    title: s.title || s.template?.title || "Untitled Survey",
    date: s.createdAt
      ? `Created ${new Date(s.createdAt).toLocaleDateString("en-GB")}`
      : "",
    status: isCompleted ? "Completed" : "Incompleted",
    questions: s.questions?.length ?? 0,
  };
};

const Surveys = () => {
  const navigate = useNavigate();

  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("parentToken");

      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);

      const response = await fetch(
        `${API_BASE_URL}api/parent/survey/list-with-response`,
        {
          method: "GET",
          headers: myHeaders,
          redirect: "follow",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Failed to fetch surveys");
      }

      const list = result.data || result.surveys || [];
      setSurveys(list.map(normalizeSurvey));
    } catch (err) {
      console.error("Error fetching surveys:", err);
      setError(err.message || "Failed to fetch surveys");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    return status === "Incompleted" ? "text-orange-500" : "text-green-500";
  };

  const getStatusDot = (status) => {
    return status === "Incompleted" ? "bg-orange-500" : "bg-green-500";
  };

  return (
    <div className="lg:p-8 p-5 animate-fadeIn">
      <div className="mb-6">
        <h2 className="text-[#282829] font-bold text-[32px] font-semibold">
          Surveys
        </h2>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          Loading surveys...
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500 text-sm">{error}</div>
      ) : (
        <>
          {/* Desktop View */}
          <div className="hidden md:block bg-white rounded-[30px] p-6 lg:px-10 border border-[#E2E1E5]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-0">
                <thead>
                  <tr className="">
                    <th className="text-[20px] font-semibold text-[#282829] w-1/3 pb-4">
                      Survey Title
                    </th>
                    <th className="text-[20px] font-semibold text-[#282829] w-1/4 pb-4">
                      Status
                    </th>
                    <th className="text-[20px] font-semibold text-[#282829] w-1/4 pb-4">
                      Questions
                    </th>
                    <th className="text-[20px] font-semibold text-[#282829] pb-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {surveys.map((survey) => (
                    <tr
                      key={survey.id}
                      className="transition-colors border-t border-[#F1F1F2] first:border-t-0"
                    >
                      <td className="py-5">
                        <div className="text-[16px] text-[#282829] font-semibold">
                          {survey.title}
                        </div>
                        <div className="text-[16px] text-[#717073] mt-1">
                          {survey.date}
                        </div>
                      </td>
                      <td className="py-5">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${getStatusDot(survey.status)}`}
                          ></div>
                          <span
                            className={`text-[16px] ${getStatusColor(survey.status)} font-semibold`}
                          >
                            {survey.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-5">
                        <span className="text-sm font-semibold  text-[#717073] ">
                          {survey.questions}
                        </span>
                      </td>
                      <td className="py-5 text-right">
                        {survey.status === "Incompleted" ? (
                          <button
                            onClick={() => navigate(`/surveys/${survey.id}`)}
                            className="bg-[#042C89] text-white px-6 py-2.5 rounded-[14px] text-[16px] font-bold hover:bg-[#032066] transition-colors"
                          >
                            Complete survey
                          </button>
                        ) : (
                          <div className="text-green-600 text-md font-semibold">
                            Survey completed
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {surveys.length === 0 && (
                <div className="text-center py-12 text-gray-400 text-sm">
                  No surveys available at the moment.
                </div>
              )}
            </div>
          </div>

          {/* Mobile View */}
          <div className="md:hidden space-y-4">
            {surveys.map((survey) => (
              <div
                key={survey.id}
                className="bg-white border border-[#E2E1E5] rounded-[24px] p-6"
              >
                <h3 className="text-[#191919] font-bold text-[18px] mb-1">
                  {survey.title}
                </h3>
                <p className="text-[#717073] text-[14px] mb-5">{survey.date}</p>
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className={`w-2 h-2 rounded-full ${getStatusDot(survey.status)}`}
                  ></div>
                  <span
                    className={`text-[14px] ${getStatusColor(survey.status)} font-semibold`}
                  >
                    {survey.status}
                  </span>
                </div>
                {survey.status === "Incompleted" ? (
                  <button
                    onClick={() => navigate(`/surveys/${survey.id}`)}
                    className="bg-[#042C89] text-white px-6 py-3 rounded-[14px] text-[14px] font-bold hover:bg-[#032066] transition-colors shadow-sm"
                  >
                    Complete survey
                  </button>
                ) : (
                  <div className="text-green-600 text-md font-semibold">
                    Survey completed
                  </div>
                )}
              </div>
            ))}
            {surveys.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm">
                No surveys available at the moment.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Surveys;
