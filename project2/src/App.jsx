import Home from "./Pages/Home";
import Problems from "./Pages/Problems";
import AuthLogin from "./Pages/Login";
import { Route, Routes, Navigate } from "react-router-dom";
import Dashboard from "./Pages/Dashboard";
import ProtectedRoute from "./Components/ProtectedRoute";
import EditorPage from "./Pages/EditorPage";
import ProfilePage from "./Pages/ProfilePage";
import AnalyticsPage from "./Pages/AnalyticsPage";
import DiscussPage from "./Pages/DiscussPage";
import DiscussionDetail from "./Pages/DiscussionDetail";
import LeaderboardPage from "./Pages/LeaderboardPage";
import RoadmapPage from "./Pages/RoadmapPage";
import MentorDashboard from "./Pages/MentorDashboard"; // New Import
import CreateContext from "./Pages/CreateContext";
import EditContext from "./Pages/EditContext";
import ContextPage from "./Pages/ContextPage";
import AddProblem from "./Pages/AddProblem";
import ManageTestCases from "./Pages/ManageTestCases";
import Submissions from "./Pages/Submissions";
import Achievements from "./Pages/Achievements";
import Contests from "./Pages/Contests";
import ContestDetail from "./Pages/ContestDetail";
import ContestArena from "./Pages/ContestArena";
import CreateContest from "./Pages/CreateContest";
import ContestsManagement from "./Pages/ContestsManagement";
import CommandPalette from "./Components/CommandPalette";
import About from "./Pages/About";
import Contact from "./Pages/Contact";
import Settings from "./Pages/Settings";
import ScoreboardPage from "./Pages/ScoreboardPage";
import StudentActivity from "./Pages/StudentActivity";

// Redirect logged-in users away from the landing page to their dashboard
function HomeRoute() {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const username = localStorage.getItem("username");
  const userRole = localStorage.getItem("userRole");

  if (isLoggedIn && username) {
    if (userRole === "teacher") return <Navigate to="/mentor-dashboard" replace />;
    return <Navigate to={`/dashboard/${username}`} replace />;
  }
  return <Home />;
}

function App() {
  return (
    <div className="app-container">
      <CommandPalette />
      <div className="scroll-progress"></div>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/problems" element={<Problems />} />
        <Route path="/login" element={<AuthLogin />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/solve/:id" element={<EditorPage />} />
        <Route path="/dashboard/:username" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/profile/:username" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute allowedRoles={['teacher']}><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/submissions" element={<ProtectedRoute><Submissions /></ProtectedRoute>} />
        <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
        <Route path="/contests" element={<ProtectedRoute><Contests /></ProtectedRoute>} />
        <Route path="/contests-management" element={<ProtectedRoute><ContestsManagement /></ProtectedRoute>} />
        <Route path="/contest/:id" element={<ProtectedRoute><ContestDetail /></ProtectedRoute>} />
        <Route path="/contest/:id/arena" element={<ProtectedRoute><ContestArena /></ProtectedRoute>} />
        <Route path="/create-contest" element={<ProtectedRoute allowedRoles={['teacher']}><CreateContest /></ProtectedRoute>} />
        <Route path="/discuss" element={<DiscussPage />} />
        <Route path="/discuss/:id" element={<DiscussionDetail />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/roadmap" element={<RoadmapPage />} />
        <Route path="/mentor-dashboard" element={<ProtectedRoute allowedRoles={['teacher']}><MentorDashboard /></ProtectedRoute>} />
        <Route path="/create-context" element={<ProtectedRoute allowedRoles={['teacher']}><CreateContext /></ProtectedRoute>} />
        <Route path="/edit-context/:id" element={<ProtectedRoute allowedRoles={['teacher']}><EditContext /></ProtectedRoute>} />
        <Route path="/context/:id" element={<ProtectedRoute><ContextPage /></ProtectedRoute>} />
        <Route path="/add-problem" element={<ProtectedRoute allowedRoles={['teacher']}><AddProblem /></ProtectedRoute>} />
        <Route path="/manage-testcases/:id" element={<ProtectedRoute allowedRoles={['teacher']}><ManageTestCases /></ProtectedRoute>} />
        <Route path="/scoreboard" element={<ProtectedRoute allowedRoles={['teacher']}><ScoreboardPage /></ProtectedRoute>} />
        <Route path="/student-activity" element={<ProtectedRoute allowedRoles={['teacher']}><StudentActivity /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

export default App;
