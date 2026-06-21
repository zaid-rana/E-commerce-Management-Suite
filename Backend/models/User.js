import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: {type: Boolean},
  resetPasswordToken: {type: String},
  otp: { type: String },
  otpExpires: { type: Date },
  resetPasswordExpire: {type: Date}
},
{
  timestamps: true,
});

export default mongoose.model("User" , userSchema);