import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import MongoStore from "connect-mongo";
import dotenv from "dotenv";
import routes from "./routes.js";  
import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT;
const saltRounds = 10;
app.use(
  cors({
    origin: "http://localhost:5173", 
    credentials: true, // allow cookies
  })
);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));


// schemas
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model("User", userSchema);
const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  created_at: { type: Date, default: Date.now },
});
const Project = mongoose.model("Project", projectSchema);
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  status: { type: String, enum: ["to do", "in progress", "done"], default: "to do" },
  created_at: { type: Date, default: Date.now },
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
});
const Task = mongoose.model("Task", taskSchema);


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Session middleware (stored in Mongo)
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
    }),
  })
);

//Passport setup 
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  next();
});

//login
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (!user) return done(null, false, { message: "username does not exist try signing up" });

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return done(null, false, { message: "Invalid password" });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

//cookie
passport.serializeUser((user, cb) => cb(null, user.id));
passport.deserializeUser(async (id, cb) => {
  const user = await User.findById(id);
  cb(null, user);
});

//debugging
app.use((req, res, next) => {
  console.log("Request:", req.method, req.url);
  next();
});

//Pass User model to routes (so routes.js can use it)
app.use("/auth", routes(User, Project, Task, bcrypt, passport, saltRounds));


// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
