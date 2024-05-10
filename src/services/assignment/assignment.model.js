import mongoose from 'mongoose';

/**
 * assignment model schema definition
 */
const AssignmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.ObjectId,
    required: true
  },
  moduleId: {
    type: mongoose.ObjectId,
    required: true
  },
  moduleUUID: {
    type: Number,
    required: true
  },
  currentProgress: {
    type: Number,
    required: true
  },
  totalProgress: {
    type: Number,
    required: true
  },
  saveData: {
    type: Map,
    required: true,
    of: {
      _id: false,
      assignmentId: {
        type: String,
        required: true
      },
      question: {
        type: mongoose.Mixed,
        required: true
      },
      answer: {
        type: mongoose.Mixed,
        required: true
      }
    }
  },
  progress: {
    type: Number,
    required: true
  }
}, { timestamps: true, minimize: false });

export default mongoose.model('Assignment', AssignmentSchema);
