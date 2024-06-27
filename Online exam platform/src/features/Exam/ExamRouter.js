const express = require('express')
const ExamRouter = express.Router()
const examController = require('./ExamController')
const authController = require('../Authentication/AuthController')

ExamRouter.route('/')
  .get(
    authController.protect,
    authController.restrictTo('student', 'admin'),
    examController.getExam
  )
  .post(
    authController.protect,
    authController.restrictTo('admin', 'Examiner'),
    examController.addExam
  )

ExamRouter.route('/submit').post(
  authController.protect,
  authController.restrictTo('student', 'admin'),
  examController.submitAnswer
)

ExamRouter.route('/:subject')
  .get(
    authController.protect,
    authController.restrictTo('student', 'admin'),
    examController.getExamBySubject
  )
  .post(
    // authController.protect,
    // authController.restrictTo('admin', 'Examiner'),
    examController.addExam
  ) //

module.exports = ExamRouter
