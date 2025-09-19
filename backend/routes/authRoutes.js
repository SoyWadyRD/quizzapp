const express = require('express');
const router = express.Router();
const { registerUser, loginUser, verifyEmail, forgotPassword, resetPassword, validateToken } = require('../controllers/authController');

// Registro
router.post('/register', registerUser);

// Login
router.post('/login', loginUser);

// Ruta para validar token
router.get('/validate-token', validateToken);

// Verificación de correo
router.get('/verify-email', verifyEmail);

// Solicitar recuperación de contraseña
router.post('/forgot-password', forgotPassword);

// Resetear contraseña usando token
router.post('/reset-password/:token', resetPassword);

module.exports = router;
