import { useState } from "react";
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

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
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    // Save to localStorage
    localStorage.setItem(
      "parentLogin",
      JSON.stringify({
        email: formData.email,
        remember: formData.remember,
      })
    );

    alert("Login Successful ✅");
  };

  return (
    <div className="w-full h-full bg-white flex items-center p-5 md:p-0">
      <div className="w-full flex flex-col items-center justify-center m-auto ">
        <div className="text-center w-full mb-8">
          <div className="text-5xl font-bold text-blue-700 2xl:max-w-[70px] lg:max-w-[50px] m-auto"> <img src="/assets/sambaLogoBlue.png" alt="" className="w-full" /></div>
          <h2 className="2xl:text-[51px] lg:text-[40px] font-semibold mt-3">Welcome</h2>
          <p className="text-black text-[20px] font-semibold">Bookings made simple.</p>
        </div>

        <form onSubmit={handleSubmit} className="lg:w-[55%]">
          {/* EMAIL */}
          <div className="my-5">
            <label className="2xl:text-[18px] lg:text-[16px] font-medium">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2.5 border border-[#D0CFD1] placeholder:text-[#717073] rounded-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full mt-1 px-4 py-2.5 border border-[#D0CFD1] placeholder:text-[#717073] rounded-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <a href="#" className="text-[#282829] hover:underline m-0">
              Forgot password?
            </a>
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
