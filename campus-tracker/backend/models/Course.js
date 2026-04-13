const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    description: { type: String },
    department: { type: String, required: true },
    semester: { type: Number, required: true },
    credits: { type: Number, default: 3 },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    schedule: {
      days: [{ type: String }],
      time: { type: String },
      room: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
