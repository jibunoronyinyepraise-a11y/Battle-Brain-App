import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const stageThresholds = [40, 60, 80];

/* 🔹 PRE-QUIZ MOTIVATION */
const startQuotes = [
  "🌟 Believe in yourself. Stay calm, focus, and do your best.",
  "🧠 No fear, no pressure. Think positive and avoid distractions.",
  "🔥 You are prepared. Trust your mind and start strong.",
  "💫 This is your moment. Stay confident and give it your all.",
];

/* 🔹 WIN QUOTES */
const winQuotes = [
  "🔥 Victory loves preparation. Keep pushing!",
  "🏆 Well done! This is not the end — aim higher.",
  "💪 Champions keep moving forward. Stay hungry!",
];

/* 🔹 FAIL QUOTES */
const failQuotes = [
  "💡 Failure is not the end — it’s a lesson.",
  "⚔️ Every loss makes you stronger. Rise again!",
  "🚀 Don’t give up. You’re closer than you think.",
];

function getRandomQuote(type) {
  const list =
    type === "win" ? winQuotes : type === "fail" ? failQuotes : startQuotes;

  return list[Math.floor(Math.random() * list.length)];
}

function StudentDashboard() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [adminEmailInput, setAdminEmailInput] = useState("");
  const [confirmedAdminEmail, setConfirmedAdminEmail] = useState("");

  useEffect(() => {
    const students = JSON.parse(localStorage.getItem("students") || "[]");
    if (!students.length) {
      navigate("/register-student");
      return;
    }
    setStudent(students[students.length - 1]);

    const allQuizzes = JSON.parse(localStorage.getItem("quizzes") || "[]");
    setQuizzes(Array.isArray(allQuizzes) ? allQuizzes : []);
  }, [navigate]);

  if (!student) return null;

  const visibleQuizzes = confirmedAdminEmail
    ? quizzes.filter(
        (q) =>
          q.class === student.class &&
          q.adminEmail?.toLowerCase() === confirmedAdminEmail.toLowerCase(),
      )
    : [];

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
            onClick={() => {
              if (!adminEmailInput.trim())
                return alert("Please enter admin email");
              setConfirmedAdminEmail(adminEmailInput.trim());
            }}
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

                  {/* PRE-QUIZ MOTIVATION */}
                  {!status.completed && !status.locked && (
                    <p className="text-sm italic mt-2 text-black/80">
                      {getRandomQuote("start")}
                    </p>
                  )}

                  {/* FAILED */}
                  {status.locked && (
                    <>
                      <p className="text-red-700 font-semibold mt-2">
                        ❌ Locked (Failed at Stage {status.failedStage})
                      </p>
                      <p className="text-sm italic mt-1">
                        {getRandomQuote("fail")}
                      </p>
                    </>
                  )}

                  {/* COMPLETED */}
                  {status.completed && (
                    <>
                      <p className="text-green-700 font-semibold mt-2">
                        🏆 Completed
                      </p>
                      <p className="text-sm italic mt-1">
                        {getRandomQuote("win")}
                      </p>
                    </>
                  )}
                </div>

                <button
                  disabled={status.locked || status.completed}
                  onClick={() =>
                    navigate(`/quiz/${quizKey}`, {
                      state: { student, quiz },
                    })
                  }
                  className={`mt-4 px-4 py-2 rounded font-semibold transition transform-gpu hover:scale-[1.03] ${
                    status.locked || status.completed
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
