import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const stageThresholds = [40, 60, 80];

/* ✅ STAGE-BASED QUOTES (start/win/fail) */
const stageQuotes = {
  start: [
    [
      "🌟 Stage 1: Stay calm. Read each question twice before answering.",
      "🧠 Stage 1: Focus on accuracy first. No rushing.",
      "🔥 Stage 1: You’ve got this. Start strong and build momentum.",
    ],
    [
      "⚡ Stage 2: You’re leveling up. Stay sharp and trust your mind.",
      "🎯 Stage 2: Don’t panic. One question at a time.",
      "💫 Stage 2: Keep your confidence steady. You’re doing well.",
    ],
    [
      "🏆 Stage 3: This is elite level. Be precise and fearless.",
      "🔥 Stage 3: Champions stay calm under pressure. You’re ready.",
      "⚔️ Stage 3: Final stage. Keep focus—finish strong!",
    ],
  ],
  win: [
    [
      "✅ Great start! Keep going—Stage 2 is waiting.",
      "🏆 Well done! You passed Stage 1. Aim higher!",
      "💪 Nice! Keep your energy—don’t relax yet.",
    ],
    [
      "🔥 Incredible! Stage 3 is where legends are made.",
      "🏆 You’re flying! Keep that same focus.",
      "💪 Stage 2 cleared! You’re closer than you think.",
    ],
    [
      "👑 CHAMPION! You cleared Stage 3. Respect!",
      "🏆 You did it! That’s elite performance.",
      "🔥 Victory! Keep learning and stay on top.",
    ],
  ],
  fail: [
    [
      "💡 Stage 1 setback. Learn the pattern and try again.",
      "⚔️ Don’t give up. Start again, smarter.",
      "🚀 You can do this. Reset and come back stronger.",
    ],
    [
      "💡 Stage 2 is tough. Review your weak areas and retry.",
      "⚔️ Loss is a lesson. You’re improving.",
      "🚀 Keep pushing. You’re not far from passing.",
    ],
    [
      "💡 Stage 3 is for the brave. You were close—try again!",
      "⚔️ Respect for reaching Stage 3. Now come back stronger.",
      "🚀 Almost there. Refocus and take it again.",
    ],
  ],
};

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function getCurrentStage(student) {
  const statuses = student.quizStatus ? Object.values(student.quizStatus) : [];
  if (!statuses.length) return 1;

  const anyCompleted = statuses.some((s) => s?.completed);
  if (anyCompleted) return 3;

  const failedStages = statuses
    .filter((s) => s?.locked && s?.failedStage)
    .map((s) => Number(s.failedStage))
    .filter(Boolean);

  if (failedStages.length) return Math.max(...failedStages);

  return 1;
}

