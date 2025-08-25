const express = require("express");
const {
  createStudent,
  getStudents,
  updateStudent,
  deleteStudent
} = require("../controllers/studentController");

const router = express.Router();

// CRUD routes
router.get("/", getStudents);
router.post("/", createStudent);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

module.exports = router;
