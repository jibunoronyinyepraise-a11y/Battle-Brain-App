import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const stageThresholds = [40, 60, 80];
const STAGE_TIME = 6; // seconds for demo

function QuizPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { student, quiz } = state || {};

  const [stageIndex, setStageIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(STAGE_TIME);
  const [submitting, setSubmitting] = useState(false);

  const [nextRoute, setNextRoute] = useState(null);
  const [updatedStudent, setUpdatedStudent] = useState(null);

  const safeParse = (key, fallback) => {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  };

  // ✅ basic guards
  const safeQuiz = quiz && Array.isArray(quiz.stages) ? quiz : null;
  const safeStudent = student || null;

  const quizKey = useMemo(() => {
    if (!safeQuiz) return "";
    return `${safeQuiz.class}-${safeQuiz.subject}-${safeQuiz.id}`;
  }, [safeQuiz]);

  const stage = useMemo(() => {
    if (!safeQuiz) return null;
    return safeQuiz.stages?.[stageIndex] || null;
  }, [safeQuiz, stageIndex]);

  const questions =
    stage?.questions && Array.isArray(stage.questions) ? stage.questions : [];
  const question = questions[questionIndex];

  // If missing required data, bounce back safely
  useEffect(() => {
    if (!safeStudent || !safeQuiz) {
      navigate("/student-dashboard");
    }
  }, [safeStudent, safeQuiz, navigate]);

  /* ⏱ TIMER */
  useEffect(() => {
    if (!stage || submitting || nextRoute) return;
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [stage, submitting, nextRoute, timeLeft]);

  // ✅ When timer reaches 0, submit once
  useEffect(() => {
    if (!stage || submitting || nextRoute) return;
    if (timeLeft === 0) {
      handleSubmitStage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, stage, submitting, nextRoute]);

  const handleAnswerSelect = (opt) => {
    const copy = [...answers];
    copy[questionIndex] = opt;
    setAnswers(copy);
  };

  /* ✅ SUBMISSION LOGIC (FAIL = PERMANENT LOCK) */
  const handleSubmitStage = () => {
    if (submitting) return;
    if (!stage || !questions.length) return;

    setSubmitting(true);

    const students = safeParse("students", []);

    // find student (name + class + school if available)
    const idx = students.findIndex(
      (s) =>
        (s.name || "") === (safeStudent?.name || "") &&
        (s.class || "") === (safeStudent?.class || "") &&
        ((s.school || "") === (safeStudent?.school || "") ||
          !safeStudent?.school),
    );

    const safeIdx = idx >= 0 ? idx : students.length - 1;
    if (safeIdx < 0) {
      navigate("/register-student");
      return;
    }

    const currentStudent = { ...students[safeIdx] };
    currentStudent.quizStatus = currentStudent.quizStatus || {};

    // ✅ If quiz already locked or completed, block retake permanently
    const existingStatus = currentStudent.quizStatus[quizKey];
    if (existingStatus?.locked || existingStatus?.completed) {
      setUpdatedStudent(currentStudent);
      setNextRoute("/student-dashboard");
      return;
    }

    const correct = questions.filter((q, i) => answers[i] === q.answer).length;
    const score = (correct / questions.length) * 100;
    const passed = score >= stageThresholds[stageIndex];

    // ✅ ensure progress is STAGE ARRAY (matches StudentProgress/AdminStudentProgress)
    currentStudent.progress = Array.isArray(currentStudent.progress)
      ? currentStudent.progress
      : [];

    currentStudent.progress[stageIndex] = { score, passed };

    // ❌ FAILED → LOCK THIS QUIZ FOREVER
    if (!passed) {
      currentStudent.quizStatus[quizKey] = {
        locked: true,
        failedStage: stageIndex + 1,
        completed: false,
      };

      students[safeIdx] = currentStudent;
      localStorage.setItem("students", JSON.stringify(students));

      setUpdatedStudent(currentStudent);
      setNextRoute("/student-dashboard");
      return;
    }

    // ▶ NEXT STAGE (do NOT unlock anything—just keep status neutral)
    if (stageIndex < safeQuiz.stages.length - 1) {
      currentStudent.quizStatus[quizKey] = {
        locked: false,
        failedStage: null,
        completed: false,
      };

      students[safeIdx] = currentStudent;
      localStorage.setItem("students", JSON.stringify(students));

      setStageIndex((i) => i + 1);
      setQuestionIndex(0);
      setAnswers([]);
      setTimeLeft(STAGE_TIME);
      setSubmitting(false);
      return;
    }

    // 🏆 PASSED ALL STAGES → COMPLETED FOREVER
    currentStudent.quizStatus[quizKey] = {
      completed: true,
      locked: false,
      failedStage: null,
    };

    students[safeIdx] = currentStudent;
    localStorage.setItem("students", JSON.stringify(students));

    setUpdatedStudent(currentStudent);
    setNextRoute("/student-progress");
  };

  /* 🔁 SAFE NAVIGATION */
  useEffect(() => {
    if (!nextRoute || !updatedStudent) return;

    const t = setTimeout(() => {
      navigate(nextRoute, { state: { student: updatedStudent } });
    }, 800);

    return () => clearTimeout(t);
  }, [nextRoute, updatedStudent, navigate]);

  // If no question (bad data), show nothing
  if (!safeStudent || !safeQuiz || !stage || !question) return null;

  /* 🎨 UI (UNCHANGED) */
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-yellow-400 mb-2">
        {safeQuiz.subject} Quiz
      </h1>

      <p className="mb-2 text-white/70">Stage {stageIndex + 1}</p>

      <p className="mb-4 text-white/70">
        Time Left: {Math.floor(timeLeft / 60)}:
        {(timeLeft % 60).toString().padStart(2, "0")}
      </p>

      <div className="w-full max-w-2xl bg-white/10 p-6 rounded-2xl mb-6">
        <p className="mb-4 font-semibold">
          {questionIndex + 1}. {question.question}
        </p>

        {question.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswerSelect(opt)}
            className={`w-full mb-2 px-4 py-2 rounded font-semibold transition ${
              answers[questionIndex] === opt
                ? "bg-yellow-400 text-black"
                : "bg-white/20 hover:bg-white/30"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setQuestionIndex((i) => i - 1)}
          disabled={questionIndex === 0}
          className="px-6 py-2 bg-gray-700 rounded disabled:opacity-50"
        >
          Previous
        </button>

        {questionIndex < questions.length - 1 ? (
          <button
            onClick={() => setQuestionIndex((i) => i + 1)}
            disabled={!answers[questionIndex]}
            className={`px-6 py-2 rounded font-semibold ${
              !answers[questionIndex]
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-yellow-400 text-black"
            }`}
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmitStage}
            disabled={answers.filter(Boolean).length < questions.length}
            className={`px-6 py-2 rounded font-semibold ${
              answers.filter(Boolean).length < questions.length
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-green-400 text-black"
            }`}
          >
            Submit Stage
          </button>
        )}
      </div>
    </div>
  );
}

export default QuizPage;
