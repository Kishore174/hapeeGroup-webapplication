import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import loginicon from "../Assets/logo.jpg";
import { loginUser, googleLoginUser } from "../Api/authApi";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/");
  }, [navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await loginUser({
      email: form.email,
      password: form.password,
    });

    // 👇 CORRECT destructuring
    const { token, user } = res.data.data;

    console.log("TOKEN:", token);
    console.log("USER:", user);

    login(token, user);              // ✅ FIXED
    toast.success("Login successful");
    navigate("/", { replace: true }); // ✅ redirect
  } catch (err) {
    console.error(err);
    toast.error("Invalid credentials");
  }
};





 

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
        
        {/* LEFT IMAGE */}
        <div className="hidden md:flex items-center justify-center ">
          <img src={loginicon} alt="login" className="max-w-xs" />
        </div>

        {/* RIGHT FORM */}
        <div className="p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Admin Login  
          </h2>
          <p className="text-gray-500 text-center mt-1 mb-6">
            Login to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
              required
              className="input"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                className="input pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400"
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Login
            </button>
          </form>

        

  
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
