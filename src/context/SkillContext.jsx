import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { showError } from "../../utils/swalHelper";

const SkillContext = createContext();

export const useSkill = () => useContext(SkillContext);

export const SkillProvider = ({ children }) => {
    const [skill, setSkill] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


    const fetchSkillData = async () => {
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
                `${API_URL}api/parent/student-course/list`,

            );

            setSkill(response.data?.data ?? response.data);
        } catch (err) {
            console.error("Error fetching skill:", err);

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
        <SkillContext.Provider
            value={{
                skill,
                loading,
                error,
                fetchSkillData,
                setSkill,
            }}
        >
            {children}
        </SkillContext.Provider>
    );
};
