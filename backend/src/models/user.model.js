import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, unique: true },
  role: { type: String, enum: ["tenant", "landlord"], required: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);