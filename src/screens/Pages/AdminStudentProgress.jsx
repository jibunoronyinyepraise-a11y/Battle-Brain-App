import { useState, useEffect } from "react";
import { FaExclamationTriangle, FaTimes, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function AdminStudentProgress() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [visibleStudents, setVisibleStudents] = useState([]);

  const stageThresholds = [40, 60, 80]; // cutoff marks

  const safeParse = (key, fallback) => {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  };

  useEffect(() => {
    // ✅ Admin gate (matches your existing auth logic)
    const loggedIn = localStorage.getItem("adminLoggedIn");
    if (loggedIn !== "true") {
      navigate("/register-admin");
      return;
    }

    const adminData = safeParse("adminData", null);
    if (!adminData?.verified) {
      navigate("/register-admin");
      return;
    }

    // ✅ Only load students linked to this admin
    const storedStudents = safeParse("students", []);
    const myStudents = storedStudents.filter(
      (s) =>
        (s.adminEmail || "").toLowerCase() ===
        (adminData.email || "").toLowerCase(),
    );

    setStudents(myStudents);
    setVisibleStudents(myStudents);
  }, [navigate]);

  // ✅ Hide from view only (temporary)
  const clearStudentFromView = (index) => {
    setVisibleStudents((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ Permanently remove (eliminate) student from localStorage
  const eliminateStudent = (student) => {
    if (!window.confirm(`Eliminate ${student.name} permanently?`)) return;

    const allStudents = safeParse("students", []);

    // Remove by matching key fields you already store
    const updatedAllStudents = allStudents.filter(
      (s) =>
        !(
          (s.name || "") === (student.name || "") &&
          (s.school || "") === (student.school || "") &&
          (s.class || "") === (student.class || "") &&
          (s.adminEmail || "") === (student.adminEmail || "")
        ),
    );

    localStorage.setItem("students", JSON.stringify(updatedAllStudents));

    // Update local page states (remove from both lists)
    setStudents((prev) =>
      prev.filter(
        (s) =>
          !(
            (s.name || "") === (student.name || "") &&
            (s.school || "") === (student.school || "") &&
            (s.class || "") === (student.class || "") &&
            (s.adminEmail || "") === (student.adminEmail || "")
          ),
      ),
    );

    setVisibleStudents((prev) =>
      prev.filter(
        (s) =>
          !(
            (s.name || "") === (student.name || "") &&
            (s.school || "") === (student.school || "") &&
            (s.class || "") === (student.class || "") &&
            (s.adminEmail || "") === (student.adminEmail || "")
          ),
      ),
    );
  };

  const getStageStatus = (student, stageIndex) => {
    const progress = student.progress?.[stageIndex];
    const score = progress?.score ?? null;
    const passed = score !== null && score >= stageThresholds[stageIndex];

    if (stageIndex > 0) {
      const prevScore = student.progress?.[stageIndex - 1]?.score ?? 0;
      if (prevScore < stageThresholds[stageIndex - 1]) {
        return { score: null, passed: false, locked: true };
      }
    }

    return { score, passed, locked: false };
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white">
      <h1 className="text-3xl font-bold text-yellow-400 mb-2">
        Student Progress (Admin View)
      </h1>

      {/* ✅ CUTOFF MARKS */}
      <p className="text-white/70 mb-4">
        Stage cutoffs: Stage 1 – 40%, Stage 2 – 60%, Stage 3 – 80%
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 rounded-lg">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-yellow-400">Name</th>
              <th className="px-4 py-2 text-left text-yellow-400">Class</th>
              <th className="px-4 py-2 text-left text-yellow-400">
                Registered By
              </th>
              <th className="px-4 py-2 text-yellow-400">Stage 1</th>
              <th className="px-4 py-2 text-yellow-400">Stage 2</th>
              <th className="px-4 py-2 text-yellow-400">Stage 3</th>
              <th className="px-4 py-2 text-yellow-400">Clear</th>
            </tr>
          </thead>

          <tbody>
            {visibleStudents.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-4 text-center text-white/70">
                  No students to display
                </td>
              </tr>
            ) : (
              visibleStudents.map((s, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-700 hover:bg-gray-700 transition"
                >
                  <td className="px-4 py-2">{s.name}</td>
                  <td className="px-4 py-2">{s.class}</td>
                  <td className="px-4 py-2">{s.adminName || "Unknown"}</td>

                  {Array(3)
                    .fill(0)
                    .map((_, stageIdx) => {
                      const { score, passed, locked } = getStageStatus(
                        s,
                        stageIdx,
                      );

                      return (
                        <td
                          key={stageIdx}
                          className={`px-4 py-2 font-semibold ${
                            locked
                              ? "text-white/70"
                              : passed
                                ? "text-green-400"
                                : "text-red-500"
                          }`}
                        >
                          {locked
                            ? "Locked"
                            : score !== null
                              ? `${score.toFixed(2)}%`
                              : "-"}
                          {!locked && score !== null && !passed && (
                            <FaExclamationTriangle className="inline ml-1 text-yellow-400" />
                          )}
                        </td>
                      );
                    })}

                  {/* ✅ CLEAR + ELIMINATE (same styling) */}
                  <td className="px-4 py-2 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => clearStudentFromView(idx)}
                        className="text-red-400 hover:text-red-600"
                        title="Clear student from view"
                      >
                        <FaTimes />
                      </button>

                      <button
                        onClick={() => eliminateStudent(s)}
                        className="text-red-400 hover:text-red-600"
                        title="Eliminate student (remove permanently)"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminStudentProgress;
