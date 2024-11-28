const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();

const { initializeDatabase } = require("./db/db.connect");
const User = require("./models/users.model");
const Task = require("./models/task.model");
const Project = require("./models/project.model");
const Team = require("./models/team.model");
const Tag = require("./models/tag.model");

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
initializeDatabase();

const JWT_SECRET = "your_jwt_secret";

const verifyJWT = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ message: "Token not provided." });
  }

  const tokenParts = token.split(" ");

  try {
    const decodedToken = jwt.verify(tokenParts[1], JWT_SECRET);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(402).json({ message: "Invalid token" });
  }
};

app.post("/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existedUser = await User.findOne({ email });

    if (existedUser) {
      res.status(400).json({ message: "User already exists." });
    } else {
      //hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newUser = new User({
        name,
        email,
        password: hashedPassword,
      });

      await newUser.save();

      const token = jwt.sign({ id: newUser._id, role: "user" }, JWT_SECRET, {
        expiresIn: "24h",
      });

      res.status(201).json({ message: "User registered successfully", token });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, role: "user" }, JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(200).json({ message: "User login successful.", token });
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
});

app.get("/auth/me", verifyJWT, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("name email");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
});

app.get("/users", verifyJWT, async (req, res) => {
  try {
    const users = await User.find();

    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
});

app.post("/tasks", verifyJWT, async (req, res) => {
  try {
    const isTeamExist = await Team.findById(req.body.team);
    if (!isTeamExist) {
      return res.status(400).json({ message: "Invalid team ID" });
    }

    const isOwnerExist = await User.find({ _id: { $in: req.body.owners } });
    if (!isOwnerExist) {
      return res
        .status(400)
        .json({ message: "One or more user IDs are invalid" });
    }

    const newTask = new Task(req.body);

    await newTask.save();

    res.status(201).json({
      message: "Task created successfully",
      task: newTask,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
});

app.get("/tasks", verifyJWT, async (req, res) => {
  try {
    if (req.query.tags) {
      req.query.tags = { $in: req.query.tags.split(",") };
    }

    const tasks = await Task.find(req.query).populate([
      "owners",
      "team",
      "project",
    ]);

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
});

app.post("/tasks/:id", verifyJWT, async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate(["owners", "team", "project"]);

    if (!updatedTask) {
      res.status(404).json({ message: "Task not found." });
    }
    res
      .status(200)
      .json({ message: "Task updated successfully", task: updatedTask });
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
});

app.delete("/tasks/:id", verifyJWT, async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) {
      res.status(404).json({ message: "Task not found." });
    }
    res
      .status(200)
      .json({ message: "Task deleted successfully", task: deletedTask });
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
});

app.post("/teams", verifyJWT, async (req, res) => {
  try {
    const newTeam = new Team(req.body);
    await newTeam.save();

    res.status(201).json({
      message: "Team created successfully",
      team: newTeam,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
});

app.get("/teams", verifyJWT, async (req, res) => {
  try {
    const teams = await Team.find();

    res.status(200).json({ teams });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/projects", verifyJWT, async (req, res) => {
  try {
    const newProject = new Project(req.body);
    await newProject.save();
    res
      .status(201)
      .json({ messae: "Project created successfully.", project: newProject });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/projects", verifyJWT, async (req, res) => {
  try {
    const projects = await Project.find();

    res
      .status(200)
      .json({ message: "Projects fetched successfully.", projects });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/tags", verifyJWT, async (req, res) => {
  try {
    const newTag = new Tag(req.body);
    await newTag.save();

    res.status(201).json({ message: "Tag created successfully.", tag: newTag });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/tags", verifyJWT, async (req, res) => {
  try {
    const tags = await Tag.find();

    res.status(200).json({ message: "Tags fetched successfully.", tags });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/report/last-week", verifyJWT, async (req, res) => {
  try {
    const lastWeekDate = new Date();
    lastWeekDate.setDate(lastWeekDate.getDate() - 7);

    const tasksLastWeek = await Task.aggregate([
      {
        $match: {
          status: "Completed",
          updatedAt: { $gte: lastWeekDate }, // Filter tasks
        },
      },
      {
        $count: "totalCompleted", // Count completed tasks
      },
    ]);

    res.status(200).json({
      message: "Tasks from the last week fetched successfully.",
      data: tasksLastWeek,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/report/pending", verifyJWT, async (req, res) => {
  try {
    const pendingWork = await Task.aggregate([
      {
        $match: {
          status: { $ne: "Completed" },
        },
      },
      {
        $group: {
          _id: null, // no grouping of tasks
          totalPendingTime: { $sum: "$timeToComplete" }, // sum time to completed
        },
      },
    ]);

    res.status(200).json({
      message: "Total pending work time.",
      data: pendingWork,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/report/closed-tasks", verifyJWT, async (req, res) => {
  try {
    const { groupBy } = req.query;

    if (!["team", "owner", "project"].includes(groupBy)) {
      return res.status(400).json({
        message: "Invalid groupBy parameter.",
      });
    }

    const closedTasks = await Task.aggregate([
      {
        $match: {
          status: "Completed",
        },
      },
      {
        $group: {
          _id: `$${groupBy}`,
          totalClosedTasks: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      message: `Tasks closed by each ${groupBy}.`,
      data: closedTasks,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server is listening on ${PORT}`));
