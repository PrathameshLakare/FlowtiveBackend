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

app.use(cors());
app.use(express.json());
initializeDatabase();

const JWT_SECRET = "your_jwt_secret";

const verifyJWT = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ message: "Token not provided." });
  }

  try {
    const decodedToken = jwt.verify(token, JWT_SECRET);
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
      return res.status(400).json({ message: "Email already exists." });
    }

    //hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const token = jwt.sign({ role: "user" }, JWT_SECRET, {
      expiresIn: "24h",
    });

    return res
      .status(201)
      .json({ message: "User registered successfully", token });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ role: "user" }, JWT_SECRET, {
        expiresIn: "24h",
      });
      return res
        .status(201)
        .json({ message: "User login successfully.", token });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server is listening on ${PORT}`));
