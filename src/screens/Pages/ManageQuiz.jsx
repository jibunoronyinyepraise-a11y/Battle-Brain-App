import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ManageQuiz() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem("adminData"));
    let storedQuizzes = JSON.parse(localStorage.getItem("quizzes") || "[]");

    if (!Array.isArray(storedQuizzes)) storedQuizzes = [];

    const myQuizzes = admin
      ? storedQuizzes.filter((q) => q.adminEmail === admin.email)
      : [];

    setQuizzes(myQuizzes);
  }, []);

  const handleDelete = (id) => {
    if (!window.confirm("Delete this quiz?")) return;

    const stored = JSON.parse(localStorage.getItem("quizzes") || "[]");
    const updated = stored.filter((q) => q.id !== id);

    localStorage.setItem("quizzes", JSON.stringify(updated));
    setQuizzes(updated);
    setSelectedQuiz(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-yellow-400">Manage Quizzes</h1>
        <button
          onClick={() => navigate("/create-quiz")}
          className="px-4 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-300 transition"
        >
          Create Quiz
        </button>
      </header>

      <p className="text-white/70 mb-4">
        Total Quizzes: <strong>{quizzes.length}</strong>
      </p>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Quiz List */}
        <div className="w-full md:w-1/3 bg-white/10 p-4 rounded-xl max-h-[70vh] overflow-auto">
          {quizzes.length === 0 ? (
            <p className="text-white/70">No quizzes created yet</p>
          ) : (
            quizzes.map((quiz) => (
              <div
                key={quiz.id}
                onClick={() => setSelectedQuiz(quiz)}
                className={`flex justify-between items-center mb-3 p-3 rounded cursor-pointer transition
                  ${
                    selectedQuiz?.id === quiz.id
                      ? "bg-yellow-400/30"
                      : "bg-white/20 hover:bg-white/30"
                  }
                `}
              >
                <span className="truncate text-white">
                  {quiz.class} — {quiz.subject}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(quiz.id);
                  }}
                  className="text-sm bg-red-500 px-2 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>

        {/* Preview */}
        <div className="w-full md:w-2/3 bg-white/10 p-4 rounded-xl max-h-[70vh] overflow-auto">
          {!selectedQuiz ? (
            <p className="text-white/70">
              Select a quiz to preview its questions
            </p>
          ) : (
            selectedQuiz.stages.map((stage) => (
              <div key={stage.stage} className="mb-6">
                <h3 className="text-yellow-400 font-bold mb-2">
                  Stage {stage.stage}
                </h3>

                {stage.questions.map((q, index) => (
                  <div key={index} className="bg-white/20 p-3 rounded mb-3">
                    <p className="font-semibold text-white mb-1">
                      {index + 1}. {q.question}
                    </p>

                    <ul className="ml-4 space-y-1">
                      {q.options.map((opt, idx) => (
                        <li
                          key={idx}
                          className={
                            opt === q.answer
                              ? "text-yellow-400 font-bold"
                              : "text-white/70"
                          }
                        >
                          {opt}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ManageQuiz;
