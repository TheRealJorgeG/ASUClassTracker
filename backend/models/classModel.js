const mongoose = require('mongoose');

const classSchema = mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    course: {
      type: String,
      required: [true, "Please add the course name"],
    },
    title: {
      type: String,
      required: [true, "Please add the class title"],
    },
    number: {
      type: String,
      required: [true, "Please add the class number"],
    },
    instructors: {
      type: [String], 
      required: [true, "Please add at least one instructor"],
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Class", classSchema);
