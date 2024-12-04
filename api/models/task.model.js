const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  owners: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ],
  tags: [{ type: String }],
  status: {
    type: String,
    enum: ["To Do", "In Progress", "Completed", "Blocked"],
    default: "To Do",
  },
  timeToComplete: { type: Number, required: true, default: 1 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  dueDate: { type: Date },
});

// Automatically update the `updatedAt` field whenever the document is updated
taskSchema.pre("save", function (next) {
  this.updatedAt = Date.now();

  if (this.timeToComplete) {
    const dueDate = new Date(this.createdAt);
    dueDate.setDate(dueDate.getDate() + this.timeToComplete);
    this.dueDate = dueDate;
  }

  next();
});

module.exports = mongoose.model("Task", taskSchema);

// taskSchema.pre("findOneAndUpdate", function (next) {
//   const update = this.getUpdate();
//   if (update.timeToComplete) {
//     const dueDate = new Date(update.createdAt || Date.now());
//     dueDate.setDate(dueDate.getDate() + update.timeToComplete);
//     update.dueDate = dueDate;
//   }
//   update.updatedAt = Date.now();
//   next();
// });
