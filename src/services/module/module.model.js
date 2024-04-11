import mongoose from 'mongoose';

/**
 * module model schema definition
 */
const ModuleSchema = new mongoose.Schema({
  moduleUUID: {
    type: String,
    required: true,
    unique: true,
    max: 2
  },
  moduleContent: {
    type: Object,
    required: true
  }
}, { timestamps: true, minimize: false });

export default mongoose.model('Module', ModuleSchema);
