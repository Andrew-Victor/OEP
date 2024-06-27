const express = require('express')
const router = express.Router()
const studentController = require('./StudentController')
const authController = require('../Authentication/AuthController')

router.post(
  '/',
  authController.protect,
  authController.restrictTo('admin'),
  studentController.createStudent
)

router.get(
  '/',
  authController.protect,
  authController.restrictTo('examiner', 'admin'),
  studentController.getAllStudents
)

router.get('/:id', studentController.getStudentById)

router.put('/:id', studentController.updateStudent)

router.delete(
  '/:id',
  authController.protect,
  authController.restrictTo('examiner', 'admin'),
  studentController.deleteStudent
)

router.post('/forgotPassword', authController.forgotPassword)
router.patch('/resetPassword/:token', authController.resetPassword)
module.exports = router
