import React from "react";
import { useNavigate } from "react-router-dom";

function RegistrationPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white p-6">
      <h1 className="text-4xl font-extrabold text-center mb-8 drop-shadow-lg">
        Choose Your Role
      </h1>

      <div className="w-full max-w-md flex flex-col gap-6">
        <button
          onClick={() => navigate("/register-admin")}
          className="w-full bg-yellow-400 text-gray-900 font-bold text-lg py-5 rounded-2xl shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-300"
        >
          Register as Admin
        </button>

        <button
          onClick={() => navigate("/register-student")}
          className="w-full bg-white text-gray-900 font-bold text-lg py-5 rounded-2xl shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-300"
        >
          Register as Student
        </button>
      </div>

      <p className="text-center text-white/80 text-sm mt-6 max-w-sm">
        <span className="font-semibold text-yellow-300">Admin:</span> Create and
        manage quizzes, track student progress. <br />
        <span className="font-semibold text-yellow-300">Student:</span> Take
        quizzes and view your results.
      </p>
    </div>
  );
}

export default RegistrationPage;
