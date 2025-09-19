const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // no se repite
  },
  email: {
    type: String,
    required: true,
    unique: true, // no se repite
  },
  password: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false, // por defecto no está verificado
  },
  verifyToken: {
    type: String, // token único para verificar correo
  },
  verifyTokenExpires: {
    type: Date, // fecha de expiración del token
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: {
     type: String },
  resetPasswordExpires: { 
    type: Date },

});

module.exports = mongoose.model('User', userSchema);
