const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// Registro de usuario
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    let user = await User.findOne({ $or: [{ username }, { email }] });
    if (user) return res.status(400).json({ msg: 'Username o email ya existe' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verifyToken = crypto.randomBytes(32).toString('hex');
    const verifyTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24h

    user = new User({ username, email, password: hashedPassword, verified: false, verifyToken, verifyTokenExpires });
    await user.save();

    const verifyLink = `${process.env.FRONTEND_URL}/verify-email.html?token=${verifyToken}`;
    await sendEmail(user.email, 'Verifica tu correo', `
      <div style="font-family: Arial, sans-serif; text-align:center;">
        <h2>Hola ${user.username}</h2>
        <p>Haz clic para verificar tu correo:</p>
        <a href="${verifyLink}" style="padding:12px 20px;background:#0d6efd;color:white;text-decoration:none;border-radius:5px;">Verificar correo</a>
      </div>
    `);

    console.log(`✅ Usuario registrado: ${username} | ${email}`);
    res.status(201).json({ msg: 'Usuario creado. Revisa tu correo para verificar.' });

  } catch (err) {
    console.error(err);
    res.status(500).send('Error del servidor');
  }
};
















// Login de usuario
const loginUser = async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  try {
    const user = await User.findOne({ $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }] });
    if (!user) return res.status(400).json({ msg: 'Usuario no encontrado' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Contraseña incorrecta' });
    if (!user.verified) return res.status(401).json({ msg: 'Usuario no verificado' });

    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1d' });
    console.log(`🔑 Usuario hizo login: ${user.username} | ${user.email}`);

    res.json({ token, username: user.username });

  } catch (err) {
    console.error(err);
    res.status(500).send('Error del servidor');
  }
};








// Validar token y devolver username
const validateToken = async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'No hay token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar el usuario en DB usando el id que pusiste en el token
    const user = await User.findById(decoded.id).select('username');
    if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });

    res.json({ username: user.username });
  } catch (err) {
    console.error('Error en validateToken:', err);
    return res.status(403).json({ msg: 'Token inválido' });
  }
};











// Solicitar recuperación de contraseña
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Usuario no encontrado' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset.html?token=${token}`;
    await sendEmail(user.email, 'Recuperar contraseña', `
      <div style="font-family: Arial, sans-serif; text-align:center;">
        <h2>Hola ${user.username}</h2>
        <p>Haz clic para restablecer tu contraseña:</p>
        <a href="${resetUrl}" style="padding:12px 20px;background:#0d6efd;color:white;text-decoration:none;border-radius:5px;">Restablecer contraseña</a>
      </div>
    `);

    console.log(`✉️ Solicitud de recuperación de contraseña: ${user.username} | ${user.email}`);
    res.json({ msg: 'Correo de recuperación enviado ✅' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error del servidor' });
  }
};












// Resetear contraseña
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ msg: 'Token inválido o expirado' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    console.log(`🔑 Contraseña reseteada: ${user.username} | ${user.email}`);
    res.json({ msg: 'Contraseña restablecida correctamente ✅' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error del servidor' });
  }
};


















// Verificar correo (sin cambios, pero se mantiene log)
const verifyEmail = async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ msg: 'Token inválido' });

  try {
    const user = await User.findOne({ verifyToken: token, verifyTokenExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ msg: 'Token inválido o expirado' });

    user.verified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpires = undefined;
    await user.save();

    console.log(`✅ Correo verificado: ${user.username} | ${user.email}`);
    res.json({ msg: 'Correo verificado con éxito ✅. Ya puedes iniciar sesión.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error del servidor' });
  }
};

module.exports = { registerUser, loginUser, verifyEmail, forgotPassword, resetPassword, validateToken };
