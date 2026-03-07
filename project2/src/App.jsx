import Home from "./Pages/Home";
import Problems from "./Pages/Problems";
import AuthLogin from "./Pages/Login";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./Pages/Dashboard";
import ProtectedRoute from "./Components/ProtectedRoute";
import EditorPage from "./Pages/EditorPage";
import ProfilePage from "./Pages/ProfilePage";
import AnalyticsPage from "./Pages/AnalyticsPage";
import DiscussPage from "./Pages/DiscussPage";
import LeaderboardPage from "./Pages/LeaderboardPage";
import ContestsPage from "./Pages/ContestsPage";
import RoadmapPage from "./Pages/RoadmapPage";
import MentorDashboard from "./Pages/MentorDashboard"; // New Import
import CreateContext from "./Pages/CreateContext";
import EditContext from "./Pages/EditContext";
import ContextPage from "./Pages/ContextPage";
import CommandPalette from "./Components/CommandPalette";
import About from "./Pages/About";
import Contact from "./Pages/Contact";
import Settings from "./Pages/Settings";

function App() {
  return (
    <div className="app-container">
      <CommandPalette />
      <div className="scroll-progress"></div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/problems" element={<Problems />} />
        <Route path="/login" element={<AuthLogin />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/solve/:id" element={<EditorPage />} />
        <Route path="/dashboard/:username" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/profile/:username" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/discuss" element={<DiscussPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/contests" element={<ContestsPage />} />
        <Route path="/roadmap" element={<RoadmapPage />} />
        <Route path="/mentor-dashboard" element={<ProtectedRoute allowedRoles={['teacher']}><MentorDashboard /></ProtectedRoute>} />
        <Route path="/create-context" element={<ProtectedRoute allowedRoles={['teacher']}><CreateContext /></ProtectedRoute>} />
        <Route path="/edit-context/:id" element={<ProtectedRoute allowedRoles={['teacher']}><EditContext /></ProtectedRoute>} />
        <Route path="/context/:id" element={<ProtectedRoute><ContextPage /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

export default App;
