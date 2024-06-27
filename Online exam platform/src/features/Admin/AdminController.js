const Admin = require('./AdminModel'); // admin model file
const catchAsync = require('../utils/catchAsync');
// Fn create a new admin
exports.createAdmin = catchAsync(async (req, res) => {
  try {
    // Hash password
    //   const hashedPassword = await bcrypt.hash(req.body.password, 10);
    // Create a new admin with the hashed password
    const newAdmin = new Admin({
      name: req.body.name,
      password: req.body.password,
      email: req.body.email,
      gender: req.body.gender,
      phone: req.body.phone
    });
    await newAdmin.save();
    res.status(201).json({ success: true, data: newAdmin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// Fn retrieve all admins
exports.getAllAdmins = async (req, res) => {
  console.log('here in get all admins');

  try {
    console.log('admins');
    const admins = await Admin.find();
    console.log('admins');
    res.status(200).json({ success: true, data: admins });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fn retrieve an admin by ID
exports.getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    res.status(200).json({ success: true, data: admin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fn update an admin
exports.updateAdmin = async (req, res) => {
  try {
    // Hash the password if it is provided in the request body
    /*
        if (req.body.password) {
          const hashedPassword = await bcrypt.hash(req.body.password, 10);
          req.body.password = hashedPassword;
        }
    */

    const updatedAdmin = await Admin.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedAdmin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    res.status(200).json({ success: true, data: updatedAdmin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fn delete an admin
exports.deleteAdmin = async (req, res) => {
  try {
    const deletedAdmin = await Admin.findByIdAndDelete(req.params.id);
    if (!deletedAdmin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    res.status(200).json({ success: true, data: deletedAdmin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




