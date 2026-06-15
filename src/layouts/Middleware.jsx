import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../components/Loader";

const Middleware = ({ children }) => {
    const [loading, setLoading] = useState(true);

   useEffect(() => {
    const verifyAuth = async () => {
        const token = localStorage.getItem("parentToken");
        const API_URL = import.meta.env.VITE_API_BASE_URL;
        const currentPath = window.location.pathname;

        if (!token) {
            window.location.replace(
                `/auth/login?redirect=${encodeURIComponent(currentPath)}`
            );
            return;
        }

        try {
            const result = await axios.get(          // ✅ was missing "const result ="
                `${API_URL}api/parent/auth/login/verify`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            localStorage.setItem("parentData", JSON.stringify(result?.data?.admin));
            setLoading(false);
        } catch (error) {
            localStorage.removeItem("parentToken");
            window.location.replace(
                `/auth/login?redirect=${encodeURIComponent(currentPath)}`
            );
        }
    };

    verifyAuth();
}, []);

    if (loading) return <Loader />;

    return <>{children}</>;
};

export default Middleware;
