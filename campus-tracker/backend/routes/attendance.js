const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const { protect } = require('../middleware/auth');

// @GET /api/attendance - Get attendance records
router.get('/', protect, async (req, res) => {
  try {
    const { courseId, studentId, startDate, endDate } = req.query;
    const filter = {};
    if (courseId) filter.course = courseId;
    if (studentId) filter.student = studentId;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const records = await Attendance.find(filter)
      .populate('course', 'name code')
      .populate('student', 'name rollNumber')
      .sort({ date: -1 });

    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @POST /api/attendance - Mark attendance
router.post('/', protect, async (req, res) => {
  try {
    const { courseId, studentId, date, status } = req.body;

    const existing = await Attendance.findOne({
      course: courseId,
      student: studentId,
      date: new Date(date),
    });

    if (existing) {
      existing.status = status;
      existing.markedBy = req.user.id;
      await existing.save();
      return res.json(existing);
    }

    const record = await Attendance.create({
      course: courseId,
      student: studentId,
      date: new Date(date),
      status,
      markedBy: req.user.id,
    });

    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @POST /api/attendance/bulk - Mark attendance for multiple students
router.post('/bulk', protect, async (req, res) => {
  try {
    const { courseId, date, records } = req.body;
    // records: [{ studentId, status }]
    const ops = records.map((r) => ({
      updateOne: {
        filter: { course: courseId, student: r.studentId, date: new Date(date) },
        update: { $set: { status: r.status, markedBy: req.user.id } },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(ops);
    res.json({ message: 'Attendance marked for all students' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/attendance/summary/:studentId - Summary per student
router.get('/summary/:studentId', protect, async (req, res) => {
  try {
    const records = await Attendance.find({ student: req.params.studentId }).populate('course', 'name code');

    const summary = {};
    records.forEach((r) => {
      const key = r.course._id.toString();
      if (!summary[key]) {
        summary[key] = { course: r.course, total: 0, present: 0, absent: 0, late: 0 };
      }
      summary[key].total++;
      summary[key][r.status]++;
    });

    const result = Object.values(summary).map((s) => ({
      ...s,
      percentage: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
