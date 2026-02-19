import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const stageThresholds = [40, 60, 80];
const STAGE_TIME = 600; // seconds for demo

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

  if (!student || !quiz) return null;

  const quizKey = `${quiz.class}-${quiz.subject}-${quiz.id}`;
  const stage = quiz.stages[stageIndex];
  const question = stage.questions[questionIndex];

  /* ⏱ TIMER */
  useEffect(() => {
    if (submitting || nextRoute) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          handleSubmitStage();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [stageIndex, submitting, nextRoute]);

  const handleAnswerSelect = (opt) => {
    const copy = [...answers];
    copy[questionIndex] = opt;
    setAnswers(copy);
  };

  /* ✅ FIXED SUBMISSION LOGIC */
  const handleSubmitStage = () => {
    if (submitting) return;
    setSubmitting(true);

    const correct = stage.questions.filter(
      (q, i) => answers[i] === q.answer,
    ).length;

    const score = (correct / stage.questions.length) * 100;
    const passed = score >= stageThresholds[stageIndex];

    const students = JSON.parse(localStorage.getItem("students") || "[]");
    const idx = students.findIndex(
      (s) => s.name === student.name && s.class === student.class,
    );

    const currentStudent = { ...students[idx] };

    /* ✅ ENSURE SAFE STRUCTURE */
    currentStudent.quizStatus = currentStudent.quizStatus || {};
    currentStudent.progress = currentStudent.progress || {};

    currentStudent.progress[quizKey] = currentStudent.progress[quizKey] || [];

    /* ✅ SAVE STAGE RESULT PER QUIZ */
    currentStudent.progress[quizKey][stageIndex] = {
      score,
      passed,
    };

    /* ❌ FAILED → LOCK ONLY THIS QUIZ */
    if (!passed) {
      currentStudent.quizStatus[quizKey] = {
        locked: true,
        failedStage: stageIndex + 1,
        completed: false,
      };

      students[idx] = currentStudent;
      localStorage.setItem("students", JSON.stringify(students));

      setUpdatedStudent(currentStudent);
      setNextRoute("/student-dashboard");
      return;
    }

    /* ▶ NEXT STAGE */
    if (stageIndex < quiz.stages.length - 1) {
      setStageIndex((i) => i + 1);
      setQuestionIndex(0);
      setAnswers([]);
      setTimeLeft(STAGE_TIME);
      setSubmitting(false);
      return;
    }

    /* 🏆 PASSED ALL STAGES */
    currentStudent.quizStatus[quizKey] = {
      completed: true,
      locked: false,
    };

    students[idx] = currentStudent;
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

  /* 🎨 UI (UNCHANGED) */
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-yellow-400 mb-2">
        {quiz.subject} Quiz
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

        {questionIndex < stage.questions.length - 1 ? (
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
            disabled={answers.length < stage.questions.length}
            className={`px-6 py-2 rounded font-semibold ${
              answers.length < stage.questions.length
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