function StudentDashboard() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  const [adminEmailInput, setAdminEmailInput] = useState("");
  const [confirmedAdminEmail, setConfirmedAdminEmail] = useState("");

  const [quoteCache, setQuoteCache] = useState({});

  const safeParse = (key, fallback) => {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  };

  // ✅ LOAD + ALWAYS REFRESH STUDENT FROM STORAGE
  const loadLatestStudent = () => {
    const students = safeParse("students", []);
    if (!students.length) return null;
    return students[students.length - 1];
  };

  useEffect(() => {
    const students = safeParse("students", []);
    if (!students.length) {
      navigate("/register-student");
      return;
    }

    const lastStudent = students[students.length - 1];
    setStudent(lastStudent);
    setAllStudents(students);

    const allQuizzes = safeParse("quizzes", []);
    setQuizzes(Array.isArray(allQuizzes) ? allQuizzes : []);

    if (lastStudent.adminEmail) {
      setAdminEmailInput(lastStudent.adminEmail);
      setConfirmedAdminEmail(lastStudent.adminEmail);
    }
  }, [navigate]);

  // ✅ refresh when page becomes active again (after coming back from quiz)
  useEffect(() => {
    const onFocus = () => {
      const latest = loadLatestStudent();
      if (latest) setStudent(latest);
    };

    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentStage = useMemo(
    () => (student ? getCurrentStage(student) : 1),
    [student],
  );

  const visibleQuizzes = useMemo(() => {
    if (!student || !confirmedAdminEmail) return [];

    return quizzes.filter(
      (q) =>
        q.class === student.class &&
        (q.adminEmail || "").toLowerCase() ===
          confirmedAdminEmail.toLowerCase(),
    );
  }, [quizzes, student, confirmedAdminEmail]);

  if (!student) return null;

  const isStudentStillRegistered = allStudents.some(
    (s) =>
      (s.name || "") === (student.name || "") &&
      (s.school || "") === (student.school || "") &&
      (s.class || "") === (student.class || ""),
  );

  if (!isStudentStillRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white p-4 md:p-6 flex items-center justify-center">
        <div className="max-w-lg w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 text-center">
          <h2 className="text-2xl font-bold text-yellow-400 mb-2">
            Access Removed
          </h2>
          <p className="text-white/80 mb-4">
            Your admin has removed your account. Please register again or
            contact your admin.
          </p>
          <button
            onClick={() => navigate("/register-student")}
            className="px-6 py-2 bg-yellow-400 text-black rounded font-semibold transition hover:scale-[1.03]"
          >
            Go to Student Registration
          </button>
        </div>
      </div>
    );
  }

  const getQuoteStable = (quizKey, type, stageIndex) => {
    const cacheKey = `${quizKey}-${type}-${stageIndex}`;
    if (quoteCache[cacheKey]) return quoteCache[cacheKey];

    const quote = pickRandom(stageQuotes[type][stageIndex]);
    setQuoteCache((prev) => ({ ...prev, [cacheKey]: quote }));
    return quote;
  };

  const saveStudentAdminLink = (email) => {
    const updatedStudents = allStudents.map((s, i) => {
      if (i !== allStudents.length - 1) return s;
      return { ...s, adminEmail: email.trim() };
    });

    localStorage.setItem("students", JSON.stringify(updatedStudents));
    setAllStudents(updatedStudents);
    setStudent(updatedStudents[updatedStudents.length - 1]);
  };

  const handleSearchAdmin = () => {
    if (!adminEmailInput.trim()) return alert("Please enter admin email");

    const email = adminEmailInput.trim();

    const adminHasQuizzes = quizzes.some(
      (q) => (q.adminEmail || "").toLowerCase() === email.toLowerCase(),
    );

    if (!adminHasQuizzes) {
      alert(
        "No quizzes found for this admin email yet. Confirm with your admin.",
      );
    }

    setConfirmedAdminEmail(email);
    saveStudentAdminLink(email);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white p-4 md:p-6">
      {/* HEADER */}
      <header className="text-center mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-yellow-400">
          Battle Brain
        </h1>
        <p className="italic text-white/70 text-sm md:text-base">
          Battle your brain, beat the best
        </p>
      </header>

      {/* WELCOME */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 md:p-6 mb-6 text-center">
        <h2 className="text-xl md:text-2xl font-semibold mb-1">
          Welcome, {student.name}
        </h2>
        <p className="text-white/80 text-sm md:text-base">
          Each quiz is a challenge. Stay focused and do your best!
        </p>

        {student.adminEmail && (
          <p className="text-white/70 text-sm mt-2">
            Your Admin:{" "}
            <span className="text-yellow-300">{student.adminEmail}</span>
          </p>
        )}

        <p className="text-white/70 text-sm mt-2">
          Current Stage:{" "}
          <span className="text-yellow-300">Stage {currentStage}</span>
        </p>
      </div>

      {/* STAGE CUTOFF */}
      <div className="mb-6 bg-white/10 p-3 md:p-4 rounded-xl max-w-xl mx-auto">
        <h3 className="text-yellow-400 font-bold mb-2">Stage Cutoff Marks</h3>
        {stageThresholds.map((cutoff, i) => (
          <p key={i} className="text-sm md:text-base text-white/80">
            Stage {i + 1}: <span className="font-semibold">{cutoff}%</span>
          </p>
        ))}
      </div>

      {/* ADMIN EMAIL */}
      <div className="mb-8 max-w-xl mx-auto bg-white/10 p-3 md:p-4 rounded-xl">
        <label
          htmlFor="adminEmail"
          className="text-sm text-white/70 mb-2 block"
        >
          Enter your admin email to load quizzes
        </label>
        <div className="flex flex-wrap gap-2">
          <input
            type="email"
            id="adminEmail"
            value={adminEmailInput}
            onChange={(e) => setAdminEmailInput(e.target.value)}
            placeholder="admin@email.com"
            className="flex-1 min-w-[120px] p-2 rounded bg-black/40 text-white outline-none"
          />
          <button
            onClick={handleSearchAdmin}
            className="px-3 py-2 text-sm bg-yellow-400 text-black font-semibold rounded hover:opacity-90 transition"
          >
            Search
          </button>
        </div>
      </div>

      {/* QUIZ GRID */}
      <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-6">
        {!confirmedAdminEmail ? (
          <p className="text-center text-white/60 col-span-2">
            🔒 Enter your admin email to view quizzes
          </p>
        ) : visibleQuizzes.length === 0 ? (
          <p className="text-center text-white/70 col-span-2">
            No quizzes found for this admin and your class.
          </p>
        ) : (
          visibleQuizzes.map((quiz, idx) => {
            const quizKey = `${quiz.class}-${quiz.subject}-${quiz.id}`;
            const status = student.quizStatus?.[quizKey] || {};

            const stageIndex = Math.max(
              0,
              Math.min(
                2,
                (status.failedStage
                  ? Number(status.failedStage)
                  : currentStage) - 1,
              ),
            );

            const showStartQuote = !status.completed && !status.locked;
            const showFailQuote = status.locked;
            const showWinQuote = status.completed;

            const disabled = status.locked || status.completed;

            return (
              <div
                key={idx}
                className="p-4 md:p-6 bg-gradient-to-br from-yellow-500 to-yellow-300 rounded-2xl shadow-xl text-black flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-lg md:text-xl font-bold mb-1">
                    {quiz.subject} Quiz
                  </h3>
                  <p className="text-sm mb-1">Class: {quiz.class}</p>

                  {showStartQuote && (
                    <p className="text-sm italic mt-2 text-black/80">
                      {getQuoteStable(quizKey, "start", stageIndex)}
                    </p>
                  )}

                  {showFailQuote && (
                    <>
                      <p className="text-red-700 font-semibold mt-2">
                        ❌ Locked (Failed at Stage {status.failedStage})
                      </p>
                      <p className="text-sm italic mt-1">
                        {getQuoteStable(quizKey, "fail", stageIndex)}
                      </p>
                    </>
                  )}

                  {showWinQuote && (
                    <>
                      <p className="text-green-700 font-semibold mt-2">
                        🏆 Completed
                      </p>
                      <p className="text-sm italic mt-1">
                        {getQuoteStable(quizKey, "win", stageIndex)}
                      </p>
                    </>
                  )}
                </div>

                <button
                  disabled={disabled}
                  onClick={() => {
                    // ✅ extra safety: never navigate if locked/completed
                    if (status.locked || status.completed) return;
                    navigate(`/quiz/${quizKey}`, { state: { student, quiz } });
                  }}
                  className={`mt-4 px-4 py-2 rounded font-semibold transition transform-gpu hover:scale-[1.03] ${
                    disabled
                      ? "bg-gray-700 text-white cursor-not-allowed"
                      : "bg-black text-yellow-400"
                  }`}
                >
                  {status.locked
                    ? "Locked"
                    : status.completed
                      ? "Completed"
                      : "Start Quiz"}
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* ACTIONS */}
      <div className="mt-6 md:mt-10 text-center flex flex-col gap-4">
        <button
          onClick={() => navigate("/student-progress", { state: { student } })}
          className="px-6 py-2 bg-yellow-400 text-black rounded font-semibold transition hover:scale-[1.03]"
        >
          View Your Progress
        </button>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 bg-red-500 text-white rounded font-semibold transition hover:scale-[1.03]"
        >
          Exit to Main Menu
        </button>
      </div>
    </div>
  );
}

export default StudentDashboard;
