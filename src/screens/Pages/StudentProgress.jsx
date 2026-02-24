import { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const stageThresholds = [40, 60, 80];

function safeParse(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

function StudentProgress() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Load student ONCE (no effect, no setState)
  const student = useMemo(() => {
    const students = safeParse("students", []);
    if (!students.length) return null;

    const fromNav = location.state?.student;

    // If student passed from navigation, try to refresh it from storage
    if (fromNav) {
      const found =
        students.find(
          (s) =>
            (s.name || "") === (fromNav.name || "") &&
            (s.school || "") === (fromNav.school || "") &&
            (s.class || "") === (fromNav.class || ""),
        ) || students[students.length - 1];

      return found;
    }

    // Otherwise return last student
    return students[students.length - 1];
  }, [location.state]);

  // ✅ If no student, redirect (no setState → no loop)
  if (!student) {
    navigate("/student-dashboard");
    return null;
  }

  const stageRows = useMemo(() => {
    const progressArr = Array.isArray(student.progress) ? student.progress : [];

    return [0, 1, 2].map((i) => {
      const raw = progressArr[i] || null;
      const score = raw?.score ?? null;

      // lock rule
      if (i > 0) {
        const prevScore = progressArr[i - 1]?.score ?? null;
        const prevPassed =
          prevScore !== null ? prevScore >= stageThresholds[i - 1] : false;

        if (!prevPassed) {
          return { stage: i + 1, locked: true, score: null, passed: false };
        }
      }

      const passed = score !== null && score >= stageThresholds[i];
      return { stage: i + 1, locked: false, score, passed };
    });
  }, [student]);

  const motivationText = useMemo(() => {
    const anyAttempted = stageRows.some((r) => r.score !== null);
    if (!anyAttempted) {
      return "Start your first quiz today — every attempt makes you smarter.";
    }

    const anyFailedUnlocked = stageRows.some(
      (r) => !r.locked && r.score !== null && !r.passed,
    );

    return anyFailedUnlocked
      ? "Don't give up! Every attempt is a step toward mastery."
      : "Excellent work! Keep challenging yourself to do even better.";
  }, [stageRows]);

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
          {student.name}&apos;s Progress
        </h2>
        <p className="text-white/80">
          Check your stages, see how well you did, and stay motivated!
        </p>
      </div>

      <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-4 mb-8 text-center">
        <p className="italic text-yellow-300 text-lg">{motivationText}</p>
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
            {stageRows.map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-gray-600 hover:bg-gray-700 transition"
              >
                <td className="px-4 py-2">Stage {row.stage}</td>
                <td className="px-4 py-2">
                  {row.locked
                    ? "-"
                    : row.score !== null
                      ? row.score.toFixed(2)
                      : "-"}
                </td>
                <td
                  className={`px-4 py-2 font-semibold ${
                    row.locked
                      ? "text-white/70"
                      : row.score === null
                        ? "text-white/70"
                        : row.passed
                          ? "text-green-400"
                          : "text-red-500"
                  }`}
                >
                  {row.locked
                    ? "Locked"
                    : row.score === null
                      ? "Not Attempted"
                      : row.passed
                        ? "Passed"
                        : "Failed"}
                </td>
              </tr>
            ))}
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
