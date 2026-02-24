import { createBrowserRouter, Navigate } from "react-router-dom";
import PublicLayout from "../components/layout/Publiclayout";
import WelcomePage from "../screens/Pages/WelcomePage";
import RegistrationPage from "../screens/Pages/RegistrationPage";
import AdminRegister from "../screens/Pages/AdminRegister";
import StudentRegister from "../screens/Pages/StudentRegister";
import Layout from "../components/layout/Layout";
import AdminDashboard from "../screens/Pages/AdminDashboard";
import StudentDashboard from "../screens/Pages/StudentDashboard";
import CreateQuiz from "../screens/Pages/CreateQuiz";
import ManageQuiz from "../screens/Pages/ManageQuiz";
import StudentProgress from "../screens/Pages/StudentProgress";
import AdminStudentProgress from "../screens/Pages/AdminStudentProgress";
import QuizPage from "../screens/Pages/QuizPage";

// ✅ NEW: admin route guard
import AdminProtectedRoute from "./AdminProtectedRoute";

const MainRouter = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      // Redirect root "/" to WelcomePage
      {
        path: "/",
        element: <Navigate to="/WelcomePage" />,
      },
      {
        path: "/WelcomePage",
        element: <WelcomePage />,
      },
      {
        path: "/registration",
        element: <RegistrationPage />,
      },
      {
        path: "/admin-register",
        element: <AdminRegister />,
      },
      {
        path: "/register-student",
        element: <StudentRegister />,
      },
      {
        path: "/quiz/:quizKey",
        element: <QuizPage />,
      },
    ],
  },
  {
    element: <Layout />,
    children: [
      // ✅ PROTECT ADMIN ROUTES
      {
        path: "/admin-dashboard",
        element: (
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        ),
      },
      {
        path: "/create-quiz",
        element: (
          <AdminProtectedRoute>
            <CreateQuiz />
          </AdminProtectedRoute>
        ),
      },
      {
        path: "/manage-quiz",
        element: (
          <AdminProtectedRoute>
            <ManageQuiz />
          </AdminProtectedRoute>
        ),
      },
      {
        path: "/adminstudent-progress",
        element: (
          <AdminProtectedRoute>
            <AdminStudentProgress />
          </AdminProtectedRoute>
        ),
      },

      // ✅ STUDENT ROUTES (unchanged)
      {
        path: "/student-dashboard",
        element: <StudentDashboard />,
      },
      {
        path: "/student-progress",
        element: <StudentProgress />,
      },
    ],
  },
]);

export default MainRouter;
