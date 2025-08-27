import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function ProjectDetails() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskStatus, setTaskStatus] = useState("to do");
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const navigate = useNavigate();

  const fetchProjectAndTasks = async () => {
    try {
      const res = await fetch(`http://localhost:4000/auth/projects/${projectId}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setProject(data.project);
        setTasks(data.project.tasks || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectAndTasks();
  }, [projectId]);

  const handleDeleteTask = async (taskId) => {
    try {
      const res = await fetch(`http://localhost:4000/auth/tasks/${taskId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setTasks(tasks.filter((t) => t._id !== taskId));
      } else {
        console.error(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAllTasks = async () => {
    try {
      const res = await fetch(`http://localhost:4000/auth/projects/${projectId}/tasks`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setTasks([]);
        setShowDeleteAllConfirm(false);
      } else {
        console.error(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllDone = async () => {
    try {
      const res = await fetch(`http://localhost:4000/auth/projects/${projectId}/tasks/mark-all-done`, {
        method: "PUT",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setTasks(tasks.map((t) => ({ ...t, status: "done" })));
      } else {
        console.error(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle) return;
    try {
      const res = await fetch(`http://localhost:4000/auth/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: taskTitle, status: taskStatus }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setTasks([...tasks, data.task]);
        setTaskTitle("");
        setTaskStatus("to do");
        setShowTaskForm(false);
      } else {
        console.error(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <p className="text-white text-center mt-10">Loading project...</p>;
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6 overflow-y-auto">
            {/* Return button */}
    <button
      onClick={() => navigate("/my-projects")}
      className="px-4 py-2 mb-4 bg-gray-700 hover:bg-gray-600 rounded text-white"
    >
      Return to My Projects
    </button>
      <h1 className="text-4xl text-indigo-400 font-extrabold mb-4">{project.title}</h1>
      <p className="text-gray-300 mb-6">{project.description || "No description"}</p>

      <button
        onClick={() => setShowTaskForm(true)}
        className="px-4 py-2 mb-6 bg-green-600 hover:bg-green-500 rounded text-white"
      >
        + Add Task
      </button>

      {/* Task Buttons */}
      {tasks.length > 0 && (
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setShowDeleteAllConfirm(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-white"
          >
            Delete All Tasks
          </button>
          <button
            onClick={handleMarkAllDone}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white"
          >
            Mark All as Done
          </button>
        </div>
      )}

      {/* Confirmation Popup for Delete All Tasks */}
      <AnimatePresence>
        {showDeleteAllConfirm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-gray-800 p-6 rounded-2xl shadow-lg w-full max-w-sm mx-auto mb-6"
          >
            <p className="text-white mb-4">Are you sure you want to delete all tasks?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteAllConfirm(false)}
                className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllTasks}
                className="px-3 py-2 bg-red-600 hover:bg-red-500 rounded text-white"
              >
                Yes
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task creation form */}
      <AnimatePresence>
        {showTaskForm && (
          <motion.form
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onSubmit={handleCreateTask}
            className="mb-6 bg-gray-800 p-6 rounded-2xl shadow-lg w-full max-w-md"
          >
            <input
              type="text"
              placeholder="Task Title"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full px-4 py-2 mb-3 rounded border border-gray-600 bg-gray-100 text-black"
              required
            />
            <select
              value={taskStatus}
              onChange={(e) => setTaskStatus(e.target.value)}
              className="w-full px-4 py-2 mb-3 rounded border border-gray-600 bg-gray-100 text-black"
            >
              <option value="to do">to do</option>
              <option value="in progress">in progress</option>
              <option value="done">done</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowTaskForm(false)}
                className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-2 bg-green-600 hover:bg-green-500 rounded text-white"
              >
                Save
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Task list */}
      {tasks.length === 0 ? (
        <p className="text-gray-300">No tasks were added yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {tasks.map((task) => (
            <motion.div
              key={task._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 p-4 rounded-2xl flex justify-between items-center"
            >
 <div>
  <h2 className="text-xl text-indigo-400 font-semibold">{task.title}</h2>
  <p
    className={`font-medium ${
      task.status === "to do"
        ? "text-red-400"
        : task.status === "in progress"
        ? "text-yellow-400"
        : "text-green-400"
    }`}
  >
    Status: {task.status}
  </p>
</div>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/tasks/${task._id}`)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-white"
                >
                  View Task Details
                </button>
                <button
                  onClick={() => handleDeleteTask(task._id)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-white"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
