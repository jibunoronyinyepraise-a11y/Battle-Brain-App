import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white p-6">
      {/* Logo */}
      <img src={logo} alt="Battle Brain Logo" className="w-32 h-32 mb-6" />

      <h1 className="text-5xl font-extrabold mb-6 drop-shadow-lg text-center">
        Battle <span className="text-yellow-400">Brain</span>
      </h1>

      <p className="text-center text-white/80 text-lg mb-8">
        Battle your brain. Beat the best.
      </p>

      <button
        onClick={() => navigate("/registration")}
        className="px-10 py-4 bg-yellow-400 text-gray-900 font-bold rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transform transition-all duration-300"
      >
        Get Started
      </button>
    </div>
  );
}

export default WelcomePage;
