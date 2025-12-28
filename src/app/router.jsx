import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Exam from "../pages/exam/Exam";
import Book from "../pages/Book";
import Blog from "../pages/Blog";
import AdminLayout from "../layout/AdminLayout";
import PrivateRoute from "./auth/PrivateRoute";
import StudentsList from "../pages/Student/StudentsList";
import CreateExam from "../pages/exam/CreateExam";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <PrivateRoute>
        <AdminLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "students", element: <StudentsList /> },
      { path: "exam", element: <Exam /> },
      { path: "createExam", element: <CreateExam /> },
      { path: "book", element: <Book /> },
      { path: "blog", element: <Blog /> },
    ],
  },
]);
