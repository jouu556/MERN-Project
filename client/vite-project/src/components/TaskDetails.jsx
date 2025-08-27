import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function TaskDetails() {
  const { taskId } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskStatus, setTaskStatus] = useState("to do");
  const navigate = useNavigate();

  // Fetch task by ID
  const fetchTask = async () => {
    try {
      const res = await fetch(`http://localhost:4000/auth/tasks/${taskId}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setTask(data.task);
        setTaskTitle(data.task.title);
        setTaskStatus(data.task.status);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  // Update task
  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:4000/auth/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: taskTitle, status: taskStatus }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setTask(data.task);
        setShowTaskForm(false);
      } else {
        console.error(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-300 text-lg"
        >
          Loading task...
        </motion.p>
      </div>
    );

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8 flex flex-col items-center">
      {/* Task Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-lg w-full text-center"
      >
        <h1 className="text-3xl font-extrabold text-indigo-400 mb-4 drop-shadow">
          {task.title}
        </h1>
        <p className="text-gray-300 mb-6 text-lg">
          Status:{" "}
          <span
            className={`font-semibold ${
              task.status === "done"
                ? "text-green-400"
                : task.status === "in progress"
                ? "text-yellow-400"
                : "text-red-400"
            }`}
          >
            {task.status}
          </span>
        </p>

        {/* Edit button */}
        <button
          onClick={() => setShowTaskForm(true)}
          className="px-6 py-2 mb-6 bg-yellow-500 hover:bg-yellow-400 rounded-xl text-white font-semibold shadow-lg transition"
        >
          Edit Task
        </button>

        {/* Edit Form Popup */}
        <AnimatePresence>
          {showTaskForm && (
            <motion.form
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleUpdateTask}
              className="mt-4 bg-gray-900 p-6 rounded-xl shadow-xl w-full"
            >
              <input
                type="text"
                placeholder="Task Title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full px-4 py-2 mb-3 rounded-lg border border-gray-700 bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
              <select
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value)}
                className="w-full px-4 py-2 mb-3 rounded-lg border border-gray-700 bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="to do">To Do</option>
                <option value="in progress">In Progress</option>
                <option value="done">Done</option>
              </select>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowTaskForm(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-white font-medium shadow-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white font-semibold shadow-md"
                >
                  Save
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Back Button */}
      <motion.button
        onClick={() => navigate(-1)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-semibold shadow-lg"
      >
        Back to Project
      </motion.button>
    </div>
  );
}
