const express = require('express')
const router = express.Router()
const authController = require('./AuthController')

router.post('/log-in', authController.logIn)
router.post(
  '/updatePassword',
  authController.protect,
  authController.updatePassword
)
module.exports = router
