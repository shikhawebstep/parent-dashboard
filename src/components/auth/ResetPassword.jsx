import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from 'lucide-react';
import Swal from "sweetalert2";
import axios from "axios";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [passwords, setPasswords] = useState({
        password: "",
        confirmPassword: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!token) {
            Swal.fire({
                icon: "error",
                title: "Invalid Link",
                text: "Reset token is missing. Please request a new password reset link.",
                confirmButtonText: "Go to Login"
            }).then(() => {
                navigate("/parent/auth/login");
            });
        }
    }, [token, navigate]);

    const handleChange = (e) => {
        setPasswords({
            ...passwords,
            [e.target.name]: e.target.value
        });
    };

    const validate = () => {
        let newErrors = {};

        if (!passwords.password) {
            newErrors.password = "Password is required";
        } else if (passwords.password.length < 6) {
            newErrors.password = "Minimum 6 characters required";
        }

        if (passwords.password !== passwords.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        const API_URL = import.meta.env.VITE_API_BASE_URL;

        Swal.fire({
            title: "Resetting Password...",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });

        try {
            await axios.post(
                `${API_URL}api/parent/auth/reset-password`,
                {
                    token,
                    password: passwords.password
                },
                { headers: { "Content-Type": "application/json" } }
            );

            Swal.fire({
                icon: "success",
                title: "Password Reset Successful",
                text: "You can now login with your new password.",
                timer: 2000,
                showConfirmButton: false,
            }).then(() => {
                navigate("/parent/auth/login");
            });

        } catch (error) {
            Swal.close();
            console.error("RESET PASS ERROR:", error);

            let message = "Something went wrong. Please try again.";

            if (error.response) {
                message =
                    error.response.data?.message ||
                    error.response.data?.error ||
                    "Could not reset password.";
            }

            Swal.fire({
                icon: "error",
                title: "Reset Failed",
                text: message,
            });
        }
    };

    if (!token) return null;

    return (
        <div className="w-full h-full bg-white flex items-center p-5 lg:p-10 xl:p-0">
            <div className="w-full flex flex-col max-w-xl border border-gray-200 rounded-[15px] p-5 m-auto items-center justify-center m-auto ">
                <div className="text-center w-full mb-8">
                    <div className="text-5xl font-bold text-blue-700 2xl:max-w-[70px] lg:max-w-[50px] max-w-[60px] m-auto">
                        <img src="/assets/sambaLogoBlue.png" alt="" className="w-full" />
                    </div>
                    <h2 className="2xl:text-[38px] text-[38px] lg:text-[40px] font-semibold mt-3">Reset Password</h2>
                    <p className="text-black text-[20px] font-semibold">Enter your new password below.</p>
                </div>

                <form onSubmit={handleSubmit} className="w-full">
                    {/* NEW PASSWORD */}
                    <div className="my-5">
                        <label className="2xl:text-[18px] lg:text-[16px] font-medium">New Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Enter new password"
                                value={passwords.password}
                                onChange={handleChange}
                                className={`w-full mt-1 px-4 py-2.5 border ${errors.password ? "border-red-500" : "border-[#D0CFD1]"
                                    } placeholder:text-[#717073] rounded-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-500 2xl:text-[18px] lg:text-[16px]"
                            >
                                {showPassword ? <EyeOff /> : <Eye />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                        )}
                    </div>

                    {/* CONFIRM PASSWORD */}
                    <div className="mb-8">
                        <label className="2xl:text-[18px] lg:text-[16px] font-medium">Confirm Password</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                placeholder="Confirm new password"
                                value={passwords.confirmPassword}
                                onChange={handleChange}
                                className={`w-full mt-1 px-4 py-2.5 border ${errors.confirmPassword ? "border-red-500" : "border-[#D0CFD1]"
                                    } placeholder:text-[#717073] rounded-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-3 text-gray-500 2xl:text-[18px] lg:text-[16px]"
                            >
                                {showConfirmPassword ? <EyeOff /> : <Eye />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                        )}
                    </div>

                    {/* BUTTON */}
                    <button
                        type="submit"
                        className="w-full bg-[#237FEA] text-white 2xl:text-[18px] lg:text-[16px] font-bold py-2.5 rounded-[14px] hover:bg-blue-700 transition"
                    >
                        Reset Password
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

export default ResetPassword;
