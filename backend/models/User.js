
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  joinDate: { type: Date, default: Date.now },
  isAdmin: { type: Boolean, default: false },
  role: { 
    type: String, 
    enum: ['Super Admin', 'Manager', 'Editor', 'Staff', 'User'],
    default: 'User'
  },
  avatarUrl: { type: String, default: 'https://i.pravatar.cc/300' },
  
  // Fields for Password Reset
  resetPasswordOtp: { type: String },
  resetPasswordExpires: { type: Date }
});

// To use the 'id' virtual field provided by Mongoose instead of '_id'
UserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) { 
    delete ret._id; 
    delete ret.password; 
    delete ret.resetPasswordOtp; // Do not expose OTP
    delete ret.resetPasswordExpires;
  }
});

// Pre-save middleware to set isAdmin based on role for backward compatibility
UserSchema.pre('save', function(next) {
  if (this.role === 'Super Admin' || this.role === 'Manager') {
    this.isAdmin = true;
  }
  next();
});


module.exports = mongoose.model('User', UserSchema);
