import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function StudentRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    school: "",
    class: "JSS1",
  });

  const [availableClasses, setAvailableClasses] = useState([]);

  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem("adminData"));
    if (!admin) return;

    // Get classes from quizzes created by this admin
    const quizzes = JSON.parse(localStorage.getItem("quizzes") || "[]");
    const classes = [
      ...new Set(
        quizzes.filter((q) => q.adminEmail === admin.email).map((q) => q.class)
      ),
    ];

    setAvailableClasses(classes.length ? classes : ["JSS1"]);
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const admin = JSON.parse(localStorage.getItem("adminData"));
    if (!admin) return alert("No admin registered yet.");

    const students = JSON.parse(localStorage.getItem("students") || []);

    const newStudent = {
      ...formData,
      adminEmail: null, // 🔑 linked later from dashboard
      progress: [],
      quizStatus: {},
    };

    students.push(newStudent);
    localStorage.setItem("students", JSON.stringify(students));

    alert("Student registered successfully!");
    navigate("/student-dashboard", { state: { student: newStudent } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-5">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl w-full max-w-md shadow-lg">
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          Student Registration
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            required
            onChange={handleChange}
            className="p-3 rounded-lg bg-white/20 text-white outline-none"
          />

          <input
            type="text"
            name="school"
            placeholder="School"
            required
            onChange={handleChange}
            className="p-3 rounded-lg bg-white/20 text-white outline-none"
          />

          {/* Class Dropdown */}
          <div className="relative mb-4">
            <select
              name="class"
              value={formData.class}
              onChange={handleChange}
              className="appearance-none w-full p-3 rounded-lg bg-white/20 text-yellow-400 outline-none pr-10"
            >
              {availableClasses.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-yellow-400">
              ▼
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 p-3 bg-gradient-to-r from-yellow-500 to-yellow-300 rounded-lg text-black font-semibold hover:scale-105 transition"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default StudentRegister;
