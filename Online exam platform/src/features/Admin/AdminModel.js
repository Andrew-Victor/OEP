const mongoose = require('mongoose');
//const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  name: {
    type: String, required: true
  }, password: {
    type: String, required: true, minlength: 8/* validate: {
      validator: function(value) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(value);
      },
      message: 'Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, and one number.'
    }*/
  }, email: {
    type: String,
    required: true,
    unique: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'] // Email format validation
  }, gender: {
    type: String, enum: ['Male', 'Female'] // The gender values
  }, phone: {
    type: String, required: false // Optional

  }, role: {
    type: String, default: 'admin', lowercase: true
  }
});

// Hash the password before saving to database
/*adminSchema.pre('save', function(next) {
  if (!this.isModified('password')) return next();
  bcrypt.hash(this.password, 10, (err, hash) => {
    if (err) return next(err);
    this.password = hash;
    next();
  });
});*/

const Admin = mongoose.model('Admins', adminSchema);

module.exports = Admin;