// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StarterPage from "./StarterPage";
import SignupPage from "./SignupPage";
import LoginPage from "./LoginPage";
import HomePage from "./HomePage";
import MyProjects from "./MyProjects"
import ProjectDetails from "./ProjectDetails"
import TaskDetails from "./TaskDetails"
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StarterPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/my-projects" element={<MyProjects />} />
        <Route path="/projects/:projectId" element={<ProjectDetails />} />
        <Route path="/tasks/:taskId" element={<TaskDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
