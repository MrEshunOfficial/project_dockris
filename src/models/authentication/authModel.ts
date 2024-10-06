import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
    trim: true,
    minlength: 2,
  },
  password: {
    type: String,
    required: [true, "Please enter a password"],
  },
  email: {
    type: String,
    required: [true, "Please enter a valid email address"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  profile: {
    phone: { type: String, match: /^\+?[1-9]\d{1,14}$/ },
    location: { type: String, minlength: 2 },
    occupation: { type: String, minlength: 2 },
    birthdate: { type: Date },
    bio: { type: String, maxlength: 500 },
    avatarUrl: { type: String }
  }
});

// Add a pre-save hook to update the 'updatedAt' field
userSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;