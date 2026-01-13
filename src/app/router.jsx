import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Blog from "../pages/Blog";
import AdminLayout from "../layout/AdminLayout";
import PrivateRoute from "./auth/PrivateRoute";
import StudentsList from "../pages/Student/StudentsList";
import Exams from "../pages/Exams/Exams";
import ExamCreate from "../pages/Exams/ExamCreate";
import ExamView from "../pages/Exams/ExamView";
import AddQuestion from "../pages/Exams/AddQuestion";
import ExamQuestions from "../pages/Exams/ExamQuestions";
import EntryRequests from "../pages/EntryRequest/EntryRequests";
import EnrollmentByReference from "../pages/Exams/EnrollmentByReference";
import ExamLeaderboard from "../pages/Exams/ExamLeaderboard";
import BookList from "../pages/Book/BookList";
import AdminBookDetails from "../pages/Book/AdminBookDetails";
import AdminEditBook from "../pages/Book/AdminEditBook";

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
      { path: "/admin/exams/:id/questions", element: <ExamQuestions /> },
      { path: "/admin/exams/:id/enrollments", element: <EnrollmentByReference /> },
      { path: "/admin/exams/:examId/leaderboard", element: <ExamLeaderboard /> },
      { path: "/admin/entry-requests", element: <EntryRequests /> },
      {
        path: "/admin/exams/:id/questions/add",
        element: <AddQuestion/>,
      },
      { path: "/admin/books", element: <BookList /> },
      { path: "/admin/books/:book_id", element: <AdminBookDetails /> },
      { path: "/admin/books/:book_id/edit", element: <AdminEditBook /> },

    ],
  },
]);
