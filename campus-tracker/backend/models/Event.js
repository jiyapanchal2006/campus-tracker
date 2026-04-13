const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    endDate: { type: Date },
    location: { type: String },
    type: {
      type: String,
      enum: ['academic', 'sports', 'cultural', 'holiday', 'exam', 'other'],
      default: 'other',
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
