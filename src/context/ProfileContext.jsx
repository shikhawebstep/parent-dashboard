import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const ProfileContext = createContext();

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


    const fetchProfileData = async () => {
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
                `${API_URL}api/parent/account-profile/${parentId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setProfile(response.data?.data ?? response.data);
        } catch (err) {
            console.error("Error fetching profile:", err);

            // ✅ Extract API error message safely
            const errorMessage =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "Something went wrong while fetching profile.";

            setError(errorMessage);

            // ✅ Show SweetAlert
            Swal.fire({
                icon: "error",
                title: "Error",
                text: errorMessage,
            });

        } finally {
            setLoading(false);
        }
    };


    return (
        <ProfileContext.Provider
            value={{
                profile,
                loading,
                error,
                fetchProfileData,
                setProfile
            }}
        >
            {children}
        </ProfileContext.Provider>
    );
};
