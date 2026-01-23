import { useState, useEffect } from "react";
import { Eye, EyeOff } from 'lucide-react';
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("parentToken");
    console.log('token', token)
    if (token) {
      window.location.href = "/parent";
    }
  }, []);

  useEffect(() => {
    const email = localStorage.getItem("parentEmail");
    const password = localStorage.getItem("parentPassword");
    if (email && password) {
      setFormData({
        email: email || "",
        password: password || "",
      })
    }
  }, []);

  // 🔹 HANDLE CHANGE
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // 🔹 VALIDATION
  const validate = () => {
    let newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Minimum 6 characters required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  // 🔹 SUBMIT


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const API_URL = import.meta.env.VITE_API_BASE_URL;
    const params = new URLSearchParams(window.location.search);
    const redirectTo = params.get("redirect") || "/parent";

    Swal.fire({
      title: "Logging in...",

      message: "Please wait...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const response = await axios.post(
        `${API_URL}api/parent/auth/login`,
        {
          email: formData.email,
          password: formData.password,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      const result = response?.data;
      const token = result?.data?.token || result?.data?.accessToken;
      if (!token) throw new Error("TOKEN_MISSING");

      localStorage.setItem("parentToken", token);
      localStorage.setItem("parentData", JSON.stringify(result?.data?.admin));
      if (formData.remember) {
        localStorage.setItem("parentEmail", formData.email);
        localStorage.setItem("parentPassword", formData.password);
      }

      Swal.fire({
        icon: "success",
        title: "Login Successful",
        message: "Redirecting to dashboard...",
        timer: 1200,
        showConfirmButton: false,
      }).then(() => {
        window.location.replace(redirectTo);
      });

    } catch (error) {
      Swal.close();

      let message = "Something went wrong. Please try again.";

      if (error.code === "ERR_NETWORK") {
        message = "Cannot connect to server.";
      } else if (error.message === "TOKEN_MISSING") {
        message = "Token not returned by API.";
      } else if (error.response) {
        message =
          error.response.data?.message ||
          error.response.data?.error ||
          "Invalid email or password.";
      }

      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: message,
      });
    }
  };



  return (
    <div className="w-full h-full bg-white flex items-center p-5 lg:p-10 xl:p-0">
      <div className="w-full flex flex-col items-center justify-center m-auto ">
        <div className="text-center w-full mb-8">
          <div className="text-5xl font-bold text-blue-700 2xl:max-w-[70px] lg:max-w-[50px] max-w-[60px] m-auto"> <img src="/assets/sambaLogoBlue.png" alt="" className="w-full" /></div>
          <h2 className="2xl:text-[51px] text-[38px] lg:text-[40px] font-semibold mt-3">Welcome</h2>
          <p className="text-black text-[20px] font-semibold">Bookings made simple.</p>
        </div>

        <form onSubmit={handleSubmit} className="xl:w-[55%] w-full">
          {/* EMAIL */}
          <div className="my-5">
            <label className="2xl:text-[18px] lg:text-[16px] font-medium">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full mt-1 px-4 py-2.5 border ${errors.email ? "border-red-500" : "border-[#D0CFD1]"
                } placeholder:text-[#717073] rounded-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* PASSWORD */}
          <div className="mb-1">
            <label className="2xl:text-[18px] lg:text-[16px] font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter password"
                value={formData.password}
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

          {/* OPTIONS */}
          <div className="flex items-center justify-between text-[16px] mb-10">
            <label className="flex items-center gap-2 m-0">
              <input
                type="checkbox"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
                className="text-[#282829]"
              />
              Remember me
            </label>
            <Link to="/parent/auth/forgot-password" className="text-[#282829] hover:underline m-0">
              Forgot password?
            </Link>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            className="w-full bg-[#237FEA] text-white 2xl:text-[18px] lg:text-[16px] font-bold py-2.5 rounded-[14px] hover:bg-blue-700 transition"
          >
            Log In
          </button>
        </form>

        <div className="mt-8 max-w-[150px] m-auto">
          <img src="/assets/sss-logo-parents.png" alt="" className="w-full" />
        </div>
      </div>

    </div>

  );
};

export default Login;
