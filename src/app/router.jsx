import { createBrowserRouter } from "react-router-dom"
import Login from "../pages/Login"
import Dashboard from "../pages/Dashboard"
import Student from "../pages/Student"
import Exam from "../pages/Exam"
import Book from "../pages/Book"
import Blog from "../pages/Blog"
import AdminLayout from "../layout/AdminLayout"
import PrivateRoute from "./auth/PrivateRoute"

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />
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
      { path: "student", element: <Student /> },
      { path: "exam", element: <Exam /> },
      { path: "book", element: <Book /> },
      { path: "blog", element: <Blog /> },
    ]
  }
])
