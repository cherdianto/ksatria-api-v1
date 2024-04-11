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
    type: String,
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
    type: [{
      assignmentId: {
        type: String,
        required: true
      },
      assignmentData: {
        type: mongoose.Mixed,
        required: true
      }
    }]
  },
  progress: {
    type: Number,
    required: true
  }
}, { timestamps: true, minimize: false });

export default mongoose.model('Assignment', AssignmentSchema);
