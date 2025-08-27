import express from "express";

export default function routes(User, Project, Task, bcrypt, passport, saltRounds) {
  const router = express.Router();

//Register
router.post("/register", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
    return res.status(400).json({ message: "Username and password cannot be empty" });
    }
try {
    const existing = await User.findOne({ username });
    if (existing) {
      console.log("Username already exists:", username);
      return res.status(400).json({ message: "username already exists try logging in" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    console.log("Saved user:", newUser);
//Auto login and save session
    req.login(newUser, (err) => {
      if (err) {
        console.error("Auto login error:", err);
        return res.status(500).json({ message: "Login error" });
        }
      const safeUser = { id: newUser._id, username: newUser.username };
      console.log("Auto login success for:", safeUser);
      req.session.user = { id: newUser._id, username: newUser.username };
      res.json({ message: "Registered & logged in", user: safeUser });
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Error registering user" });
  }
});


//Login
router.post("/login", (req, res, next) => {
 const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password cannot be empty" });
  }
//username w password checking
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(400).json({ message: info.message });
//login action and saving the session
    req.login(user, (err) => {
      if (err) return next(err);

      const safeUser = { id: user._id, username: user.username };
      console.log("Login success for:", safeUser);
       req.session.user = { id: user._id, username: user.username };
      return res.json({ message: "Logged in", user: safeUser });
    });
  })(req, res, next);
});

//Logout
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: "Logout error" });
//End the session
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: "Failed to destroy session" });
      res.clearCookie("connect.sid"); 
      return res.json({ message: "Logged out" });
    });
  });
});

    //--PROJECT ROUTES--\\

//Create a project
  router.post("/projects", async (req, res) => {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Project title is required" });
    }
    try {
      const project = new Project({
        title,
        description,
      });
      await project.save();
      res.json({ message: "Project created", project });
    } catch (err) {
      console.error("Project error:", err);
      res.status(500).json({ message: "Error creating project" });
    }
  });
  // Get all projects
router.get("/projects", async (req, res) => {
  try {
    const projects = await Project.find().lean(); 
    res.json({ projects }); // just send projects directly
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).json({ message: "Error fetching projects" });
  }
});


  // Update project
  router.put("/projects/:id", async (req, res) => {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ message: "Project title is required" });

    try {
      const project = await Project.findByIdAndUpdate(req.params.id, { title, description }, { new: true });
      if (!project) return res.status(404).json({ message: "Project not found" });
      res.json({ message: "Project updated", project });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error updating project" });
    }
  });

  // Delete project + its tasks
  router.delete("/projects/:id", async (req, res) => {
    try {
      await Task.deleteMany({ project: req.params.id });
      await Project.findByIdAndDelete(req.params.id);
      res.json({ message: "Project and its tasks deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error deleting project" });
    }
  });
  // Get project by ID with its tasks
router.get("/projects/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).lean();
    if (!project) return res.status(404).json({ message: "Project not found" });

    const tasks = await Task.find({ project: project._id }).lean();
    res.json({ project: { ...project, tasks } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching project" });
  }
});
// Delete ALL projects
router.delete("/projects", async (req, res) => {
  try {
    await Task.deleteMany({});     // delete all tasks too
    await Project.deleteMany({});  // delete all projects
    res.json({ message: "All projects and tasks deleted" });
  } catch (err) {
    console.error("Error deleting all projects:", err);
    res.status(500).json({ message: "Error deleting all projects" });
  }
});



  //--TASK ROUTES--\\

// Get single task by ID
router.get("/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).lean();
    if (!task) return res.status(404).json({ message: "Task not found" });

    res.json({ task });
  } catch (err) {
    console.error("Error fetching task:", err);
    res.status(500).json({ message: "Error fetching task" });
  }
});

  // Update task
  router.put("/tasks/:id", async (req, res) => {
    const { title, status } = req.body;
    if (!title) return res.status(400).json({ message: "Task title is required" });

    try {
      const task = await Task.findByIdAndUpdate(req.params.id, { title, status }, { new: true });
      if (!task) return res.status(404).json({ message: "Task not found" });
      res.json({ message: "Task updated", task });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error updating task" });
    }
  });

  //create a task linked to a specific project
router.post("/projects/:projectId/tasks", async (req, res) => {
  const { projectId } = req.params;
  const { title, status } = req.body;

  if (!title) return res.status(400).json({ message: "Title is required" });

  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const task = new Task({
      project: project._id, // must match schema
      title,
      status: status || "ToDo",
    });

    await task.save();
    res.status(201).json({ message: "Task created", task });
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(500).json({ message: err.message });
  }
});


  // Delete task
  router.delete("/tasks/:id", async (req, res) => {
    try {
      await Task.findByIdAndDelete(req.params.id);
      res.json({ message: "Task deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error deleting task" });
    }
  });


// Delete ALL tasks for a specific project
router.delete("/projects/:projectId/tasks", async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    await Task.deleteMany({ project: projectId });
    res.json({ message: `All tasks deleted for project ${project.title}` });
  } catch (err) {
    console.error("Error deleting tasks:", err);
    res.status(500).json({ message: "Error deleting tasks for project" });
  }
});

// Mark ALL tasks as "done" for a specific project
router.put("/projects/:projectId/tasks/mark-all-done", async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    await Task.updateMany(
      { project: projectId },
      { $set: { status: "done" } }
    );
    res.json({ message: `All tasks for project ${project.title} marked as done` });
  } catch (err) {
    console.error("Error marking tasks as done:", err);
    res.status(500).json({ message: "Error updating tasks" });
  }
});

router.get("/check-session", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ loggedIn: true, user: { id: req.user._id, username: req.user.username } });
  } else {
    res.status(401).json({ loggedIn: false, message: "Not logged in" });
  }
});


  return router;
}
