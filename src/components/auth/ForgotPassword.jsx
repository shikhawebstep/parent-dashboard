import { useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState({});

    // 🔹 VALIDATION
    const validate = () => {
        let newErrors = {};

        if (!email) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Invalid email address";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 🔹 SUBMIT
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        const API_URL = import.meta.env.VITE_API_BASE_URL;

        // 🔄 Loading
        Swal.fire({
            title: "Sending Request...",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });

        try {
            await axios.post(
                `${API_URL}api/parent/auth/forgot-password`,
                { email },
                { headers: { "Content-Type": "application/json" } }
            );

            Swal.fire({
                icon: "success",
                title: "Link Sent!",
                text: "Please check your email for password reset instructions.",
                timer: 3000,
                showConfirmButton: true,
            });

        } catch (error) {
            Swal.close();
            console.error("FORGOT PASS ERROR:", error);

            let message = "Something went wrong. Please try again.";

            if (error.response) {
                message =
                    error.response.data?.message ||
                    error.response.data?.error ||
                    "Could not send reset link.";
            }

            Swal.fire({
                icon: "error",
                title: "Request Failed",
                text: message,
            });
        }
    };

    return (
        <div className="w-full h-full bg-white flex items-center p-5 lg:p-10 xl:p-0">
            <div className="w-full flex flex-col max-w-xl border border-gray-200 rounded-[15px] p-5 m-auto items-center justify-center m-auto ">
                <div className="text-center w-full mb-8">
                    <div className="text-5xl font-bold text-blue-700 2xl:max-w-[70px] lg:max-w-[50px] max-w-[60px] m-auto">
                        <img src="/assets/sambaLogoBlue.png" alt="" className="w-full" />
                    </div>
                    <h2 className="2xl:text-[38px] text-[38px] lg:text-[40px] font-semibold mt-3">Forgot Password?</h2>
                    <p className="text-black text-[20px] font-semibold">Enter your email to receive a reset link.</p>
                </div>

                <form onSubmit={handleSubmit} className="w-full">
                    {/* EMAIL */}
                    <div className="my-5">
                        <label className="2xl:text-[18px] lg:text-[16px] font-medium">Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your registered email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full mt-1 px-4 py-2.5 border ${errors.email ? "border-red-500" : "border-[#D0CFD1]"
                                } placeholder:text-[#717073] rounded-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                        )}
                    </div>

                    {/* BUTTON */}
                    <button
                        type="submit"
                        className="w-full bg-[#237FEA] text-white 2xl:text-[18px] lg:text-[16px] font-bold py-2.5 rounded-[14px] hover:bg-blue-700 transition"
                    >
                        Send Reset Link
                    </button>

                    <div className="text-center mt-5">
                        <Link to="/parent/auth/login" className="text-[#237FEA] font-semibold hover:underline">
                            Back to Login
                        </Link>
                    </div>
                </form>

                <div className="mt-8 max-w-[150px] m-auto">
                    <img src="/assets/sss-logo-parents.png" alt="" className="w-full" />
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
