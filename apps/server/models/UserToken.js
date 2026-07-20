import mongoose from 'mongoose';

const UserTokenSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true, unique: true },
  expires_at: { type: Date, required: true },
  revoked: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model('UserToken', UserTokenSchema);