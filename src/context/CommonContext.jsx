import { createContext, useContext, useCallback, useState, useEffect } from "react";
import axios from "axios";
import { showError } from "../../utils/swalHelper";

const CommonContext = createContext();

export const useCommon = () => useContext(CommonContext);

export const CommonProvider = ({ children }) => {
    const [venues, setVenues] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


 const fetchVenues = useCallback(async () => {
    const token = localStorage.getItem("parentToken") || localStorage.getItem("adminToken") || localStorage.getItem("token");
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    setLoading(true);
    setError(null);

    try {
        const headers = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        const { data } = await axios.get(
            `${API_URL}api/parent/venues`,
            { headers }
        );

        setVenues(data?.data ?? []);
    } catch (err) {
        console.error("Error fetching venues:", err);

        const errorMessage =
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Something went wrong while fetching venues.";

        setError(errorMessage);
        showError("Error", errorMessage);
    } finally {
        setLoading(false);
    }
}, [showError]);



    return (
        <CommonContext.Provider
            value={{
                venues,
                loading,
                error,
                fetchVenues,
                setVenues,
            }}
        >
            {children}
        </CommonContext.Provider>
    );
};
