const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    assessments: [
      {
        type: { type: String, enum: ['quiz', 'assignment', 'midterm', 'final', 'project'] },
        name: { type: String },
        score: { type: Number },
        maxScore: { type: Number },
        date: { type: Date },
      },
    ],
    finalGrade: { type: String },
    gpa: { type: Number },
  },
  { timestamps: true }
);

gradeSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Grade', gradeSchema);
