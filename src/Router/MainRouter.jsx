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
        path: "/register-admin",
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
      {
        path: "/admin-dashboard",
        element: <AdminDashboard />,
      },
      {
        path: "/student-dashboard",
        element: <StudentDashboard />,
      },
      {
        path: "/create-quiz",
        element: <CreateQuiz />,
      },
      {
        path: "/manage-quiz",
        element: <ManageQuiz />,
      },
      {
        path: "/student-progress",
        element: <StudentProgress />,
      },
      {
        path: "/adminstudent-progress",
        element: <AdminStudentProgress />,
      },
    ],
  },
]);

export default MainRouter;
