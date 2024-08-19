import mongoose from 'mongoose';

/**
 * module model schema definition
 */
const ModuleSchema = new mongoose.Schema({
  moduleUUID: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['published', 'draft'],
    default: 'draft'
  },
  title: {
    type: String,
    required: false,
    unique: true
  },
  image: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false
  },
  moduleContent: {
    type: Object,
    required: true
  }
}, { timestamps: true, minimize: false });

export default mongoose.model('Module', ModuleSchema);
