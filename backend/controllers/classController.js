const asyncHandler = require("express-async-handler");
const { exec } = require("child_process");
const Class = require("../models/classModel");

//@desc Get all classes
//@routes GET /api/classes
//@access Private
const getClasses = asyncHandler(async (req, res) => {
  const classes = await Class.find({ user_id: req.user.id });
  res.status(200).json(classes);
});

//@desc Create new class
//@routes POST /api/classes
//@access Private
const createClass = asyncHandler(async (req, res) => {
  console.log("The request body is: ", req.body);
  const { course, title, number, instructors } = req.body;

  if (!course || !title || !number || !instructors) {
    res.status(400);
    throw new Error("Please provide all class details");
  }

  const newClass = await Class.create({
    course,
    title,
    number,
    instructors,
    user_id: req.user.id,
  });

  res.status(201).json(newClass);
});


//@desc Get class by ID
//@routes GET /api/classes/:id
//@access Private
const getClass = asyncHandler(async (req, res) => {
  const singleClass = await Class.findById(req.params.id);
  if (!singleClass) {
    res.status(404);
    throw new Error("Class not found");
  }
  res.status(200).json(singleClass);
});

//@desc Update class
//@routes PUT /api/classes/:id
//@access Private
const updateClass = asyncHandler(async (req, res) => {
  const singleClass = await Class.findById(req.params.id);
  if (!singleClass) {
    res.status(404);
    throw new Error("Class not found");
  }

  if (singleClass.user_id.toString() !== req.user.id) {
    res.status(403);
    throw new Error("User doesn't have permission to update this class");
  }

  const updatedClass = await Class.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.status(200).json(updatedClass);
});

//@desc Delete class
//@routes DELETE /api/classes/:id
//@access Private
const deleteClass = asyncHandler(async (req, res) => {
  const singleClass = await Class.findById(req.params.id);
  if (!singleClass) {
    res.status(404);
    throw new Error("Class not found");
  }

  if (singleClass.user_id.toString() !== req.user.id) {
    res.status(403);
    throw new Error("User doesn't have permission to delete this class");
  }

  await singleClass.deleteOne({ _id: req.params.id });
  res.status(200).json(singleClass);
});

//@desc Lookup class by number (using Python script)
//@routes POST /api/classes/lookup
//@access Private
const lookupClass = asyncHandler(async (req, res) => {
  const { number } = req.body;
  if (!number) {
    return res.status(400).json({ message: "Class number is required" });
  }

  // Wrap exec in a Promise
  const execPromise = (command) =>
    new Promise((resolve, reject) => {
      exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });

  try {
    const stdout = await execPromise(`python scripts/get_class_info.py ${number}`);
    const classData = JSON.parse(stdout);

    if (classData.error) {
      return res.status(404).json({ message: "Class not found" });
    }

    // 🚀 Return the full class data, including new fields
    return res.status(200).json({
      number: classData.number,
      course: classData.course,
      title: classData.title,
      instructors: classData.instructors,
      seatStatus: classData.seatStatus,
      days: classData.days,
      startTime: classData.startTime,
      endTime: classData.endTime,
      location: classData.location,
      dates: classData.dates,
      units: classData.units
    });
  } catch (error) {
    console.error("Error in lookupClass:", error);
    return res.status(500).json({ message: "Failed to fetch class info" });
  }
});


module.exports = {
  getClasses,
  createClass,
  getClass,
  updateClass,
  deleteClass,
  lookupClass
};
