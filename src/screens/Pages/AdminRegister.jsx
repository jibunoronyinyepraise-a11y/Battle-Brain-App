import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function AdminRegister() {
  const navigate = useNavigate();
  const [mode, setMode] = useState(null); // null | signup | signin
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    // If admin already exists, default to signin
    const savedAdmin = JSON.parse(localStorage.getItem("adminData"));
    if (savedAdmin) setMode("signin");
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValidEmail(formData.email)) return alert("Enter a valid email.");

    const savedAdmin = JSON.parse(localStorage.getItem("adminData"));

    if (mode === "signup") {
      if (savedAdmin) {
        setMode("signin"); // Redirect to sign in if admin exists
        return;
      }

      const adminData = { ...formData, verified: true };
      localStorage.setItem("adminData", JSON.stringify(adminData));
      localStorage.setItem("adminLoggedIn", "true");
      alert("Admin registered successfully!");
      navigate("/admin-dashboard");
    }

    if (mode === "signin") {
      if (!savedAdmin) return alert("No admin account found. Please sign up.");

      if (
        formData.name !== savedAdmin.name ||
        formData.email !== savedAdmin.email ||
        formData.password !== savedAdmin.password
      ) {
        return alert(
          "Invalid credentials. You cannot access the dashboard without your correct password."
        );
      }

      localStorage.setItem("adminLoggedIn", "true");
      alert("Login successful!");
      navigate("/admin-dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-5">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl w-full max-w-md shadow-lg">
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          Admin Access
        </h2>

        {!mode && (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => setMode("signup")}
              className="p-3 bg-gradient-to-r from-yellow-500 to-yellow-300 rounded-lg text-black font-semibold hover:scale-105 transition"
            >
              Sign Up as Admin
            </button>
            <button
              onClick={() => setMode("signin")}
              className="p-3 bg-gray-700 rounded-lg text-white font-semibold hover:bg-gray-600 transition"
            >
              Sign In as Admin
            </button>
          </div>
        )}

        {mode && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <p className="text-sm text-yellow-300 italic mb-2">
              Note: If you forget your password, you will NOT be able to access
              the dashboard.
            </p>

            <input
              type="text"
              name="name"
              placeholder="Full Name"
              required
              onChange={handleChange}
              className="p-3 rounded-lg bg-white/20 text-white outline-none"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              onChange={handleChange}
              className="p-3 rounded-lg bg-white/20 text-white outline-none"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              onChange={handleChange}
              className="p-3 rounded-lg bg-white/20 text-white outline-none"
            />
            <button
              type="submit"
              className="mt-2 p-3 bg-gradient-to-r from-yellow-500 to-yellow-300 rounded-lg text-black font-semibold hover:scale-105 transition"
            >
              {mode === "signup" ? "Create Admin Account" : "Sign In"}
            </button>

            {/* ← Back button */}
            <button
              type="button"
              onClick={() => setMode(null)}
              className="text-sm text-white/70 hover:text-white mt-2"
            >
              ← Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default AdminRegister;
