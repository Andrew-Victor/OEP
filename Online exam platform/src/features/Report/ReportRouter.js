const express = require('express')
const router = express.Router()
const reportController = require('../Report/ReportController')
const AuthController = require('../Authentication/AuthController')

router.get('/triggerAnalyze', reportController.triggerAnalyze)
router.post(
  '/',
  //AuthController.protect,
  //AuthController.restrictTo('Examiner'),
  reportController.getReportById
)

module.exports = router
