const express = require('express')
const AdminController = require('./AdminController')
const authController = require('../Authentication/AuthController')
const studentController = require('../Student/StudentController')
const Student = require('../Student/StudentModel')
const router = express.Router()

// Route to create a new admin
router.post('/', AdminController.createAdmin)

// Route to get all admins
router.get(
  '/',
  authController.protect,
  authController.restrictTo('admin'),
  AdminController.getAllAdmins
)

// Route to get an admin by ID
router.get(
  '/:id',
  authController.protect,
  authController.restrictTo('admin'),
  AdminController.getAdminById
)

// Route to update an admin
router.put(
  '/:id',
  authController.protect,
  authController.restrictTo('admin'),
  AdminController.updateAdmin
)

// Route to delete an admin
router.delete(
  '/:id',
  authController.protect,
  authController.restrictTo('admin'),
  AdminController.deleteAdmin
)

router.patch(
  '/updateStudent',
  authController.protect,
    authController.restrictTo('admin'),
  studentController.updateStudent
)

module.exports = router
