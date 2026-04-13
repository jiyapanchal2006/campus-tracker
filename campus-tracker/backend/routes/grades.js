const express = require('express');
const router = express.Router();
const Grade = require('../models/Grade');
const { protect } = require('../middleware/auth');

// @GET /api/grades
router.get('/', protect, async (req, res) => {
  try {
    const { studentId, courseId } = req.query;
    const filter = {};
    if (studentId) filter.student = studentId;
    if (courseId) filter.course = courseId;

    const grades = await Grade.find(filter)
      .populate('student', 'name rollNumber')
      .populate('course', 'name code');

    res.json(grades);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/grades/:studentId/:courseId
router.get('/:studentId/:courseId', protect, async (req, res) => {
  try {
    const grade = await Grade.findOne({
      student: req.params.studentId,
      course: req.params.courseId,
    })
      .populate('student', 'name rollNumber')
      .populate('course', 'name code');

    if (!grade) return res.status(404).json({ message: 'Grade record not found' });
    res.json(grade);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @POST /api/grades - Add/update grade
router.post('/', protect, async (req, res) => {
  try {
    const { studentId, courseId, assessments, finalGrade, gpa } = req.body;

    let grade = await Grade.findOne({ student: studentId, course: courseId });

    if (grade) {
      grade.assessments = assessments || grade.assessments;
      grade.finalGrade = finalGrade || grade.finalGrade;
      grade.gpa = gpa || grade.gpa;
      await grade.save();
    } else {
      grade = await Grade.create({
        student: studentId,
        course: courseId,
        assessments,
        finalGrade,
        gpa,
      });
    }

    res.status(201).json(grade);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @PUT /api/grades/:id - Update grade record
router.put('/:id', protect, async (req, res) => {
  try {
    const grade = await Grade.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!grade) return res.status(404).json({ message: 'Grade not found' });
    res.json(grade);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
