import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [students, setStudents] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [progressRecords, setProgressRecords] = useState([]);

  const safeParse = (key, fallback) => {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  };

  useEffect(() => {
    const loggedIn = localStorage.getItem("adminLoggedIn");
    if (!loggedIn) {
      navigate("/register-admin"); // ✅ fix route path
      return;
    }

    const adminData = safeParse("adminData", {});
    if (!adminData?.verified) {
      alert("Access denied. Admin verification required.");
      navigate("/register-admin"); // ✅ fix route path
      return;
    }

    setAdmin(adminData);

    // Load students linked to this admin
    const allStudents = safeParse("students", []);
    const myStudents = allStudents.filter(
      (s) => s.adminEmail === adminData.email,
    );
    setStudents(myStudents);

    // Load quizzes created by this admin
    const allQuizzes = safeParse("quizzes", []);
    const myQuizzes = allQuizzes.filter(
      (q) => q.adminEmail === adminData.email,
    );
    setQuizzes(myQuizzes);

    // ✅ Load progress records linked to this admin
    // Expected structure: [{ adminEmail, studentKey, studentName, quizKey, score, total, percentage, createdAt }]
    const allProgress = safeParse("studentProgress", []);
    const myProgress = allProgress.filter(
      (p) => p.adminEmail === adminData.email,
    );
    setProgressRecords(myProgress);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    navigate("/");
  };

  const handleRemoveStudent = (index) => {
    if (!window.confirm("Remove this student from your list?")) return;

    const studentToRemove = students[index];
    const allStudents = safeParse("students", []);

    const updatedAllStudents = allStudents.filter(
      (s) =>
        !(
          s.name === studentToRemove.name &&
          s.school === studentToRemove.school &&
          s.class === studentToRemove.class &&
          s.adminEmail === admin.email
        ),
    );

    localStorage.setItem("students", JSON.stringify(updatedAllStudents));
    setStudents(updatedAllStudents.filter((s) => s.adminEmail === admin.email));
  };

  // ✅ Helper: create a stable key for each student (prefer email/phone/id if you have it)
  const makeStudentKey = (s) =>
    `${(s.name || "").trim().toLowerCase()}|${(s.school || "")
      .trim()
      .toLowerCase()}|${(s.class || "").trim().toLowerCase()}|${(
      s.adminEmail || ""
    )
      .trim()
      .toLowerCase()}`;

  // ✅ Build summary per student from progressRecords
  const progressByStudentKey = useMemo(() => {
    const map = new Map();
    for (const rec of progressRecords) {
      const key = rec.studentKey;
      if (!key) continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(rec);
    }
    return map;
  }, [progressRecords]);

  const getStudentSummary = (student) => {
    const key = makeStudentKey(student);
    const list = progressByStudentKey.get(key) || [];

    const attempts = list.length;
    const best = list.reduce(
      (max, r) => Math.max(max, Number(r.percentage || 0)),
      0,
    );
    const last = list
      .slice()
      .sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      )[0];

    return {
      key,
      attempts,
      best,
      lastPlayed: last?.createdAt
        ? new Date(last.createdAt).toLocaleString()
        : null,
    };
  };

  const handleViewStudent = (student) => {
    // Save selected student so your /adminstudent-progress page can read it
    const summary = getStudentSummary(student);
    localStorage.setItem(
      "selectedAdminStudent",
      JSON.stringify({
        ...student,
        studentKey: summary.key,
      }),
    );

    navigate("/adminstudent-progress");
  };

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-yellow-400">
          Battle Brain · Admin Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition"
        >
          Logout
        </button>
      </header>

      {/* Admin Note */}
      <p className="text-green-300 mb-6 text-sm">
        🔒 This dashboard is private. Only verified admins can create quizzes
        and view students linked to them.
      </p>

      <h2 className="text-xl mb-6">Welcome, {admin.name}</h2>

      {/* Action Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div
          onClick={() => navigate("/create-quiz")}
          className="p-6 bg-gradient-to-br from-yellow-500 to-yellow-300 text-black rounded-2xl cursor-pointer hover:scale-105 transition shadow-xl"
        >
          <h3 className="text-xl font-bold mb-2">Create Quiz</h3>
          <p>Create competitive quizzes by class and subject</p>
        </div>

        <div
          onClick={() => navigate("/manage-quiz")}
          className="p-6 bg-gray-700 rounded-2xl cursor-pointer hover:scale-105 transition shadow-xl"
        >
          <h3 className="text-xl font-bold mb-2">Manage Quizzes</h3>
          <p>Edit or review your quizzes</p>
          <p className="mt-2 text-sm text-white/70">
            Total Quizzes: {quizzes.length}
          </p>
        </div>

        <div
          onClick={() => navigate("/adminstudent-progress")}
          className="p-6 bg-gray-700 rounded-2xl cursor-pointer hover:scale-105 transition shadow-xl"
        >
          <h3 className="text-xl font-bold mb-2">Student Progress</h3>
          <p>View scores, stages, and performance</p>
        </div>
      </div>

      {/* Students Table */}
      <div>
        <h3 className="text-2xl font-semibold mb-4">Your Students</h3>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-yellow-400">Name</th>
                <th className="px-4 py-3 text-left text-yellow-400">School</th>
                <th className="px-4 py-3 text-left text-yellow-400">Class</th>
                <th className="px-4 py-3 text-left text-yellow-400">Status</th>
                <th className="px-4 py-3 text-left text-yellow-400">Action</th>
              </tr>
            </thead>

            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-white/60"
                  >
                    No students linked to you yet
                  </td>
                </tr>
              ) : (
                students.map((s, idx) => {
                  const summary = getStudentSummary(s);

                  return (
                    <tr
                      key={idx}
                      className="border-b border-gray-700 hover:bg-gray-700 transition"
                    >
                      <td className="px-4 py-2">{s.name}</td>
                      <td className="px-4 py-2">{s.school}</td>
                      <td className="px-4 py-2">{s.class}</td>

                      {/* ✅ Status shows progress summary (still same table styling) */}
                      <td className="px-4 py-2">
                        {summary.attempts > 0 ? (
                          <span className="text-green-300">
                            Attempts: {summary.attempts} · Best: {summary.best}%
                            {summary.lastPlayed ? (
                              <span className="text-white/60">
                                {" "}
                                · Last: {summary.lastPlayed}
                              </span>
                            ) : null}
                          </span>
                        ) : (
                          s.status || "Not started"
                        )}
                      </td>

                      <td className="px-4 py-2 flex gap-2">
                        <button
                          onClick={() => handleViewStudent(s)}
                          className="px-3 py-1 bg-yellow-500 hover:bg-yellow-400 rounded text-black transition"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleRemoveStudent(idx)}
                          className="px-3 py-1 bg-red-500 hover:bg-red-400 rounded text-white transition"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
