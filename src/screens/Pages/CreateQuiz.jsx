import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import questionsData from "../Pages/questions.json";

function CreateQuiz() {
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem("adminData"));

  const [selectedClass, setSelectedClass] = useState("JSS1");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [previewQuestions, setPreviewQuestions] = useState([]);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);

  // Update subjects when class changes
  useEffect(() => {
    if (selectedClass.startsWith("JSS")) {
      setSubjectOptions(["Maths", "English", "General Knowledge"]);
    } else {
      setSubjectOptions([
        "Maths",
        "English",
        "Chemistry",
        "Physics",
        "Literature",
        "Government",
        "Financial Account",
        "Commerce",
        "General Knowledge",
      ]);
    }
    setSelectedSubject("");
  }, [selectedClass]);

  const handleGenerateQuiz = () => {
    if (!selectedClass || !selectedSubject) {
      alert("Please select both class and subject.");
      return;
    }

    setLoading(true);

    let subjectQuestions = [];

    if (
      selectedSubject === "General Knowledge" &&
      ["JSS1", "JSS2", "JSS3"].includes(selectedClass)
    ) {
      subjectQuestions = questionsData["GeneralKnowledge"] || [];
    } else {
      subjectQuestions = questionsData[selectedClass]?.[selectedSubject] || [];
    }

    if (subjectQuestions.length < 30) {
      alert("This subject must have at least 30 questions.");
      setLoading(false);
      return;
    }

    const shuffled = [...subjectQuestions].sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, 30);

    const quiz = {
      id: Date.now(),
      adminEmail: admin?.email,
      class: selectedClass,
      subject: selectedSubject,
      totalQuestions: 30,
      stages: [
        { stage: 1, questions: selectedQuestions.slice(0, 10) },
        { stage: 2, questions: selectedQuestions.slice(10, 20) },
        { stage: 3, questions: selectedQuestions.slice(20, 30) },
      ],
    };

    setGeneratedQuiz(quiz);
    setPreviewQuestions(selectedQuestions);
    setLoading(false);
  };

  const handleSaveQuiz = () => {
    if (!generatedQuiz) return alert("Generate a quiz first!");

    let quizzes = JSON.parse(localStorage.getItem("quizzes") || "[]");
    if (!Array.isArray(quizzes)) quizzes = [];

    quizzes.push(generatedQuiz);
    localStorage.setItem("quizzes", JSON.stringify(quizzes));

    alert("Quiz saved successfully!");
    navigate("/manage-quiz");
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 flex flex-col">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-yellow-400">Battle Brain</h1>
        <button
          onClick={() => navigate("/admin-dashboard")}
          className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition text-white"
        >
          Back
        </button>
      </header>

      <h2 className="text-4xl font-bold text-white mb-6 text-center">
        Create Quiz
      </h2>

      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl w-full max-w-md mx-auto mb-6">
        <div className="relative mb-4">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="appearance-none w-full p-3 rounded-lg bg-white/20 text-yellow-400 outline-none pr-10"
          >
            <option>JSS1</option>
            <option>JSS2</option>
            <option>JSS3</option>
            <option>SS1</option>
            <option>SS2</option>
            <option>SS3</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-yellow-400">
            ▼
          </div>
        </div>

        <div className="relative mb-4">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="appearance-none w-full p-3 rounded-lg bg-white/20 text-yellow-400 outline-none pr-10"
          >
            <option value="">Select Subject</option>
            {subjectOptions.map((sub) => (
              <option key={sub}>{sub}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-yellow-400">
            ▼
          </div>
        </div>

        <button
          onClick={handleGenerateQuiz}
          disabled={loading}
          className="w-full p-3 bg-gradient-to-r from-yellow-500 to-yellow-300 text-black font-semibold rounded-lg"
        >
          {loading ? "Generating..." : "Generate Quiz"}
        </button>

        {generatedQuiz && (
          <button
            onClick={handleSaveQuiz}
            className="w-full mt-4 p-3 bg-green-400 text-black font-semibold rounded-lg"
          >
            Save Quiz
          </button>
        )}
      </div>

      {previewQuestions.length > 0 && (
        <div className="bg-white/10 border border-white/20 p-6 rounded-2xl max-w-3xl mx-auto max-h-[60vh] overflow-auto">
          <h3 className="text-white font-bold mb-4">Preview Questions</h3>
          <ul className="list-decimal list-inside text-white/80 space-y-2">
            {previewQuestions.map((q, i) => (
              <li key={i}>{q.question}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CreateQuiz;
