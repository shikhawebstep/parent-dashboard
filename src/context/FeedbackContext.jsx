import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { showError } from "../../utils/swalHelper";

const FeedbackContext = createContext();

export const useFeedback = () => useContext(FeedbackContext);

export const FeedbackProvider = ({ children }) => {
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


    const fetchFeedbackData = async () => {
        const token = localStorage.getItem("parentToken");
        const parentData = JSON.parse(localStorage.getItem("parentData"));
        const parentId = parentData?.id;
        const API_URL = import.meta.env.VITE_API_BASE_URL;

        if (!token || !parentId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(
                `${API_URL}api/parent/holiday/feedback/list`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setFeedback(response.data?.data ?? response.data);
        } catch (err) {
            console.error("Error fetching feedback:", err);

            // ✅ Extract API error message safely
            const errorMessage =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "Something went wrong while fetching feedback.";

            setError(errorMessage);

            // ✅ Show SweetAlert
            showError("Error", errorMessage);

        } finally {
            setLoading(false);
        }
    };




    return (
        <FeedbackContext.Provider
            value={{
                feedback,
                loading,
                error,
                fetchFeedbackData,
                setFeedback,
            }}
        >
            {children}
        </FeedbackContext.Provider>
    );
};
