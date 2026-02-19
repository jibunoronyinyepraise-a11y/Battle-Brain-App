import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function StudentProgress() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [student, setStudent] = useState(state?.student);

  useEffect(() => {
    if (!student) {
      const students = JSON.parse(localStorage.getItem("students") || "[]");
      if (!students.length) return navigate("/student-dashboard");
      setStudent(students[students.length - 1]);
    }
  }, [student, navigate]);

  if (!student) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white p-6">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-yellow-400">
          Battle Brain
        </h1>
        <p className="italic text-white/70">Battle your brain, beat the best</p>
      </header>

      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-6 text-center">
        <h2 className="text-2xl font-semibold mb-2">
          {student.name}'s Progress
        </h2>
        <p className="text-white/80">
          Check your stages, see how well you did, and stay motivated!
        </p>
      </div>

      <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-4 mb-8 text-center">
        <p className="italic text-yellow-300 text-lg">
          {student.progress?.some((p) => !p.passed)
            ? "Don't give up! Every attempt is a step toward mastery."
            : "Excellent work! Keep challenging yourself to do even better."}
        </p>
      </div>

      <div className="overflow-x-auto max-w-3xl mx-auto mb-6">
        <table className="min-w-full bg-gray-800 rounded-lg">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-yellow-400 font-bold">
                Stage
              </th>
              <th className="px-4 py-2 text-left text-yellow-400 font-bold">
                Score
              </th>
              <th className="px-4 py-2 text-left text-yellow-400 font-bold">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {student.progress?.length ? (
              student.progress.map((stage, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-600 hover:bg-gray-700 transition"
                >
                  <td className="px-4 py-2">Stage {idx + 1}</td>
                  <td className="px-4 py-2">
                    {stage?.score?.toFixed(2) || "-"}
                  </td>
                  <td
                    className={`px-4 py-2 font-semibold ${
                      stage?.passed ? "text-green-400" : "text-red-500"
                    }`}
                  >
                    {stage?.passed ? "Passed" : "Failed"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-2 text-center text-white/70">
                  No progress yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="text-center">
        <button
          onClick={() => navigate("/student-dashboard", { state: { student } })}
          className="px-6 py-2 bg-yellow-400 text-black rounded font-semibold hover:scale-105 transition"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default StudentProgress;
