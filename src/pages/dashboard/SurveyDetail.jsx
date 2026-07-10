import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ─── Score a single answer against its question so we can decide whether the
// responder counts as "happy" (per spec: review ask is HIGH-SCORE ONLY, never
// shown to low/negative responders). Returns { value, max } or null if the
// question type isn't meaningfully scoreable (e.g. free text).
const scoreAnswer = (question, answer) => {
  if (answer === undefined || answer === null || answer === "") return null;

  if (question.type === "rating_10") {
    const value = Number(answer);
    if (Number.isNaN(value)) return null;
    return { value, max: 10 };
  }

  if (question.type === "multiple_choice") {
    const options = question.options || [];
    // Numeric-option scale, e.g. ["1","2","3","4","5"]
    if (options.length > 0 && options.every((o) => !Number.isNaN(Number(o)))) {
      const value = Number(answer);
      const max = Math.max(...options.map(Number));
      if (Number.isNaN(value)) return null;
      return { value, max };
    }
    // Ordinal word scale, e.g. ["Bad","Good","Excellent"] or
    // ["Very Dissatisfied", ..., "Very Satisfied"] — position in the
    // list stands in for the rating.
    const idx = options.indexOf(answer);
    if (idx === -1) return null;
    return { value: idx + 1, max: options.length };
  }

  return null;
};

// NOTE: "happy" threshold should ultimately be configurable in Synco (per
// spec). Hardcoded here at 75% pending that settings integration.
const HAPPY_THRESHOLD = 0.75;

const SurveyDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [answers, setAnswers] = useState({});
  const [answerErrors, setAnswerErrors] = useState({});
  const [uploadToGoogle, setUploadToGoogle] = useState(true);

  useEffect(() => {
    fetchSurvey();
  }, [id]);

  // NOTE: assumes GET /api/parent/survey/:id. Adjust if the real route
  // differs (e.g. filtering list-with-response client-side instead).
  const fetchSurvey = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("parentToken");
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);

      const response = await fetch(
        `${API_BASE_URL}api/parent/survey/list-with-response/${id}`,
        {
          method: "GET",
          headers: myHeaders,
          redirect: "follow",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Failed to load survey");
      }

      setSurvey(result.data || result.survey || result);
    } catch (err) {
      console.error("Error fetching survey:", err);
      setError(err.message || "Failed to load survey");
    } finally {
      setLoading(false);
    }
  };

  const questions = survey?.questions || [];

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    if (answerErrors[questionId]) {
      setAnswerErrors((prev) => ({ ...prev, [questionId]: null }));
    }
  };

  // Overall score fraction across every scoreable question — used purely
  // to decide whether to show the review-ask panel.
  const scoreFraction = useMemo(() => {
    let value = 0;
    let max = 0;
    questions.forEach((q) => {
      const s = scoreAnswer(q, answers[q.questionId]);
      if (s) {
        value += s.value;
        max += s.max;
      }
    });
    return max > 0 ? value / max : null;
  }, [questions, answers]);

  const isHighScore =
    scoreFraction !== null && scoreFraction >= HAPPY_THRESHOLD;

  const validate = () => {
    const errs = {};
    questions.forEach((q) => {
      const val = answers[q.questionId];
      if (val === undefined || val === null || val === "") {
        errs[q.questionId] = "Please answer this question";
      }
    });
    setAnswerErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Confirmed: POST /api/parent/survey/:surveyId/response with
  // { venueId, answers: [{ questionId, answer }] }.
  const handleComplete = async () => {
    if (!validate()) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem("parentToken");
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("Authorization", `Bearer ${token}`);

      const surveyId = survey?.id ?? id;
      // NOTE: venueId isn't confirmed to exist on the survey payload —
      // falls back through a couple of likely shapes. If the API
      // rejects a null venueId, this needs a real source (e.g. the
      // parent's selected venue from CommonContext).
      const venueId = survey?.venueId ?? survey?.trigger?.venue?.id ?? null;

      const raw = JSON.stringify({
        venueId,
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          answer,
        })),
      });

      const response = await fetch(
        `${API_BASE_URL}api/parent/survey/${surveyId}/response`,
        {
          method: "POST",
          headers: myHeaders,
          body: raw,
          redirect: "follow",
        },
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result?.status === false) {
        throw new Error(result?.message || "Failed to submit survey");
      }

      setSubmitted(true);
      setTimeout(() => navigate("/surveys"), 1500);
    } catch (err) {
      setError(err.message || "Failed to submit survey");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="lg:p-8 p-4 min-h-screen lg:m-7 bg-[#fff] rounded-[30px] animate-fadeIn flex items-center justify-center text-gray-400 text-sm">
        Loading survey...
      </div>
    );
  }

  if (error && !survey) {
    return (
      <div className="lg:p-8 p-4 min-h-screen lg:m-7 bg-[#fff] rounded-[30px] animate-fadeIn flex flex-col items-center justify-center gap-3 text-sm">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => navigate("/surveys")}
          className="text-[#042C89] font-semibold underline"
        >
          Back to surveys
        </button>
      </div>
    );
  }

  return (
    <div className="lg:p-8 p-4 min-h-screen lg:m-7  bg-[#fff] rounded-[30px] animate-fadeIn">
      <button
        onClick={() => navigate("/surveys")}
        className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4 text-sm font-semibold"
      >
        <ChevronLeft size={18} /> Back
      </button>
      <h2 className="text-[#191919] font-bold text-2xl mb-8">
        {survey?.title || survey?.template?.title || "Survey"}
      </h2>

      <div className="bg-white rounded-[30px] lg:p-10 p-4 border border-[#D0CFD1] max-w-[990px]">
        <div className="relative">
          {/* Vertical Line for Stepper */}
          <div className="absolute md:left-[15px] left-3 rounded-[15px] top-4 bottom-20 md:w-[6px] w-[4px] bg-[#D9D9D9] h-full"></div>

          <div className="space-y-12">
            {questions.map((q, idx) => (
              <div key={q.questionId} className="relative flex md:gap-8 gap-4">
                {/* Step Number */}
                <div className="z-10 flex-shrink-0 md:w-8 md:h-8 h-7 w-7 mt-10 rounded-full bg-[#0DD180] text-white text-sm font-bold flex items-center justify-center border-4 border-[#D6EFDD] shadow-sm">
                  {idx + 1}
                </div>

                {/* Content */}
                <div className="flex-1 bg-white shadow-[2px_5px_20px_0px_rgba(0,0,0,0.08)] rounded-[20px] p-4">
                  <h3 className="text-[#34AE56] font-bold text-[16px] ">
                    Question {idx + 1}
                  </h3>
                  <h3 className="text-[#282829] font-bold md:text-[20px] text-[16px] mb-4">
                    {q.questionText}
                  </h3>

                  {q.type === "multiple_choice" && (
                    <div className="space-y-3">
                      {(q.options || []).map((option, optIdx) => (
                        <label
                          key={optIdx}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <div className="relative flex items-center justify-center">
                            <input
                              type="radio"
                              name={`question-${q.questionId}`}
                              checked={answers[q.questionId] === option}
                              onChange={() =>
                                handleAnswerChange(q.questionId, option)
                              }
                              className="peer appearance-none w-5 h-5 rounded-full border-2 border-gray-300 checked:border-[#00D285] checked:bg-[#00D285] transition-all"
                            />
                          </div>
                          <span className="md:text-[16px] text-[14px] text-[#282829] font-medium group-hover:text-gray-900">
                            {option}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}

                  {q.type === "rating_10" && (
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                        <button
                          type="button"
                          key={n}
                          onClick={() => handleAnswerChange(q.questionId, n)}
                          className={`h-10 w-10 rounded-lg border text-sm font-bold transition ${
                            answers[q.questionId] === n
                              ? "border-[#00D285] bg-[#00D285] text-white"
                              : "border-gray-200 text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  )}

                  {q.type === "text" && (
                    <textarea
                      value={answers[q.questionId] || ""}
                      onChange={(e) =>
                        handleAnswerChange(q.questionId, e.target.value)
                      }
                      className="w-full bg-[#F9FAFB] h-24 p-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder:text-gray-400"
                      placeholder="Type your answer..."
                    />
                  )}

                  {answerErrors[q.questionId] && (
                    <p className="text-[#F04438] text-xs mt-2">
                      {answerErrors[q.questionId]}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Google/Trustpilot Review Section — high-score responders only */}
        {isHighScore && (
          <div className="mt-8  bg-[#FFFCE6] border-[6px] border-[#FFDE14] rounded-[20px] p-6 relative">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-[20px] text-[#101014]">
                    Google
                  </span>
                  <span className="text-gray-400">
                    <img src="/assets/star1.png" className="w-6" alt="" />
                  </span>
                  <span className="font-bold text-[20px] text-[#101014]">
                    Trustpilot
                  </span>
                </div>
                <h4 className="font-bold text-[#282829] text-[20px] mb-1">
                  Would you like to upload the review to Google / Trustpilot?
                </h4>
                <p className="text-[16px] font-medium text-[#3E3E47] mb-4">
                  We'll send you an email with a link for you to verify your
                  review.
                </p>

                <label className="flex gap-2 items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={uploadToGoogle}
                    onChange={() => setUploadToGoogle((prev) => !prev)}
                  />

                  <div
                    className="
      relative w-13 h-6 rounded-full
      bg-gray-300
      peer-checked:bg-[#34AE56]
      transition-colors overflow-hidden
      peer-checked:[&>span]:translate-x-4
    "
                  >
                    {/* WHITE CIRCLE */}
                    <span
                      className="
        absolute top-[4px] left-[2px]
        w-4 h-4 bg-white rounded-full
        transition-transform shadow-sm
      "
                    ></span>
                  </div>

                  <span className="text-[16px] font-semibold text-gray-700 whitespace-nowrap">
                    Yes, Upload
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {error && <p className="text-[#F04438] text-sm mt-4">{error}</p>}

        {submitted && (
          <p className="text-[#0DD180] text-sm font-semibold mt-4">
            Thanks for your feedback! Redirecting...
          </p>
        )}

        {/* Footer Actions */}
        <div className="flex justify-end gap-4 mt-8 lg:ml-16">
          <button
            onClick={() => navigate("/surveys")}
            className="sm:px-8 px-4 py-3 md:min-w-[200px] rounded-xl text-gray-500 font-bold border border-[#E2E1E5] text-[18px] hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleComplete}
            disabled={submitting || submitted}
            className={`bg-[#042C89] text-white sm:px-10  px-4 py-3 md:min-w-[200px] rounded-xl font-bold text-[18px] hover:bg-[#032066] transition-colors shadow-lg ${
              submitting || submitted ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {submitting ? "Submitting..." : "Complete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SurveyDetail;
