import { createBrowserRouter } from "react-router-dom"
import Login from "../pages/Login"
import Dashboard from "../pages/Dashboard"
import Book from "../pages/Book"
import Blog from "../pages/Blog"
import AdminLayout from "../layout/AdminLayout"
import PrivateRoute from "./auth/PrivateRoute"
import StudentsList from "../pages/Student/StudentsList"
import Exams from "../pages/Exams/Exams"
import ExamCreate from "../pages/Exams/ExamCreate"
import ExamView from "../pages/Exams/ExamView"
import ExamQuestionsUpload from "../pages/Exams/ExamQuestionsUpload"

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
      { path: "/admin/students", element: <StudentsList /> },
      { path: "/admin/exams", element: <Exams /> },
      { path: "/admin/exams/create", element: <ExamCreate /> },
      { path: "/admin/exams/:id", element: <ExamView /> },
      { path: "/admin/exams/:id/questions", element: <ExamQuestionsUpload /> },
      { path: "/admin/book", element: <Book /> },
      { path: "/admin/blog", element: <Blog /> },
    ]
  }
])
