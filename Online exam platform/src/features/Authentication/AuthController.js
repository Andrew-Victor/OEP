const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const Student = require('../Student/StudentModel')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')
const Admin = require('../Admin/AdminModel')
const sendMessage = require('../utils/email')
const crypto = require('crypto')

const Signtoken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  })
}
const createSendCookie = (res, token) => {
  res.cookie('jwt', token, {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRATION * 60),
    httpOnly: true,
  })
}

exports.signUp = async (req, res, next) => {
  const newStudent = await Student.create(req.body)
  //TODO refactor later to take speceife paramter name, photo url, password , email ,
  const token = jwt.sign({ id: newStudent._id, r }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_SECRET,
  }) // --> create account
  createSendCookie(res, token)
  res.status(201).json({
    status: 'success',
    token: token,
    data: {
      newStudent,
    },
  })
}

exports.logIn = async (req, res, next) => {
  //DeConstruct email and password from request
  const { email, password, role } = req.body

  //1) check if email and password exists
  if (!email || !password) {
    return next(new AppError('please provide email and password!', 400))
  }

  //2) check if user exists and password is correct
  let user
  //const user = await Student.findOne({ email: email }).select('+password')
  if (role === 'admin')
    user = await Admin.findOne({ email: email }).select('+password')
  // else if (role === 'examiner') user = await Student.findOne({ email: email }).select('+password')
  else user = await Student.findOne({ email: email }).select('+password')

  if (!user || user.password !== password) {
    return next(new AppError('Wrong password or Email', 401))
  }

  //3) if everything is correct, send token to client
  const token = Signtoken(user._id, user.role)
  createSendCookie(res, token)
  res.status(200).json({
    status: 'success',
    token: token,
    user: user,
  })
}

exports.protect = async (req, res, next) => {
  console.log(`hit protect`)

  //1) getting token and check if there is a one
  let token = ''
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }

  console.log(`token is received: ${token}`)

  if (!token) {
    return next(new AppError('You are not logged in! please LogIn First ', 401))
  }
  //2)verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
  const userRole = decoded.role
  const userId = decoded.id
  console.log(`TAG:token is ${token}`)

  //3) check if user still exist or other business logic
  let freshUser
  if (userRole === 'admin') freshUser = Admin.findById(userId)
  else freshUser = await Student.findById(userId)
  /*
  *   if (role === 'admin') user = await Admin.findOne({ email: email }).select('+password');
  // else if (role === 'examiner') user = await Student.findOne({ email: email }).select('+password')
  else await Student.findOne({ email: email }).select('+password');

  * */

  if (!freshUser)
    return next(new AppError('User Does not exist  or wrong role', 401))
  //4) check if user changed password after token was issued
  /*  if (fuser.changePasswordAfter(decoded.iat)) {
      return next(new AppError('User have changed the password recently please login again ! ', 401));
    }*/ // grant access to protected route and put its auth role
  freshUser.role = userRole
  req.user = freshUser
  console.log(freshUser)
  next()
}

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // now I have access to roles array due to closers
    console.log(`roles passed is ${roles}`)
    console.log(`roles in req is ${req.user.role}`)
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You dont have permission to perform this Action', 403)
      )
    }
    next()
  }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) get user posted Email
  const student = await Student.findOne({ email: req.body.email })
  //2) verify if its exist
  if (!student) return next(new AppError('no student with such email', 404))

  //3) generate random token and save hashed verions of it in database
  const resetToken = student.createPasswordResetToken()
  await student.save({ validateBeforeSave: false })

  //4) send email with token

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/students/resetPassword/${resetToken}`
  const subject = 'password reset Token for OEP'
  const text = `You have requested a reset password token if you didnt please ignore this message\n
  please send a patch request to to ${resetURL}`
  //TODO REMOVE IT IN PRODUCTION TO BE SENT TO STUDENT EMAIL
  const options = {
    text: text,
    to: 'victorandrew292@gmail.com',
    subject: subject,
  }
  const emailSent = await sendMessage(options)
  if (emailSent) {
    res.status(200).json({
      status: 'success',
      message: `reset token is sent to ${student.email}`,
    })
  } else {
    res.status(404).json({
      status: 'fail',
      message: 'error happened please try again later',
    })
  }
})

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1 get user bassed on token
  console.log(`token is ${req.params.token}`)
  const unhashedToken = req.params.token
  const hashedToken = crypto
    .createHash('sha256')
    .update(unhashedToken)
    .digest('hex')
  const student = await Student.findOne({
    passwordResetToken: hashedToken,
  })

  //2) if tokne has not expired and there is the user set the new password
  if (!student) {
    return next(new AppError('invalid Token ', 403))
  }

  if (student.passwordResetExpires < Date.now()) {
    return next(new AppError('Token has expired please try again', 403))
  }
  student.passwordResetToken = undefined
  student.passwordResetExpires = undefined
  student.password = req.body.newPassword
  const result = await student.save()
  console.log(result)
  if (result.password === req.body.newPassword) {
    res.status(200).json({
      status: 'success',
      message: `Password updated successfully`,
    })
  } else {
    res.status(403).json({
      status: 'failed',
      message: 'Password update failed please try again later',
    })
  }
})
exports.updatePassword = catchAsync(async (req, res, next) => {
  //1)get user from collection
  const postedPassword = req.body.password
  const newPassword = req.body.newPassword
  const id = req.user.id
  //TODO REfecator later to check role first

  const user = await Student.findOne({
    _id: id,
  }).select('+password')

  //2)check if posted password is correct
  if (user.password !== postedPassword) {
    return next(new AppError(403, 'wrong password'))
  }
  //3 if correct update password
  user.password = newPassword
  const updated = await user.save()

  if (updated.password === newPassword) {
    res.status(200).json({
      status: 'success',
      message: 'password updated successfully',
    })
  } else {
    res.status(403).json({
      status: 'failed',
      message: 'error happend please try again later ',
    })
  }
})
