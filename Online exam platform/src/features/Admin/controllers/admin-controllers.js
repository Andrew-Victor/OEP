import Admin from '../Admin/model' // admin model file
import { isValidPhoneNumber } from 'libphonenumber-js'
import bcrypt from 'bcryptjs'

// Fn create a new admin
exports.createAdmin = async (req, res) => {
  try {
    // Validate phone no.
    if (req.body.phone && !isValidPhoneNumber(req.body.phone, 'EG')) {
      return res
        .status(400)
        .json({
          success: false,
          message: `${req.body.phone} is not a valid phone number!`,
        })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(req.body.password, 10)

    // Create a new admin with the hashed password
    const newAdmin = new Admin({
      name: req.body.name,
      password: hashedPassword,
      email: req.body.email,
      gender: req.body.gender,
      phone: req.body.phone,
    })
    await newAdmin.save()
    res.status(201).json({ success: true, data: newAdmin })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Fn retrieve all admins
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find()
    res.status(200).json({ success: true, data: admins })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Fn retrieve an admin by ID
exports.getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id)
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: 'Admin not found' })
    }
    res.status(200).json({ success: true, data: admin })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Fn update an admin
exports.updateAdmin = async (req, res) => {
  try {
    // Hash the password if it is provided in the request body
    if (req.body.password) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
      req.body.password = hashedPassword
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    if (!updatedAdmin) {
      return res
        .status(404)
        .json({ success: false, message: 'Admin not found' })
    }
    res.status(200).json({ success: true, data: updatedAdmin })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Fn delete an admin
exports.deleteAdmin = async (req, res) => {
  try {
    const deletedAdmin = await Admin.findByIdAndDelete(req.params.id)
    if (!deletedAdmin) {
      return res
        .status(404)
        .json({ success: false, message: 'Admin not found' })
    }
    res.status(200).json({ success: true, data: deletedAdmin })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
