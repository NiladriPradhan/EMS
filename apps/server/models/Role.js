import mongoose from 'mongoose';

const RoleSchema = new mongoose.Schema({
  role_name: { type: String, required: true, unique: true },
  permissions: [String]
});

export default mongoose.model('Role', RoleSchema);