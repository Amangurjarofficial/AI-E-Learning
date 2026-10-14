import { Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import AITutor from "./pages/AITutor";
import Quizzes from "./pages/Quizzes";

import StudentDashboard from "./pages/StudentDashboard";
import InstructorDashboard from "./pages/InstructorDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import MyCourses from "./pages/MyCourses";
import MyProgress from "./pages/MyProgress";
import ManageLessons from "./pages/ManageLessons";
import CreateCourse from "./pages/CreateCourse";
import EditCourse from "./pages/EditCourse";
import NotFound from "./pages/NotFound";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/courses" element={<Courses />} />

      {/* Individual course details */}
      <Route path="/courses/:id" element={<CourseDetails />} />

      {/* Student-only pages */}
      <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/ai-tutor" element={<AITutor />} />
        <Route path="/quizzes" element={<Quizzes />} />
        <Route path="/student/my-progress" element={<MyProgress />} />
      </Route>

      {/* Instructor-only pages */}
      <Route element={<ProtectedRoute allowedRoles={["instructor"]} />}>
        <Route path="/instructor" element={<InstructorDashboard />} />

        <Route path="/instructor/my-courses" element={<MyCourses />} />

        <Route
          path="/instructor/courses/create"
          element={<CreateCourse />}
        />

        <Route
          path="/instructor/courses/edit/:id"
          element={<EditCourse />}
        />

        <Route
          path="/instructor/courses/:id/lessons"
          element={<ManageLessons />}
        />
      </Route>

      {/* Admin-only page */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      {/* Page not found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;