const mongoose = require('mongoose')
const crypto = require('crypto')

const studentSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    select: false,
    required: [true, 'please provide a password'],
    minlength: 8,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female'],
    required: true,
  },
  address: {
    street: String,
    city: String,
    country: String,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  branch: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  passwordChangeAt: Date,
  role: {
    type: String,
    default: 'student',
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
})

studentSchema.methods.changePasswordAfter = function (jwtTimeStamp) {
  if (this.passwordChangeAt) {
    const changeTimeStamp = parseInt(
      this.passpasswordChangeAt.getTime() / 1000,
      10
    )
    console.log(` pc ${changeTimeStamp}  : jwt ${jwtTimeStamp} `)
    return jwtTimeStamp < changeTimeStamp
  }
  // false means not changed , just read name of function and answers it with return statment
  return false
}
studentSchema.methods.createPasswordResetToken = function () {
  //ResetTOKEN is sent to user and it's not encrypted
  //while passworedResetToken is saved in the database and encrypted
  //when user provide sent token in request we encrypted then compare two encrypted tokens
  
  //1)creating Token
  const resetToken = crypto.randomBytes(32).toString('hex')

  //2)hash and save created Token in database
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')

  //set time for valid token 10 mins after creating it
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000
  
   
// return normal token to be sent to user via email 
  return resetToken
}
const Student = mongoose.model('Student', studentSchema)

module.exports = Student
