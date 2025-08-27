import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Folder, PlusCircle, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MyProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showConfirmDeleteAll, setShowConfirmDeleteAll] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const res = await fetch("http://localhost:4000/auth/projects", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) setProjects(data.projects);
      else setMessage(data.message);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDeleteProject = async (projectId) => {
    try {
      const res = await fetch(`http://localhost:4000/auth/projects/${projectId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setProjects(projects.filter((p) => p._id !== projectId));
        setMessage("Project deleted!");
      } else setMessage(data.message);
    } catch (err) {
      console.error(err);
      setMessage("Error deleting project");
    }
  };

  const handleDeleteAllProjects = async () => {
    try {
      const res = await fetch("http://localhost:4000/auth/projects", {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setProjects([]);
        setMessage("All projects deleted!");
      } else setMessage(data.message);
    } catch (err) {
      console.error(err);
      setMessage("Error deleting all projects");
    } finally {
      setShowConfirmDeleteAll(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!title) {
      setMessage("Project title is required");
      return;
    }
    try {
      const res = await fetch("http://localhost:4000/auth/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setProjects([...projects, data.project]);
        setTitle("");
        setDescription("");
        setShowForm(false);
        setMessage("Project created successfully!");
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong");
    }
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6 overflow-y-auto">
      <h1 className="text-4xl font-extrabold text-white mb-6 text-center drop-shadow-lg">
        My Projects
      </h1>

<div className="flex justify-center gap-8 mb-6">
  <button
    onClick={() => setShowForm(true)}
    className="flex items-center px-6 py-3 bg-green-600 rounded-xl hover:bg-green-700 transition shadow-lg"
  >
    <PlusCircle className="mr-2" size={20} />
    Create Project
  </button>

  <button
    onClick={() => navigate("/home")}
    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-white shadow-lg"
  >
    Return to Home Page
  </button>
</div>


      <AnimatePresence>
        {showForm && (
          <motion.form
            onSubmit={handleCreateProject}
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col space-y-4 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 p-8 rounded-2xl shadow-2xl w-96 mx-auto mb-6"
          >
            <input
              type="text"
              placeholder="Project Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="px-4 py-3 rounded-lg border border-gray-600 bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <textarea
              placeholder="Project Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="px-4 py-3 rounded-lg border border-gray-600 bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <button
              type="submit"
              className="px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:from-green-600 hover:to-green-700 transition text-white font-semibold shadow-md"
            >
              Save Project
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {message && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-center text-pink-400 font-medium"
        >
          {message}
        </motion.p>
      )}

      {loading && <p className="text-white text-center mt-4">Loading projects...</p>}

      {!loading && projects.length === 0 && !showForm && (
        <p className="text-center text-gray-300 mt-4">No projects were added yet.</p>
      )}

      <div className="flex flex-wrap gap-6 justify-center">
        <AnimatePresence>
          {projects.map((project) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="bg-gray-800 p-6 rounded-2xl shadow-xl w-96 relative flex flex-col"
            >
              <h2 className="text-2xl font-bold text-indigo-400 mb-4 flex items-center">
                <Folder className="mr-2" size={24} />
                {project.title}
              </h2>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => navigate(`/projects/${project._id}`)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white transition"
                >
                  View Project Details
                </button>
                <button
                  onClick={() => handleDeleteProject(project._id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-white transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Delete All Projects Button */}
      {projects.length > 0 && (
        <div className="flex justify-center mt-10">
          <button
            onClick={() => setShowConfirmDeleteAll(true)}
            className="flex items-center px-6 py-3 bg-red-700 rounded-xl hover:bg-red-800 transition shadow-lg text-white"
          >
            <Trash2 className="mr-2" size={20} />
            Delete All Projects
          </button>
        </div>
      )}

{/* Confirmation Form */}
<AnimatePresence>
  {showConfirmDeleteAll && (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="mx-auto mt-6 bg-gray-800 p-6 rounded-2xl shadow-xl w-80 text-center"
    >
      <h3 className="text-lg font-bold text-white mb-4">
        Are you sure you want to delete all the projects?
      </h3>
      <div className="flex justify-center gap-4">
        <button
          onClick={handleDeleteAllProjects}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-white transition"
        >
          Yes
        </button>
        <button
          onClick={() => setShowConfirmDeleteAll(false)}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded text-white transition"
        >
          Cancel
        </button>
      </div>
    </motion.div>
  )}
</AnimatePresence>

    </div>
  );
}
