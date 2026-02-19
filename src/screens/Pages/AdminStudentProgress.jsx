import { useState, useEffect } from "react";
import { FaExclamationTriangle, FaTimes } from "react-icons/fa";

function AdminStudentProgress() {
  const [students, setStudents] = useState([]);
  const [visibleStudents, setVisibleStudents] = useState([]);

  const stageThresholds = [40, 60, 80]; // cutoff marks

  useEffect(() => {
    const storedStudents = JSON.parse(localStorage.getItem("students") || "[]");
    setStudents(storedStudents);
    setVisibleStudents(storedStudents);
  }, []);

  const clearStudentFromView = (index) => {
    setVisibleStudents((prev) => prev.filter((_, i) => i !== index));
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
                        stageIdx
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

                  {/* ✅ CLEAR BUTTON */}
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => clearStudentFromView(idx)}
                      className="text-red-400 hover:text-red-600"
                      title="Clear student from view"
                    >
                      <FaTimes />
                    </button>
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
