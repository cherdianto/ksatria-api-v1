import mongoose from 'mongoose';
import config from '../../config';
import constants from '../../constants';

const {
  USER, USER_ROLE, INVITATION_STATUS, PENDING
} = constants;
/**
 * Invitation model schema definition
 */
const InvitationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    token: {
      type: String,
      // required: true,
    },
    status: {
      type: String,
      enum: INVITATION_STATUS,
      default: PENDING
    },
    counselorId: {
      type: mongoose.Types.ObjectId,
      // required: true,
      ref: 'User',
    },
    role: {
      type: String,
      enum: USER_ROLE,
      default: USER,
    },
  },
  { timestamps: true },
  { versionKey: false }
);

export default mongoose.model('Invitation', InvitationSchema);
